# ScioKrillion

Run npm ci, npm run build and npm start from this folder, then open http://localhost:4173. This serves both the built pages and the answer API. On Vercel, use this folder as the project root.

| Environment variables | Feature |
| --- | --- |
| AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT | Azure fallback for guesses outside the curated answer bank. Choose a deployment that supports Chat Completions JSON mode. |
| UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, DIVE_SECRET | Persistent judgments and practice data, account sign-in and sync, and global daily percentiles. Use a stable random signing secret shared by every server instance. |

Guest settings, completion, and streaks are saved on the device. The answer API stores a hash of a daily fallback guess with its verdict. It records normalized practice guesses and their outcomes for editorial review. Azure-validated answers initially receive 30 points and can receive a curated tier when added to the answer bank.

## Live site and GitHub Pages

[Play ScioKrillion](https://scioly-dive.vercel.app/). Vercel deploys every push to main. The old GitHub Pages address, https://lightningale23.github.io/scioly-dive/, now only redirects to Vercel (`pages-redirect/index.html`, published by `.github/workflows/pages.yml`) and carries a visitor's saved results and streaks across once. The static guest build below still works but is no longer deployed. Daily, Archive, Unlimited and packs use the curated answers and rarity tiers in the browser. Results and streaks are stored on the device. Azure judgments, account sync and global rankings require the Node or Vercel deployment described above.

Run `npm ci` and then `node build.mjs --pages` to generate the static site in `pages-dist/`.

## Question catalog and timed guesses

Every prompt is a specialist prompt written from its event's 2027 Division C rules (`catalog-data/specialist-prompts*.js`). The person who studies that event should do best, for example "Name a rock or mineral on the 2027 National Rocks and Minerals List". General-knowledge prompts were removed. The 23 official events each have a specialist prompt; trial events are paused. Prompts with large answer lists also get letter-rule variants, and a dive includes at most one.

Players can retry during the original 25-second round. A unique close spelling appears in the input for confirmation or editing. Only an accepted answer, a skip, or the deadline ends the round. The Pages build judges locally; the Node server also supports the optional Azure fallback for off-bank guesses.

Run `npm test` to check accepted spellings, typo handling, obvious-answer lists, fun facts and client/server schedule alignment before building.

## Daily-only mode and adding answers

`features.js` sets `dailyOnly = true`, so the site offers only the Daily Dive while the answer lists are filled in. Old Unlimited, Archive, Packs and Party links open the Daily Dive, and the server refuses those modes. Set it to `false` to bring them back.

Run `npm run upcoming -- 7` to print the next seven days of Daily prompts with their current answers. Add missing answers directly to the prompt's list in `catalog-data/specialist-prompts*.js`, then run `npm run familiarity` and `npm test`.

## How rarity is decided

Like Krillion, an answer's tier is fixed before anyone plays. In order of precedence:

1. A prompt's short list of obvious answers in `catalog-data/obvious-answers.js`, which become Plankton and Schooler.
2. Familiarity from the wordfreq corpus in `catalog-data/familiarity.js`, which fills each tier up to a size that grows with the answer list. About 1.1·ln(n) answers are Plankton and 1.6·√n Schooler, so obvious answers are a big share of a short list and a tiny share of a long one, as in a real crowd. About a third are Rare, and the rest are Deep Cuts. Lists flagged in `obvious-answers.js` skip corpus filling because their names double as everyday words.

Each prompt's One in a Krillion prefers an answer with a fun fact from `catalog-data/krillion-facts.js`, and the fact appears when a player lands it. After adding answers, run `pip install wordfreq` and then `npm run familiarity` to score the new spellings. Unscored answers count as Deep Cuts.


## Daily prompts

The Daily draws only prompts with at least 100 accepted answers (`MIN_DAILY_ANSWERS` in `selection.js`) and skips unit and number puzzles. `featuredDailies` in `features.js` can pin a day's seven prompts by hand.
