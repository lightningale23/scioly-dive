# Science Olympiad Dive

Run npm ci, npm run build and npm start from this folder, then open http://localhost:4173. This serves both the built pages and the answer API. On Vercel, use this folder as the project root.

| Environment variables | Feature |
| --- | --- |
| AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT | Azure fallback for guesses outside the curated answer bank. Choose a deployment that supports Chat Completions JSON mode. |
| UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, DIVE_SECRET | Persistent judgments and practice data, account sign-in and sync, and global daily percentiles. Use a stable random signing secret shared by every server instance. |
| ANSWER_FAMILIARITY_JSON | Optional precomputed corpus counts per million, keyed by normalized canonical answer, for example {"parallax":3.2}. Editorial selections take precedence for the 15- and 100-point tiers. |

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
