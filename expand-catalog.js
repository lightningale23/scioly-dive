import { addNumericalPrompts } from './numerical-prompts.js';
import { measurements, measurementBank } from './measurements.js';
import { topics } from './topics.js';
import { broadPrompts } from './catalog-data/broad-prompts.js';
import { broadPrompts2 } from './catalog-data/broad-prompts-2.js';
import { specialistPrompts } from './catalog-data/specialist-prompts.js';

// Keep the original seven events and their first two entries in place for archived dives.
export const combinedSources=new Map();
export function expandCatalog(events) {
  for (const [event, entries] of topics) {
    let section = events.find(([name]) => name === event);
    if (!section) {
      section = [event, []];
      events.push(section);
    }
    section[1].push(...entries);
  }

  const combinations = [
    ['Experimental Design', 'a measurement or analysis term from experimental design or remote sensing', ['Experimental Design','Remote Sensing']],
    ['Water Quality', 'a freshwater organism or river landform', ['Water Quality','Dynamic Planet']],
    ['Engineering CAD', 'a CAD operation, sketch constraint, or load-bearing structural term', ['Engineering CAD','Boomilever']],
    ['Hovercraft', 'a flight or fluid-mechanics term from aircraft, hovercraft, or parachute design', ['Hovercraft','Wright Stuff','Ping Pong Parachute']],
    ['Mission Possible', 'a mechanism or component from a mechanical or hydraulic system', ['Mission Possible','Hydraulics']],
    ['Disease Detectives', 'a study design, experimental variable, or statistical term', ['Experimental Design','Disease Detectives']],
    ['Electric Vehicle', 'a vehicle component or circuit measurement unit', ['Electric Vehicle','Circuit Lab']],
    ['Thermodynamics', 'a thermal quantity, hydraulic component, or fluid-system measurement', ['Thermodynamics','Hydraulics']],
    ['Protein Modeling', 'an amino acid, protein structure term, or classical genetics term', ['Protein Modeling','Designer Genes']],
    ['Botany', 'a flowering plant family or a freshwater organism', ['Botany','Water Quality']],
  ];
  for (const [event, subject, members] of combinations) {
    const sources=topics.filter(([name])=>members.includes(name)).flatMap(([name,entries])=>entries.slice(0,name==="Protein Modeling"||name==="Boomilever"?2:1));
    combinedSources.set('Name '+subject+'.',sources.map(([prompt])=>prompt));
    const groups=sources.flatMap(([,bank])=>bank.split('; '));
    events.find(([name]) => name === event)[1].push(['Name '+subject+'.', [...new Set(groups)].join('; ')]);
  }

  const domains=[
    ['experimental measurement and analysis',['Experimental Design','Disease Detectives','Remote Sensing']],
    ['engineering design and model construction',['Boomilever','Engineering CAD','Junkyard Challenge','Electric Vehicle','Mission Possible','Hydraulics']],
    ['flight and fluid mechanics',['Hovercraft','Wright Stuff','Ping Pong Parachute','Hydraulics']],
    ['Earth and space science',['Rocks & Minerals','Astronomy','Dynamic Planet','Remote Sensing']],
    ['biology and freshwater ecology',['Anatomy & Physiology','Botany','Water Quality','Designer Genes','Protein Modeling']],
  ];
  for(const [domain,members] of domains){
    const sources=topics.filter(([name])=>members.includes(name)).flatMap(([,rows])=>rows);
    combinedSources.set('What term might you hear in '+domain+'?',sources.map(([prompt])=>prompt));
    const groups=sources.flatMap(([,bank])=>bank.split('; '));
    const merged=new Map();
    for(const group of groups){
      const [term,...aliases]=group.split('|');
      const names=merged.get(term.toLowerCase())??new Set([term]);
      for(const alias of aliases)names.add(alias);
      merged.set(term.toLowerCase(),names);
    }
    const bank=[...merged.values()].map(names=>[...names].join('|')).join('; ');
    events.find(([event])=>event===members[0])[1].push(['What term might you hear in '+domain+'?',bank]);
  }

  // Broad prompts carry the first Daily day that may draw them (third element).
  for(const [event,prompt,bank,firstDay] of [...broadPrompts,...broadPrompts2,...specialistPrompts]){
    events.find(([name])=>name===event)[1].push(firstDay?[prompt,bank,firstDay]:[prompt,bank]);
  }

  const letters = word => word.toLowerCase().normalize('NFKD').replace(/[^a-z]/g,'');
  for (const [,entries] of events) {
    for (const [prompt,bank,firstDay] of [...entries]) {
      const groups = bank.split('; ').map(item => item.split('|'));
      if (groups.length < 18) continue;
      for (const [phrase,test] of [
        ['starts with',(word,c)=>word.startsWith(c)],
        ['ends with',(word,c)=>word.endsWith(c)],
        ['contains',(word,c)=>word.includes(c)],
      ]) {
        for (const c of 'abcdefghijklmnopqrstuvwxyz') {
          const matches = groups.map(names=>names.filter(n=>test(letters(n),c))).filter(names=>names.length);
          // Keep a meaningful choice of answers and discard nearly redundant constraints.
          if (matches.length < 8 || matches.length >= groups.length*.9) continue;
          const variant=[prompt+'\n'+({'starts with':'Start with','ends with':'End with','contains':'Include'}[phrase])+' the letter '+c.toUpperCase()+'.', matches.map(names=>names.join('|')).join('; ')];
          entries.push(firstDay?[...variant,firstDay]:variant);
        }
      }
    }
  }
  for(const [event,prompt,unit] of measurements){
    events.find(([name])=>name===event)[1].push([prompt+' Unit names and symbols both count.',measurementBank(unit)]);
  }
  addNumericalPrompts(events);
}
