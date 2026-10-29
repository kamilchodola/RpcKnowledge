// The dataset the browser loads: every category's lessons, in reading order, each joined
// with its checkpoint questions. Lessons live in data/<category>.js and questions in
// data/quizzes/<category>.js, so a question can be reviewed or replaced without touching
// the lesson it tests. data/roadmap.js is the suggested order to read them in.
export { categories } from './data/categories.js';
export { stages } from './data/roadmap.js';
import { topics as foundations } from './data/foundations.js';
import { topics as protocol } from './data/protocol.js';
import { topics as requests } from './data/requests.js';
import { topics as clients } from './data/clients.js';
import { topics as nodes } from './data/nodes.js';
import { topics as consensus } from './data/consensus.js';
import { topics as indexing } from './data/indexing.js';
import { topics as proofs } from './data/proofs.js';
import { topics as scaling } from './data/scaling.js';
import { topics as operations } from './data/operations.js';
import { topics as tooling } from './data/tooling.js';
import { quizzes as foundationsQuiz } from './data/quizzes/foundations.js';
import { quizzes as protocolQuiz } from './data/quizzes/protocol.js';
import { quizzes as requestsQuiz } from './data/quizzes/requests.js';
import { quizzes as clientsQuiz } from './data/quizzes/clients.js';
import { quizzes as nodesQuiz } from './data/quizzes/nodes.js';
import { quizzes as consensusQuiz } from './data/quizzes/consensus.js';
import { quizzes as indexingQuiz } from './data/quizzes/indexing.js';
import { quizzes as proofsQuiz } from './data/quizzes/proofs.js';
import { quizzes as scalingQuiz } from './data/quizzes/scaling.js';
import { quizzes as operationsQuiz } from './data/quizzes/operations.js';
import { quizzes as toolingQuiz } from './data/quizzes/tooling.js';

const quizzes = Object.assign({}, foundationsQuiz, protocolQuiz, requestsQuiz, clientsQuiz, nodesQuiz,
  consensusQuiz, indexingQuiz, proofsQuiz, scalingQuiz, operationsQuiz, toolingQuiz);

export const topics = [...foundations, ...protocol, ...requests, ...clients, ...nodes, ...consensus,
  ...indexing, ...proofs, ...scaling, ...operations, ...tooling]
  .map(topic => ({ ...topic, quiz: quizzes[topic.id] ?? [] }));
