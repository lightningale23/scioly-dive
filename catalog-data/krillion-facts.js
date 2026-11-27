import { normalize } from '../matching.js';

// A fact may be [text, word]: then it applies only where the base prompt contains that word,
// because some answers mean different things in different events.
// Fun facts for One in a Krillion picks. When a prompt's answers include one of these, the
// game prefers it as the 100-point answer and shows the fact when someone lands it: the
// Krillion should be a delightful find, not just the most obscure word on the list.
const facts = {
  // Obscure Krillions for prompts that lacked a fact or had an obvious Krillion (2026-11-27)
  'Euler buckling': ['Leonhard Euler worked out the buckling load of a slender column in 1744; doubling a column\u2019s length cuts that load to a quarter.', 'boomilever'],
  'chiasma': ['Frans Alfons Janssens named the chiasma in 1909 for its X shape, after the Greek letter chi, and guessed it marked where chromosomes swap pieces.', 'mendelian'],
  'yazoo stream': ['A yazoo stream runs alongside a bigger river for miles because the natural levee blocks it from joining; it is named for Mississippi\u2019s Yazoo River.', 'freshwater'],
  'spotface': ['A spotface is a very shallow counterbore that only smooths a flat seat for a bolt head or washer on a rough casting.', 'annotation'],
  'medullary index': ['The medullary index (medulla width over hair width) is usually under 1/3 for human hair but over 1/2 for most animal hair.', 'hair, fiber'],
  'pascal': ['One pascal is tiny: roughly the pressure of a sheet of printer paper lying flat on a table.', 'hovercraft'],
  'block and tackle': ['Plutarch wrote that Archimedes, using compound pulleys, single-handedly hauled a fully loaded ship onto dry land.', 'simple machine'],
  'tryptophan': ['Tryptophan is the rarest of the 20 amino acids in most proteins, only about 1 in every 100 residues.', 'amino acid'],
  'crown-of-thorns starfish': ['A crown-of-thorns starfish pushes its stomach out through its mouth to digest coral in place; outbreaks can strip whole reefs.', 'coral reef'],
  'microfilm': ['Indoor fliers once covered wings in microfilm, a lacquer poured onto water and lifted off so thin that it shimmers with rainbow colors.', 'model plane'],
  'weathercocking': ['Weathercocking turns a stable rocket into the wind, because crosswind pushes harder on the fins at the back than on the nose.', 'design parameter'],
  'Wheatstone bridge': ['Samuel Hunter Christie invented the Wheatstone bridge in 1833; Charles Wheatstone only popularized it about ten years later.', 'dc circuit'],
  // Prompts added 2026-11-27 (scoped to a word in their prompt)
  'third-angle projection': ['US drawings use third-angle projection while much of Europe and Asia uses first-angle; a small truncated-cone symbol in the title block tells you which.', 'onshape'],
  'Kasiski examination': ['Friedrich Kasiski published his attack on the Vigen\u00e8re cipher in 1863, ending its reputation as \u201cthe indecipherable cipher\u201d.', 'codebusters'],
  'Darcy\u2019s law': ['Henry Darcy worked out his law of groundwater flow in 1856 while engineering the public fountains of Dijon, France.', 'groundwater'],
  'cap snatching': ['Influenza steals the 5\u2032 caps off the host cell\u2019s own mRNAs, a trick called cap snatching, to start writing its own messages.', 'influenza infection'],
  'Grubbs\u2019 test': ['Frank Grubbs published his outlier test in 1950 while working on ballistics data at the U.S. Army\u2019s Aberdeen Proving Ground.', 'experimental design'],
  'sphincter of Oddi': ['Ruggero Oddi described the sphincter that now bears his name in 1887, while he was still a 23-year-old medical student.', 'digestive'],
  'florigen': ['Florigen was proposed in 1936 as a mystery signal that travels from leaves to buds to start flowering; it was finally shown to be a protein, FT, in 2007.', 'hormone'],
  'wobble hypothesis': ['Francis Crick proposed the wobble hypothesis in 1966 to explain how a cell reads all 61 sense codons with far fewer kinds of tRNA.', 'translation'],
  'anadromous': ['Salmon are anadromous: they hatch in fresh water, grow up at sea, then swim back to the stream where they hatched to spawn.', 'estuary'],
  'quadrature encoder': ['A quadrature encoder reads two signals a quarter cycle apart, so the controller can tell which way a wheel turns, not just how far.', 'microcontroller'],
  'IceCube': ['IceCube\u2019s 5,160 light sensors hang in a cubic kilometer of Antarctic ice, up to about 2.5 km deep, watching for flashes from neutrinos.', 'multi-messenger'],
  'Naegleria fowleri': ['Naegleria fowleri, the \u201cbrain-eating amoeba\u201d, infects people only when warm fresh water goes up the nose; drinking the water does not cause infection.', 'pathogen'],
  'Seasat': ['Seasat, launched in 1978, carried the first imaging radar flown on an Earth-orbiting satellite, but it failed after just 106 days.', 'earth-observing'],
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
  'gusset': ['A gusset plate ties truss members together at a joint. An undersized gusset helped bring down Minneapolis’s I-35W bridge in 2007.', 'structural'],
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
  // Second specialist prompts
  'IgE': 'IgE is the rarest antibody class in the blood, yet it drives allergic reactions, from hay fever to anaphylaxis.',
  'GW170817': ['GW170817 was the first neutron star merger seen in both gravitational waves and light, and about 70 observatories followed it up.', 'astronomy'],
  'Terzan 5': 'Terzan 5, a star cluster near the Milky Way\u2019s center, hosts more known millisecond pulsars than any other cluster.',
  'Panama disease': 'Panama disease wiped out the Gros Michel banana as an export crop by the 1960s, which is why supermarkets switched to the Cavendish.',
  'thiocyanate': 'Thiocyanate and iron(III) ions form a blood-red complex, a classic trick for making stage "fake blood".',
  'Georg Ohm': 'Georg Ohm\u2019s 1827 work on circuits was so badly received that he resigned his teaching post. The Royal Society gave him its Copley Medal in 1841.',
  'Hardy-Weinberg equilibrium': 'The mathematician G. H. Hardy, who prized pure mathematics over practical uses, derived his half of the Hardy\u2013Weinberg principle in a short 1908 letter to Science.',
  'ring vaccination': 'Ring vaccination, vaccinating the contacts around each case, was the strategy that finished off smallpox.',
  'piezoelectricity': 'Piezoelectricity keeps time in quartz watches: a tiny quartz crystal vibrates 32,768 times a second.',
  'red edge': 'Healthy leaves reflect near infrared strongly but absorb red, so reflectance jumps sharply near 700 nm. Satellites watch this "red edge" to track plant health.',
  'Fresnel lens': 'Augustin-Jean Fresnel designed his flat, ridged lens in 1822 to make lighthouses visible for many kilometers.',
  'activated sludge': 'The activated sludge process, still the core of most sewage plants, was developed in Manchester, England, in 1914.',
  'birch': ['Howard Hughes\u2019s "Spruce Goose" flying boat was actually built almost entirely of birch.', 'boomilever'],
};

export const factAnswers = Object.keys(facts);
const lookup = new Map(Object.entries(facts).map(([answer, fact]) => [normalize(answer), Array.isArray(fact) ? fact : [fact]]));
export function factFor(names, prompt) {
  for (const name of names) {
    const [fact, scope] = lookup.get(normalize(name)) ?? [];
    if (fact && (!scope || prompt.split('\n')[0].toLowerCase().includes(scope))) return fact;
  }
}
