// Pages loads playable rows once, so each round keeps its own prompt and answers.
// The Node build emits a prompt-only version of this module and validates on the server.
export {questions as events} from './answer-bank.js';
export {packs} from './prompts.js';
