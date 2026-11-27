import { normalize } from '../matching.js';

// A fact may be [text, word]: then it applies only where the base prompt contains that word,
// because some answers mean different things in different events.
// Fun facts for One in a Krillion picks. When a prompt's answers include one of these, the
// game prefers it as the 100-point answer and shows the fact when someone lands it: the
// Krillion should be a delightful find, not just the most obscure word on the list.
const facts = {
  // Anatomy & Physiology
  'inferior nasal concha': 'The inferior nasal conchae are scroll-shaped bones that swirl incoming air so it is warmed and humidified before it reaches your lungs.',
  'zygomatic bone': 'The zygomatic bone is your cheekbone. Its name comes from the Greek zygon, meaning "yoke".',
  'intermediate cuneiform': 'Cuneiform means "wedge-shaped", the same root as the wedge-shaped writing of ancient Mesopotamia.',
  'hyoid': 'The hyoid is the only bone in the human body that does not touch any other bone.',
  'stapes': 'The stapes, in the middle ear, is the smallest bone in the body: about 3 mm long.',
  'coccyx': 'Coccyx comes from the Greek for "cuckoo", because the tailbone was thought to look like a cuckoo’s beak.',
  'Wernicke’s area': 'Damage to Wernicke’s area can leave speech fluent but meaningless, a symptom sometimes called "word salad".',
  'hippocampus': 'Hippocampus is Greek for "seahorse", a nod to the structure’s curled shape.',
  'vagus': 'Vagus is Latin for "wandering": this cranial nerve runs from the brainstem all the way to the abdomen.',
  'stapedius': 'The stapedius is the smallest skeletal muscle in the body. It steadies the stapes to protect your inner ear from loud sounds.',
  'sartorius': 'The sartorius is the longest muscle in the body, named from the Latin for "tailor" after the cross-legged pose tailors once sat in.',
  'fovea': 'The fovea is a pit only about 1.5 mm wide, yet it supplies nearly all of your sharp central vision.',
  // Astronomy
  'Ophiuchus': 'Ophiuchus, the Serpent Bearer, sits on the ecliptic. The Sun passes through it every year, yet it is not a zodiac sign.',
  'Crux': 'Crux, the Southern Cross, is the smallest of the 88 modern constellations, and it appears on the flags of Australia, Brazil and New Zealand.',
  'Polaris': 'Polaris will not be the North Star forever: Earth’s slow wobble will make Vega the pole star in about 12,000 years.',
  'Mira': ['Mira means "wonderful". It was one of the first variable stars recognized, brightening and fading over about 11 months.', 'star'],
  'Albireo': 'Through a small telescope, Albireo splits into a golden star and a blue one, one of the prettiest color contrasts in the sky.',
  'Cepheid': 'Henrietta Swan Leavitt discovered the Cepheid period–luminosity relation in 1912, giving astronomers a yardstick for the universe.',
  'Cartwheel': 'The Cartwheel Galaxy’s ring formed when a smaller galaxy plunged through its center, like a stone dropped into a pond.',
  'Dysnomia': 'Dysnomia orbits the dwarf planet Eris and is named after Eris’s daughter, the spirit of lawlessness.',
  'Miranda': ['Miranda, a moon of Uranus, has Verona Rupes, a cliff around 20 km tall, among the tallest known in the Solar System.', 'moon'],
  'yardang': 'Yardangs are wind-carved ridges named from a Turkic word for a steep bank, and they are found on Mars as well as Earth.',
  // Botany
  'pistil': 'Pistil comes from the Latin pistillum, "pestle", for its shape.',
  'Casparian strip': 'The Casparian strip is a waxy band in root cells that forces water and minerals through a living checkpoint before they enter the xylem.',
  'ciliate': 'A ciliate leaf edge is fringed with hairs. Cilia is Latin for "eyelashes".',
  'cladode': 'The flat pads of a prickly pear cactus are cladodes: stems that have taken over a leaf’s job.',
  'ginkgo': 'Ginkgo trees about 1–2 km from the Hiroshima blast survived and still grow today, and the lineage is over 200 million years old.',
  'bristlecone pine': 'Some living bristlecone pines are more than 4,800 years old, older than the Egyptian pyramids.',
  'mangrove': 'Many mangroves give birth to live seedlings that sprout while still attached to the parent tree, then float off to root elsewhere.',
  'Orchidaceae': 'Orchidaceae is one of the largest plant families, with around 28,000 species, and vanilla comes from one of them.',
  // Chemistry Lab
  'technetium': 'Technetium was the first element made artificially, and its name comes from the Greek for "artificial".',
  'gallium': 'Gallium melts at about 30 °C, so a piece will turn liquid in your hand.',
  'yttrium': 'Yttrium is one of four elements named after a single Swedish village, Ytterby. The others are ytterbium, terbium and erbium.',
  'osmium': 'Osmium is the densest naturally occurring element, about twice as dense as lead.',
  'bromine': 'Bromine is one of only two elements that are liquid at room temperature. The other is mercury.',
  'galinstan': 'Galinstan, an alloy of gallium, indium and tin, replaced mercury in many thermometers because it stays liquid below freezing and is far less toxic.',
  'Graham law': 'Graham’s law explains why a helium balloon deflates faster than an air-filled one: lighter gas molecules escape more quickly.',
  'Erlenmeyer flask': 'The Erlenmeyer flask is named after Emil Erlenmeyer, who introduced it in 1860. Its sloped sides let you swirl without spilling.',
  'pycnometer': 'A pycnometer’s stopper has a thin capillary hole, so the flask holds an exactly repeatable volume for density measurements.',
  // Circuit Lab
  'Norton theorem': 'Edward Norton described Norton’s theorem in a 1926 Bell Labs memo and never formally published it.',
  'NOR': ['The Apollo Guidance Computer that flew to the Moon was built almost entirely from NOR gates.', 'logic gate'],
  'NAND': ['NAND is a universal gate: every other logic gate can be built from NAND gates alone.', 'logic gate'],
  'memristor': 'Leon Chua predicted the memristor in 1971 as the missing fourth basic circuit element. HP Labs reported a working device in 2008.',
  'siemens': 'The siemens, the unit of conductance, was once called the mho: "ohm" spelled backwards.',
  // Codebusters
  'scytale': 'Spartan messengers wrapped a strip around a rod of an agreed thickness. Unwound, the strip’s letters looked like nonsense.',
  'crib': ['Bletchley Park codebreakers called guessed plaintext a crib. Routine German weather reports made famously good cribs.', 'cipher'],
  'Elizebeth Friedman': 'Elizebeth Friedman broke rum-runners’ codes during Prohibition and later helped unmask Nazi spy rings in South America.',
  'Joan Clarke': 'Joan Clarke worked on Enigma in Hut 8 at Bletchley Park and became its deputy head.',
  // Designer Genes / Disease Detectives
  'hemophilia': 'Queen Victoria carried hemophilia, and her descendants passed it into the royal families of Spain, Germany and Russia.',
  'progeria': 'Progeria is caused by a single-letter change in the LMNA gene. Most cases arise as new mutations rather than being inherited.',
  'smallpox': 'Smallpox is the only human disease ever eradicated. The last natural case was in 1977, and eradication was declared in 1980.',
  'Kuru': 'Kuru, a prion disease in Papua New Guinea, spread through funeral rites in which relatives ate the dead.',
  'cohort study': 'The Framingham Heart Study, a cohort study begun in 1948, has followed three generations of one Massachusetts town.',
  'box plot': 'The box plot was introduced by the statistician John Tukey in 1970, who also coined the word "bit".',
  // Dynamic Planet
  'knickpoint': 'Niagara Falls is a knickpoint that has retreated upstream about 11 km over roughly 12,000 years.',
  'oxbow lake': 'Oxbow lakes are named for the U-shaped collar of an ox yoke.',
  'meander': ['Meander comes from the Maeander River in Turkey, famous in ancient times for its winding course.', 'river'],
  'saltation': ['Saltation is Latin for "leaping": sand grains hop along a riverbed or desert in short arcs.', 'sediment'],
  'Lake Baikal': 'Lake Baikal is the world’s deepest lake, at over 1,600 m, and holds roughly a fifth of Earth’s unfrozen surface fresh water.',
  'Congo': ['The Congo is the deepest river ever measured, over 220 m deep in places.', 'river'],
  'sublimation': 'Snow can vanish on cold, dry, windy days without melting: it sublimates straight into water vapor.',
  // Electric Vehicle
  'Baghdad battery': 'The "Baghdad battery" is an ancient clay jar holding a copper cylinder and an iron rod. Whether it was ever a battery is still debated.',
  'voltaic pile': 'Alessandro Volta’s 1800 voltaic pile, stacked discs of zinc, copper and brine-soaked cloth, was the first true battery.',
  // Engineering CAD / Mission Possible / Boomilever
  'truncated icosahedron': 'A classic soccer ball is a truncated icosahedron: 12 pentagons and 20 hexagons.',
  'stadium': ['A stadium shape is a rectangle capped by two semicircles, like a running track.', 'shape'],
  'Geneva drive': 'The Geneva drive turns smooth rotation into stop-and-go steps. It advanced the film in old movie projectors.',
  'Scotch yoke': 'A Scotch yoke converts rotation into perfectly simple harmonic back-and-forth motion.',
  'neutral axis': 'Along a beam’s neutral axis, bending causes neither tension nor compression, which is why I-beams put little material there.',
  'gusset': 'A gusset plate ties truss members together at a joint. An undersized gusset helped bring down Minneapolis’s I-35W bridge in 2007.',
  // Experimental Design / Forensics
  'Pareto chart': 'The Pareto chart is named after Vilfredo Pareto, who noticed that about 80% of Italy’s land was owned by 20% of the people.',
  'heteroscedasticity': 'Heteroscedasticity comes from Greek for "different scatter": the spread of the data changes along the trend.',
  'Kevlar': 'Kevlar was invented by the chemist Stephanie Kwolek at DuPont in 1965.',
  // Flight
  'spill hole': 'A spill hole at the top of a parachute lets air escape steadily, which cuts down on side-to-side swinging.',
  'winglet': 'Winglets weaken the swirling vortices at the wingtips. Modern airliners save a few percent of their fuel with them.',
  'Gossamer Albatross': 'In 1979 the pedal-powered Gossamer Albatross crossed the English Channel, about 36 km, in under three hours.',
  // Protein Modeling
  'titin': 'Titin is the largest known protein, about 34,000 amino acids long. Its full chemical name runs to nearly 190,000 letters.',
  'green fluorescent protein': 'Green fluorescent protein comes from the jellyfish Aequorea victoria, and its development won the 2008 Nobel Prize in Chemistry.',
  'sulfur': ['Only two of the twenty standard amino acids contain sulfur: cysteine and methionine.', 'amino'],
  'ball and stick model': 'Ball-and-stick models date to the 1860s, when August Hofmann built molecule models from croquet balls.',
  // Remote Sensing
  'Landsat': 'Landsat has photographed Earth continuously since 1972, the longest record of the land surface from space.',
  'center pivot irrigation': 'Center pivot irrigation paints the giant green circles you see from airplane windows.',
  // Rocks & Minerals
  'pumice': 'Pumice is so full of gas bubbles that it floats. Rafts of pumice have drifted across entire oceans.',
  'spinifex': 'Spinifex texture is named after a spiky Australian grass, and it forms when very hot komatiite lava cools quickly.',
  'skarn': 'Skarn was an old Swedish miners’ word for "dirt" or "filth", used for the rock around valuable ore.',
  'streak': ['A mineral’s streak can differ from its color: golden pyrite leaves a greenish-black streak.', 'mineral'],
  'spessartine': 'Spessartine is an orange garnet named after the Spessart mountains in Germany, where it was first described.',
  'tuff': 'The giant moai statues of Easter Island are carved from volcanic tuff.',
  // Thermodynamics
  'aerogel': 'Some aerogels are over 99% air by volume, making them some of the best solid insulators known.',
  'deposition': ['Frost on a window forms by deposition: water vapor turns straight into ice without becoming liquid first.', 'phase change'],
  'latent heat': 'Joseph Black introduced latent heat in the 1760s after noticing that melting ice absorbs heat without warming up.',
  'isenthalpic': 'Throttling, like the refrigerant squeezing through a fridge’s expansion valve, is an isenthalpic process.',
  // Water Quality
  'parrotfish': 'Parrotfish grind coral and excrete it as fine sand. Much of the white sand on tropical beaches has been through one.',
  'tardigrade': 'Tardigrades survived 10 days exposed to outer space on a 2007 satellite mission.',
  'Daphnia': 'Daphnia, the water flea, is transparent enough that you can watch its heart beat under a microscope.',
  'Secchi depth': 'The Secchi disk is named after Angelo Secchi, a Jesuit astronomer who used it to measure water clarity in 1865.',
  // Code Craze / Junkyard Challenge
  'Python': 'Python is named after the comedy troupe Monty Python, not the snake.',
  'Brainfuck': 'Brainfuck is a complete programming language with only eight commands.',
  'quick sort': 'Tony Hoare devised quicksort in 1959 while working on machine translation in Moscow.',
  'Dijkstra’s algorithm': 'Edsger Dijkstra designed his shortest-path algorithm in about twenty minutes at a café, without pencil or paper.',
  'trie': 'Trie comes from "retrieval". Its inventor pronounced it "tree", though many now say "try".',
  'bug': ['In 1947, Grace Hopper’s team taped a real moth into the Harvard Mark II logbook as the "first actual case of bug being found".', 'programming'],
  'plumb bob': 'Plumb comes from plumbum, Latin for lead, the traditional weight on a plumb line. Lead’s symbol Pb comes from the same word.',
  'Velcro': 'Velcro was invented by George de Mestral, inspired by the burdock burrs stuck to his dog after a walk.',
  // Broad prompts
  'sepak takraw': 'In sepak takraw, players keep a woven rattan ball over a volleyball-style net using only their feet, knees, chest and head.',
  'jai alai': 'A jai alai ball has been clocked at over 300 km/h, among the fastest speeds of any ball in sport.',
  'Basque': 'Basque is a language isolate: it has no known relationship to any other living language.',
  'Esperanto': 'Esperanto was invented by L. L. Zamenhof in 1887 as an easy-to-learn international language.',
  'Rudolf Diesel': 'Rudolf Diesel vanished overboard from a steamer crossing the English Channel in 1913, and how he died is still unknown.',
  'Benjamin Thompson': 'Benjamin Thompson, Count Rumford, saw cannon barrels heat up endlessly while being bored and argued that heat is motion, not a fluid.',
  'Lamborghini': 'Ferruccio Lamborghini built tractors before he built supercars, reportedly after a dispute with Enzo Ferrari over a faulty clutch.',
  'Trabant': 'The East German Trabant\u2019s body was made of Duroplast, a plastic reinforced with cotton waste.',
  'Bhutan': 'Bhutan measures its progress by Gross National Happiness alongside economic output.',
  'Nauru': 'Nauru, one of the world\u2019s smallest countries, has no official capital city.',
  'Tacoma Narrows Bridge': 'The first Tacoma Narrows Bridge, nicknamed Galloping Gertie, twisted itself apart in the wind in 1940, about four months after it opened.',
  'Pont du Gard': 'The Roman Pont du Gard aqueduct bridge was built from stones fitted together without mortar, and it still stands after about 2,000 years.',
  'Arctic tern': 'Arctic terns migrate from the Arctic to the Antarctic and back each year, the longest migration of any animal known.',
  'lyrebird': 'Lyrebirds can mimic almost any sound they hear, including other birds, camera shutters and chainsaws.',
  'hovercraft': ['In 1959 the SR.N1 hovercraft crossed the English Channel, 50 years after Louis Bl\u00e9riot first flew across it.', 'vehicle'],
  'zamboni': 'The Zamboni ice resurfacer is named after Frank Zamboni, who built the first one in 1949 to keep his California skating rink smooth.',
  'Post-it note': 'Post-it notes grew out of a "failed" weak adhesive that 3M chemist Spencer Silver created while trying to make a super-strong glue.',
  'microwave oven': 'Percy Spencer got the idea for the microwave oven after a chocolate bar melted in his pocket while he worked near a radar magnetron.',
  'Reuleaux triangle': 'The Reuleaux triangle has constant width, like a circle, and drills based on it can cut nearly square holes.',
  'Mobius strip': 'A M\u00f6bius strip has only one side and one edge: trace its surface and you return to where you started on the "other" side.',
  'smoot': 'In 1958, MIT students measured Boston\u2019s Harvard Bridge using their classmate Oliver Smoot as a ruler: it is 364.4 smoots long.',
  'Scoville unit': 'The Scoville scale dates to 1912, when pharmacist Wilbur Scoville measured chili heat by diluting extracts until tasters could no longer feel the burn.',
  'capsaicin': 'Birds cannot taste capsaicin\u2019s burn, so they eat chili peppers and spread the seeds, while mammals that would crush the seeds stay away.',
  'Prussian blue': 'Prussian blue, made around 1706, was one of the first modern synthetic pigments, and today it is also an antidote for some radioactive poisoning.',
  'corpse flower': 'The corpse flower, or titan arum, blooms only every few years and smells of rotting meat to attract carrion beetles and flies.',
  'rafflesia': 'Rafflesia produces the largest single flower in the world, up to about a meter across, and it has no leaves, stem or roots of its own.',
  'GRACE': 'The twin GRACE satellites "weighed" Earth\u2019s water by measuring tiny changes in the distance between them as gravity varied below.',
};

const lookup = new Map(Object.entries(facts).map(([answer, fact]) => [normalize(answer), Array.isArray(fact) ? fact : [fact]]));
export function factFor(names, prompt) {
  for (const name of names) {
    const [fact, scope] = lookup.get(normalize(name)) ?? [];
    if (fact && (!scope || prompt.split('\n')[0].toLowerCase().includes(scope))) return fact;
  }
}
export const factAnswers = Object.keys(facts);
