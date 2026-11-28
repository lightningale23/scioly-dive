// While answer lists are being filled in, the site offers only the Daily Dive.
// Set to false to bring back Unlimited, Archive, Themed Packs and the Puffer Party preview.
export const dailyOnly = true;
export const modeAllowed = mode => !dailyOnly || mode === 'Daily';

// AI judging for answers that aren't in a prompt's list (api/judge.js on Vercel). Leave empty to turn it
// off: unlisted answers are then simply not accepted. Example: 'https://scioly-dive.vercel.app/api/judge'.
export const judgeUrl = 'https://scioly-dive.vercel.app/api/judge';

// Trial events (not yet official Division C events) are left out of every dive for now.
export const pausedEvents = ['Code Craze', 'Hydraulics', 'Junkyard Challenge'];

// Hand-picked Dailies, keyed by day number (days since 1970-01-01; each runs midnight to midnight
// Pacific time on its date, see daily-clock.js): seven [event, prompt]
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
  // 2026-11-28
  20785: [
    ["Astronomy","Name an object or galactic feature from the 2027 Astronomy rules."],
    ["Forensics","Name a substance, material, or technique from the Forensics rules."],
    ["Boomilever","Name a structural concept or rule term from Boomilever."],
    ["Chemistry Lab","Name an ion you are expected to know for Chemistry Lab."],
    ["Dynamic Planet","Name a freshwater landform, process, or feature from the study of rivers, lakes, and groundwater."],
    ["Wright Stuff","Name a part, trim adjustment, or rule term for a rubber-powered free-flight plane."],
    ["Designer Genes","Name a term from Mendelian, population, or evolutionary genetics."],
  ],
  // 2026-11-29
  20786: [
    ["Anatomy & Physiology","Name a cell, organ, or molecule of the human immune system."],
    ["Remote Sensing","Name a satellite, instrument, or concept from the Remote Sensing rules."],
    ["Electric Vehicle","Name a component, measurement, or rule term from the Electric Vehicle event."],
    ["Codebusters","Name a cipher, code type, or cryptanalysis technique from Codebusters."],
    ["Botany","Name a plant tissue, structure, or process a botanist studies."],
    ["Thermodynamics","Name a thermodynamics law, process, quantity, or scientist from the rules."],
    ["Rocks & Minerals","Name a mineral habit, physical property, or rock texture from the Rocks and Minerals rules."],
  ],
  // 2026-11-30
  20787: [
    ["Circuit Lab","Name a DC circuit idea, component, or pioneer from Circuit Lab."],
    ["Water Quality","Name a coral reef organism, water test, or marine ecology term from Water Quality."],
    ["Engineering CAD","Name an Onshape feature, CAD tool, or engineering-drawing term."],
    ["Disease Detectives","Name a strategy to control or prevent disease in a population."],
    ["Mission Possible","Name an action, machine, or rule term from Mission Possible."],
    ["Protein Modeling","Name an amino acid, structural feature, or influenza term from Protein Modeling."],
    ["Botany","Name a plant disease, pest, or nutrient deficiency."],
  ],
  // 2026-12-01
  20788: [
    ["Experimental Design","Name a part of an experiment or report scored on the Experimental Design checklist."],
    ["Hovercraft","Name a physics concept, part, or rule term from the Hovercraft event."],
    ["Ping Pong Parachute","Name a part, measurement, or rule term from Ping Pong Parachute."],
    ["Remote Sensing","Name a part of the electromagnetic spectrum, a sensor band, or a spectral index."],
    ["Thermodynamics","Name a material or design feature for a heat-collecting device."],
    ["Water Quality","Name a water treatment step or water pollutant."],
    ["Boomilever","Name a wood, adhesive, or joint used to build a Boomilever."],
  ],
  // 2026-12-02 (planned by scripts/plan-dailies.mjs)
  20789: [
    ["Codebusters","Name a clue, technique, or term used to solve a Codebusters cipher by hand."],
    ["Forensics","Name a test, reagent, or clue used to identify a powder, hair, fiber, or plastic in Forensics."],
    ["Electric Vehicle","Name a microcontroller, sensor, or programming concept used to control a vehicle."],
    ["Astronomy","Name an observatory, telescope, or detector used for multi-wavelength or multi-messenger astronomy."],
    ["Anatomy & Physiology","Name a part of the digestive tract, an accessory organ, or a digestive enzyme or hormone."],
    ["Wright Stuff","Name a material, tool, or part used to build or fly a rubber-powered model plane."],
    ["Designer Genes","Name a stage, structure, or factor in transcription or translation."],
  ],
  // 2026-12-03 (planned by scripts/plan-dailies.mjs)
  20790: [
    ["Dynamic Planet","Name a karst or groundwater feature, or something you could read from a topographic map, well, or hydrograph."],
    ["Disease Detectives","Name a pathogen (virus, bacterium, parasite, fungus, or prion) that causes human disease."],
    ["Botany","Name a plant hormone, pigment, or biochemical a botanist studies."],
    ["Engineering CAD","Name a view, line type, or annotation on an engineering drawing."],
    ["Mission Possible","Name a simple machine, mechanical-advantage term, or form of energy a Mission Possible device could use."],
    ["Rocks & Minerals","Name a rock or mineral on the 2027 National Rocks and Minerals List."],
    ["Protein Modeling","Name a step of influenza infection, a part of the virus, or part of the immune response to it."],
  ],
  // 2026-12-04 (planned by scripts/plan-dailies.mjs)
  20791: [
    ["Remote Sensing","Name an Earth-observing satellite, satellite series, or onboard sensor."],
    ["Experimental Design","Name a statistic, graph type, or data-analysis term used in an Experimental Design report."],
    ["Circuit Lab","Name a digital logic gate, circuit, or concept."],
    ["Water Quality","Name an estuary or marine-ecology concept from Water Quality Part I."],
    ["Chemistry Lab","Name a concept, law, or quantity from gas behavior or reaction kinetics."],
    ["Hovercraft","Name a physics equation, unit, or quantity used to plan or score a hovercraft run."],
    ["Ping Pong Parachute","Name a design parameter, flight measurement, or physics term for a Ping Pong Parachute rocket."],
  ],
  // 2026-12-05 (planned by scripts/plan-dailies.mjs)
  20792: [
    ["Boomilever","Name a structural concept or rule term from Boomilever."],
    ["Forensics","Name a substance, material, or technique from the Forensics rules."],
    ["Thermodynamics","Name a thermodynamics law, process, quantity, or scientist from the rules."],
    ["Astronomy","Name a type of star, stellar remnant, or stellar explosion."],
    ["Anatomy & Physiology","Name a disease or disorder of the respiratory, digestive, or immune system."],
    ["Wright Stuff","Name a part, trim adjustment, or rule term for a rubber-powered free-flight plane."],
    ["Designer Genes","Name an enzyme, technique, or molecule used in molecular genetics."],
  ],
  // 2026-12-06 (planned by scripts/plan-dailies.mjs)
  20793: [
    ["Codebusters","Name a cipher, code type, or cryptanalysis technique from Codebusters."],
    ["Dynamic Planet","Name a freshwater landform, process, or feature from the study of rivers, lakes, and groundwater."],
    ["Disease Detectives","Name an epidemiology term, measure, or study design."],
    ["Botany","Name a plant tissue, structure, or process a botanist studies."],
    ["Mission Possible","Name an action, machine, or rule term from Mission Possible."],
    ["Electric Vehicle","Name a component, measurement, or rule term from the Electric Vehicle event."],
    ["Rocks & Minerals","Name a mineral habit, physical property, or rock texture from the Rocks and Minerals rules."],
  ],
  // 2026-12-07 (planned by scripts/plan-dailies.mjs)
  20794: [
    ["Protein Modeling","Name an amino acid, structural feature, or influenza term from Protein Modeling."],
    ["Experimental Design","Name a part of an experiment or report scored on the Experimental Design checklist."],
    ["Remote Sensing","Name a satellite, instrument, or concept from the Remote Sensing rules."],
    ["Circuit Lab","Name a DC circuit idea, component, or pioneer from Circuit Lab."],
    ["Engineering CAD","Name an Onshape feature, CAD tool, or engineering-drawing term."],
    ["Water Quality","Name a coral reef organism, water test, or marine ecology term from Water Quality."],
    ["Chemistry Lab","Name an ion you are expected to know for Chemistry Lab."],
  ],
  // 2026-12-08 (planned by scripts/plan-dailies.mjs)
  20795: [
    ["Boomilever","Name a wood, adhesive, or joint used to build a Boomilever."],
    ["Thermodynamics","Name a material or design feature for a heat-collecting device."],
    ["Astronomy","Name an object or galactic feature from the 2027 Astronomy rules."],
    ["Anatomy & Physiology","Name a cell, organ, or molecule of the human immune system."],
    ["Hovercraft","Name a physics concept, part, or rule term from the Hovercraft event."],
    ["Designer Genes","Name a term from Mendelian, population, or evolutionary genetics."],
    ["Ping Pong Parachute","Name a part, measurement, or rule term from Ping Pong Parachute."],
  ],
  // 2026-12-09 (planned by scripts/plan-dailies.mjs)
  20796: [
    ["Codebusters","Name a clue, technique, or term used to solve a Codebusters cipher by hand."],
    ["Disease Detectives","Name a strategy to control or prevent disease in a population."],
    ["Botany","Name a plant disease, pest, or nutrient deficiency."],
    ["Forensics","Name a test, reagent, or clue used to identify a powder, hair, fiber, or plastic in Forensics."],
    ["Electric Vehicle","Name a microcontroller, sensor, or programming concept used to control a vehicle."],
    ["Rocks & Minerals","Name a rock or mineral on the 2027 National Rocks and Minerals List."],
    ["Wright Stuff","Name a material, tool, or part used to build or fly a rubber-powered model plane."],
  ],
  // 2026-12-10 (planned by scripts/plan-dailies.mjs)
  20797: [
    ["Remote Sensing","Name a part of the electromagnetic spectrum, a sensor band, or a spectral index."],
    ["Protein Modeling","Name a step of influenza infection, a part of the virus, or part of the immune response to it."],
    ["Experimental Design","Name a statistic, graph type, or data-analysis term used in an Experimental Design report."],
    ["Dynamic Planet","Name a karst or groundwater feature, or something you could read from a topographic map, well, or hydrograph."],
    ["Engineering CAD","Name a view, line type, or annotation on an engineering drawing."],
    ["Water Quality","Name a water treatment step or water pollutant."],
    ["Mission Possible","Name a simple machine, mechanical-advantage term, or form of energy a Mission Possible device could use."],
  ],
  // 2026-12-11 (planned by scripts/plan-dailies.mjs)
  20798: [
    ["Circuit Lab","Name a digital logic gate, circuit, or concept."],
    ["Chemistry Lab","Name a concept, law, or quantity from gas behavior or reaction kinetics."],
    ["Anatomy & Physiology","Name a part of the digestive tract, an accessory organ, or a digestive enzyme or hormone."],
    ["Hovercraft","Name a physics equation, unit, or quantity used to plan or score a hovercraft run."],
    ["Astronomy","Name an observatory, telescope, or detector used for multi-wavelength or multi-messenger astronomy."],
    ["Designer Genes","Name a stage, structure, or factor in transcription or translation."],
    ["Ping Pong Parachute","Name a design parameter, flight measurement, or physics term for a Ping Pong Parachute rocket."],
  ],
};
