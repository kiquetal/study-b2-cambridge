# B2 Cambridge Grammar Mastery — Steering

## Goal

Fill grammar gaps for the Use of English paper by reviewing, practicing, and retaining key B2 grammar topics through spaced repetition.

## Approach

For each grammar topic, follow this cycle:

1. **Explain** — Break down the rule with clear examples and common B2 exam traps
2. **Compare** — Side-by-side of confusing pairs (e.g., reported speech vs direct speech)
3. **Practice** — Generate Use of English-style exercises (open cloze, key word transformations)
4. **Correct** — User attempts them, review and explain mistakes
5. **Log** — Save the session in the tracker app for spaced repetition review

## Grammar Topics Priority List

| # | Topic | Why it's tricky at B2 | UoE Parts |
|---|-------|----------------------|-----------|
| 1 | Reported Speech | Tense backshift, say vs tell, time/place changes | Part 2, 4 |
| 2 | Indirect Questions | Word order flips, if/whether, no auxiliaries | Part 4 |
| 3 | Conditionals (0-3 + mixed) | Mixed conditionals, unless/provided that | Part 2, 4 |
| 4 | Wish / If only | Wish + past simple vs past perfect vs would | Part 4 |
| 5 | Passive Voice | Impersonal passive, have something done | Part 3, 4 |
| 6 | Relative Clauses | Defining vs non-defining, omitting the pronoun | Part 2 |
| 7 | Modal Verbs for Speculation | Must have / can't have / might have been | Part 2, 4 |
| 8 | Used to / Would / Be used to | Three different structures, easy to confuse | Part 2, 4 |
| 9 | Comparatives & Superlatives | The more...the more, as...as, by far the | Part 4 |
| 10 | Word Formation | Prefixes, suffixes, noun/verb/adj shifts | Part 3 |
| 11 | Linking Words & Connectors | Although/despite/in spite of, so that/in order to | Part 1, 2 |
| 12 | Articles & Determiners | Zero article, the + superlatives, a/an edge cases | Part 2 |

## Study Modes

When working on a grammar topic, use these interaction patterns:

- **Teach me** — Ask for a full explanation with rules, examples, and exam traps
- **Quiz me** — Request key word transformation or open cloze exercises
- **Fix my sentences** — Write sentences using the rule, get corrections with explanations
- **Compare** — Ask for side-by-side comparison of confusing structures
- **Open cloze** — Request a Part 2-style passage with gaps
- **Cheat sheet** — Get a compact one-page reference for a topic
- **Real context** — Share podcast/book sentences and practice transforming them

## Workflow

1. Pick a topic from the priority list
2. Start with "Teach me" explanation
3. Do 5-10 "Quiz me" exercises
4. Log the session in the study tracker app
5. When spaced repetition reminder fires, do a quick review quiz

## Post-Podcast Exercise Generation

When the user says "Generate exercises from my latest session" or references a specific session:

1. Query the SQLite database (`study.db`) to find the session and its notes
2. Check if a PDF is attached (`pdfPath` field) — if so, extract text with `pdftotext public/<pdfPath> -`
3. Generate **at least 10 exercises** from the actual content, mixing these types:
   - `vocabulary` — words from the episode matched to definitions
   - `open_cloze` — passage from transcript with grammar words removed
   - `word_formation` — sentences with word roots to transform
   - `key_word_transformation` — rewrite sentences using a given word
   - `error_correction` — sentences with deliberate mistakes to spot
4. For each exercise, include a `grammarLink` URL when applicable (Cambridge Dictionary, British Council grammar pages)
5. **Save exercises to the database** via POST `/api/exercises` with body: `{ exercises: [{ sessionId, type, question, answer, grammarLink, createdDate }] }`
6. Exercises appear in the **Exercises tab** in the UI, grouped by type, with show/hide answers and grammar links
7. After the user answers, correct with explanations and note common pitfalls

### Phrasal Verb Cleanup

When reviewing phrasal verbs from the database:
- Show corrected meaning and example
- Preserve the original errors with ⚠️ markers so the user sees their pitfalls
- Flag entries that aren't actually phrasal verbs (noun phrases, adjectives, collocations)
- Correct spelling errors explicitly (original → corrected)

### PDF Content Access

- PDFs are stored in `public/pdfs/` and linked to sessions via `pdfPath`
- Use `pdftotext <path> -` to extract text
- Session-PDF mapping is in the `sessions` table

## Content Guidelines

- All examples should be B2 Cambridge level
- Focus on Use of English Parts 1-4
- Highlight common exam traps and distractors
- Include both formal and informal register examples
- Reference real sources when possible (podcasts, textbooks)

## Class with Edu (Speaking Practice)

Each class creates a **new session** with the date in the title for unique identification.
When the user says "Class with Edu recap:" followed by notes:

1. Create a new session: title "Class with Edu - YYYY-MM-DD", skillArea "Speaking", source "Private teacher"
2. Extract corrections Edu made → explain the grammar rule behind each
3. Extract new vocabulary/phrasal verbs → add to the phrasal_verbs table with proper definitions and examples
4. Generate 10+ follow-up exercises based on the corrections, save to DB via `/api/exercises`
5. Log the class as a study_log entry under the new session

## File Organization

Grammar notes and exercises can be saved to `docs/grammar/` in the project root.
