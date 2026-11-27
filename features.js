// While answer lists are being filled in, the site offers only the Daily Dive.
// Set to false to bring back Unlimited, Archive, Themed Packs and the Puffer Party preview.
export const dailyOnly = true;
export const modeAllowed = mode => !dailyOnly || mode === 'Daily';

// Trial events (not yet official Division C events) are left out of every dive for now.
export const pausedEvents = ['Code Craze', 'Hydraulics', 'Junkyard Challenge'];

// Hand-picked Dailies, keyed by UTC day number (days since 1970-01-01): seven [event, prompt]
// pairs in round order. Every prompt must exist in the catalog; test/catalog.test.js checks this.
export const featuredDailies = {
  // 2026-11-27: specialist prompts drawn from the 2027 rules.
  20784: [
    ['Rocks & Minerals', 'Name a rock or mineral on the 2027 National Rocks and Minerals List.'],
    ['Circuit Lab', 'Name a digital logic gate, circuit, or concept.'],
    ['Anatomy & Physiology', 'Name a disease or disorder of the respiratory, digestive, or immune system.'],
    ['Chemistry Lab', 'Name a concept, law, or quantity from gas behavior or reaction kinetics.'],
    ['Designer Genes', 'Name an enzyme, technique, or molecule used in molecular genetics.'],
    ['Astronomy', 'Name a type of star, stellar remnant, or stellar explosion.'],
    ['Disease Detectives', 'Name an epidemiology term, measure, or study design.'],
  ],
};
