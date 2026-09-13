def generate_kling_video(prompt, duration=5, aspect_ratio="16:9", fal_key=None):
    if not fal_key:
        raise ValueError("FAL_KEY is missing. Add it in Streamlit Secrets.")

    import fal_client

    handler = fal_client.submit(
        "fal-ai/kling-video/v2.1/master/text-to-video",
        arguments={
            "prompt": prompt,
            "duration": str(duration),
            "aspect_ratio": aspect_ratio
        },
        key=fal_key
    )
    result = handler.get()

    data = result.get("data", result) if isinstance(result, dict) else result
    video = data.get("video", {}) if isinstance(data, dict) else {}
    url = video.get("url") if isinstance(video, dict) else None
    if not url:
        raise RuntimeError(f"No video URL returned: {str(result)[:500]}")
    return url

def estimate_total_seconds(scenes, default_seconds=5):
    return sum(int(scene.get("estimated_seconds", default_seconds) or default_seconds) for scene in scenes)
