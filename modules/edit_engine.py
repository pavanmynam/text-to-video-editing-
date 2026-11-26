"""
Small, focused ffmpeg-based post-processing operations on an already
rendered video: trimming, thumbnail extraction, and audio attach/replace.
These all work on a plain local video file path and return a new file path
— they don't know anything about scenes, FAL, or Streamlit.
"""

import os
import subprocess


def _run(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        tail = result.stderr.decode("utf-8", errors="ignore").strip()
        raise RuntimeError(tail[-800:] if tail else f"ffmpeg failed: {' '.join(cmd)}")
    return result


def get_duration_seconds(video_path):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path,
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        return float(result.stdout.decode("utf-8", errors="ignore").strip())
    except ValueError:
        return None


def trim_video(video_path, out_path, start_seconds=0, end_seconds=None):
    """Cut the video to [start_seconds, end_seconds). end_seconds=None means
    "to the end". Re-encodes (not a stream-copy trim) so the cut point is
    frame-accurate rather than snapped to the nearest keyframe."""

    cmd = ["ffmpeg", "-y", "-i", video_path, "-ss", str(max(0, start_seconds))]

    if end_seconds is not None:
        duration = max(0.0, end_seconds - max(0, start_seconds))
        cmd += ["-t", str(duration)]

    cmd += [
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        "-c:a", "aac",
        out_path,
    ]

    _run(cmd)
    return out_path


def extract_thumbnail(video_path, out_path, timestamp_seconds=1.0):
    """Grab a single frame at timestamp_seconds as a JPEG thumbnail."""

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(max(0, timestamp_seconds)),
        "-i", video_path,
        "-frames:v", "1",
        "-q:v", "2",
        out_path,
    ]
    _run(cmd)
    return out_path


def replace_audio(video_path, audio_path, out_path):
    """Replace a video's audio track entirely with the given audio file,
    padding the audio with silence if it's shorter than the video, capped at
    the video's own length."""

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-filter_complex", "[1:a]apad[aout]",
        "-map", "0:v:0", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac",
        "-shortest",
        out_path,
    ]
    _run(cmd)
    return out_path


def extract_audio(video_path, out_path):
    """Pull the audio track out of a video as a standalone file (used to
    feed a transcription model)."""

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",
        "-ac", "1", "-ar", "16000",
        "-c:a", "pcm_s16le",
        out_path,
    ]
    _run(cmd)
    return out_path


def burn_subtitles(video_path, srt_path, out_path, font_size=22):
    """Hard-burn an SRT file onto the video (always visible, no player
    subtitle toggle needed — most reliable across viewers/platforms)."""

    # ffmpeg's subtitles filter needs the srt path escaped for its own
    # mini-syntax, especially on Windows-style paths or paths with ':'.
    escaped = srt_path.replace("\\", "\\\\").replace(":", "\\:")

    vf = f"subtitles='{escaped}':force_style='FontSize={font_size},Outline=1,Shadow=0'"

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        "-c:a", "copy",
        out_path,
    ]
    _run(cmd)
    return out_path
