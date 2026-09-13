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

`GEMINI_API_KEY` is optional. Without it, the app uses a basic fallback planner.
`FAL_KEY` is required for video generation.

## Important
Generated clips are individual AI video clips. Exact long-form final editing, stitching, lip-sync, audio mixing, and frame-perfect synchronization are not automatically guaranteed by this version.
