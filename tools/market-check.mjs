// 新游戏开工前的市场调研：先确认市面上是否已有同类，再决定做不做。
// 数据源：Steam 商店（PC 商业游戏）、itch.io（独立 / 网页小游戏）、GitHub（开源实现）。
// 用法：node tools/market-check.mjs "ripple puzzle" "wave physics puzzle"
//
// 注意：Steam 与 itch 都是按文本匹配标题/描述，命中数只代表「这个说法有多少人用」，
// 不代表玩法被做烂。最终判断要落到「头部作品长什么样、我能不能做出明显差异」。
import { execFileSync, execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Windows 上 Node 默认不走系统代理，这里读注册表后带代理重启一次自己。
function systemProxy() {
  if (process.env.HTTPS_PROXY || process.env.https_proxy || process.platform !== 'win32') return null;
  try {
    const out = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const match = out.match(/ProxyServer\s+REG_SZ\s+(\S+)/);
    if (!match) return null;
    return /^https?:\/\//.test(match[1]) ? match[1] : 'http://' + match[1];
  } catch {
    return null;
  }
}

const proxy = systemProxy();
if (proxy && !process.env.NODE_USE_ENV_PROXY) {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
    env: { ...process.env, HTTP_PROXY: proxy, HTTPS_PROXY: proxy, NODE_USE_ENV_PROXY: '1' },
    stdio: 'inherit'
  });
  process.exit(result.status ?? 1);
}

// 网络偶发超时，重试几次再放弃。
async function fetchText(url, headers, attempt = 1) {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error('http ' + res.status);
    return { res, text: await res.text() };
  } catch (error) {
    if (attempt >= 3) throw error;
    await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    return fetchText(url, headers, attempt + 1);
  }
}

async function steamSearch(term) {
  const url = 'https://store.steampowered.com/api/storesearch/?term=' + encodeURIComponent(term) + '&cc=us&l=en';
  const { text } = await fetchText(url, { 'User-Agent': UA });
  const json = JSON.parse(text);
  return { count: json.total ?? 0, items: (json.items ?? []).map((item) => item.name) };
}

async function itchSearch(term) {
  const { text: html } = await fetchText('https://itch.io/search?q=' + encodeURIComponent(term), { 'User-Agent': UA, Accept: 'text/html' });
  const items = [...html.matchAll(/<a[^>]*class="title[^"]*"[^>]*>([^<]*)</g)].map((m) => m[1].trim()).filter(Boolean);
  // itch 每页返回固定条数，拿不到总量，所以只统计标题里真正含关键词的。
  // itch 每页固定 54 条且拿不到总量，这里只作为「首屏有什么」的参考。
  return { count: items.length, firstPage: true, items };
}

function githubSearch(term) {
  try {
    const query = encodeURIComponent(term);
    const jq = '.total_count, (.items[] | .full_name + " | " + (.description // ""))';
    // gh 走系统代理会失败，这里让它直连。
    const env = { ...process.env };
    for (const key of ['HTTPS_PROXY', 'HTTP_PROXY', 'https_proxy', 'http_proxy']) delete env[key];
    const out = execFileSync('gh', ['api', 'search/repositories?q=' + query + '&per_page=6', '--jq', jq], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], env });
    const lines = out.trim().split('\n').filter(Boolean);
    const count = Number(lines.shift() ?? 0);
    return { count, items: lines };
  } catch (error) {
    return { count: 0, items: ['(skip: ' + String(error.message).split('\n')[0] + ')'] };
  }
}

const SOURCES = [
  ['steam (PC 商业)', steamSearch],
  ['itch.io (独立/网页)', itchSearch],
  ['github (开源实现)', githubSearch]
];

async function check(term) {
  console.log('\n=== ' + term + ' ===');
  for (const [label, fn] of SOURCES) {
    try {
      const result = await fn(term);
      const suffix = result.firstPage ? ' (itch first page only, no total available)' : '';
      console.log('  ' + label + ': ' + result.count + ' hits' + suffix);
      for (const name of result.items.slice(0, 6)) console.log('    - ' + name);
    } catch (error) {
      console.log('  ' + label + ': ERROR ' + error.message);
    }
  }
}

async function main() {
  const terms = process.argv.slice(2);
  if (!terms.length) {
    console.error('用法：node tools/market-check.mjs "<关键词>" [...]');
    process.exit(2);
  }
  for (const term of terms) await check(term);
  console.log('\n提示：命中数只说明这个说法被多少人用了。真正要看的头部作品的机制，能不能找到差异化空位。');
}

main();