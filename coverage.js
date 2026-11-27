import {combinedSources} from './expand-catalog.js';
import { minerals } from './catalog-data/minerals.js';
import { moons } from './catalog-data/moons.js';
import { curatedAnswers } from './catalog-data/curated-answers.js';
import { normalize } from './matching.js';

const additions=[
  ['Name a mineral, mineral group',[...minerals,...'feldspar;plagioclase;mica;biotite;amphibole;pyroxene;garnet;olivine;tourmaline;apatite;chlorite;hornblende;serpentine;zeolite;chalcedony;agate;jasper;amethyst;citrine;rose quartz;smoky quartz;milky quartz;ruby;sapphire;emerald;aquamarine;peridot;tiger’s eye;moonstone;labradorite;nephrite'.split(';')]],
  ['Name a moon in',moons],
  ['What’s one part','battery pack;electric motor|DC motor;rotor;stator;commutator;brush;motor driver;wheel bearing;differential;transmission;servo;steering linkage;wheel hub;capacitor;resistor;diode;potentiometer;microcontroller;printed circuit board|PCB;driveshaft;switch lever;voltage regulator'],
  ['Name a structure a botanist','corolla;calyx;perianth;tepal;androecium;gynoecium;connective;pollen grain|pollen;floral tube;hypanthium;floral disc;placenta;pedicel;bract'],
  ['What could you measure during a vehicle','time|travel time;acceleration time;voltage drop;battery current;wheel RPM|RPM;turning radius;track width;stopping time;motor temperature;wheel diameter;mass;total distance;kinetic energy'],
  ['Name a way astronomers','standard candle;standard ruler;tip of the red giant branch|TRGB;surface brightness fluctuations;expanding photosphere method;eclipsing binary|eclipsing binaries;maser distance|water maser;Faber Jackson relation;baryonic Tully Fisher relation;cosmological redshift'],
  ['Name a metamorphic rock','metasandstone;metagabbro;metarhyolite;metagraywacke;greenstone;hornblende schist;mica schist;garnet schist;biotite schist;chlorite schist;paragneiss;orthogneiss;augen gneiss;cataclasite;metachert;mariposite rock;serpentine marble'],
  ['Name an igneous rock','trachyte;phonolite;basanite;tephrite;trachyandesite;trachybasalt;ignimbrite;volcanic breccia;pillow basalt;pitchstone;perlite;vitrophyre;boninite;picrite;nephelinite;basaltic andesite;latite'],
  ['What part of a parachute','diameter;radius;surface area;air resistance;parachute cord;harness;seam;hem;reinforcement tape;apex vent;attachment point;canopy fabric;fabric thickness;permeability;glide ratio;wind speed;fall time'],
  ['What term might you use to explain','dominance;recessiveness;autosomal dominant inheritance|autosomal dominant;autosomal recessive inheritance|autosomal recessive;X linked dominant;X linked recessive;Y linked inheritance;mitochondrial inheritance;genomic imprinting;variable expressivity;incomplete penetrance;multiple alleles;compound heterozygote'],
  ['Name a statistic or a graph','arithmetic average;five number summary;dot plot;frequency table;standardized score|z score;coefficient of variation;stem and leaf plot;trimmed mean;geometric mean'],
  ['What kind of surface feature','pond;creek;stream;hill;mountain;valley;island;peninsula;bay;beach;gulf;lagoon;marsh;swamp;grassland;lake shore;riverbank;building;reservoir;railroad;parking lot;farmland;crop field;airport;volcanic cone'],
  ['Which design feature could','vacuum insulation;reflective foil;polystyrene foam;Styrofoam;double glazing;air pocket;insulating lid;shiny surface;ceramic coating;low conductivity material;insulated handle;silvered surface'],
  ['Name a basic tool','measuring tape;meter stick|metre stick;yardstick;digital caliper;vernier caliper;vernier scale;carpenter square;try square;T square;angle gauge;laser distance meter;measuring wheel;folding rule;chalk line;marking knife'],
  ['What instrument or image-analysis','spectroradiometry;hyperspectral imaging;radar altimeter;laser altimeter;thermal infrared sensor;imaging spectrometer;optical scanner;infrared camera;photogrammetry;image registration;segmentation;atmospheric correction;band ratio;supervised classification;unsupervised classification;principal component analysis|PCA'],
  ['Name a hydraulic component','hydraulic pump;hydraulic motor;hydraulic cylinder;hydraulic ram;pressure transducer;accumulator;pressure switch;pressure relief valve;ball valve;spool valve;solenoid valve;directional control valve;pressure regulator;hydraulic line;return line;pressure line;oil tank;working pressure;fluid temperature'],
  ['How could you plot','pie chart;frequency histogram;line plot;time plot;scatter diagram;stacked bar chart;grouped bar chart;strip chart;run chart;Pareto chart;cumulative frequency graph;probability plot;quantile quantile plot|QQ plot'],

  ['What mechanism could','compound gear;eccentric cam;universal joint;chain drive;belt drive;timing belt;pulley system;flywheel;clutch;axle;connecting rod;Geneva drive;Scotch yoke;escapement;differential;idler gear;planetary gearset;slider crank;camshaft'],
  ['What might you find living','frog;turtle;fish;toad;otter;beaver;muskrat;salmon;carp;goldfish;eel;pike;walleye;sunfish;crappie;lamprey;sturgeon;water snake;bullfrog;tree frog;water beetle;water spider;bacteria;fungi;phytoplankton;zooplankton;water mold;green algae;freshwater shrimp;water fern;water moss'],
  ['Name a CAD sketch','tangent constraint;distance constraint;angle constraint;lock;fillet edge;boolean operation;chamfer edge;hole;counterbore;countersink;thread;draft angle;path pattern;split body;combine;emboss;engrave;wrap;surface offset;extend surface'],
  ['What concept or data structure','hash table|hash map;linked list;doubly linked list;binary tree;binary search tree;heap;priority queue;deque;trie;hash set;matrix;record;struct;pointer;reference;enumeration;interface;inheritance;polymorphism;encapsulation;closure;lambda;generator;floating point number;list comprehension;type conversion;iteration variable'],
  ['What shape could','right triangle;equilateral triangle;isosceles triangle;scalene triangle;regular polygon;right trapezoid;quadrilateral;arc;circular segment;circular sector;stadium;heptadecagon;decagram;pentagram'],
  ['What material or geometric','density;wood species;elastic modulus;grain angle;grain orientation;grain runout;hardness;flexural modulus;tensile strength;compressive strength'],
  ['What could you build or fasten','plastic;steel;aluminum|aluminium;acrylic;polycarbonate;cloth;fabric;nylon;polyester;hot glue;epoxy;wood glue;super glue;stapler;Velcro|hook and loop fastener;hair tie;toothpick;rubber;foam;plastic bottle;can;balloon;string;wood;twist tie'],
  ['What glassware','micropipette;weighing scale;electronic balance;flask;gas syringe;glass pipette;graduated beaker;sample vial;glass cuvette;glass capillary tube;desiccator;glass slide;glass funnel;glass stirring rod;temperature probe;pressure sensor;oxygen sensor;digital timer;refractometer;viscometer;polarimeter'],
  ['Name a part of the eye','choroid;vitreous body;retinal ganglion cell;optic disc;macula lutea;cone cell;rod cell'],
  ['What landform or deposit','riverbank;riverbed;levee;river island;braid bar;alluvial terrace;fluvial terrace;flood basin;riparian wetland;alluvial plain;splay deposit;mouth bar;alluvial cone;river cliff;slip off slope'],
  ['Name a process that moves water','melting;freezing;deposition;advection;interception;snowmelt;streamflow;throughflow;seepage;recharge;discharge;drainage;ice melt;fog drip;throughfall;stemflow'],
  ['Which classical cipher','simple substitution cipher;monoalphabetic substitution;polyalphabetic cipher;transposition cipher;scytale;book cipher;Nihilist cipher;keyword cipher;straddling checkerboard;chaocipher;Jefferson disk;Vernam cipher;one time pad;ROT13'],
  ['What could you change about the shape','wing length;wing width;anhedral;winglet angle;leading edge radius;root chord;tip chord;wingtip shape;trailing edge shape;winglet;wing sweep'],
  ['What might you spot on the surface','mountain range;plateau;crack;ridge;ice;volcanic crater;shield volcano;lava field;dust;rock;boulder;regolith;fault scarp;scree;wrinkle ridge;tectonic plate boundary;valley network'],
  ['Name a part of the human brain','motor cortex;visual cortex;auditory cortex;somatosensory cortex;prefrontal cortex;Broca’s area;Wernicke’s area;pineal gland;olfactory bulb;optic chiasm;fornix;internal capsule;reticular formation;dentate gyrus;ventricle;fourth ventricle;lateral ventricle;cerebellar vermis']
];
const aliases={
 patella:'kneecap',clavicle:'collarbone',scapula:'shoulder blade',mandible:'lower jawbone|lower jaw',maxilla:'upper jaw',sternum:'breastbone',femur:'thighbone',tibia:'shinbone',humerus:'upper arm bone',coccyx:'tailbone',calcaneus:'heel bone',malleus:'hammer',incus:'anvil',stapes:'stirrup',
 mean:'average|arithmetic mean',median:'50th percentile',variance:'statistical variance','standard deviation':'SD','interquartile range':'IQR','confidence interval':'CI','body mass':'body weight',
 'phase angle':'phase difference',current:'electric current|electrical current',frequency:'signal frequency',resistance:'electrical resistance',voltage:'electric potential difference',
 'case control study':'case control', 'cohort study':'cohort design', 'randomized trial':'randomized controlled trial|RCT','sample size':'number of samples',
 'Ohm law':"Ohm’s law|U=RI|I=V/R|R=V/I",'Kirchhoff current law':"Kirchhoff’s first law|Kirchhoff’s junction rule",'Kirchhoff voltage law':"Kirchhoff’s second law|Kirchhoff’s loop rule",
 'increase temperature':'raise the temperature|increase the temperature|heat it up|heat the reactants','add a catalyst':'adding a catalyst|add catalyst|catalysis','increase surface area':'increase the surface area|powder the solid',
 'binary search tree':'BST','priority queue':'min priority queue|max priority queue','hash table':'hashtable|hashmap','merge sort':'mergesort','quick sort':'quicksort','leaf blade':'lamina',
 precipitation:'rain|rainfall|snowfall',evaporation:'evaporating',condensation:'condensing',sublimation:'subliming',
 brainstem:'brain stem',pons:'pons Varolii','medulla oblongata':'medulla', 'field of view':'FOV', 'water flea':'Daphnia', crayfish:'crawfish|crawdad', 'water lily':'waterlily',
 orthoclase:'orthoclase feldspar','round seeds':'round seed|round', 'wrinkled seeds':'wrinkled seed|wrinkled'
};
export {additions};
export function expandedGroups(prompt,original){
 const base=prompt.split('\n')[0];
 const sources=combinedSources.get(base)??[base];
 const extra=additions.filter(([start])=>sources.some(source=>source.startsWith(start))).flatMap(([,names])=>typeof names==='string'?names.split(';'):names);
 for(const source of sources)if(curatedAnswers[source])extra.push(...curatedAnswers[source].split(';'));
 // A group that shares any spelling with an earlier answer joins that answer, so one answer never
 // appears twice (e.g. "font|typeface" added where "typeface" already exists).
 const groups=[], owner=new Map();
 for(const group of [...original.split(';').map(s=>s.trim()),...extra.map(s=>s.trim())]){
   const [canonical,...other]=group.split('|');
   const spellings=[canonical,...other,...(Object.hasOwn(aliases,canonical)?aliases[canonical]:'').split('|')].filter(Boolean);
   let names=spellings.map(name=>owner.get(normalize(name))).find(Boolean);
   if(!names){names=new Set();groups.push(names)}
   for(const name of spellings){names.add(name);if(!owner.has(normalize(name)))owner.set(normalize(name),names)}
 }
 return groups.map(names=>[...names]);
}
