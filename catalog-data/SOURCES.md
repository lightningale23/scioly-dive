# Catalog sources

- Prompts and answer lists are written from the Science Olympiad 2027 Division C Rules Manual (event topics, required materials, scoring terms and the 2027 National Rocks and Minerals List).
- Answer familiarity scores in familiarity.js are Zipf frequencies computed with [wordfreq](https://github.com/rspeer/wordfreq) by Robyn Speer, whose word-frequency data is distributed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Long answer lists in sourced-answers.js are pulled by scripts/sourced-answers.mjs from open reference data:
  - Disease names and synonyms (respiratory, gastrointestinal and immune system diseases) from the [Human Disease Ontology](https://disease-ontology.org/), released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
  - Commercially available restriction enzymes from [REBASE](http://rebase.neb.com/) (New England Biolabs), as packaged in [Biopython](https://biopython.org/) under the Biopython License / BSD 3-Clause.
  - 7400- and 4000-series logic chip numbers and functions from Wikipedia's "List of 7400-series integrated circuits" and "List of 4000-series integrated circuits", available under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Some hand-written answers were cross-checked against Wikipedia categories (Star types, Variable stars, Chemical kinetics, Equations of state, Epidemiology, Molecular biology techniques, Boolean algebra, Logic families).
