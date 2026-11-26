def _submit_and_get_url(endpoint, arguments, fal_key):
    if not fal_key:
        raise ValueError("FAL_KEY is missing. Add it in Streamlit Secrets.")

    import os
    import fal_client

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


def generate_kling_video(prompt, duration=5, aspect_ratio="16:9", fal_key=None):
    """Text-to-video: fal-ai/kling-video/v2.1/master/text-to-video."""

    endpoint = "fal-ai/kling-video/v2.1/master/text-to-video"
    arguments = {
        "prompt": prompt,
        "duration": str(duration),
        "aspect_ratio": aspect_ratio
    }
    return _submit_and_get_url(endpoint, arguments, fal_key)


def generate_kling_image_to_video(prompt, image_path, duration=5, fal_key=None):
    """Image-to-video: fal-ai/kling-video/v2.1/master/image-to-video.
    Uploads the local image file to FAL's file store first (the model takes
    an image_url, not raw bytes). Output keeps the source image's aspect
    ratio — this endpoint has no aspect_ratio input."""

    if not fal_key:
        raise ValueError("FAL_KEY is missing. Add it in Streamlit Secrets.")

    import os
    import fal_client

    os.environ["FAL_KEY"] = fal_key

    image_url = fal_client.upload_file(image_path)

    endpoint = "fal-ai/kling-video/v2.1/master/image-to-video"
    arguments = {
        "prompt": prompt,
        "image_url": image_url,
        "duration": str(duration)
    }
    return _submit_and_get_url(endpoint, arguments, fal_key)


def estimate_total_seconds(scenes, default_seconds=5):
    return sum(int(scene.get("estimated_seconds", default_seconds) or default_seconds) for scene in scenes)
