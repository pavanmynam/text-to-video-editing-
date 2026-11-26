# CineLuxe DEEPU

Professional Streamlit Script-to-Video planning app.

## Features
- Telugu / English script input
- TXT script upload
- Optional voice-over upload and duration detection
- Generic DEEPU semantic scene analysis with Gemini
- Fallback scene planner when Gemini is not configured
- Primary visual + B-roll + mood + camera + transitions
- Kling-ready prompts
- Single-scene and Generate All buttons
- FAL / Kling video generation
- 5 or 10 second clips
- 16:9 / 9:16 / 1:1
- Professional dark UI
- **New:** one-click "Combine Scenes Into One Final Video" — downloads every
  generated clip, normalizes them to one resolution/frame rate, joins them
  in scene order with ffmpeg, optionally lays your uploaded voice-over on
  top, and gives you a single downloadable final video

## GitHub
Extract the ZIP first, then upload the files/folders to a GitHub repository.
Do NOT upload the ZIP itself expecting GitHub or Streamlit to extract and run it.

## Streamlit deploy
Main file: `app.py`

## Streamlit Secrets
Add:

```toml
FAL_KEY = "your_fal_key"
GEMINI_API_KEY = "your_gemini_key"
```

`GEMINI_API_KEY` is optional. Without it, the app uses a basic fallback planner
(it still produces a video, but scene quality is much better with a real
Gemini key — get a free one at https://aistudio.google.com/apikey).
`FAL_KEY` is required for video generation.

## System dependency
This repo includes a `packages.txt` with `ffmpeg` in it, which Streamlit
Community Cloud installs automatically on deploy. If you run this app
somewhere else (your own server, Docker, etc.), make sure `ffmpeg` is
installed and on `PATH` there too — the final-video stitching step needs it.

## Important
Each AI call produces one individual video clip per scene. Use the
**🎞️ Combine Scenes Into One Final Video** button after generation to join
all the clips (and your uploaded voice-over, if any) into a single final
video. Lip-sync and frame-perfect voice/visual timing are still not
guaranteed — the voice-over track is played over the combined clips, not
matched word-for-word to the visuals.
