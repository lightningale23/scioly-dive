// Prompts whose answers are a fixed official list from the rules. The AI judge is never asked about
// these: an answer that isn't on the list is simply not accepted. Letter-rule variants of these
// prompts are closed too. Add a prompt here only when the rules enumerate every accepted answer.
export const closedLists = new Set([
  'Name a rock or mineral on the 2027 National Rocks and Minerals List.',
  'Name an object or galactic feature from the 2027 Astronomy rules.',
  'Name an ion you are expected to know for Chemistry Lab.',
  'Name a part of an experiment or report scored on the Experimental Design checklist.',
  'Name a substance, material, or technique from the Forensics rules.',
]);
export const isClosedList = prompt => closedLists.has(prompt.split('\n')[0]);
