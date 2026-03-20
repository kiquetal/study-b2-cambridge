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
2. Check if a PDF is attached (`pdfPath` field) — if so, extract text with `pdftotext`
3. Generate exercises from the actual content. Available exercise types:
   - **Vocabulary matching** — words from the episode matched to definitions
   - **Open cloze (Part 2)** — passage from transcript with grammar words removed
   - **Word formation (Part 3)** — sentences with word roots to transform
   - **Key word transformations (Part 4)** — rewrite sentences using a given word
   - **Phrasal verb extraction** — phrasal verbs from the episode with gaps
   - **Comprehension questions** — recall questions about the content
   - **Error correction** — sentences with deliberate mistakes to spot
4. If the user doesn't specify a type, generate a mixed set (vocabulary + open cloze + key word transformations)
5. After the user answers, correct with explanations and note common pitfalls

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

Session ID: `class-with-edu`. When the user says "Class with Edu recap:" followed by notes:

1. Extract corrections Edu made → explain the grammar rule behind each
2. Extract new vocabulary/phrasal verbs → add to the phrasal_verbs table with proper definitions and examples
3. Generate 3-5 follow-up exercises based on the corrections
4. Log the class as a study_log entry under the `class-with-edu` session

## File Organization

Grammar notes and exercises can be saved to `docs/grammar/` in the project root.
