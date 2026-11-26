import { expandCatalog } from './expand-catalog.js';
export const events = [
 ['Circuit Lab', [
 ['Name a law that helps solve an electrical circuit.', 'Ohm law|Ohms law|Ohm|V=IR; Kirchhoff current law|KCL|junction rule|Kirchhoffs current law; Kirchhoff voltage law|KVL|loop rule|Kirchhoffs voltage law; Joule law|Joules law; Coulomb law|Coulombs law'],
 ['Name a logic gate you could find on a circuit diagram.', 'AND|AND gate; OR|OR gate; NOT|NOT gate|inverter; XOR|XOR gate|exclusive or|exclusive or gate; NAND|NAND gate; NOR|NOR gate; XNOR|XNOR gate|exclusive nor|exclusive nor gate; buffer|buffer gate']
 ]],
 ['Astronomy', [
 ['Name a way astronomers estimate the distance to a star or galaxy.', 'parallax|trigonometric parallax; Cepheid|Cepheid variables|period luminosity; distance modulus; Type Ia supernova|SN Ia; Hubble law|Hubbles law|redshift; Tully Fisher|Tully Fisher relation; RR Lyrae; spectroscopic parallax|main sequence fitting'],
 ['Name a galaxy from the stellar evolution event.', 'Andromeda|Andromeda Galaxy|M31; Sombrero|Sombrero Galaxy|M104; Whirlpool|Whirlpool Galaxy|M51; Cigar Galaxy|M82; Antennae|Antennae Galaxies; Cartwheel|Cartwheel Galaxy; NGC 1569; NGC 4536; Arp 143; Arp 147; MCG+07-33-027']
 ]],
 ['Botany', [
 ['Name a structure a botanist could point to on a flower.', 'petal; sepal; stamen; pistil|carpel; anther; stigma; ovary; style; filament; ovule; receptacle; nectary'],
 ['Name a tissue or cell type involved in moving water or sugars through a plant.', 'xylem; phloem; vessel element|vessel member; tracheid; sieve tube element|sieve tube; companion cell; root hair|root hair cell; endodermis']
 ]],
 ['Chemistry Lab', [
 ['Name a gas law you might use to predict what happens in a sealed syringe.', 'Boyle law|Boyles law|Boyle; Charles law|Charles; ideal gas law|PV=nRT; combined gas law; Gay Lussac law|Gay Lussacs law|Gay Lussac|Amontons law|Amontons'],
 ['Name a change that could speed up a chemical reaction.', 'increase temperature|raise temperature|heating|heat; increase concentration|higher concentration|add reactant; add a catalyst|catalyst|use a catalyst; increase surface area|smaller particle size|crush solid|grind reactant; increase gas pressure|higher pressure|increase pressure']
 ]],
 ['Dynamic Planet', [
 ['A river is winding across a floodplain. Name a feature its flow can create.', 'oxbow lake|oxbow; meander; point bar; cut bank|cutbank; natural levee|levee; meander scar; scroll bar; cutoff channel|cutoff; backswamp'],
 ['Name a process that moves water or changes its state in the water cycle.', 'evaporation; precipitation; condensation; runoff|surface runoff; infiltration; transpiration; percolation; sublimation; groundwater flow; evapotranspiration']
 ]],
 ['Rocks & Minerals', [
 ['Name an observation that helps identify a mystery mineral.', 'color|colour; hardness; streak; luster|lustre; cleavage; fracture; density|specific gravity|heft; crystal habit|habit|crystal shape; magnetism|magnetic; fluorescence; acid reaction|effervescence; transparency|diaphaneity; tenacity; double refraction|birefringence'],
 ['Name an igneous rock that formed at or near the surface.', 'basalt; obsidian; pumice; rhyolite; andesite; scoria; tuff; tuff breccia; dacite; komatiite']
 ]],
 ['Thermodynamics', [
 ['Name a thermodynamic process that keeps one quantity constant, or keeps heat from crossing the boundary.', 'isothermal|constant temperature; isobaric|constant pressure; isochoric|isovolumetric|constant volume; adiabatic|no heat transfer; isentropic|constant entropy; isenthalpic|constant enthalpy'],
 ['Name a phase change that can happen as a substance heats up or cools down.', 'melting|fusion; freezing|solidification; evaporation|vaporization|vaporisation|boiling; condensation; sublimation; deposition|desublimation']
 ]]
];

expandCatalog(events);

export const packs = [
 ['Field Notebook','Plants, rocks, and the water cycle','✿','#769cff',2],
 ['Night Observatory','Galaxies and stellar distances','✦','#b77bff',1],
 ['Engineering Bay','Electricity and heat transfer','ϟ','#4de3ff',0],
 ['Watershed Expedition','Follow fresh water across the landscape','≈','#ffb35c',4],
 ['Mineral Cabinet','Identify the clues left in stone','◆','#ff7bac',5]
];

