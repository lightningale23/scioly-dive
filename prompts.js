import { expandCatalog } from './expand-catalog.js';
import { specialistPrompts } from './catalog-data/specialist-prompts.js';
import { specialistPrompts2 } from './catalog-data/specialist-prompts-2.js';

// Every prompt is a specialist prompt written from its event's 2027 Division C rules, so the
// player who studies that event does best. Events appear in the rules manual's order.
const officialEvents = ['Anatomy & Physiology', 'Astronomy', 'Boomilever', 'Botany', 'Chemistry Lab', 'Circuit Lab',
  'Codebusters', 'Designer Genes', 'Disease Detectives', 'Dynamic Planet', 'Electric Vehicle', 'Engineering CAD',
  'Experimental Design', 'Forensics', 'Hovercraft', 'Mission Possible', 'Ping Pong Parachute', 'Protein Modeling',
  'Remote Sensing', 'Rocks & Minerals', 'Thermodynamics', 'Water Quality', 'Wright Stuff'];

export const events = officialEvents.map(name => [name,
  [...specialistPrompts, ...specialistPrompts2].filter(([event]) => event === name).map(([, prompt, bank]) => [prompt, bank])]);

expandCatalog(events);

// Themed packs are paused with the other non-Daily modes; the last value is the pack's first event.
export const packs = [
 ['Field Notebook','Plants, rocks, and fresh water','✿','#769cff',3],
 ['Night Observatory','Stars and stellar remnants','✦','#b77bff',1],
 ['Engineering Bay','Circuits and heat','ϟ','#4de3ff',5],
 ['Watershed Expedition','Rivers, lakes, and groundwater','≈','#ffb35c',9],
 ['Mineral Cabinet','The National Rocks and Minerals List','◆','#ff7bac',19]
];
