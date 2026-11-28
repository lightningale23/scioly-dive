import { normalize } from '../matching.js';

// A fact may be [text, word]: then it applies only where the base prompt contains that word,
// because some answers mean different things in different events.
// Fun facts for One in a Krillion picks, shown when someone lands it. The Krillion must be a
// genuine deep cut that few specialists would think of, so write facts only for such answers: a
// fact never lifts a well-known answer (one on the prompt's Plankton, Schooler or Rare lists) to the
// Krillion. Among Deep Cuts, one with a fact is preferred. Some older facts below belong to past
// Krillions that are now listed as Rare; they are kept for the record.
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
  // Genuinely niche Krillions, chosen by hand (2026-11-28); each fact is scoped to its whole prompt.
  "perforin": ["Perforin, fired by killer T cells and natural killer cells, assembles into rings that punch pores roughly 10 to 20 nanometers wide in a target cell, letting granzymes in to make it self-destruct.","name a cell, organ, or molecule of the human immune system."],
  "enteropeptidase": ["Ivan Pavlov’s lab found enteropeptidase in 1899 and called it enterokinase. It is the master switch of protein digestion: it turns trypsinogen into trypsin, which then activates the other pancreatic enzymes.","name a part of the digestive tract, an accessory organ, or a digestive enzyme or hormone."],
  "Uhuru": ["Uhuru, the first satellite built for X-ray astronomy, was launched from a platform off the coast of Kenya on December 12, 1970, Kenya’s independence day; uhuru is Swahili for freedom.","name an observatory, telescope, or detector used for multi-wavelength or multi-messenger astronomy."],
  "hinoki": ["Hinoki, Japanese cypress, is the wood of Hōryū-ji’s 7th-century temple halls, among the oldest wooden buildings in the world.","name a wood, adhesive, or joint used to build a boomilever."],
  "pneumatophore": ["Pneumatophores are roots that grow up out of the mud so mangroves can breathe; a single black mangrove can ring itself with thousands of them, like pencils stuck in the sand.","name a plant tissue, structure, or process a botanist studies."],
  "bakanae": ["Bakanae, Japanese for “foolish seedling”, makes rice shoots grow absurdly tall and spindly. Studying it led Eiichi Kurosawa in 1926 to the fungal chemical later named gibberellin.","name a plant disease, pest, or nutrient deficiency."],
  "systemin": ["Systemin, found in wounded tomato leaves in 1991, was the first peptide hormone discovered in plants: just 18 amino acids that spread the alarm and switch on defenses against chewing insects.","name a plant hormone, pigment, or biochemical a botanist studies."],
  "kinetic isotope effect": ["Swap a hydrogen atom for heavier deuterium and a reaction that breaks that C–H bond can run about seven times slower, because the heavier atom sits lower in its vibrational energy well.","name a concept, law, or quantity from gas behavior or reaction kinetics."],
  "Marquand diagram": ["Allan Marquand drew logic diagrams in 1881, about 70 years before Karnaugh maps, and soon built a mechanical logic machine as well.","name a digital logic gate, circuit, or concept."],
  "virtual ground": ["In an inverting op-amp circuit, the minus input sits at 0 volts without being wired to ground: negative feedback holds it there, so it is called a virtual ground.","name a dc circuit idea, component, or pioneer from circuit lab."],
  "Myszkowski transposition": ["Émile Myszkowski published his transposition in 1902: repeated letters in the key word get the same number, so their columns are read off together, left to right.","name a cipher, code type, or cryptanalysis technique from codebusters."],
  "ETAOIN SHRDLU": ["ETAOIN SHRDLU, roughly the most common English letters in order, was the first two columns of keys on a Linotype machine, so it often slipped into old newspapers by mistake.","name a clue, technique, or term used to solve a codebusters cipher by hand."],
  "Sleeping Beauty transposon": ["The Sleeping Beauty transposon was “awakened” in 1997 by rebuilding a working copy from fish DNA, where its relatives had lain dead for more than 10 million years.","name an enzyme, technique, or molecule used in molecular genetics."],
  "riboswitch": ["A riboswitch is a stretch of mRNA that folds around a small molecule, such as a vitamin, and turns its own gene off with no protein involved. Riboswitches were discovered in 2002.","name a stage, structure, or factor in transcription or translation."],
  "cordon sanitaire": ["A cordon sanitaire seals a line around a whole area. In 1665 and 1666 the English village of Eyam sealed itself off this way to keep its plague from spreading, and at least 260 villagers died inside the line.","name an epidemiology term, measure, or study design."],
  "quaternary prevention": ["Quaternary prevention, named by the Belgian doctor Marc Jamoulle in 1986, means protecting patients from too much medicine: tests and treatments they do not need.","name a strategy to control or prevent disease in a population."],
  "Spirillum minus": ["Spirillum minus causes sodoku, the Asian form of rat-bite fever, and no one has yet managed to grow it in a lab culture.","name a pathogen (virus, bacterium, parasite, fungus, or prion) that causes human disease."],
  "cockpit karst": ["Cockpit karst is named for Jamaica’s Cockpit Country, where deep star-shaped hollows between steep hills reminded people of cockfighting pits.","name a karst or groundwater feature, or something you could read from a topographic map, well, or hydrograph."],
  "flyback diode": ["A flyback diode across a motor gives the coil’s stored energy a safe path when the switch opens; without it, the voltage spike can be many times the battery voltage and destroy a transistor.","name a component, measurement, or rule term from the electric vehicle event."],
  "DRV8833": ["The DRV8833 motor driver runs on as little as 2.7 volts, so it can work straight off two AA cells, where the classic L298N loses about 2 volts or more inside the chip.","name a microcontroller, sensor, or programming concept used to control a vehicle."],
  "pierce": ["Onshape’s Pierce constraint pins a sketch point to the exact spot where a 3D curve passes through the sketch plane, a handy trick for lining up sweeps.","name an onshape feature, cad tool, or engineering-drawing term."],
  "operational definition": ["The physicist Percy Bridgman popularized the operational definition in 1927: a quantity means exactly the steps you take to measure it.","name a part of an experiment or report scored on the experimental design checklist."],
  "coronal scales": ["Coronal hair scales wrap the shaft like a stack of crowns; they are common on bat and rodent hairs and very rare on human hair.","name a test, reagent, or clue used to identify a powder, hair, fiber, or plastic in forensics."],
  "finger skirt": ["Full-size hovercraft hang their skirts as rows of separate “fingers”, so a torn finger can be replaced without changing the whole skirt.","name a physics concept, part, or rule term from the hovercraft event."],
  "cushion pressure": ["Cushion pressure is just weight divided by cushion area, so even big passenger hovercraft float on air only a few percent above atmospheric pressure.","name a physics equation, unit, or quantity used to plan or score a hovercraft run."],
  "cam": ["Cams already drove Greek water-powered automata more than 2,000 years ago; today a car’s camshaft opens every engine valve at the right moment.","name an action, machine, or rule term from mission possible."],
  "thread pitch": ["One turn of a screw moves it forward only one thread pitch, so a fine thread can give an ideal mechanical advantage of 100 or more.","name a simple machine, mechanical-advantage term, or form of energy a mission possible device could use."],
  "Schrader valve": ["The Schrader valve, invented by August Schrader’s company in 1891, is the same kind of valve found on car tires and on many bottle-rocket launchers.","name a part, measurement, or rule term from ping pong parachute."],
  "alpha 2,3 linkage": ["Bird flu viruses grab sialic acid joined by an alpha 2,3 linkage, common in birds’ guts, while human flu prefers the alpha 2,6 linkage lining our noses and throats; that mismatch is a big reason bird flu rarely spreads between people.","name an amino acid, structural feature, or influenza term from protein modeling."],
  "ECOSTRESS": ["ECOSTRESS measures plant temperatures from the International Space Station, whose drifting orbit lets it see the same field at different times of day, unlike sun-synchronous satellites.","name a satellite, instrument, or concept from the remote sensing rules."],
  "NBR": ["The Normalized Burn Ratio compares near infrared with shortwave infrared; the change in it from before to after a wildfire maps how badly each patch of land burned.","name a part of the electromagnetic spectrum, a sensor band, or a spectral index."],
  "zincite": ["Most big zincite crystals in rock shops grew by accident in the flues of zinc smelters in Poland; natural zincite comes almost entirely from Franklin and Sterling Hill, New Jersey.","name a rock or mineral on the 2027 national rocks and minerals list."],
  "pisolitic": ["Pisolitic rock is packed with pea-sized grains, from the Greek word for pea; the smaller grains of oolitic rock take their name from the word for egg.","name a mineral habit, physical property, or rock texture from the rocks and minerals rules."],
  "Joseph Black": ["Around 1761 Joseph Black noticed that melting ice soaks up heat without getting any warmer, and so discovered latent heat.","name a thermodynamics law, process, quantity, or scientist from the rules."],
  "low emissivity": ["Low-emissivity window coatings use a layer of silver only about 10 nanometers thick: thin enough to see through, yet it reflects most of the heat radiation trying to escape.","name a material or design feature for a heat-collecting device."],
  "bumphead parrotfish": ["Bumphead parrotfish ram coral with their foreheads and bite off chunks; a single adult grinds up about five tonnes of reef a year, much of it coming out as sand.","name a coral reef organism, water test, or marine ecology term from water quality."],
  "chloramination": ["Many US cities add ammonia after chlorine to make chloramine, which lasts longer in the pipes; it is harmless to drink but deadly to aquarium fish, so it must be removed before filling a tank.","name a water treatment step or water pollutant."],
  "pycnocline": ["A pycnocline is a layer where seawater gets denser quickly with depth; internal waves more than 100 meters tall can roll along it while the surface above stays calm.","name an estuary or marine-ecology concept from water quality part i."],
  "motor stooge": ["A stooge is a stand that holds a fully wound model, so the flier can let go, check the plane over and launch at just the right moment.","name a material, tool, or part used to build or fly a rubber-powered model plane."],
};

export const factAnswers = Object.keys(facts);
const lookup = new Map(Object.entries(facts).map(([answer, fact]) => [normalize(answer), Array.isArray(fact) ? fact : [fact]]));
export function factFor(names, prompt) {
  for (const name of names) {
    const [fact, scope] = lookup.get(normalize(name)) ?? [];
    if (fact && (!scope || prompt.split('\n')[0].toLowerCase().includes(scope))) return fact;
  }
}
