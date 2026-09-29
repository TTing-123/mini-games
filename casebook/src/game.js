import { CaseCore, caseCount, getCase } from './case-core.js';

const els = {
  caseTag: document.querySelector('#case-tag'),
  caseTitle: document.querySelector('#case-title'),
  brief: document.querySelector('#brief-text'),
  facts: document.querySelector('#facts-list'),
  questionsLeft: document.querySelector('#questions-left'),
  questionMax: document.querySelector('.budget-max'),
  suspectList: document.querySelector('#suspect-list'),
  keyMeter: document.querySelector('#key-meter'),
  recordList: document.querySelector('#record-list'),
  topicOwner: document.querySelector('#topic-owner'),
  topicList: document.querySelector('#topic-list'),
  accuseButton: document.querySelector('#accuse-button'),
  accusePanel: document.querySelector('#accuse-panel'),
  accuseSuspects: document.querySelector('#accuse-suspects'),
  accuseEvidence: document.querySelector('#accuse-evidence'),
  confirmAccuse: document.querySelector('#confirm-accuse'),
  cancelAccuse: document.querySelector('#cancel-accuse'),
  verdict: document.querySelector('#verdict'),
  verdictKicker: document.querySelector('#verdict-kicker'),
  verdictTitle: document.querySelector('#verdict-title'),
  verdictText: document.querySelector('#verdict-text'),
  solutionBox: document.querySelector('#solution-box'),
  nextCase: document.querySelector('#next-case'),
  retryCase: document.querySelector('#retry-case'),
  verdictCases: document.querySelector('#verdict-cases'),
  casesButton: document.querySelector('#cases-button'),
  restartButton: document.querySelector('#restart-button'),
  casesPanel: document.querySelector('#cases-panel'),
  caseList: document.querySelector('#case-list'),
  closeCases: document.querySelector('#close-cases')
};

const PROGRESS_KEY = 'casebook-solved';

function loadSolved() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list : []);
  } catch (_) {
    return new Set();
  }
}

const solvedCases = loadSolved();

function markSolved(caseId) {
  if (solvedCases.has(caseId)) return;
  solvedCases.add(caseId);
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...solvedCases]));
  } catch (_) {
    /* 隐私模式写不了就算了 */
  }
}

const core = new CaseCore(0);
let pickedSuspect = null;
let pickedEvidence = null;

/* ---------------- 渲染 ---------------- */

function renderCase() {
  const data = core.caseData;
  els.caseTag.textContent = data.tag;
  els.caseTitle.textContent = data.title;
  els.brief.textContent = data.brief.join('');
  els.facts.innerHTML = '';
  for (const fact of data.facts) {
    const li = document.createElement('li');
    li.textContent = fact;
    els.facts.append(li);
  }
}

function renderBudget() {
  els.questionsLeft.textContent = String(core.state.questionsLeft);
  els.questionMax.textContent = `/${core.state.questionsMax}`;
  const key = core.keyEvidenceCount();
  els.keyMeter.innerHTML = key
    ? `已问出 <b>${key}</b> 条关键证词`
    : '还没有问到关键的东西';
  els.accuseButton.disabled = core.state.phase !== 'interview' || core.state.log.length === 0;
}

function renderSuspects() {
  els.suspectList.innerHTML = '';
  for (const person of core.caseData.suspects) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'suspect';
    if (person.id === core.state.selected) button.classList.add('is-active');
    const allAsked = person.topics.every((topic) => core.hasAsked(person.id, topic.id));
    if (allAsked) button.classList.add('is-done');

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = person.name;
    const role = document.createElement('span');
    role.className = 'role';
    role.textContent = person.role;
    const note = document.createElement('span');
    note.className = 'note';
    note.textContent = person.note;
    button.append(name, role, note);
    button.addEventListener('click', () => {
      core.select(person.id);
      renderSuspects();
      renderTopics();
    });
    els.suspectList.append(button);
  }
}

function renderTopics() {
  const person = core.suspect(core.state.selected);
  els.topicOwner.textContent = person ? `· ${person.name}` : '';
  els.topicList.innerHTML = '';
  if (!person) return;
  for (const topic of person.topics) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'topic';
    button.textContent = topic.label;
    const asked = core.hasAsked(person.id, topic.id);
    button.disabled = asked || !core.canAsk();
    if (asked) button.textContent = `${topic.label}（已问）`;
    button.addEventListener('click', () => {
      core.ask(person.id, topic.id);
      renderAll();
    });
    els.topicList.append(button);
  }
}

function renderRecord() {
  const log = core.state.log;
  els.recordList.innerHTML = '';
  if (!log.length) {
    const placeholder = document.createElement('p');
    placeholder.className = 'placeholder';
    placeholder.textContent = '选一个人，问一个问题。你只有有限的机会。';
    els.recordList.append(placeholder);
    return;
  }
  for (const entry of log) {
    const block = document.createElement('div');
    block.className = entry.key ? 'entry is-key' : 'entry';
    const who = document.createElement('div');
    who.className = 'who';
    who.textContent = entry.suspectName;
    const question = document.createElement('p');
    question.className = 'q';
    question.textContent = `问：${entry.question}`;
    const answer = document.createElement('p');
    answer.className = 'a';
    answer.textContent = entry.answer;
    block.append(who, question, answer);
    els.recordList.append(block);
  }
  els.recordList.scrollTop = els.recordList.scrollHeight;
}

function renderAll() {
  renderBudget();
  renderSuspects();
  renderTopics();
  renderRecord();
}

/* ---------------- 指认 ---------------- */

function openAccusation() {
  if (core.state.phase !== 'interview') return;
  core.startAccusation();
  pickedSuspect = null;
  pickedEvidence = null;
  renderAccusation();
  els.accusePanel.classList.remove('is-hidden');
}

function renderAccusation() {
  els.accuseSuspects.innerHTML = '';
  for (const person of core.caseData.suspects) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    if (pickedSuspect === person.id) chip.classList.add('is-active');
    chip.textContent = person.name;
    chip.addEventListener('click', () => { pickedSuspect = person.id; renderAccusation(); });
    els.accuseSuspects.append(chip);
  }

  els.accuseEvidence.innerHTML = '';
  for (const entry of core.state.log) {
    const ref = `${entry.suspectId}:${entry.topicId}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'evidence';
    if (pickedEvidence === ref) button.classList.add('is-active');
    const src = document.createElement('span');
    src.className = 'src';
    src.textContent = entry.suspectName;
    const text = document.createElement('span');
    text.textContent = entry.answer;
    button.append(src, text);
    button.addEventListener('click', () => { pickedEvidence = ref; renderAccusation(); });
    els.accuseEvidence.append(button);
  }

  els.confirmAccuse.disabled = !(pickedSuspect && pickedEvidence);
  els.accuseButton.disabled = true;
}

function confirmAccusation() {
  const result = core.accuse(pickedSuspect, pickedEvidence);
  if (!result) return;
  els.accusePanel.classList.add('is-hidden');
  showVerdict(result);
}

function showVerdict(result) {
  if (result.correct) markSolved(core.caseData.id);
  els.verdict.classList.toggle('verdict-ok', result.correct);
  els.verdict.classList.toggle('verdict-bad', !result.correct);
  els.verdictKicker.textContent = result.correct ? '结案' : '指认失败';
  els.verdictTitle.textContent = result.correct ? '案子结了' : '还差一口气';
  els.verdictText.textContent = core.verdictText();
  els.solutionBox.innerHTML = '';
  const lines = result.correct
    ? core.caseData.solution
    : ['再回去读一遍证词，找那句和别人对不上的话。'];
  for (const line of lines) {
    const p = document.createElement('p');
    p.textContent = line;
    els.solutionBox.append(p);
  }
  els.nextCase.classList.toggle('is-hidden', !result.correct || core.isLastCase());
  els.verdict.classList.remove('is-hidden');
}

function closeVerdict() {
  els.verdict.classList.add('is-hidden');
  els.solutionBox.innerHTML = '';
}

/* ---------------- 流程 ---------------- */

function renderCaseList() {
  els.caseList.innerHTML = '';
  for (let index = 0; index < caseCount(); index += 1) {
    const data = getCase(index);
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'case-item';
    if (index === core.caseIndex) item.classList.add('is-current');
    if (solvedCases.has(data.id)) item.classList.add('is-solved');

    const left = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'case-name';
    name.textContent = data.title;
    const sub = document.createElement('span');
    sub.className = 'case-sub';
    sub.textContent = data.tag;
    left.append(name, sub);

    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = solvedCases.has(data.id) ? '已破案' : index === core.caseIndex ? '正在办' : '未破';

    item.append(left, status);
    item.addEventListener('click', () => goToCase(index));
    els.caseList.append(item);
  }
}

function goToCase(index) {
  core.loadLevel(index);
  closeVerdict();
  renderCase();
  renderAll();
  els.casesPanel.classList.add('is-hidden');
}

function restartCurrentCase() {
  core.restart();
  closeVerdict();
  renderCase();
  renderAll();
}

els.casesButton.addEventListener('click', () => {
  renderCaseList();
  els.casesPanel.classList.remove('is-hidden');
});
els.closeCases.addEventListener('click', () => els.casesPanel.classList.add('is-hidden'));
els.restartButton.addEventListener('click', restartCurrentCase);

els.accuseButton.addEventListener('click', openAccusation);
els.cancelAccuse.addEventListener('click', () => {
  core.backToInterview();
  els.accusePanel.classList.add('is-hidden');
  renderAll();
});
els.confirmAccuse.addEventListener('click', confirmAccusation);
els.nextCase.addEventListener('click', () => {
  if (!core.nextCase()) return;
  closeVerdict();
  renderCase();
  renderAll();
});
els.retryCase.addEventListener('click', restartCurrentCase);
els.verdictCases.addEventListener('click', () => {
  closeVerdict();
  renderCaseList();
  els.casesPanel.classList.remove('is-hidden');
});

renderCase();
renderAll();

if (new URLSearchParams(location.search).has('debug')) window.__case = core;