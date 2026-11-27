# Science Olympiad Dive

Run npm ci, npm run build and npm start from this folder, then open http://localhost:4173. This serves both the built pages and the answer API. On Vercel, use this folder as the project root.

| Environment variables | Feature |
| --- | --- |
| AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT | Azure fallback for guesses outside the curated answer bank. Choose a deployment that supports Chat Completions JSON mode. |
| UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, DIVE_SECRET | Persistent judgments and practice data, account sign-in and sync, and global daily percentiles. Use a stable random signing secret shared by every server instance. |

Guest settings, completion, and streaks are saved on the device. The answer API stores a hash of a daily fallback guess with its verdict. It records normalized practice guesses and their outcomes for editorial review. Azure-validated answers initially receive 30 points and can receive a curated tier when added to the answer bank.

## GitHub Pages

[Play Science Olympiad Dive](https://lightningale23.github.io/scioly-dive/). Pushes to main automatically build and publish the guest game. Daily, Archive, Unlimited and packs use the curated answers and rarity tiers in the browser. Results and streaks are stored on the device. Azure judgments, account sync and global rankings require the Node or Vercel deployment described above.

Run `npm ci` and then `node build.mjs --pages` to generate the static site in `pages-dist/`.

## Question catalog and timed guesses

The catalog spans 23 Division C events and three trial events. Topic banks feed subject prompts, cross-event questions, and spelling variants. A seven-prompt dive includes at most one letter challenge. The letter rule appears beneath the question and applies to the spelling submitted, including aliases. Numerical challenges have explicit bounds and accept all solutions within those bounds. Open-ended topic lists are curated and can grow as additional valid answers are found.

Players can retry during the original 25-second round. A unique close spelling appears in the input for confirmation or editing. Only an accepted answer, a skip, or the deadline ends the round. The Pages build judges locally; the Node server also supports the optional Azure fallback for off-bank guesses.

Run `npm test` to check catalog coverage, accepted spellings, typo handling and client/server schedule alignment before building.

Each prompt has exactly one canonical 100-point answer. Existing editorial picks take precedence; when several qualify, a stable prompt-based tie-break picks one. Prompts without a prior pick use a featured term or a highest-rated eligible answer. Aliases of the winner earn the same points. These are game-design choices, not measured player frequencies. See the [catalog sources](catalog-data/SOURCES.md) for the mineral and satellite lists.

## Daily-only mode and adding answers

`features.js` sets `dailyOnly = true`, so the site offers only the Daily Dive while the answer lists are filled in. Old Unlimited, Archive, Packs and Party links open the Daily Dive, and the server refuses those modes. Set it to `false` to bring them back.

Run `npm run upcoming -- 7` to print the next seven days of Daily prompts with their current answers. Add missing answers to `catalog-data/curated-answers.js`, keyed by the exact prompt. `npm test` checks that every key matches a prompt and every spelling is accepted.

## How rarity is decided

Like Krillion, an answer's tier is fixed before anyone plays. In order of precedence:

1. Hand-set tiers in `answer-bank.js` (the original prompts' editorial picks and the `ratings` list).
2. A prompt's short list of obvious answers in `catalog-data/obvious-answers.js`, which become Plankton and Schooler.
3. Familiarity from the wordfreq corpus in `catalog-data/familiarity.js`, which fills each tier up to a size that grows with the answer list. About 1.1·ln(n) answers are Plankton and 1.6·√n Schooler, so obvious answers are a big share of a short list and a tiny share of a long one, as in a real crowd. About a third are Rare, and the rest are Deep Cuts. Lists flagged in `obvious-answers.js` skip corpus filling because their names double as everyday words.

Each prompt's One in a Krillion prefers an answer with a fun fact from `catalog-data/krillion-facts.js`, and the fact appears when a player lands it. After adding answers, run `pip install wordfreq` and then `npm run familiarity` to score the new spellings. Unscored answers count as Deep Cuts.

Broad prompts in `catalog-data/broad-prompts.js` carry the first Daily day that may draw them. The day must be after the deploy date, so a live Daily never changes.

## Daily prompts

The Daily draws only prompts with at least 100 accepted answers (`MIN_DAILY_ANSWERS` in `selection.js`) and skips unit and number puzzles. Narrower prompts stay in the catalog for other modes.
