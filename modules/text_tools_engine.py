"""
Generic free-text helpers for the Script Notepad — translating a whole
script into any requested language, and auto-correcting spelling/grammar
mistakes — both via Gemini. Unlike modules.subtitle_engine.translate_lines
(which translates a list of short, individually-timed subtitle lines),
these work on one continuous block of prose.
"""


def _clean_model_text(raw):
    text = (raw or "").strip()

    if text.startswith("```"):
        text = text.split("\n", 1)[-1]

    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]

    return text.strip().strip('"').strip()


def translate_text(text, target_language, api_key):
    """Translates a full script/paragraph into target_language, preserving
    paragraph breaks and tone. Raises on failure — caller decides whether
    to show the error or fall back to the original text."""

    if not api_key:
        raise ValueError("GEMINI_API_KEY is required to translate text.")

    text = (text or "").strip()

    if not text:
        return ""

    from google import genai

    client = genai.Client(api_key=api_key)

    prompt = (
        f"Translate the following script into {target_language}. Keep "
        "the meaning, tone, and paragraph breaks natural for a spoken "
        "video script — not a stiff word-for-word translation. Return "
        "ONLY the translated text: no preamble, no notes, no markdown "
        "fences, no quotation marks around it.\n\n" + text
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return _clean_model_text(response.text)


def autocorrect_text(text, api_key):
    """Fixes spelling, grammar, and punctuation in `text` without changing
    its language, meaning, or style. Raises on failure."""

    if not api_key:
        raise ValueError("GEMINI_API_KEY is required to auto-correct text.")

    text = (text or "").strip()

    if not text:
        return ""

    from google import genai

    client = genai.Client(api_key=api_key)

    prompt = (
        "Fix only the spelling, grammar, and punctuation mistakes in the "
        "following script. Do not change its meaning, its language, or "
        "its writing style, and do not translate it. Return ONLY the "
        "corrected text: no preamble, no notes, no markdown fences, no "
        "quotation marks around it.\n\n" + text
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return _clean_model_text(response.text)
