def generate_kling_video(prompt, duration=5, aspect_ratio="16:9", fal_key=None):
    if not fal_key:
        raise ValueError("FAL_KEY is missing. Add it in Streamlit Secrets.")

    import os
    import fal_client

    endpoint = "fal-ai/kling-video/v2.1/master/text-to-video"
    arguments = {
        "prompt": prompt,
        "duration": str(duration),
        "aspect_ratio": aspect_ratio
    }

    # The installed fal-client version's submit() does not accept a `key`
    # keyword argument directly (that raises:
    # "SyncClient.submit() got an unexpected keyword argument 'key'").
    # The API key has to be provided either via a dedicated client instance
    # or via the FAL_KEY environment variable, depending on the fal-client
    # version. Set the env var first (works for every version) and also try
    # the dedicated-client form (more explicit, avoids any global state).
    os.environ["FAL_KEY"] = fal_key

    try:
        client = fal_client.SyncClient(key=fal_key)
        handler = client.submit(endpoint, arguments=arguments)
    except (AttributeError, TypeError):
        handler = fal_client.submit(endpoint, arguments=arguments)

    result = handler.get()

    data = result.get("data", result) if isinstance(result, dict) else result
    video = data.get("video", {}) if isinstance(data, dict) else {}
    url = video.get("url") if isinstance(video, dict) else None
    if not url:
        raise RuntimeError(f"No video URL returned: {str(result)[:500]}")
    return url

def estimate_total_seconds(scenes, default_seconds=5):
    return sum(int(scene.get("estimated_seconds", default_seconds) or default_seconds) for scene in scenes)
