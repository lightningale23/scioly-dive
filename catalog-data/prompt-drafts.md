# Prompt drafts (no answer banks yet)

These are specialist prompts for future Dailies. Each is drawn from a section of the 2027 Division C rules that the event's live prompts don't already cover.

To use one:

1. Write its answer list in a `catalog-data/specialist-prompts*.js` file, citing the rules section.
2. Add an obvious-answer list to `obvious-answers.js`, and a fun fact if a good one exists.
3. Run `npm run familiarity`, then `npm test`.
4. Pin it in `features.js`.

Size estimates are rough. Prompts estimated under 60 answers need widening, or merging with a sibling idea, before they can join the Daily rotation.

Live prompts these drafts avoid: see `specialist-prompts.js`, `specialist-prompts-2.js` and `specialist-prompts-3.js`.

## Anatomy & Physiology

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a structure of the respiratory tract or lungs. | 3.a.i, 3.a.iii | 70 | Nasal cavity through alveoli, cell types (type I/II pneumocytes, goblet cells), pleura, surfactant. Krillion idea: surfactant. |
| Name a lung volume, capacity, or breathing-mechanics term. | 3.a.ii, 3.a.iv | 55 | Tidal volume, IRV, ERV, residual volume, FVC, FEV1, FEV1/FVC, compliance, elastic recoil, Boyle's law, flow-volume loop. Merge with gas-exchange terms (3.a.v) to pass 60. |
| Name a part of the digestive tract, an accessory organ, or a digestive enzyme or hormone. | 3.b.ii–vii | 100 | Organs, the four wall layers, sphincters, enzymes (amylase, pepsin, trypsin, lipase), hormones (gastrin, secretin, CCK, GIP, ghrelin). |
| Name a cell or structure of the liver or pancreas. | 3.b.xi (State/National) | 40 | Hepatocyte, Kupffer cell, lobule, portal triad, islets, alpha/beta/delta cells, acinar cells. Too small alone; pair with the digestive organs prompt. |

## Astronomy

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a spectral feature, spectral class, or luminosity class of a star. | 3.a | 60 | OBAFGKM(LTY), Morgan–Keenan I–V, Balmer series, H-alpha, Ca II H and K, Fraunhofer lines, absorption and emission lines. |
| Name an observatory, telescope, or detector used for multi-wavelength or multi-messenger astronomy. | 3 (intro) | 70 | LIGO, Virgo, KAGRA, IceCube, Chandra, XMM-Newton, NuSTAR, Fermi, Swift, Hubble, JWST, Spitzer, ALMA, VLA, Pierre Auger. |
| Name an equation, law, or quantity used to find a cosmic distance. | 3.b | 45 | Overlaps the stars prompt; widen with orbital mechanics terms (Kepler's laws, semi-major axis, period, radial velocity). |

## Boomilever

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a type of truss or structural form an engineer could use in a cantilever. | 1, 3 | 45 | Warren, Pratt, Howe, K, Fink, bowstring, lattice, Vierendeel, box beam, I-beam, space frame. Merge with failure modes to pass 60. |
| Name a way a wooden structure can fail under load. | 4.c, 5.d | 40 | Buckling, crushing, shear, splitting, joint failure, glue failure, tension failure, torsion, lateral-torsional buckling. |

## Botany

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a plant hormone, pigment, or biochemical a botanist studies. | 3.d.iii, 3.d.xiii | 70 | Auxin, gibberellin, cytokinin, ABA, ethylene, chlorophylls, carotenoids, anthocyanins, lignin, cellulose, starch, tannins, alkaloids, terpenes. |
| Name a botanist or a milestone in the history of botany. | 3.d.i | 70 | Theophrastus, Linnaeus, Mendel, Hooke, Grew, Malpighi, Hales, Ingenhousz, Calvin, McClintock, Carver, Borlaug, Vavilov, Asa Gray, binomial nomenclature, Green Revolution. |
| Name a crop, medicinal plant, or plant product people use. | 3.d.vii, x, xiv | 150 | Large and approachable. Keep it rules-flavored: fibers, drugs (quinine, digitalis, taxol), rubber, foods. |

## Chemistry Lab

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name an item on the Division C Chemistry Lab Equipment List or a probeware sensor. | 2.d, 3.b | 50 | Equipment list items plus pressure, temperature, gas and colorimeter probes. Widen with glassware to reach 60. |
| Name a greenhouse gas, ozone-depleting substance, or gas-phase atmospheric reaction term. | 3.e | 45 | CO2, CH4, N2O, CFCs, HCFCs, HFCs, halons, ozone, chlorine radical, Montreal Protocol, ozone hole. |
| Name a factor, plot, or method used to find a rate law or activation energy. | 3.f.ii | 45 | Initial rates, ln[A] vs t, 1/[A] vs t, Arrhenius plot, slope = −Ea/R, half-life, isolation method. Merge with stoichiometry terms (3.c). |

## Circuit Lab

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a quantity, unit, or instrument you'd use in a hands-on Circuit Lab task. | Part II | 60 | Multimeter modes, mAh, Wh, charging time, equivalent resistance, SPDT, breadboard rails, LED forward voltage. |
| Name an op-amp or transistor circuit, configuration, or term. | 3.c.x–xi | 40 | Inverting, non-inverting, follower, summing, comparator, ideal op-amp rules, saturation, cutoff, biasing. Merge with flip-flop and timing terms (3.c.ix). |

## Codebusters

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a clue or technique for cracking an Aristocrat or Patristocrat. | 3.e.i–ii | 45 | Pattern words, letter frequency, doubled letters, short words, contact analysis, K1/K2 alphabet recovery, keyword guessing. Merge with Spanish Xenocrypt clues (ñ, common Spanish words). |
| Name a word in the Porta, Nihilist, checkerboard, or homophonic cipher procedures. | 3.e.vii–xi | 40 | Porta table, key, Polybius square, row and column keywords, additive key. Small; pair with the clue prompt. |

## Designer Genes

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a type of DNA mutation, repair pathway, or DNA-damaging agent. | 3.b.iv.5–6 | 50 | Substitution, insertion, deletion, frameshift, missense, nonsense, silent, inversion, translocation, NER, NHEJ, HDR, UVA, UVB, ionizing radiation, intercalating agents, thymine dimer. |
| Name a stage, structure, or factor in transcription or translation. | 3.b.v | 70 | TATA box, initiation, elongation, termination, RNA pol II, spliceosome, start codon, A/P/E sites, release factor, Shine–Dalgarno. |

## Disease Detectives

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a type of bias, error, or confounding in an epidemiologic study. | 3.b.ii.9 | 40 | Selection, recall, interviewer, misclassification, healthy worker effect, loss to follow-up, confounding by indication. Merge with study-quality terms. |
| Name a mode of disease transmission or a link in the chain of infection. | 3.b.ii.6 | 50 | Direct contact, droplet, airborne, vehicle-borne, vector-borne, fomite, fecal-oral, vertical transmission, reservoir, portal of entry. |

## Dynamic Planet

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name something you could read from a topographic map, well data, or a hydrograph. | 3.k | 55 | Contour interval, index contour, gradient, relief, V-pointing contours, flow lines, rising limb, falling limb, lag time, peak discharge, baseflow. |
| Name a karst landform or groundwater feature. | 3.g | 50 | Sinkhole, cave, spring, losing stream, uvala, polje, tower karst, stalactite, aquifer types, cone of depression. |

## Electric Vehicle

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a microcontroller, sensor, or programming concept used to control a vehicle. | 3.c, 3.l | 80 | Arduino, ESP32, encoder, IMU, PWM, interrupt, PID, loop, variable, delay, serial monitor, library. |

## Engineering CAD

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a view, line type, or annotation on an engineering drawing. | 1, 2.e | 60 | Orthographic views, section, detail, hidden line, phantom line, centerline, leader, GD&T symbols, title block fields. |

## Experimental Design

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a statistic, graph type, or data-analysis term used in an Experimental Design report. | Checklist I–L | 60 | Mean, median, mode, range, standard deviation, IQR, best-fit line, R², percent error, outlier tests, bar vs line graph. |

## Forensics

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a test, reagent, or observation used to identify a white powder. | 2.f, 3.b | 45 | Iodine (starch), Benedict's (reducing sugar), HCl fizz (carbonate), flame colors (Li red, K violet, Ca orange-red, Na yellow), solubility, pH, conductivity. |
| Name a hair, fiber, or polymer identification clue. | 3.c | 50 | Medulla patterns, scale types, burn odor, melt behavior, density float or sink, resin identification codes 1–7. |

## Hovercraft

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name an equation, unit, or quantity used to plan a hovercraft run. | 4, 7 | 50 | Pressure = force/area, lift, thrust, Target Time, average speed, distance, mass of nickels, run score terms. |

## Mission Possible

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a simple machine or a mechanical-advantage term. | 4.b.iv–x | 40 | Lever classes, fulcrum, effort arm, load arm, IMA, AMA, efficiency, pulley systems, block and tackle, screw pitch. Merge with chemical-reaction actions (vinegar and baking soda, endothermic). |

## Ping Pong Parachute

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a parameter you could record in a bottle-rocket flight log. | 4 | 50 | Pressure, peak height, time aloft, fin count, fin shape, parachute diameter, canopy material, line length, nose mass, launch angle. |

## Protein Modeling

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a step of influenza infection or the immune response to it. | 3, Part II c.iii–iv | 50 | Attachment, sialic acid binding, endocytosis, endosome acidification, fusion, uncoating, replication, budding, neuraminidase release, antibodies, T cells. |
| Name a Jmol/JUDE display style or visualization term. | Part II d | 30 | Cartoon, backbone, wireframe, spacefill, sticks, ball and stick, surface, alpha carbon trace. Small; merge with sidechain chemistry terms. |

## Remote Sensing

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a climate process, feedback, or Earth-energy-balance term. | 3.e–f | 70 | Ice-albedo feedback, water vapor feedback, cloud feedback, radiative forcing, greenhouse effect, ENSO, carbon sinks, outgoing longwave radiation. |

## Rocks & Minerals

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a metamorphic facies, index mineral, or plate-tectonic rock-forming setting. | 3.i.vi | 45 | Zeolite, greenschist, amphibolite, granulite, blueschist, eclogite, hornfels facies, chlorite, biotite, garnet, staurolite, kyanite, sillimanite, subduction zone, mid-ocean ridge. |
| Name a gem variety from the rules or a mineral mined as an ore. | 3.h.xii | 60 | Emerald, ruby, sapphire, kunzite, peridot; ores like galena (lead), bauxite (aluminum), hematite (iron), chalcopyrite (copper), sphalerite (zinc). |

## Thermodynamics

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a heat engine, thermodynamic cycle, or efficiency term. | 5.c.iv | 40 | Carnot, Otto, Diesel, Rankine, Brayton, Stirling, refrigerator, heat pump, COP. Merge with phase-diagram terms (5.c.ii). |
| Name a temperature scale, heat unit, or kind of thermometer. | 5.c.i | 40 | Celsius, Kelvin, Rankine, Réaumur, calorie, BTU, joule, thermocouple, thermistor, RTD, infrared thermometer, bimetallic strip. |

## Water Quality

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name an estuary or marine-ecology concept from Water Quality Part I. | Part I | 80 | Salt wedge, halocline, brackish water, tides, nursery habitat, eutrophication, trophic cascade, r/K strategies, survivorship curves, TEK. |
| Name a water-monitoring measurement and what it indicates. | Part III | 40 | Small closed set; widen with units and methods (Secchi disk, Winkler titration, membrane filtration, BOD5). |

## Wright Stuff

| Draft prompt | Rules section | Est. answers | Notes |
| --- | --- | --- | --- |
| Name a material or tool used to build a rubber-powered model plane. | 3 | 70 | Balsa, carbon fiber, tissue, Mylar, condenser paper, CA glue, tungsten wire, prop hanger, winder, torque meter, building board, pins. |
| Name a trim problem or flight behavior you could see on a test flight. | 4.e | 40 | Stall, dive, spiral dive, porpoising, Dutch roll, mush, wing drop, torque roll, ceiling hit. Merge with fixes (add washin, shift CG). |
