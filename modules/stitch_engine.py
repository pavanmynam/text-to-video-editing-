"""
Combines the individual AI-generated scene clips (from video_engine.py) into
one final, downloadable video — using ffmpeg, which must be available on the
server (see packages.txt).

Why this exists: FAL/Kling returns one short silent clip per scene. Without
this module the app only shows separate unconnected clips, which is the main
reason "text to video" didn't feel like it produced a real video. This module
downloads each clip, normalizes them to a single resolution/fps/codec (Kling
clips can differ slightly between calls), concatenates them in scene order,
and optionally lays the user's uploaded voice-over audio on top.
"""

import os
import subprocess
import urllib.request

# Aspect ratio -> output resolution used for the final stitched video.
_ASPECT_DIMENSIONS = {
    "16:9": (1280, 720),
    "9:16": (720, 1280),
    "1:1": (1080, 1080),
}


def dims_for_aspect(aspect_ratio):
    return _ASPECT_DIMENSIONS.get(aspect_ratio, (1280, 720))


def _run(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        tail = result.stderr.decode("utf-8", errors="ignore").strip()
        raise RuntimeError(tail[-800:] if tail else f"ffmpeg failed: {' '.join(cmd)}")
    return result


def download_file(url, dest_path, timeout=180):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
    with open(dest_path, "wb") as f:
        f.write(data)
    return dest_path


def _has_audio_stream(path):
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "a",
        "-show_entries", "stream=index",
        "-of", "csv=p=0",
        path,
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return bool(result.stdout.decode("utf-8", errors="ignore").strip())


def _normalize_clip(src_path, dst_path, width=1280, height=720, fps=30):
    """Re-encode one clip to a common resolution/fps/codec (and guarantee an
    audio track, even if silent) so clips from different generation calls can
    be concatenated safely with ffmpeg's concat demuxer."""

    vf = (
        f"scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,"
        f"fps={fps},format=yuv420p"
    )

    if _has_audio_stream(src_path):
        cmd = [
            "ffmpeg", "-y",
            "-i", src_path,
            "-vf", vf,
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
            "-c:a", "aac", "-ar", "44100", "-ac", "2",
            dst_path,
        ]
    else:
        cmd = [
            "ffmpeg", "-y",
            "-i", src_path,
            "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-vf", vf,
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
            "-c:a", "aac",
            "-map", "0:v:0", "-map", "1:a:0",
            "-shortest",
            dst_path,
        ]

    _run(cmd)
    return dst_path


def _concat(clip_paths, out_path):
    list_file = out_path + ".txt"
    with open(list_file, "w", encoding="utf-8") as f:
        for p in clip_paths:
            f.write(f"file '{os.path.abspath(p)}'\n")

    cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_file, "-c", "copy", out_path]
    try:
        _run(cmd)
    finally:
        if os.path.exists(list_file):
            os.remove(list_file)
    return out_path


def _apply_voiceover(video_path, audio_path, out_path):
    """Replace the stitched video's (silent/per-clip) audio with the user's
    uploaded voice-over track. The voice-over is padded with silence if it is
    shorter than the video, and the output is capped at the video's length."""

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


def stitch_final_video(
    scene_video_urls,
    workdir,
    voiceover_path=None,
    width=1280,
    height=720,
    fps=30,
    progress_cb=None,
):
    """
    scene_video_urls: ordered list of clip URLs, one per scene, already in the
    order they should play.
    workdir: a directory (caller-owned, e.g. tempfile.mkdtemp()) to store
    intermediate and final files in.
    voiceover_path: optional path to a local audio file to lay over the final
    video (replacing the per-clip silent/AI audio).
    progress_cb: optional callable(index, total, stage) for UI progress.
    Returns the path to the final .mp4 inside workdir.
    """

    if not scene_video_urls:
        raise ValueError("No generated scene clips to combine.")

    os.makedirs(workdir, exist_ok=True)
    normalized = []

    for i, url in enumerate(scene_video_urls):
        if progress_cb:
            progress_cb(i, len(scene_video_urls), "downloading")
        raw_path = os.path.join(workdir, f"raw_{i:03d}.mp4")
        download_file(url, raw_path)

        if progress_cb:
            progress_cb(i, len(scene_video_urls), "normalizing")
        norm_path = os.path.join(workdir, f"norm_{i:03d}.mp4")
        _normalize_clip(raw_path, norm_path, width=width, height=height, fps=fps)
        normalized.append(norm_path)

    if progress_cb:
        progress_cb(len(scene_video_urls), len(scene_video_urls), "combining")

    concat_path = os.path.join(workdir, "concat_raw.mp4")
    _concat(normalized, concat_path)

    if voiceover_path:
        if progress_cb:
            progress_cb(len(scene_video_urls), len(scene_video_urls), "voiceover")
        final_path = os.path.join(workdir, "final_with_voiceover.mp4")
        _apply_voiceover(concat_path, voiceover_path, final_path)
        return final_path

    final_path = os.path.join(workdir, "final.mp4")
    os.replace(concat_path, final_path)
    return final_path
