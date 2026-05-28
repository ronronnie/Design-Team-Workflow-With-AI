# Design Expansion Demo

This is the narrow first demo:

1. Paste a Figma file URL and node ID.
2. Fetch the frame.
3. Convert it into representation JSON.
4. Generate one empty-state proposal.
5. Run linter checks.
6. Show the proposal in a review UI.
7. Capture accept, edit, or dismiss.

The app runs with mock Figma and mock generation by default. Add real credentials when ready:

```bash
cp .env.example .env.local
```

Set `FIGMA_ACCESS_TOKEN` to use the Figma REST API. Set `ANTHROPIC_API_KEY` to use Anthropic generation.

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Core Files

- `app/page.tsx` - review UI
- `app/api/demo/route.ts` - end-to-end demo pipeline
- `lib/figma.ts` - Figma ingestion seam with mock fallback
- `lib/representation.ts` - compact frame representation
- `lib/generation.ts` - empty-state generation seam with mock fallback
- `lib/linter.ts` - deterministic linter checks
- `prompts/` - versioned prompt drafts
- `eval/` - eval-set shape
