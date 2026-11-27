// Regenerates catalog-data/sourced-answers.js: long answer lists pulled from open reference data.
//   Anatomy & Physiology diseases: Human Disease Ontology (CC0), descendants of
//     respiratory system disease (DOID:1579), gastrointestinal system disease (DOID:77) and
//     immune system disease (DOID:2914), with their exact synonyms.
//   Designer Genes restriction enzymes: REBASE (New England Biolabs), as packaged by Biopython;
//     only commercially available enzymes are kept.
//   Circuit Lab chips: Wikipedia's "List of 7400-series integrated circuits" and
//     "List of 4000-series integrated circuits" (CC BY-SA 4.0).
// Usage: node scripts/sourced-answers.mjs [cacheDir]. Downloads are cached in cacheDir (default: a temp dir).
// Hand-written answers in catalog-data/specialist-prompts*.js always win: a sourced spelling that
// another hand-written answer already uses is dropped, so sourced data never merges two answers.
import {mkdirSync, readFileSync, existsSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {normalize} from '../matching.js';
import {specialistPrompts} from '../catalog-data/specialist-prompts.js';
import {specialistPrompts2} from '../catalog-data/specialist-prompts-2.js';
import {specialistPrompts3} from '../catalog-data/specialist-prompts-3.js';
import {expandedGroups} from '../coverage.js';

const cache = process.argv[2] ?? join(tmpdir(), 'scioly-sourced');
mkdirSync(cache, {recursive: true});
const agent = 'AnswerListBuilder/1.0 (educational quiz)';
async function fetchCached(name, url) {
  const file = join(cache, name);
  if (!existsSync(file)) {
    for (let attempt = 0; ; attempt++) {
      const response = await fetch(url, {headers: {'User-Agent': agent}});
      if (response.ok) { writeFileSync(file, await response.text()); break; }
      if (response.status !== 429 || attempt > 6) throw new Error(url + ': ' + response.status);
      await new Promise(done => setTimeout(done, 10000 * (attempt + 1)));
    }
  }
  return readFileSync(file, 'utf8');
}

const PROMPTS = {
  disease: 'Name a disease or disorder of the respiratory, digestive, or immune system.',
  genetics: 'Name an enzyme, technique, or molecule used in molecular genetics.',
  logic: 'Name a digital logic gate, circuit, or concept.',
};
const handRows = [...specialistPrompts, ...specialistPrompts2, ...specialistPrompts3];
const handRaw = prompt => handRows.find(([, text]) => text === prompt)[2];

// Builds a "; "-joined answer string from [canonical, ...aliases] groups. A spelling may belong to
// only one answer: a hand-written group keeps it, and two sourced groups that share one both lose it.
function assemble(prompt, groups) {
  const hand = expandedGroups(prompt, handRaw(prompt));
  const handOwner = new Map();
  hand.forEach((names, i) => names.forEach(name => handOwner.set(normalize(name), i)));
  const uses = new Map();
  for (const group of groups) for (const key of new Set(group.map(normalize))) uses.set(key, (uses.get(key) ?? 0) + 1);
  const out = [];
  for (const group of groups) {
    const keys = group.map(normalize);
    // A sourced answer that is already hand-written only adds its new spellings to that answer.
    const handIndex = handOwner.get(keys[0]);
    const kept = new Set();
    const names = group.filter((name, i) => {
      const key = keys[i], owner = handOwner.get(key);
      if (!key || kept.has(key)) return false;
      const ok = owner === undefined ? i === 0 || uses.get(key) === 1 : owner === handIndex;
      if (ok) kept.add(key);
      return ok;
    });
    if (handIndex !== undefined) {
      // Only an exact match lends its synonyms: a broader sourced term ("fatty liver disease", which
      // includes the alcoholic kind) must not add its synonyms to a narrower hand answer that lists it as an alias.
      if (normalize(group[0]) !== normalize(hand[handIndex][0])) continue;
      const extra = names.filter(name => handOwner.get(normalize(name)) === undefined);
      if (extra.length) out.push([hand[handIndex][0], ...extra]);
    } else if (names[0] === group[0]) out.push(names);
  }
  return out.map(group => group.join('|').replace(/;/g, ',')).join('; ');
}

const tidy = name => name.replace(/'/g, '’').replace(/\s+/g, ' ').trim();

// ---- Human Disease Ontology
async function diseases() {
  const obo = await fetchCached('doid.obo', 'https://raw.githubusercontent.com/DiseaseOntology/HumanDiseaseOntology/main/src/ontology/doid.obo');
  const terms = new Map();
  for (const block of obo.split('\n[Term]\n').slice(1)) {
    const body = block.split('\n[')[0];
    if (/^is_obsolete: true$/m.test(body)) continue;
    const id = body.match(/^id: (\S+)/m)[1];
    terms.set(id, {
      id, name: body.match(/^name: (.+)$/m)[1],
      parents: [...body.matchAll(/^is_a: (\S+)/gm)].map(m => m[1]),
      synonyms: [...body.matchAll(/^synonym: "(.+)" EXACT/gm)].map(m => m[1]),
    });
  }
  const children = new Map();
  for (const term of terms.values()) for (const parent of term.parents) {
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(term.id);
  }
  const roots = ['DOID:1579', 'DOID:77', 'DOID:2914'];
  const found = new Set(), stack = [...roots];
  while (stack.length) for (const child of children.get(stack.pop()) ?? []) if (!found.has(child)) { found.add(child); stack.push(child); }
  // Numbered genetic subtypes ("immunodeficiency 47", "psoriasis 12") are left out; the named
  // disease they belong to is kept. The hepatitis viruses' letters are the exception.
  const numbered = /(\b\d+[a-z]?|\b[ivx]+|type [a-z0-9]+|\b[a-z])$/i;
  const keepNumbered = /^(hepatitis [a-e]|autoimmune polyendocrine syndrome type (1|2))$/i;
  // Allergens no player would name; the broad allergy each belongs to stays.
  const oddAllergy = /^(remazole|chloramine|4-vinyl|acid anhydride|oxirane|phthalyl|patent blue|alcuronium|gallamine|D-mannitol|zebrafish|horned turban|Indian plum|Indian prawn|tiger prawn|white shrimp|brown shrimp|Atlantic|carp|rainbow trout|suprofen|thiopental|amodiaquine|cefotiam|sodium aurothiomalate|disodium cromoglycate|tubocurarine|mepivacaine|isoniazide|quinidine|melphalan|succinylcholine|rocuronium|piperacillin|aztreonam|cefixime|cefaclor|ceftazidime|cefuroxime|cefotaxime|ceftriaxone|meropenem|benzylpenicillin|D-)/i;
  const synonymOk = (synonym, name) => synonym.length <= 50 && !/[,;()\[\]/]| - |\bNOS\b|\bmalignant (neoplasm|tumou?r)\b|\bother\b|\bunspecified\b/i.test(synonym)
    && !(synonym === synonym.toUpperCase() && synonym.length > 7) && normalize(synonym).length > 2 && normalize(synonym) !== normalize(name);
  const groups = [];
  for (const id of [...found].sort()) {
    const {name, synonyms} = terms.get(id);
    if (name.length > 60 || (numbered.test(name) && !keepNumbered.test(name))) continue;
    if (/ allergy$/.test(name) && oddAllergy.test(name)) continue;
    if (/. allergic asthma$/.test(name)) continue;
    if (/allergic contact dermatitis$/.test(name) && !/^allergic contact dermatitis$/.test(name)) continue;
    groups.push([tidy(name), ...synonyms.filter(synonym => synonymOk(synonym, name)).slice(0, 4).map(tidy)]);
  }
  return groups;
}

// ---- REBASE commercially available restriction enzymes (via Biopython)
async function restrictionEnzymes() {
  const source = await fetchCached('Restriction_Dictionary.py', 'https://raw.githubusercontent.com/biopython/biopython/master/Bio/Restriction/Restriction_Dictionary.py');
  const names = [];
  for (const [, name, body] of source.matchAll(/^rest_dict\["([^"]+)"\] = \{([\s\S]*?)^\}/gm)) {
    if (/"suppl": \(\s*"/.test(body)) names.push(name);
  }
  return names.map(name => [name]);
}

// ---- 7400- and 4000-series logic chips
const strip = text => text.replace(/<!--[\s\S]*?-->/g, '').replace(/<ref[\s\S]*?(<\/ref>|\/>)/g, '').replace(/\{\{[^{}]*\}\}/g, '')
  .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1').replace(/\[https?:\S+ ([^\]]*)\]/g, '$1').replace(/'''?/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
// The chip's function, without datasheet notes: "quad 2-input NAND gate, different pinout" -> "quad 2-input NAND gate".
const short = text => strip(text).split(/,| \(|;/)[0].trim();
async function logicChips() {
  const groups = [];
  const ttl = await fetchCached('7400.wiki', 'https://en.wikipedia.org/w/index.php?title=List_of_7400-series_integrated_circuits&action=raw');
  const families = ['LS', 'HC', 'HCT'];
  for (const row of ttl.split(/\n\|-/)) {
    const m = row.match(/^\s*\|\s*\{\{anchor\|[^}]*\}\}\s*74x(\d+)\s*\n\|[^\n]*\n\|([^\n]*)/);
    if (!m) continue;
    const [, number, rawDescription] = m;
    const description = short(rawDescription);
    if (!description || groups.some(group => group[1] === '74' + number)) continue;
    groups.push([`74x${number} (${description})`, '74' + number, ...families.map(f => '74' + f + number), 'SN74' + number]);
  }
  const cmos = await fetchCached('4000.wiki', 'https://en.wikipedia.org/w/index.php?title=List_of_4000-series_integrated_circuits&action=raw');
  for (const row of cmos.split(/\n\|-/)) {
    const m = row.match(/^\s*\|\s*(4\d{3}|45\d{2}|40\d{3})\s*\n\|[^\n]*\n\|[^\n]*\n\|([^\n]*)/);
    if (!m) continue;
    const [, number, rawDescription] = m;
    const description = short(rawDescription);
    if (!description || groups.some(group => group[1] === number)) continue;
    groups.push([`CD${number} (${(/^[A-Z][a-z]/.test(description) ? description.charAt(0).toLowerCase() + description.slice(1) : description)})`, number, 'CD' + number, number + 'B', 'CD' + number + 'B', 'HEF' + number + 'B']);
  }
  return groups;
}

const sections = [
  [PROMPTS.disease, 'Human Disease Ontology (CC0): respiratory, gastrointestinal and immune system diseases', await diseases()],
  [PROMPTS.genetics, 'REBASE via Biopython: commercially available restriction enzymes', await restrictionEnzymes()],
  [PROMPTS.logic, 'Wikipedia (CC BY-SA 4.0): 7400- and 4000-series logic integrated circuits', await logicChips()],
];
let file = '// Generated by scripts/sourced-answers.mjs from open reference data. Do not edit by hand;\n'
  + '// add hand-written answers to catalog-data/specialist-prompts*.js instead.\n'
  + 'export const sourcedAnswers = {\n';
for (const [prompt, source, groups] of sections) {
  const text = assemble(prompt, groups);
  console.log(prompt, '->', text.split('; ').length, 'groups');
  file += `  // ${source}\n  ${JSON.stringify(prompt)}:\n    ${JSON.stringify(text)},\n`;
}
writeFileSync(new URL('../catalog-data/sourced-answers.js', import.meta.url), file + '};\n');
