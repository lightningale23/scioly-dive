import { normalize } from '../matching.js';

// A fact may be [text, word]: then it applies only where the base prompt contains that word,
// because some answers mean different things in different events.
// Fun facts for One in a Krillion picks. When a prompt's answers include one of these, the
// game prefers it as the 100-point answer and shows the fact when someone lands it: the
// Krillion should be a delightful find, not just the most obscure word on the list.
const facts = {
  // Astronomy
  'Cepheid': ['Henrietta Swan Leavitt discovered the Cepheid period–luminosity relation in 1912, giving astronomers a yardstick for the universe.', 'distance'],
  // Botany
  'pistil': 'Pistil comes from the Latin pistillum, "pestle", for its shape.',
  'Casparian strip': 'The Casparian strip is a waxy band in root cells that forces water and minerals through a living checkpoint before they enter the xylem.',
  'ginkgo': 'Ginkgo trees about 1–2 km from the Hiroshima blast survived and still grow today, and the lineage is over 200 million years old.',
  'mangrove': 'Many mangroves give birth to live seedlings that sprout while still attached to the parent tree, then float off to root elsewhere.',
  // Chemistry Lab
  'Graham law': 'Graham’s law explains why a helium balloon deflates faster than an air-filled one: lighter gas molecules escape more quickly.',
  // Circuit Lab
  'NOR': ['The Apollo Guidance Computer that flew to the Moon was built almost entirely from NOR gates.', 'logic gate'],
  // Codebusters
  'scytale': 'Spartan messengers wrapped a strip around a rod of an agreed thickness. Unwound, the strip’s letters looked like nonsense.',
  'crib': ['Bletchley Park codebreakers called guessed plaintext a crib. Routine German weather reports made famously good cribs.', 'cipher'],
  // Designer Genes / Disease Detectives
  'cohort study': ['The Framingham Heart Study, a cohort study begun in 1948, has followed three generations of one Massachusetts town.', 'population health'],
  // Dynamic Planet
  'knickpoint': 'Niagara Falls is a knickpoint that has retreated upstream about 11 km over roughly 12,000 years.',
  'oxbow lake': 'Oxbow lakes are named for the U-shaped collar of an ox yoke.',
  'meander': ['Meander comes from the Maeander River in Turkey, famous in ancient times for its winding course.', 'river'],
  'saltation': ['Saltation is Latin for "leaping": sand grains hop along a riverbed or desert in short arcs.', 'freshwater'],
  'sublimation': 'Snow can vanish on cold, dry, windy days without melting: it sublimates straight into water vapor.',
  // Engineering CAD / Mission Possible / Boomilever
  'gusset': 'A gusset plate ties truss members together at a joint. An undersized gusset helped bring down Minneapolis’s I-35W bridge in 2007.',
  // Flight
  'spill hole': 'A spill hole at the top of a parachute lets air escape steadily, which cuts down on side-to-side swinging.',
  // Protein Modeling
  'green fluorescent protein': ['Green fluorescent protein comes from the jellyfish Aequorea victoria, and its development won the 2008 Nobel Prize in Chemistry.', 'protein'],
  'sulfur': ['Only two of the twenty standard amino acids contain sulfur: cysteine and methionine.', 'amino'],
  // Rocks & Minerals
  'pumice': ['Pumice is so full of gas bubbles that it floats. Rafts of pumice have drifted across entire oceans.', 'igneous'],
  'tuff': 'The giant moai statues of Easter Island are carved from volcanic tuff.',
  // Thermodynamics
  'deposition': ['Frost on a window forms by deposition: water vapor turns straight into ice without becoming liquid first.', 'thermodynamics'],
  'latent heat': 'Joseph Black introduced latent heat in the 1760s after noticing that melting ice absorbs heat without warming up.',
  // Water Quality
  'parrotfish': 'Parrotfish grind coral and excrete it as fine sand. Much of the white sand on tropical beaches has been through one.',
  // Broad prompts
  'GRACE': 'The twin GRACE satellites "weighed" Earth\u2019s water by measuring tiny changes in the distance between them as gravity varied below.',
  // Today's specialist prompts
  'ulexite': 'Ulexite is nicknamed "TV rock": its parallel fibers carry light like optical fibers, so text beneath a polished slab appears on its top surface.',
  'Job\u2019s syndrome': 'Job\u2019s syndrome (hyper-IgE syndrome) is named after the biblical Job, struck with boils, because patients suffer repeated skin abscesses.',
  'Taq polymerase': 'Taq polymerase comes from Thermus aquaticus, a bacterium found in a Yellowstone hot spring. Because it survives near-boiling heat, PCR became practical.',
  'Thorne-Zytkow object': 'A Thorne\u2013\u017bytkow object is a hypothetical star with a neutron star at its core, hidden inside a red supergiant.',
  'Koch\u2019s postulates': 'Robert Koch himself found healthy people carrying cholera bacteria, so his own postulate that the microbe appears only in the sick could not always hold.',
  // Specialist prompts for every event
  'Hall effect sensor': 'Edwin Hall discovered the Hall effect in 1879 as a graduate student, 18 years before the electron was identified.',
  'Onshape': 'Onshape was co-founded by Jon Hirschtick, who earlier co-founded SolidWorks.',
  'null hypothesis': ['Ronald Fisher popularized the null hypothesis with a test of whether a colleague, Muriel Bristol, could taste if milk was poured into tea first.', 'experiment'],
  'ninhydrin': 'Ninhydrin reacts with amino acids left in fingerprint sweat, turning latent prints a deep purple known as Ruhemann\u2019s purple.',
  'ground effect': 'Ground effect let the Soviet ekranoplan nicknamed the "Caspian Sea Monster" skim a few meters above the water on its wings.',
  'Archimedes screw': 'Archimedes screws are still used today, both to lift water and as fish-friendly turbines in small hydropower plants.',
  'sialic acid': 'Sialic acid takes its name from the Greek sialon, "saliva", because it was first isolated from salivary mucin.',
  'Maxwell\u2019s demon': 'Maxwell\u2019s demon, a thought experiment from 1867, imagined a tiny being sorting fast and slow molecules to beat the second law of thermodynamics.',
  'decalage': 'D\u00e9calage is French for "offset": the difference in incidence between a plane\u2019s wing and its stabilizer.',
};

export const factAnswers = Object.keys(facts);
const lookup = new Map(Object.entries(facts).map(([answer, fact]) => [normalize(answer), Array.isArray(fact) ? fact : [fact]]));
export function factFor(names, prompt) {
  for (const name of names) {
    const [fact, scope] = lookup.get(normalize(name)) ?? [];
    if (fact && (!scope || prompt.split('\n')[0].toLowerCase().includes(scope))) return fact;
  }
}
