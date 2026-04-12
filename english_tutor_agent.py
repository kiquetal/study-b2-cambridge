# english_tutor_agent.py

def explain_grammar(topic: str) -> str:
    """Provides a B2-level explanation of a given grammar topic."""
    topic = topic.lower().strip()
    
    explanations = {
        "present perfect": """
The **Present Perfect** is used to connect the past with the present.

**Form:** has/have + past participle (e.g., 'I have lived', 'She has seen')

**Main Uses at B2 Level:**
1.  **Experiences:** To talk about things you have done in your life, without specifying exactly when.
    *   *Example:* "I **have visited** Rome twice." (The experience is important, not the specific dates.)
    *   *Keywords:* ever, never, before
2.  **Actions that started in the past and continue to the present:**
    *   *Example:* "I **have lived** in London for five years." (I started living here 5 years ago and still live here.)
    *   *Keywords:* for, since
3.  **Recent actions with a present result:** The action happened recently, and its effect is still felt now.
    *   *Example:* "I **have lost** my keys." (I don't have them now.)
    *   *Keywords:* just, already, yet
4.  **Completed actions within an unfinished time period:**
    *   *Example:* "I **haven't seen** John this week." (This week is not over yet.)
    *   *Keywords:* this morning/week/month/year, today

**Distinction from Past Simple:**
The Past Simple refers to completed actions at a specific time in the past.
    *   *Past Simple:* "I **visited** Rome last year." (Specific time: last year)
    *   *Present Perfect:* "I **have visited** Rome." (Experience, no specific time given)
        """,
        "conditionals": """
**Conditionals** (If clauses) express a cause-and-effect relationship. At B2 level, you should be comfortable with Zero, First, Second, and Third Conditionals, and potentially mixed conditionals.

**1. Zero Conditional (General Truths / Facts)**
*   **Form:** If + Present Simple, Present Simple
*   **Use:** To talk about things that are always true or general facts.
*   *Example:* "If you **heat** water to 100°C, it **boils**."

**2. First Conditional (Real / Probable Situations)**
*   **Form:** If + Present Simple, Will + Base Verb
*   **Use:** To talk about a possible future event and its likely result.
*   *Example:* "If it **rains** tomorrow, I **won't go** to the park."

**3. Second Conditional (Unreal / Hypothetical Situations in the Present/Future)**
*   **Form:** If + Past Simple, Would + Base Verb
*   **Use:** To talk about imaginary or unlikely situations in the present or future.
*   *Example:* "If I **won** the lottery, I **would buy** a big house." (It's unlikely I'll win.)
*   *Note:* Use 'were' for all persons in the 'if' clause for formality, e.g., "If I **were** you..."

**4. Third Conditional (Unreal Situations in the Past / Regrets)**
*   **Form:** If + Past Perfect, Would have + Past Participle
*   **Use:** To talk about hypothetical situations in the past that didn't happen, and their imagined results. Often expresses regret or criticism.
*   *Example:* "If I **had studied** harder, I **would have passed** the exam." (I didn't study, so I didn't pass.)
        """,
        "passive voice": """
The **Passive Voice** is used when the focus is on the action or the object of the action, rather than the performer of the action.

**Form:** Subject + be (in appropriate tense) + Past Participle (+ by + agent, if necessary)

**When to use the Passive Voice (B2 Level):**
1.  **When the agent (who performs the action) is unknown, unimportant, or obvious:**
    *   *Example:* "My car **was stolen** last night." (We don't know who stole it.)
    *   *Example:* "The decision **has been made**." (It's not important who made it, the decision itself is.)
2.  **To make writing more formal or objective (e.g., in academic or scientific contexts):**
    *   *Example:* "The experiment **was conducted** over three days."
3.  **When you want to emphasize the action or the object:**
    *   *Example:* "A new bridge **is being built** across the river." (Focus on the bridge/construction.)

**How to change from Active to Passive:**
*   **Active:** Subject + Verb + Object
*   **Passive:** Object (becomes new subject) + be + Past Participle (+ by Subject)

*   *Example (Present Simple):*
    *   Active: "People **eat** pizza everywhere."
    *   Passive: "Pizza **is eaten** everywhere."
*   *Example (Past Simple):*
    *   Active: "Alexander Graham Bell **invented** the telephone."
    *   Passive: "The telephone **was invented** by Alexander Graham Bell."
*   *Example (Present Perfect):*
    *   Active: "They **have finished** the report."
    *   Passive: "The report **has been finished**."
        """
    }

    if topic in explanations:
        return explanations[topic]
    else:
        return f"I don't have a detailed B2 explanation for '{topic}' yet. Please try 'present perfect', 'conditionals', or 'passive voice'."

def correct_sentence(sentence: str) -> str:
    """
    Attempts to correct a given sentence for common B2-level errors.
    This is a very basic implementation and will improve with more sophisticated NLP.
    """
    original_sentence = sentence.strip()
    suggestions = []
    processed_sentence = original_sentence # Start with the original

    # Simple checks for common B2 errors
    # Note: This is a very simplistic string-based replacement and won't handle all cases
    # For a robust solution, proper NLP (tokenization, POS tagging, dependency parsing) is needed.

    # Common verb tense/form issues, redundancies, common vocabulary mix-ups
    replacements = {
        "have went": ("have gone", "Present Perfect uses 'gone' (past participle), not 'went'."),
        "has went": ("has gone", "Present Perfect uses 'gone' (past participle), not 'went'."),
        "did went": ("did go", "'Did' requires the base form of the verb, 'go'."),
        "I was go": ("I was going", "Use 'was going' for Past Continuous."),
        "he don't": ("he doesn't", "Third person singular (he/she/it) uses 'doesn't'."),
        "she don't": ("she doesn't", "Third person singular (he/she/it) uses 'doesn't'."),
        "it don't": ("it doesn't", "Third person singular (he/she/it) uses 'doesn't'."),
        "I like to doing": ("I like to do", "After 'like to', use the base form of the verb."),
        "I good in english": ("I am good at English", "Use 'I am good at' for proficiency."),
        "much people": ("many people", "'People' is countable, so use 'many'."),
        "less people": ("fewer people", "'People' is countable, so use 'fewer'."),
        "can able": ("can", "Avoid redundancy: 'can' already expresses ability, so 'able' is not needed."),
        "should of": ("should have", "This is a common phonetic error; it should be 'should have'."),
        "would of": ("would have", "This is a common phonetic error; it should be 'would have'."),
        "could of": ("could have", "This is a common phonetic error; it should be 'could have'."),
        "me and my friend": ("my friend and I", "When referring to yourself and others, put 'I' last and use the subject pronoun 'I' when it is the subject."),
        "he speak": ("he speaks", "Third person singular (he/she/it) verbs often end in -s."),
        "she speak": ("she speaks", "Third person singular (he/she/it) verbs often end in -s."),
        "it work": ("it works", "Third person singular (he/she/it) verbs often end in -s."),
        "informations": ("information", "'Information' is uncountable and does not have a plural form."),
        "advices": ("advice", "'Advice' is uncountable and does not have a plural form."),
        "furnitures": ("furniture", "'Furniture' is uncountable and does not have a plural form."),
        "cloths": ("clothes", "'Clothes' is the common term for garments."),
    }
    
    # Process the sentence for replacements
    lower_case_sentence = processed_sentence.lower()
    for old, (new, reason) in replacements.items():
        if old in lower_case_sentence:
            # A more robust replacement would involve regex with word boundaries
            # For simplicity, we're doing a direct string replace here, which might be imperfect
            start_index = lower_case_sentence.find(old)
            end_index = start_index + len(old)
            
            # Reconstruct the sentence with the correction, trying to preserve case where appropriate
            if original_sentence[start_index].isupper(): # If the original started with a capital
                corrected_part = new[0].upper() + new[1:]
            else:
                corrected_part = new
            
            processed_sentence = original_sentence[:start_index] + corrected_part + original_sentence[end_index:]
            suggestions.append(f"Consider changing '{old}' to '{new}'. Reason: {reason}")
            lower_case_sentence = processed_sentence.lower() # Update for subsequent checks

    # 1. Capitalization of first letter (if not already)
    if processed_sentence and not processed_sentence[0].isupper():
        processed_sentence = processed_sentence[0].upper() + processed_sentence[1:]
        suggestions.append("Remember to capitalize the first letter of a sentence.")

    # 2. End punctuation
    if processed_sentence and processed_sentence[-1] not in ".?!":
        processed_sentence += "."
        suggestions.append("Add appropriate punctuation at the end of the sentence.")

    if not suggestions:
        return f"Your sentence seems grammatically correct at a basic B2 level, or I couldn't identify common errors with my current rules.\nOriginal: '{original_sentence}'"
    
    return (f"Original: '{original_sentence}'\n"
            f"Suggested Correction: '{processed_sentence.strip()}'\n\n"
            f"Suggestions:\n- " + "\n- ".join(suggestions))


def clarify_doubt(question: str) -> str:
    """
    Provides a general answer or guidance for a B2-level English doubt.
    This function will be expanded as more specific topics are added.
    """
    question = question.lower().strip()

    if "difference between present perfect and past simple" in question or "present perfect vs past simple" in question:
        return explain_grammar("present perfect")
    elif "how to use conditionals" in question or "what are conditionals" in question:
        return explain_grammar("conditionals")
    elif "when to use passive voice" in question or "passive voice explained" in question:
        return explain_grammar("passive voice")
    elif "for vs since" in question:
        return """
**For vs. Since (B2 Level):**

*   **For:** Used with a period of time (duration) to say *how long* something has lasted.
    *   *Examples:* "for five years", "for two hours", "for a long time"
    *   "I have studied English **for** three years."
    *   "She has been waiting **for** twenty minutes."

*   **Since:** Used with a point in time (a specific moment) to say *when* something started.
    *   *Examples:* "since 2020", "since Monday", "since I was a child", "since 5 o'clock"
    *   "I have studied English **since** 2023."
    *   "She has been waiting **since** 10 AM."

**Key Idea:**
*   **For:** Answers "How long?" (duration)
*   **Since:** Answers "Since when?" (starting point)
        """
    elif "much vs many" in question or "many vs much" in question:
        return """
**Much vs. Many (B2 Level):**

Both "much" and "many" are used to talk about quantity. The difference depends on whether the noun is countable or uncountable.

*   **Many:** Used with **countable nouns** (things you can count individually, and which have a plural form).
    *   *Examples:* "many books", "many friends", "many ideas", "many people"
    *   "How **many** students are in the class?"
    *   "I don't have **many** problems with my English."

*   **Much:** Used with **uncountable nouns** (things you cannot count individually, and which don't usually have a plural form).
    *   *Examples:* "much water", "much information", "much money", "much time", "much advice"
    *   "How **much** money do you have?"
    *   "There isn't **much** traffic today."

**Important Note:** In positive statements, we often prefer to use "a lot of" or "lots of" with both countable and uncountable nouns instead of "much" or "many," especially in informal speech.
    *   "I have **a lot of** friends." (instead of "many friends")
    *   "I have **a lot of** work." (instead of "much work")
    "Much" and "many" are more common in negative sentences and questions.
        """
    elif "advices" in question or "informations" in question or "furnitures" in question:
        return """
Certain nouns in English are **uncountable** and do not have a plural form.
*   **Advice:** Always singular. Use "a piece of advice" or "some advice".
    *   *Incorrect:* "He gave me many advices."
    *   *Correct:* "He gave me a lot of advice." or "He gave me some good advice."
*   **Information:** Always singular. Use "a piece of information" or "some information".
    *   *Incorrect:* "I need informations about the project."
    *   *Correct:* "I need some information about the project."
*   **Furniture:** Always singular. Use "a piece of furniture" or "some furniture".
    *   *Incorrect:* "We bought new furnitures."
    *   *Correct:* "We bought new furniture." or "We bought some new pieces of furniture."
        """
    else:
        return f"I'm sorry, I can't provide a specific clarification for '{question}' yet. Please try asking about common B2 topics like 'present perfect', 'conditionals', 'passive voice', 'for vs since', 'much vs many', or plural forms of uncountable nouns like 'advice' or 'information'."


def main():
    print("Welcome to your B2 English Tutor Agent!")
    print("I can help you with grammar explanations, sentence correction, and clarifying doubts.")

    while True:
        print("\nWhat would you like to do?")
        print("1. Explain a grammar topic")
        print("2. Correct a sentence")
        print("3. Clarify a doubt")
        print("4. Exit")

        choice = input("Enter your choice (1-4): ").strip()

        if choice == '1':
            topic = input("Enter the grammar topic (e.g., 'present perfect', 'conditionals', 'passive voice'): ")
            print("\n--- Explanation ---")
            print(explain_grammar(topic))
            print("-------------------")
        elif choice == '2':
            sentence = input("Enter the sentence you want me to correct: ")
            print("\n--- Correction ---")
            print(correct_sentence(sentence))
            print("------------------")
        elif choice == '3':
            doubt = input("What is your doubt? (e.g., 'difference between present perfect and past simple', 'for vs since', 'much vs many'): ")
            print("\n--- Clarification ---")
            print(clarify_doubt(doubt))
            print("---------------------")
        elif choice == '4':
            print("Thank you for using the B2 English Tutor Agent. Goodbye!")
            break
        else:
            print("Invalid choice. Please enter a number between 1 and 4.")

if __name__ == "__main__":
    main()
