"""
Builds subtitles (.srt) from the DEEPU scene plan's own voiceover text and
per-scene timing, optionally translating the lines into a different
language first via Gemini. Burning the .srt onto a video is handled by
modules.edit_engine.burn_subtitles (plain ffmpeg, no language-awareness
needed there).
"""

import json
import re


def _format_srt_time(seconds):
    millis = int(round(max(0.0, seconds) * 1000))
    hh, millis = divmod(millis, 3600000)
    mm, millis = divmod(millis, 60000)
    ss, ms = divmod(millis, 1000)
    return f"{hh:02d}:{mm:02d}:{ss:02d},{ms:03d}"


def scene_lines_with_timing(scenes, default_seconds=5):
    """Returns a list of (start_seconds, end_seconds, text) for every scene
    that has non-empty voiceover text, laid out back to back using each
    scene's estimated_seconds."""

    out = []
    t = 0.0

    for scene in scenes:
        dur = float(scene.get("estimated_seconds", default_seconds) or default_seconds)
        text = (scene.get("voiceover") or "").strip()

        if text:
            out.append((t, t + dur, text))

        t += dur

    return out


def build_srt(timed_lines):
    """timed_lines: list of (start_seconds, end_seconds, text). Returns SRT
    file content as a string."""

    blocks = []

    for i, (start, end, text) in enumerate(timed_lines, 1):
        blocks.append(
            f"{i}\n{_format_srt_time(start)} --> {_format_srt_time(end)}\n{text}\n"
        )

    return "\n".join(blocks)


def translate_lines(lines, target_language, api_key):
    """Translates a list of strings into target_language using Gemini,
    preserving order and count. Raises on failure — caller decides whether
    to fall back to the original lines."""

    if not api_key:
        raise ValueError("GEMINI_API_KEY is required to translate subtitles.")

    if not lines:
        return []

    from google import genai

    client = genai.Client(api_key=api_key)

    prompt = (
        "Translate each of the following subtitle lines into "
        f"{target_language}. Keep meaning natural for on-screen subtitles "
        "(short, readable). Return ONLY a JSON array of strings, exactly "
        f"{len(lines)} items, in the same order, with no extra text, no "
        "markdown fences.\n\n"
        + json.dumps(lines, ensure_ascii=False)
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = (response.text or "").strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    translated = json.loads(raw)

    if not isinstance(translated, list) or len(translated) != len(lines):
        raise ValueError("Translation did not return a matching number of lines.")

    return [str(x) for x in translated]


def build_srt_for_scenes(scenes, target_language=None, gemini_api_key=None, default_seconds=5):
    """High-level entry point: lays out scene voiceover text on a timeline,
    optionally translates it, and returns (srt_text, warning_or_None).
    Never raises for a translation failure — falls back to the original
    language and reports why in the warning string."""

    timed = scene_lines_with_timing(scenes, default_seconds=default_seconds)

    warning = None

    if target_language:
        texts = [t for _, _, t in timed]
        try:
            translated_texts = translate_lines(texts, target_language, gemini_api_key)
            timed = [
                (start, end, translated_texts[i])
                for i, (start, end, _) in enumerate(timed)
            ]
        except Exception as exc:
            warning = (
                f"Could not translate subtitles into {target_language} "
                f"({exc}); using the original script language instead."
            )

    return build_srt(timed), warning
