// Checkpoint attempts for the knowledge map.
//
// Every question is written by hand, per topic, in data/quizzes/<category>.js: six per
// topic, each tagged with the kind of thinking it asks for (a scenario, a cause, a contrast,
// a detail, a consequence). An attempt draws five, taking one of each kind before any
// repeats, and shuffles both the question order and every question's options. A retry is
// therefore neither the same set nor the same layout, and "the answer was the third one"
// carries nothing over.
//
// There used to be a generator here that built fill-in-the-blank questions from lesson
// sentences. It blanked the word used in the sentence but offered topic titles as options,
// so the correct option often did not fit the gap. It is gone on purpose: a checkpoint that
// gates "learned" has to be fair, and fair questions have to be written by someone who read
// the lesson.
//
// The correct index never reaches the DOM; app.js keeps it in a closure.

export const QUIZ_LENGTH = 5;
export const MIN_QUESTIONS = 3;

/** Deterministic PRNG, so an attempt stays stable while it is on screen. */
function rng(seedText) {
  let hash = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/**
 * One attempt at a topic's checkpoint: up to QUIZ_LENGTH questions shaped as
 * `{ kind, prompt, options, answer }`, where `answer` indexes the shuffled options.
 */
export function buildAttempt(topic, attemptSeed = '') {
  const random = rng(`attempt:${topic.id}:${attemptSeed}`);
  const pool = shuffle(topic.quiz ?? [], random);
  const picked = [];
  const kinds = new Set();
  for (const question of pool) {
    if (picked.length < QUIZ_LENGTH && !kinds.has(question.kind)) { picked.push(question); kinds.add(question.kind); }
  }
  for (const question of pool) {
    if (picked.length < QUIZ_LENGTH && !picked.includes(question)) picked.push(question);
  }
  return shuffle(picked, random).map(question => {
    const correct = question.options[question.answer];
    const options = shuffle(question.options, random);
    return { kind: question.kind, prompt: question.question, options, answer: options.indexOf(correct) };
  });
}
