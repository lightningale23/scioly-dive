# Science Olympiad Dive

Run npm run build and npm start from this folder, then open http://localhost:4173. This serves both the built pages and the answer API. On Vercel, use this folder as the project root.

| Environment variables | Feature |
| --- | --- |
| AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT | Azure fallback for guesses outside the curated answer bank. Choose a deployment that supports Chat Completions JSON mode. |
| UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, DIVE_SECRET | Persistent judgments and practice data, account sign-in and sync, and global daily percentiles. Use a stable random signing secret shared by every server instance. |
| ANSWER_FAMILIARITY_JSON | Optional precomputed corpus counts per million, keyed by normalized canonical answer, for example {"parallax":3.2}. Editorial selections take precedence for the 15- and 100-point tiers. |

Guest settings, completion, and streaks are saved on the device. The answer API stores a hash of a daily fallback guess with its verdict. It records normalized practice guesses and their outcomes for editorial review. Azure-validated answers initially receive 30 points and can receive a curated tier when added to the answer bank.
