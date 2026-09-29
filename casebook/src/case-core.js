// 案卷核心逻辑：审问 → 指认 → 结算。纯状态机，不碰 DOM，可在 Node 里直接跑。
//
// 破案要两样都对：指对人，还要指出哪句证词是决定性的。
// 只说「是他」不算破案——你得像真的办案一样说清楚凭什么。

import { CASES, getCase, caseCount } from './cases.js';

export { CASES, getCase, caseCount };

export class CaseCore {
  constructor(caseIndex = 0) {
    this.events = [];
    this.state = null;
    this.loadLevel(caseIndex);
  }

  loadLevel(index) {
    const data = getCase(index);
    if (!data) throw new Error(`no case at index ${index}`);
    this.caseIndex = index;
    this.data = data;
    this.state = {
      phase: 'interview',        // interview | accuse | closed
      questionsLeft: data.questions,
      questionsMax: data.questions,
      asked: {},                 // { suspectId: { topicId: true } }
      log: [],                   // 按提问顺序记下证词
      selected: data.suspects[0]?.id ?? null,
      accusation: null,
      choseEvidence: null,
      correct: null
    };
    this.queue('caseLoaded', { title: data.title, tag: data.tag });
  }

  nextCase() {
    if (this.caseIndex + 1 >= caseCount()) return false;
    this.loadLevel(this.caseIndex + 1);
    return true;
  }

  isLastCase() {
    return this.caseIndex + 1 >= caseCount();
  }

  restart() {
    this.loadLevel(this.caseIndex);
  }

  queue(type, data = {}) {
    this.events.push(type === undefined ? {} : { type, ...data });
  }

  consumeEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }

  /* ---------------- 查询 ---------------- */

  get caseData() {
    return this.data;
  }

  suspect(id) {
    return this.data.suspects.find((item) => item.id === id) ?? null;
  }

  hasAsked(suspectId, topicId) {
    return !!(this.state.asked[suspectId]?.[topicId]);
  }

  canAsk() {
    return this.state.phase === 'interview' && this.state.questionsLeft > 0;
  }

  // 已经问到几条带 key 的关键证词：用来给玩家一个「信息够不够」的信号，但不点破是哪些
  keyEvidenceCount() {
    return this.state.log.filter((entry) => entry.key).length;
  }

  /* ---------------- 动作 ---------------- */

  select(suspectId) {
    if (!this.suspect(suspectId)) return false;
    this.state.selected = suspectId;
    this.queue('selected', { id: suspectId });
    return true;
  }

  ask(suspectId, topicId) {
    if (!this.canAsk()) return false;
    const person = this.suspect(suspectId);
    if (!person) return false;
    const topic = person.topics.find((item) => item.id === topicId);
    if (!topic) return false;
    if (this.hasAsked(suspectId, topicId)) return false;

    if (!this.state.asked[suspectId]) this.state.asked[suspectId] = {};
    this.state.asked[suspectId][topicId] = true;
    this.state.questionsLeft -= 1;

    const entry = {
      suspectId,
      suspectName: person.name,
      topicId,
      question: topic.label,
      answer: topic.answer,
      key: !!topic.key
    };
    this.state.log.push(entry);
    this.queue('answer', entry);

    if (this.state.questionsLeft <= 0) this.queue('outOfQuestions', {});
    return entry;
  }

  // 进入指认阶段：不用非得把提问用完，觉得有把握就可以指人
  startAccusation() {
    if (this.state.phase !== 'interview') return false;
    this.state.phase = 'accuse';
    this.queue('accusePhase', {});
    return true;
  }

  backToInterview() {
    if (this.state.phase !== 'accuse') return false;
    this.state.phase = 'interview';
    this.state.accusation = null;
    this.state.choseEvidence = null;
    this.queue('interviewPhase', {});
    return true;
  }

  accuse(suspectId, evidenceRef) {
    if (this.state.phase !== 'accuse') return false;
    if (!this.suspect(suspectId)) return false;
    const chosen = this.state.log.find((entry) => `${entry.suspectId}:${entry.topicId}` === evidenceRef);
    if (!chosen) return false;

    const rightPerson = suspectId === this.data.culprit;
    const rightEvidence = (this.data.decisive ?? []).includes(evidenceRef);
    const correct = rightPerson && rightEvidence;

    this.state.accusation = suspectId;
    this.state.choseEvidence = evidenceRef;
    this.state.correct = correct;
    this.state.phase = 'closed';
    this.queue('verdict', { correct, rightPerson, rightEvidence, suspectId, evidenceRef });
    return { correct, rightPerson, rightEvidence };
  }

  /* ---------------- 结算文案 ---------------- */

  verdictText() {
    const { correct, accusation, choseEvidence } = this.state;
    if (correct === null) return '';
    const person = this.suspect(accusation);
    const chosen = this.state.log.find((entry) => `${entry.suspectId}:${entry.topicId}` === choseEvidence);
    if (correct) {
      return `你指认了${person.name}，并指出决定性的那句话——${chosen.suspectName}说的「${chosen.answer}」。案子结了。`;
    }
    const rightPerson = accusation === this.data.culprit;
    if (!rightPerson) return `你指认了${person.name}。他确实有问题，但不是他。`;
    return `凶手确实是他。但你举出的那句话不够分量——${chosen.suspectName}说的「${chosen.answer}」还证不死他。`;
  }
}