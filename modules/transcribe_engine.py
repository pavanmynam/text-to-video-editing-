"""
Speech-to-text via FAL's hosted Whisper model (fal-ai/whisper). Used for:
  - transcribing a user's microphone recording into script text, and
  - transcribing an uploaded video's audio into subtitles.

FAL's Whisper endpoint takes an audio_url (not raw bytes), so a local
recording/extracted-audio file is first uploaded to FAL's own file store
with fal_client.upload_file(), which returns a URL to pass as audio_url.
"""

import os


def transcribe_audio_file(audio_path, fal_key, language=None, task="transcribe"):
    """Uploads a local audio file to FAL and transcribes it with Whisper.
    Returns the result dict from FAL (has at least a "text" field, and
    usually "chunks" with per-segment timestamps when available).
    task: "transcribe" keeps the original language; "translate" always
    outputs English.
    """

    if not fal_key:
        raise ValueError("FAL_KEY is missing. Add it in Streamlit Secrets.")

    os.environ["FAL_KEY"] = fal_key

    import fal_client

    audio_url = fal_client.upload_file(audio_path)

    arguments = {
        "audio_url": audio_url,
        "task": task,
        "chunk_level": "segment",
    }

    if language:
        arguments["language"] = language

    try:
        client = fal_client.SyncClient(key=fal_key)
        result = client.subscribe("fal-ai/whisper", arguments=arguments)
    except (AttributeError, TypeError):
        result = fal_client.subscribe("fal-ai/whisper", arguments=arguments)

    return result


def transcript_text(result):
    """Pulls the plain transcribed text out of a transcribe_audio_file()
    result."""

    return (result or {}).get("text", "") or ""


def transcript_segments(result):
    """Pulls (start_seconds, end_seconds, text) tuples out of a
    transcribe_audio_file() result's chunk list, when present. FAL's chunk
    objects have been seen with "timestamp": [start, end] — fall back
    gracefully if the shape differs or timestamps are missing."""

    chunks = (result or {}).get("chunks") or []
    segments = []

    for chunk in chunks:
        text = (chunk.get("text") or "").strip()

        if not text:
            continue

        timestamp = chunk.get("timestamp")

        if isinstance(timestamp, (list, tuple)) and len(timestamp) == 2:
            start, end = timestamp
        else:
            start = chunk.get("start")
            end = chunk.get("end")

        if start is None or end is None:
            continue

        segments.append((float(start), float(end), text))

    return segments
