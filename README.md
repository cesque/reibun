For local work, this project requires a `.env.local` file containing the following environment variables:

```
NEXT_PUBLIC_SERVER_ADDRESS=http://localhost:3000
```

The kanji and vocab info is cached locally in `/src/data`, but if you plan on re-fetching all the info with the `fetchWanikaniData.mjs` script, you'll also need:

```
WANIKANI_API_KEY=api_key_here
```

