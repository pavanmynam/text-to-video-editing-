import json
import re

SYSTEM_INSTRUCTION = """
You are DEEPU, an expert AI documentary editor and cinematic script-to-video planner.
Understand the COMPLETE script semantically. Do not rely only on keywords.
Return ONLY valid JSON with this schema:
{
  "title": "short title",
  "summary": "one sentence",
  "global_style": "documentary/cinematic style",
  "scenes": [
    {
      "id": 1,
      "voiceover": "exact narration beat from the supplied script",
      "meaning": "what this narration means",
      "primary_visual": "main visual",
      "secondary_visual": "supporting visual or B-roll",
      "visual_type": "literal/conceptual/reconstruction/archive/nature/etc",
      "era_location": "time period and location if implied",
      "mood": "mood",
      "shot": "camera shot",
      "camera_movement": "camera movement",
      "transition": "transition into/out of scene",
      "estimated_seconds": 5,
      "kling_prompt": "detailed English cinematic video generation prompt, no text overlays, no subtitles, no logos"
    }
  ]
}
Rules:
- Preserve the user's facts; do not invent historical facts.
- Split by visual beats, not mechanically by every sentence.
- For abstract ideas, choose meaningful conceptual visuals.
- Keep scenes practical for short AI video clips.
- Make visual prompts specific, cinematic, coherent and production-ready.
- Avoid visible captions, watermarks and logos unless the script explicitly requires them.
- The script may be Telugu, English or mixed.
"""

def _fallback(script, target_seconds=5):
    parts = [p.strip() for p in re.split(r'(?<=[.!?।])\s+|\n+', script) if len(p.strip()) > 8]
    if not parts:
        parts = [script.strip()]
    scenes = []
    for i, text in enumerate(parts, 1):
        scenes.append({
            "id": i,
            "voiceover": text,
            "meaning": "Visualize the narration faithfully as a cinematic documentary beat.",
            "primary_visual": "A cinematic visual representation of the narrated event",
            "secondary_visual": "Relevant environmental B-roll and contextual details",
            "visual_type": "cinematic documentary",
            "era_location": "Derived from narration",
            "mood": "immersive, cinematic",
            "shot": "wide establishing shot followed by a closer detail shot",
            "camera_movement": "slow cinematic push-in",
            "transition": "smooth cinematic dissolve",
            "estimated_seconds": target_seconds,
            "kling_prompt": (
                f"Cinematic documentary visualization of: {text}. "
                "Photorealistic, coherent subject and environment, natural motion, "
                "professional film lighting, realistic textures, cinematic composition, "
                "slow controlled camera movement, no subtitles, no text, no watermark, no logo."
            )
        })
    return {
        "title": "DEEPU Script Plan",
        "summary": "Automatic fallback scene plan. Add GEMINI_API_KEY for real semantic DEEPU analysis.",
        "global_style": "cinematic documentary",
        "scenes": scenes
    }

def analyze_script(script, api_key=None, target_seconds=5):
    script = (script or "").strip()
    if not script:
        raise ValueError("Script is empty.")

    if not api_key:
        return _fallback(script, target_seconds)

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = SYSTEM_INSTRUCTION + "\n\nTARGET CLIP LENGTH: " + str(target_seconds) + \
                 " seconds.\n\nSCRIPT:\n" + script
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        raw = (response.text or "").strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        if not isinstance(data.get("scenes"), list) or not data["scenes"]:
            raise ValueError("AI returned no scenes.")
        for i, scene in enumerate(data["scenes"], 1):
            scene.setdefault("id", i)
            scene.setdefault("estimated_seconds", target_seconds)
            scene.setdefault("kling_prompt", "")
        return data
    except Exception as exc:
        data = _fallback(script, target_seconds)
        data["summary"] = f"Gemini analysis failed; fallback plan used. ({str(exc)[:120]})"
        return data
