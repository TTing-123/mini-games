import test from 'node:test';
import assert from 'node:assert/strict';
import { CaseCore, CASES, caseCount, getCase } from '../src/case-core.js';

function askAll(core, refs) {
  for (const ref of refs) {
    const [suspectId, topicId] = ref.split(':');
    core.ask(suspectId, topicId);
  }
}

test('a case loads with its question budget', () => {
  const core = new CaseCore(0);
  assert.equal(core.state.phase, 'interview');
  assert.equal(core.state.questionsLeft, CASES[0].questions);
  assert.equal(core.state.log.length, 0);
});

test('asking a question spends one and records the answer', () => {
  const core = new CaseCore(0);
  const before = core.state.questionsLeft;
  const entry = core.ask('shenchuan', 'when');
  assert.ok(entry);
  assert.equal(core.state.questionsLeft, before - 1);
  assert.equal(core.state.log.length, 1);
  assert.equal(entry.suspectName, '沈川');
});

test('the same question cannot be asked twice', () => {
  const core = new CaseCore(0);
  assert.ok(core.ask('shenchuan', 'when'));
  assert.equal(core.ask('shenchuan', 'when'), false);
  assert.equal(core.state.questionsLeft, CASES[0].questions - 1);
});

test('questions run out and then asking is refused', () => {
  const core = new CaseCore(0);
  const budget = CASES[0].questions;
  let asked = 0;
  for (const person of CASES[0].suspects) {
    for (const topic of person.topics) {
      if (core.ask(person.id, topic.id)) asked += 1;
    }
  }
  assert.equal(asked, budget, 'only the budgeted number of questions get through');
  assert.equal(core.state.questionsLeft, 0);
  assert.equal(core.canAsk(), false);
});

test('naming the culprit AND the decisive line solves the case', () => {
  const core = new CaseCore(0);
  askAll(core, ['xiaohe:notice']);
  core.startAccusation();
  const result = core.accuse('shenchuan', 'xiaohe:notice');
  assert.equal(result.correct, true);
  assert.equal(core.state.phase, 'closed');
});

test('naming the right person with a weak line does not count', () => {
  const core = new CaseCore(0);
  askAll(core, ['shenchuan:money']);
  core.startAccusation();
  const result = core.accuse('shenchuan', 'shenchuan:money');
  assert.equal(result.correct, false);
  assert.equal(result.rightPerson, true);
  assert.equal(result.rightEvidence, false);
  assert.match(core.verdictText(), /不够分量/);
});

test('you can only point at a line you actually heard', () => {
  const core = new CaseCore(0);
  core.startAccusation();
  assert.equal(core.accuse('shenchuan', 'xiaohe:notice'), false, 'that testimony was never collected');
});

test('a wrong culprit fails even with a strong line', () => {
  const core = new CaseCore(0);
  askAll(core, ['xiaohe:notice']);
  core.startAccusation();
  const result = core.accuse('luya', 'xiaohe:notice');
  assert.equal(result.correct, false);
  assert.equal(result.rightPerson, false);
});

test('every case is internally consistent', () => {
  for (let index = 0; index < caseCount(); index += 1) {
    const data = getCase(index);
    const suspectIds = data.suspects.map((s) => s.id);
    assert.ok(suspectIds.includes(data.culprit), `${data.title}: culprit must be a suspect`);

    // 每条决定性证词都得真实存在，而且不能是凶手之外的人替凶手背锅
    for (const ref of data.decisive) {
      const [suspectId, topicId] = ref.split(':');
      const person = data.suspects.find((s) => s.id === suspectId);
      assert.ok(person, `${data.title}: decisive evidence points at an unknown suspect (${ref})`);
      assert.ok(person.topics.some((t) => t.id === topicId), `${data.title}: unknown topic in ${ref}`);
    }

    // 关键证词条数不能超过提问预算，否则玩家来不及问全
    const keyTopics = data.suspects.flatMap((s) => s.topics.filter((t) => t.key)).length;
    assert.ok(keyTopics <= data.questions, `${data.title}: ${keyTopics} key lines but only ${data.questions} questions`);

    const allTopics = data.suspects.flatMap((s) => s.topics).length;
    assert.ok(data.questions < allTopics, `${data.title}: budget must force a choice (${data.questions}/${allTopics})`);
  }
});

test('later cases advance and stop at the end', () => {
  const core = new CaseCore(0);
  assert.equal(core.isLastCase(), false);
  assert.equal(core.nextCase(), true);
  assert.equal(core.caseIndex, 1);
  assert.equal(core.isLastCase(), true);
  assert.equal(core.nextCase(), false);
  core.restart();
  assert.equal(core.caseIndex, 1, 'restart stays on the current case');
});