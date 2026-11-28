// Rules scope for prompts that say "from the rules" but are not closed lists. The AI judge never sees
// the rules manual, so it gets this summary of the 2027 Division C topic sections the prompt draws on
// (the same sections cited in the prompt's answer list) and accepts only answers within it. Letter-rule
// variants use their base prompt's scope. Bump JUDGMENT_CACHE in judge.js after changing a scope.
export const judgeScopes = {
  'Name a satellite, instrument, or concept from the Remote Sensing rules.':
    'Remote Sensing rules: (3.c) remote sensing instrumentation and physics: active and passive sensors, '
    + 'imagers, radiometers, lidar, radar and altimetry, gravimetry, the electromagnetic spectrum, '
    + 'reflection, refraction, scattering, absorption and emission spectra, blackbody radiation, orbits '
    + 'and orbital mechanics, and spatial, spectral, temporal and radiometric resolution; (3.d) Earth-'
    + 'observing satellite missions and their instruments used to study climate and the atmosphere, '
    + 'oceans, land and ice; (3.e, 3.f) climate processes seen from space: greenhouse gases, aerosols '
    + 'and air pollutants, the carbon and nitrogen cycles, ENSO, sea level, extreme events, albedo, '
    + 'radiative forcing, feedbacks and Earth’s energy balance. Not in scope: planetary or astronomy '
    + 'missions, spy, communication or navigation satellites, and general space history.',
  'Name a mineral habit, physical property, or rock texture from the Rocks and Minerals rules.':
    'Rocks and Minerals rules: (3.h.iii, iv) physical and other properties used to identify minerals '
    + '(color, hardness and the Mohs scale, luster types, streak, cleavage, fracture, specific gravity, '
    + 'diaphaneity, tenacity, acid reaction, fluorescence, magnetism and similar tests); (3.h.v) mineral '
    + 'habits and crystal forms; (3.h.viii) crystal systems and silicate structures; (3.i) igneous, '
    + 'sedimentary and metamorphic rock textures and sedimentary structures. A rock or mineral name '
    + 'itself is not an answer to this prompt.',
  'Name a thermodynamics law, process, quantity, or scientist from the rules.':
    'Thermodynamics rules: (5.c.i) systems and surroundings, properties, temperature, the zeroth law, '
    + 'temperature scales and energy units; (5.c.ii) states of matter, phase changes, phase diagrams, '
    + 'latent and sensible heat, and the ideal gas law; (5.c.iii) heat transfer by conduction, '
    + 'convection and radiation, conductivity, heat capacity and specific heat; (5.c.iv) thermodynamic '
    + 'processes and cycles, heat engines, heat pumps and refrigerators, efficiency, work, heat, internal '
    + 'energy and the first and second laws; (5.c.v) the historical scientists who founded '
    + 'thermodynamics and its temperature scales; (5.c.vi, vii) blackbody radiation and emissivity, '
    + 'entropy, enthalpy, free energy and the third law, and the event’s insulated-device build and '
    + 'temperature-prediction task. Not in scope: unrelated physics or chemistry topics.',
};
export const judgeScope = prompt => judgeScopes[prompt.split('\n')[0]];
