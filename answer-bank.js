import { events } from './prompts.js';

export const tiers = [10, 15, 30, 60, 85, 100];
export const tierNames = { 10: 'Common', 15: 'Too Clever', 30: 'Uncommon', 60: 'Rare', 85: 'Very Rare', 100: 'One in a Krillion' };
export const normalize = value => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');

// Editorial scores in canonical-answer order. The 15 and 100 tiers are reserved
// for deliberately selected picks and override general familiarity.
const editorial = [
  [[10, 30, 30, 60, 15], [10, 10, 10, 30, 15, 60, 85, 100]],
  [[10, 30, 60, 30, 15, 85, 60, 100], [10, 15, 30, 30, 60, 60, 85, 85, 85, 85, 100]],
  [[10, 30, 10, 10, 30, 30, 30, 60, 60, 60, 85, 100], [10, 10, 30, 60, 85, 60, 15, 100]],
  [[10, 10, 15, 30, 60], [10, 10, 15, 30, 60]],
  [[15, 10, 30, 30, 60, 85, 85, 60, 100], [10, 10, 10, 30, 30, 60, 85, 60, 60, 100]],
  [[10, 10, 30, 30, 30, 30, 60, 60, 15, 85, 85, 60, 85, 100], [10, 15, 10, 30, 30, 60, 60, 85, 85, 100]],
  [[10, 30, 30, 15, 85, 100], [10, 10, 10, 30, 15, 85]],
];

// Optional precomputed corpus data, expressed as occurrences per million.
const familiarity = JSON.parse(process.env.ANSWER_FAMILIARITY_JSON || '{}');

export const questions = events.map(([event, entries], eventIndex) => [event, entries.map(([prompt, bank], questionIndex) => ({
  prompt,
  bank: bank.split(';').map((group, index) => {
    const [canonical, ...aliases] = group.trim().split('|');
    const curated = editorial[eventIndex][questionIndex][index];
    const frequency = familiarity[normalize(canonical)];
    const points = !Number.isFinite(frequency) || curated === 15 || curated === 100 ? curated
      : frequency >= 50 ? 10 : frequency >= 5 ? 30 : frequency >= 0.5 ? 60 : 85;
    return {canonical, aliases, points};
  }),
}))]);

export function questionFor(seed, round, first) {
  const eventIndex = ((first ?? seed % questions.length) + round) % questions.length;
  const [event, entries] = questions[eventIndex];
  return entries[(Math.floor(seed / questions.length) + round) % entries.length];
}
