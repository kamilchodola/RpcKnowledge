// The Polish translation, laid over the English dataset by localizeDataset in
// src/dataset.js. Each file holds only translated words, keyed by id: ids, links, code,
// related topics, and sources come from the English records. A lesson with no entry here
// is shown in English, marked as not yet translated.
export const lang = 'pl';
export { categories } from './categories.js';
export { stages } from './roadmap.js';
import { topics as foundations } from './foundations.js';
import { topics as protocol } from './protocol.js';
import { topics as requests } from './requests.js';
import { topics as clients } from './clients.js';
import { topics as nodes } from './nodes.js';
import { topics as consensus } from './consensus.js';
import { topics as indexing } from './indexing.js';
import { topics as proofs } from './proofs.js';
import { topics as scaling } from './scaling.js';
import { topics as operations } from './operations.js';
import { topics as tooling } from './tooling.js';
import { quizzes as foundationsQuiz } from './quizzes/foundations.js';
import { quizzes as protocolQuiz } from './quizzes/protocol.js';
import { quizzes as requestsQuiz } from './quizzes/requests.js';
import { quizzes as clientsQuiz } from './quizzes/clients.js';
import { quizzes as nodesQuiz } from './quizzes/nodes.js';
import { quizzes as consensusQuiz } from './quizzes/consensus.js';
import { quizzes as indexingQuiz } from './quizzes/indexing.js';
import { quizzes as proofsQuiz } from './quizzes/proofs.js';
import { quizzes as scalingQuiz } from './quizzes/scaling.js';
import { quizzes as operationsQuiz } from './quizzes/operations.js';
import { quizzes as toolingQuiz } from './quizzes/tooling.js';

export const topics = { ...foundations, ...protocol, ...requests, ...clients, ...nodes, ...consensus, ...indexing, ...proofs, ...scaling, ...operations, ...tooling };
export const quizzes = { ...foundationsQuiz, ...protocolQuiz, ...requestsQuiz, ...clientsQuiz, ...nodesQuiz, ...consensusQuiz, ...indexingQuiz, ...proofsQuiz, ...scalingQuiz, ...operationsQuiz, ...toolingQuiz };
