// Hand-curated answers, keyed by the exact base prompt (without any letter rule).
// Format: groups separated by ";" and spellings of one answer separated by "|".
// The first spelling of a new group is its canonical answer. A group whose first
// spelling matches an existing answer adds aliases to that answer instead.
// New answers start in the 30-point tier unless answer-bank.js rates them.
// test/curated.test.js fails if a key stops matching a published prompt.
export const curatedAnswers = {
  // Circuit Lab
  'Name a law that helps solve an electrical circuit.':
    'Watt law|Watts law|power law|P=IV|power formula; De Morgan law|De Morgans law|De Morgan theorem; voltage divider rule|voltage divider|voltage division; current divider rule|current divider|current division; superposition theorem|superposition principle|superposition; Thevenin theorem|Thevenins theorem; Norton theorem|Nortons theorem; Millman theorem|Millmans theorem; maximum power transfer theorem|maximum power transfer; Tellegen theorem|Tellegens theorem; Kirchhoff current law|conservation of charge; Kirchhoff voltage law|conservation of energy',
  'Name a logic gate you could find on a circuit diagram.':
    'tri state buffer|three state buffer|tristate buffer; Schmitt trigger|Schmitt trigger inverter; IMPLY|IMPLY gate|implication gate; NIMPLY|NIMPLY gate; majority gate|majority; transmission gate',

  // Astronomy
  'Name a galaxy from the stellar evolution event.':
    'Andromeda|NGC 224|Andromeda Nebula; Sombrero|NGC 4594; Whirlpool|NGC 5194; Cigar Galaxy|NGC 3034; Antennae|NGC 4038|NGC 4039|Ringtail Galaxy; Cartwheel|ESO 350-40',

  // Botany
  'Name a structure a botanist could point to on a flower.':
    'peduncle; inflorescence; floral bud|flower bud; spur|nectar spur; nectar guide; keel; standard petal|banner|standard; wing petal; labellum|lip; column|gynostemium; corona; ray floret; disc floret|disk floret; involucre; spathe; spadix; locule; septum; funiculus|funicle; micropyle; embryo sac; pollen sac|anther sac; microsporangium; megasporangium; integument; nucellus; receptacle|thalamus|torus; staminode; epicalyx; ovary wall; lodicule; pappus; scape; stigma lobe',
  'Name a tissue or cell type involved in moving water or sugars through a plant.':
    'vascular bundle; vascular tissue; vascular cambium; pericycle; Casparian strip; sieve plate; sieve cell; albuminous cell|Strasburger cell; transfer cell; xylem parenchyma; phloem parenchyma; bundle sheath; plasmodesma|plasmodesmata; pit|bordered pit; perforation plate; vessel|xylem vessel; guard cell; stoma|stomata|stomate; cortex|root cortex; exodermis; epidermis|root epidermis',
  'How might a botanist describe the edge of a leaf?':
    'entire|smooth; serrate|sawtoothed|saw toothed|toothed; undulate|wavy; crenate|scalloped; spinose|spiny; doubly serrate|biserrate; erose; laciniate; lacerate; pinnatifid; pinnatisect; palmatifid; parted; cleft; dissected; repand; spinulose; involute; crisped|crispate; ciliolate; runcinate',
  'Where can a plant store food?':
    'tuber; stolon; cladode; succulent leaf|fleshy leaf; scale leaf|bulb scale; storage root|fleshy root; root tuber; pith; cortex; pericarp; aril; caudex; pseudobulb; fleshy stem|succulent stem; amyloplast|starch grain; vacuole; nut; grain; tap root',

  // Chemistry Lab
  'Name a gas law you might use to predict what happens in a sealed syringe.':
    'Avogadro law|Avogadros law|Avogadro; Dalton law|Daltons law|law of partial pressures|Dalton; Graham law|Grahams law|Graham; van der Waals equation|van der Waals; Amontons law|pressure law',
  'Name a change that could speed up a chemical reaction.':
    'increase temperature|warm it|warming|make it hotter; increase concentration|increase the concentration|more concentrated solution|use a more concentrated solution; add a catalyst|use an enzyme|enzyme|add an enzyme; increase surface area|cut into smaller pieces|use a powder; increase gas pressure|decrease volume|compress the gas|reduce the volume; stir|stirring|stir the mixture|agitation|shake|shaking; expose to light|light|UV light|ultraviolet light|shine light',
  'What property could help you tell two substances apart or separate them?':
    'odor|odour|smell; flammability; reactivity; pH|acidity; hardness; luster|lustre; texture; shape; thermal conductivity; electrical conductivity; heat capacity|specific heat; sublimation point; partition coefficient; retention factor|Rf|Rf value; molar mass|molecular weight; optical rotation; absorption spectrum|absorbance spectrum; emission spectrum|flame color|flame colour; miscibility; surface tension; effusion rate|rate of effusion|diffusion rate; isoelectric point; settling velocity|sedimentation rate; transparency; state of matter|phase; malleability; ductility; mass',

  // Dynamic Planet
  'A river is winding across a floodplain. Name a feature its flow can create.':
    'meander belt; meander neck; crevasse splay; yazoo stream|yazoo tributary|yazoo; ridge and swale|ridge and swale topography; chute cutoff; neck cutoff; slip off slope; river cliff; clay plug; abandoned channel; overbank deposit; thalweg; pool; riffle; floodplain; alluvium|alluvial deposit; sinuous channel',
  'What can happen to sediment as a river carries it downstream?':
    'dissolution|solution|corrosion; flocculation; rounding; downstream fining|fining; grain size reduction; corrasion; weathering; bed load transport|bed load|bedload; suspended load; dissolved load; wash load; sedimentation; lithification; cementation; winnowing; armoring|armouring; scour; mixing; siltation; storage',

  // Rocks & Minerals
  'Name an observation that helps identify a mystery mineral.':
    'taste; odor|odour|smell; piezoelectricity; radioactivity; striations; twinning; crystal system; crystal form; parting; asterism; chatoyancy; pleochroism; luminescence; phosphorescence; thermoluminescence; triboluminescence; refractive index; fusibility; play of color|play of colour; solubility; feel; streak color|streak colour; specific gravity; reaction with acid|reaction to HCl|fizzing',
  'Name an igneous rock that formed at or near the surface.':
    'hyaloclastite; welded tuff; lapilli tuff; tachylyte; reticulite; spilite; icelandite; mugearite; hawaiite; benmoreite; ankaramite; limburgite; leucitite; carbonatite; dolerite|diabase; microgranite; felsite; porphyry; lamprophyre; kimberlite; lamproite; volcanic glass; spatter',
  'What texture might you see in an igneous rock?':
    'aphanitic|fine grained; phaneritic|coarse grained; aphyric; holocrystalline; hypocrystalline; holohyaline; glomeroporphyritic; seriate; trachytic; pilotaxitic; variolitic; miarolitic; orbicular; cumulate; spinifex; rapakivi; myrmekitic; perthitic; fragmental; vitric; scoriaceous; cryptocrystalline; diabasic; eutaxitic; welded',
  'Name a metamorphic rock.':
    'whiteschist; phyllonite; ultramylonite; protomylonite; pseudotachylyte; rodingite; listvenite; jadeitite; charnockite; metapelite; metapsammite; calc silicate rock|calc silicate; verde antique; spotted slate; kyanite schist; staurolite schist; talc schist; glaucophane schist; quartz schist; tectonite; hornblende gneiss; granite gneiss; banded gneiss; metadolerite|metadiabase; skarn|tactite',

  // Thermodynamics
  'Name a thermodynamic process that keeps one quantity constant, or keeps heat from crossing the boundary.':
    'isochoric|isometric; isobaric|isopiestic; adiabatic|thermally insulated; isoenergetic|constant internal energy',
  'Name a phase change that can happen as a substance heats up or cools down.':
    'freezing|crystallization|crystallisation; condensation|liquefaction; deposition|resublimation; ionization|ionisation; recombination|deionization|deionisation',
  'What quantity might you calculate when heat moves between two objects?':
    'heat transfer rate|heat flow rate|heat flow; thermal energy; temperature change|temperature difference|change in temperature; final temperature; equilibrium temperature; molar heat capacity; heat of fusion|latent heat of fusion|enthalpy of fusion; heat of vaporization|latent heat of vaporization|enthalpy of vaporization; R value; U value|thermal transmittance; Biot number; Nusselt number; Fourier number; time constant; cooling rate; radiant exitance|radiant power; Carnot efficiency; coefficient of performance|COP; thermal mass',
  'Which design feature could reduce heat transfer from a container?':
    'wool; felt; aerogel; bubble wrap; closed cell foam; polyurethane foam; expanded polystyrene|EPS; insulated base; thicker walls|thick walls; light colored exterior|white exterior|light coloured exterior; spherical shape; weatherstripping; space blanket|emergency blanket|mylar blanket; radiant barrier; cardboard layer; cover',

  // Anatomy & Physiology
  'Name a bone in the human skeleton.':
    'vertebra; cervical vertebra; thoracic vertebra; lumbar vertebra; sesamoid bone; hip bone|os coxae|innominate bone|coxal bone; carpal|carpal bone; tarsal|tarsal bone; proximal phalanx; middle phalanx; distal phalanx; true rib; false rib; floating rib; manubrium; fabella; skull|cranium',
  'Name a part of the eye that admits, focuses, absorbs, or detects light.':
    'ciliary body; ciliary muscle; zonule|zonular fibers|suspensory ligament; tear film; lens capsule; lens fiber; anterior chamber; posterior chamber; intrinsically photosensitive retinal ganglion cell|ipRGC; S cone|blue cone|short wavelength cone; M cone|green cone|medium wavelength cone; L cone|red cone|long wavelength cone; foveola; fovea|fovea centralis; outer segment; rhodopsin; photopsin; melanin; pigment epithelium',
  'Name a part of the human brain.':
    'cerebral cortex; gray matter|grey matter; white matter; septum pellucidum; mammillary body; pituitary gland|hypophysis|pituitary; choroid plexus; cerebral aqueduct; third ventricle; tectum; tegmentum; red nucleus; nucleus accumbens; claustrum; subthalamic nucleus; limbic system; entorhinal cortex; parahippocampal gyrus; superior temporal gyrus; angular gyrus; supramarginal gyrus; central sulcus; lateral sulcus|Sylvian fissure; longitudinal fissure; arcuate fasciculus; locus coeruleus; raphe nuclei; inferior olive|olive; cerebral peduncle; striatum; lentiform nucleus; anterior commissure; habenula; epithalamus; diencephalon; telencephalon; hindbrain|rhombencephalon; forebrain|prosencephalon; midbrain|mesencephalon; neocortex; cerebral hemisphere',

  // Boomilever
  'When you load a cantilever, what might an engineer measure or look for?':
    'load|applied load|applied force; reaction force|support reaction; moment|torque; maximum stress; bending stress; shear stress; failure mode; failure load; crack|cracking; splitting; crushing; tip deflection; strain energy; vibration; elastic limit; proportional limit; plastic deformation; structural efficiency|load to weight ratio|strength to weight ratio; joint failure; lateral torsional buckling; critical load|critical buckling load; section modulus; radius of gyration; effective length; stress concentration; rotation',
  'What carries the load in a model bridge? Name a member or joint.':
    'truss; arch; deck; stringer; floor beam; abutment; pier; cable; hanger|suspender; tower|pylon; knee brace; portal brace; sway brace; lateral brace; end post; king post; queen post; girder; joist; box beam; I beam; T beam; tension member; compression member; gusset|gusset plate; rigid joint; mortise and tenon; dovetail joint; finger joint; miter joint|mitre joint; chord',
  'What material or geometric property would you record for a wooden test strip?':
    'modulus of rupture; bending strength|flexural strength; shear strength; specific gravity; ring count|growth rings|rings per inch; latewood proportion; knot|knots; defect|defects; check|checks; split; straightness; surface finish; Janka hardness; specific stiffness|stiffness to weight ratio; specific strength|strength to weight ratio; failure load; deflection; grain pattern; quartersawn|quarter sawn',

  // Codebusters
  'What clue might give away a word in a substitution cipher?':
    'pattern word; vowel placement|vowel pattern; three letter word; two letter word; initial letter; final letter; isomorph; possessive; hyphenated word|hyphen; letter contact|contact analysis; high frequency letter; low frequency letter; digraph|bigram|digram; letter frequency|frequency analysis; double letter|doubled letter',

  // Designer Genes
  'What trait did Mendel track in his peas? You can also name a form of the trait.':
    'seed coat color|seed coat colour; gray seed coat|grey seed coat; white seed coat; stem length|plant height|height; pod shape|pod form; seed color|cotyledon color|seed colour|cotyledon colour',

  // Disease Detectives
  'What term might you use to describe a population health study or its results?':
    'attack rate; secondary attack rate; case fatality rate; mortality rate; morbidity rate; incidence rate; cumulative incidence; point prevalence; period prevalence; epidemic curve|epi curve; line listing; case definition; herd immunity; basic reproduction number|R0|R naught; effective reproduction number|Rt; attributable risk; population attributable risk; number needed to treat; vaccine efficacy; vaccine effectiveness; p value; statistical significance; information bias; loss to follow up; healthy worker effect; hazard ratio; rate ratio; crude rate; age adjusted rate; surveillance; outbreak; epidemic; pandemic; endemic; cluster; exposure; outcome; risk factor; dose response; temporality; Bradford Hill criteria; nonresponse bias; crossover trial; nested case control study; meta analysis; systematic review; case crossover study; control group',
  'Name a statistic or a graph that summarizes a set of numbers.':
    'midrange; weighted mean; harmonic mean; mean absolute deviation; standard error; decile; bar chart|bar graph; frequency polygon; ogive|cumulative frequency plot; pie chart; violin plot; density plot; proportion; rate; cumulative frequency; relative frequency; count; sum',

  // Experimental Design
  'Two measurements are plotted against each other. What could you say about their relationship?':
    'form; nonlinear|curvilinear; exponential; logarithmic; quadratic; no correlation|zero correlation; perfect correlation; weak correlation; strong correlation; line of best fit|trendline|trend line|regression line; coefficient of determination|R squared; Pearson correlation coefficient|correlation coefficient; Spearman rank correlation; influential point|leverage point; homoscedasticity; extrapolation; interpolation; direct proportion|directly proportional|proportional; inverse proportion|inversely proportional; monotonic',
  'You measure a strip of wood twice and get different lengths. What might explain the difference?':
    'human error; precision|instrument precision; least count; humidity; moisture change; different instrument|different ruler; measuring at an angle; random error; systematic error; recording error|transcription error; shrinkage; swelling; ruler not straight; tape sag',

  // Forensics
  'Two fibers are under the microscope. What could you compare?':
    'length; texture; shape; fluorescence; burn behavior|burn test|burning behavior|burn behaviour; odor when burned|smell when burned; ash residue|residue; cuticle; cortex; ply|number of plies; twist direction|S twist|Z twist; thickness; dye|dye type; scale pattern',
  'Name a feature you could compare in two documents. Handwriting and print both count.':
    'ink color|ink colour; ink type; paper type; watermark; line spacing; letter height; tremor; hesitation; retouching|patching; signature; rhythm; spelling; justification; embellishment|flourish; numeral formation|numerals; i dots; t crossings; font|typeface; font size',

  // Electric Vehicle
  'What could you measure during a vehicle test run?':
    'bottle distance; vehicle distance|distance to target; braking distance; run time; wheel slip; motor current; motor speed; encoder count|encoder ticks; momentum; rolling resistance; efficiency; velocity; heading; battery capacity',

  // Engineering CAD
  'What solid could you build in CAD?':
    'prism; pentagonal prism; octagonal prism; square pyramid; triangular pyramid; pentagonal pyramid; hexagonal pyramid; spherical cap; tube|hollow cylinder; capsule; spheroid; oblate spheroid; prolate spheroid; paraboloid; hyperboloid; helix|coil|spring; cuboctahedron; truncated icosahedron; rhombic dodecahedron; antiprism; bicone; ring; block|box',

  // Hovercraft
  'Name a force, measurement, or fluid-flow term used to describe a hovercraft.':
    'friction; normal force; cushion pressure|plenum pressure; hover height|hover gap; momentum; Bernoulli principle|Bernoulli; Pascal principle|Pascal law|Pascals principle; Newton third law|Newtons third law; Newton second law|Newtons second law; inertia; acceleration; stagnation pressure|total pressure; boundary layer; flow separation; vortex|vortices; pressure drop; center of pressure|centre of pressure; center of gravity|centre of gravity|center of mass; stability; ground effect; air resistance',
  'Which variable could you change in a trial of a model hovercraft?':
    'battery voltage; number of batteries; propeller pitch; number of blades|blade count; fan blade angle; skirt thickness; skirt diameter; hull material; center of gravity|mass distribution|weight distribution; load position|nickel placement; number of nickels|nickel count; ramp use|ramp; start position; rudder angle; duct shape|fan duct; number of fans|fan count; wiring configuration|series or parallel; motor type',

  // Mission Possible
  'What form of energy could you find in a tabletop chain reaction?':
    'mechanical energy; potential energy; radiant energy|electromagnetic energy; thermal energy|heat|heat energy; strain energy; internal energy; vibrational energy; electric potential energy; elastic potential energy|spring energy|spring potential energy; kinetic energy|motion energy; sound energy|acoustic energy',

  // Ping Pong Parachute
  'What could you measure across several drops to see how consistently a parachute falls?':
    'coefficient of variation|relative standard deviation; mean absolute deviation; standard error; mean|average descent time|mean time; median; horizontal drift|drift distance; distance from target; oscillation angle|swing angle; spin rate|rotation rate; time aloft|hang time; peak height|apex height|launch height; terminal velocity; percent difference; quartile|quartiles',

  // Protein Modeling
  'Name a structural feature, bond, or model used to describe a protein.':
    'beta turn; beta hairpin; 3 10 helix|310 helix; pi helix; random coil; helix turn helix; zinc finger; Rossmann fold; beta barrel; Greek key; coiled coil; leucine zipper; fold; active site; binding site|binding pocket; ligand; cofactor; prosthetic group; van der Waals interaction|van der Waals forces; ionic bond; hydrophobic interaction|hydrophobic effect; pi stacking; alpha carbon; alpha carbon backbone|C alpha trace; wireframe model|wire model; stick model; surface model; dihedral angle|torsion angle; phi angle; psi angle; signal peptide; transmembrane helix; amino terminus|N terminus; carboxyl terminus|C terminus',

  // Water Quality
  'Which physical or chemical property could you measure on a freshwater sampling trip?':
    'aragonite saturation|aragonite saturation state; nitrite concentration; sulfate concentration; carbon dioxide|dissolved carbon dioxide; total phosphorus; total nitrogen; Secchi depth; water clarity; odor|odour|smell; stream width; total solids; oxygen saturation|percent saturation; specific conductance; chemical oxygen demand|COD; total organic carbon|TOC; residual chlorine|chlorine; air temperature',

  // Wright Stuff
  'What could you change about the shape of a model wing between flights?':
    'polyhedral; tip dihedral; end plates|tip plates; camber location|camber position; airfoil thickness; leading edge sweep; trailing edge sweep; tip twist',

  // Code Craze
  'Name a commonly taught sorting algorithm.':
    'bogosort|bogo sort; stooge sort; odd even sort|brick sort; pancake sort; strand sort; smoothsort; library sort; patience sort; bitonic sort; block sort; flashsort; spreadsort; bead sort|gravity sort; sleep sort; dual pivot quicksort; binary insertion sort; tournament sort; topological sort',
  'How could you visit the nodes in a graph or tree?':
    'depth limited search; Euler tour|Euler tour traversal; reverse postorder; Morris traversal; random walk; flood fill; backtracking; IDA star|iterative deepening A star; jump point search; beam search; reverse level order traversal; Bellman Ford|Bellman Ford algorithm',
  'What concept or data structure might you meet in a programming class?':
    'compiler; interpreter; syntax; bug; debugging; comment; module; library; package; API; event; thread; big O notation|time complexity; space complexity; abstraction; constructor; getter; setter; overloading; overriding; null|None|nil; character|char; byte; bit; while loop; for loop; do while loop; if statement; switch statement; break; continue; immutability|immutable; dynamic programming; memoization; greedy algorithm; divide and conquer; garbage collection; callback; regular expression|regex; syntax error; runtime error|run time error; logic error; unit test',

  // Hydraulics
  'What geometric or fluid property affects the pressure drop along a pipe?':
    'mean velocity|flow velocity; kinematic viscosity; dynamic viscosity; temperature|fluid temperature; number of fittings|fittings; elevation change|height difference; minor loss coefficient|minor losses; flow regime; cross sectional shape|pipe shape; sudden contraction|contraction; sudden expansion|expansion; bend angle; pipe material; wall roughness',
  "Which classical cipher could a puzzle setter use?":
    "Polybius square|Polybius cipher|Polybius; checkerboard cipher|5x5 checkerboard|checkerboard; Aristocrat; Patristocrat; Xenocrypt; cryptarithm; Enigma|Enigma cipher; Great Cipher; nomenclator; grille cipher|Cardan grille|turning grille; Myszkowski transposition; Amsco cipher|AMSCO; redefence cipher|redefence; Ragbaby cipher|Ragbaby; Quagmire cipher|Quagmire; Portax cipher|Portax; Slidefair cipher|Slidefair; Condi cipher|Condi; Gromark cipher|Gromark; Phillips cipher; Swagman cipher|Swagman; Cadenus cipher|Cadenus; tri square cipher|tri square; seriated Playfair; Digrafid cipher|Digrafid; Bazeries cipher; tap code; Trithemius cipher|Trithemius; Kama Sutra cipher|Mlecchita vikalpa; keyed Caesar cipher|keyed Caesar; Nihilist substitution; Nihilist transposition",
  "Name an element commonly found in the twenty standard amino acids.":
    "carbon|C; hydrogen|H; oxygen|O; nitrogen|N; sulfur|S",
  "Name a basic tool for measuring or marking a model component.":
    "speed square; framing square; sliding bevel|bevel gauge|T bevel; feeler gauge|thickness gauge; depth gauge; height gauge; plumb bob; laser level; center finder|centre finder; scale ruler|architect scale|engineer scale; French curve; flexible curve; template|stencil; awl; center punch|centre punch; chalk; grease pencil|china marker|wax pencil; string line; dial indicator; radius gauge; thread gauge; scale|digital scale|balance; steel rule|steel ruler; machinist square|engineer square; trammel; inside caliper; outside caliper; pen; crayon",
  "Name a CAD sketch constraint or modeling operation.":
    "sketch; plane|offset plane|sketch plane; normal; curvature constraint; slot; construction line|construction geometry; centerline|centreline; spline; arc; line; point; extrude cut|cut|pocket; pad; helix; mate connector; fastened mate; revolute mate; slider mate; cylindrical mate; planar mate; ball mate; pin slot mate; move face; replace face; delete face; sheet metal; flange; bend; angular dimension; radial dimension|radius dimension; diameter dimension; mirror pattern; variable fillet; loft cut; revolve cut; sweep cut; shell body",
  "What kind of surface feature could you map from an aerial image?":
    "canal; iceberg; ice shelf; burn scar|fire scar; smoke plume; lava flow; mangrove|mangrove forest; coral reef; kelp forest; algal bloom|harmful algal bloom; oil spill; sediment plume; desert; salt flat|playa; deforestation|clear cut|clearcut; plantation; rice paddy|paddy field; center pivot irrigation|centre pivot irrigation; pasture; vineyard; golf course; highway; pipeline; power line; wind farm; port; canyon; mesa; butte; escarpment; moraine; fjord; tidal flat|mudflat; barrier island; spit; dune field; meander; oxbow lake; alluvial fan; landfill; city; suburb; park; snowpack; permafrost; flood|flooding|flooded area",
  "What glassware or measuring equipment might you find on a chemistry bench?":
    "crucible; crucible tongs|tongs; evaporating dish; Bunsen burner; hot plate; ring stand|retort stand; clamp|utility clamp; ring clamp|iron ring; wire gauze; test tube rack; test tube holder; test tube brush; spatula|scoopula; wash bottle; mortar and pestle; Petri dish; spot plate; well plate; Buchner funnel; filter paper; Thiele tube; burette clamp; rubber stopper; eudiometer|gas measuring tube; pneumatic trough; gas jar; Kipp apparatus|Kipp generator; cuvette; centrifuge; centrifuge tube; microscope; hand lens|magnifying glass; multimeter; data logger; magnetic stirrer|stir plate; stir bar; thermocouple; infrared thermometer; calipers; flame loop|inoculating loop|wire loop; cobalt blue glass; conductivity tester; pH paper|litmus paper; pipette bulb; stopcock; glass tubing",
  "What might you find living in a freshwater pond or stream?":
    "kingfisher; heron; duck; goose; swan; mink; water vole; water shrew; hellbender; mudpuppy; axolotl; crayfish; scud; sowbug; water tiger; giant water bug; hellgrammite; bloodworm; nematode; hydrozoan; freshwater jellyfish; tardigrade|water bear; ciliate; flagellate; coontail; elodea; eelgrass; water chestnut; lotus; bladderwort; sedge; rush; pickerelweed; marsh marigold; spatterdock; stonewort|chara; shiner; dace; chub; killifish; mosquitofish; guppy; tilapia; gar; bowfin; paddlefish; arapaima; piranha; muskellunge|muskie; snapping turtle; painted turtle; alligator; caiman; platypus; hippopotamus",
  "What part or flight term might you use when trimming a rubber-powered plane?":
    "torque; turns; winding|wind; launch torque; motor peg; prop hook; nose block|nose bearing; tail post; fin area; stabilizer tilt|stab tilt; wash in|washin; right thrust|side thrust; down thrust; climb; cruise; descent; glide circle|circle; turn radius; stall recovery; porpoising; spiral dive; dutch roll; center of lift; decalage; airfoil; tissue covering|covering; balsa; ballast; clay; prop pitch|propeller pitch; prop diameter|propeller diameter; flight time|time aloft; flight log",
  "What’s one part you might find on a small electric vehicle?":
    "bottle pusher; measurement point; alignment device|sighting device; motor controller|speed controller|ESC; H bridge; relay; limit switch; reed switch; Hall effect sensor; rotary encoder|wheel encoder; gyroscope|gyro; accelerometer; IMU; Arduino; Raspberry Pi; ESP32; breadboard; jumper wire; solder joint; heat shrink; zip tie; standoff; caster|caster wheel; omni wheel; timing pulley; O ring; set screw; collar|shaft collar; motor shaft; gear motor|gearmotor; stepper motor; brushless motor; AA battery; battery clip; on off switch|power switch; LED; trigger",
  "What term might you use to explain how a trait runs in a family?":
    "sex limited trait; sex influenced trait; lethal allele; anticipation; mosaicism; germline mosaicism; de novo mutation; consanguinity; obligate carrier; affected; unaffected; generation; sibship; founder effect; X inactivation; uniparental disomy; Punnett square; heritability; family history; genetic counseling|genetic counselling; carrier testing; complementation",
};
