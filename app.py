import os
import tempfile
import time
import concurrent.futures

import streamlit as st

from modules.deepu_engine import analyze_script
from modules.video_engine import (
    generate_kling_video,
    generate_kling_image_to_video,
    estimate_total_seconds
)
from modules.stitch_engine import (
    stitch_final_video,
    dims_for_aspect
)
from modules.transcribe_engine import (
    transcribe_audio_file,
    transcript_text,
    transcript_segments
)
from modules.subtitle_engine import build_srt_for_scenes, build_srt, translate_lines
from modules.text_tools_engine import translate_text, autocorrect_text
from modules.edit_engine import (
    trim_video,
    extract_thumbnail,
    replace_audio,
    extract_audio,
    burn_subtitles,
    get_duration_seconds
)

# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title="CineLuxe DEEPU",
    page_icon="🎬",
    layout="wide"
)


# ============================================================
# STYLE
# ============================================================

st.markdown("""
<style>

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

:root {
    --clx-bg:        #0A0D14;
    --clx-panel:     #121623;
    --clx-panel-2:   #171C2C;
    --clx-line:      #262C40;
    --clx-text:      #F2F4F9;
    --clx-muted:     #8B93AB;
    --clx-indigo:    #6366F1;
    --clx-purple:    #A855F7;
    --clx-pink:      #EC4899;
    --clx-gradient:  linear-gradient(100deg, var(--clx-indigo), var(--clx-purple) 55%, var(--clx-pink));
    --clx-success:   #22C55E;
    --clx-warning:   #F59E0B;
    --clx-error:     #F43F5E;
}

html, body, [class*="css"] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--clx-text);
}

.stApp {
    background:
        radial-gradient(900px 500px at 15% -10%, rgba(99, 102, 241, 0.16), transparent 60%),
        radial-gradient(900px 500px at 100% 0%, rgba(236, 72, 153, 0.12), transparent 60%),
        var(--clx-bg);
}

.block-container {
    max-width: 1320px;
    padding-top: 1.4rem;
}

h1, h2, h3 {
    font-family: 'Space Grotesk', 'Inter', sans-serif !important;
    font-weight: 700 !important;
    letter-spacing: -0.2px;
    color: var(--clx-text) !important;
}

/* -- Masthead -- */
.masthead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding: 18px 22px;
    margin-bottom: 26px;
    border: 1px solid var(--clx-line);
    border-radius: 18px;
    background: var(--clx-panel);
}

.masthead .wordmark {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 1.9rem;
    letter-spacing: -0.5px;
    background: var(--clx-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.masthead .tagline {
    color: var(--clx-muted);
    font-size: 0.92rem;
}

.small {
    color: var(--clx-muted);
    font-size: 0.9rem;
}

/* -- The hero treatment: the finished film (st.container(border=True)) -- */
div[data-testid="stVerticalBlockBorderWrapper"]:has(div[data-testid="stVideo"]) {
    border-radius: 22px !important;
    border: 2px solid transparent !important;
    background:
        linear-gradient(var(--clx-panel), var(--clx-panel)) padding-box,
        var(--clx-gradient) border-box;
    box-shadow: 0 20px 60px rgba(168, 85, 247, 0.25);
    padding: 6px;
}

/* -- Buttons -- */
.stButton > button, .stDownloadButton > button {
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-family: 'Inter', sans-serif !important;
    letter-spacing: 0.01em;
    padding: 0.6rem 1.1rem !important;
    background: var(--clx-panel-2) !important;
    color: var(--clx-text) !important;
    border: 1px solid var(--clx-line) !important;
    transition: border-color 0.15s ease, transform 0.08s ease;
}

.stButton > button:hover, .stDownloadButton > button:hover {
    border-color: var(--clx-purple) !important;
    transform: translateY(-1px);
}

button[kind="primary"] {
    background: var(--clx-gradient) !important;
    border: none !important;
    color: white !important;
    box-shadow: 0 10px 30px rgba(168, 85, 247, 0.35) !important;
}

button[kind="primary"]:hover {
    filter: brightness(1.08);
}

/* -- Native video player: a clean rounded screen -- */
div[data-testid="stVideo"] {
    border-radius: 14px;
    overflow: hidden;
    background: #000;
    border: 1px solid var(--clx-line);
    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.45);
}

div[data-testid="stVideo"] video {
    border-radius: 14px;
}

/* -- Metrics -- */
div[data-testid="stMetric"] {
    background: var(--clx-panel);
    border: 1px solid var(--clx-line);
    border-radius: 14px;
    padding: 12px 16px;
}

div[data-testid="stMetricLabel"] {
    color: var(--clx-muted) !important;
}

div[data-testid="stMetricValue"] {
    background: var(--clx-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* -- Expanders (scene blueprint) -- */
div[data-testid="stExpander"] {
    border: 1px solid var(--clx-line) !important;
    border-radius: 14px !important;
    background: var(--clx-panel);
    overflow: hidden;
}

/* -- Inputs -- */
div[data-testid="stFileUploaderDropzone"],
div[data-baseweb="select"] > div {
    border-radius: 12px !important;
    border-color: var(--clx-line) !important;
    background: var(--clx-panel) !important;
}

/* -- Script Notepad: a clean white-paper island on the dark app -- */
div[data-testid="stTextArea"] textarea {
    border-radius: 14px !important;
    border: 1px solid #E4E1D8 !important;
    background: #FAFAF7 !important;
    color: #1C1B18 !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 1rem !important;
    line-height: 1.65 !important;
    padding: 18px !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
}

div[data-testid="stTextArea"] textarea::placeholder {
    color: #9B9890 !important;
}

div[data-testid="stTextArea"] textarea:focus {
    border-color: var(--clx-purple) !important;
    box-shadow: 0 0 0 2px var(--clx-purple) !important;
}

hr, div[data-testid="stDivider"] {
    border-color: var(--clx-line) !important;
}

/* -- Sidebar -- */
section[data-testid="stSidebar"] {
    background: var(--clx-panel);
    border-right: 1px solid var(--clx-line);
}

/* -- Status pills -- */
.pill {
    display: inline-block;
    padding: 3px 11px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
}

.pill.ok { background: rgba(34, 197, 94, 0.15); color: var(--clx-success); }
.pill.warn { background: rgba(245, 158, 11, 0.15); color: var(--clx-warning); }
.pill.off { background: rgba(244, 63, 94, 0.15); color: var(--clx-error); }

</style>
""", unsafe_allow_html=True)


# ============================================================
# SECRETS
# ============================================================

def secret(name):

    try:
        return st.secrets.get(name, None)

    except Exception:
        return None


# ============================================================
# SESSION STATE
# ============================================================

if "script" not in st.session_state:

    st.session_state.script = ""


if "script_undo" not in st.session_state:

    st.session_state.script_undo = None


if "plan" not in st.session_state:

    st.session_state.plan = None


if "videos" not in st.session_state:

    st.session_state.videos = {}


if "generating" not in st.session_state:

    st.session_state.generating = False


if "final_video_path" not in st.session_state:

    st.session_state.final_video_path = None


if "stitch_workdir" not in st.session_state:

    st.session_state.stitch_workdir = None


# ============================================================
# HEADER
# ============================================================

st.markdown("""
<div class="masthead">

<div>
<div class="wordmark">Cine<span>Luxe</span></div>
<div class="tagline">DEEPU Production Suite — script to screen</div>
</div>

</div>
""", unsafe_allow_html=True)


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.header("Production Settings")

    duration = st.selectbox(

        "Clip duration",

        [5, 10],

        index=0

    )


    aspect_ratio = st.selectbox(

        "Aspect ratio",

        [

            "16:9",

            "9:16",

            "1:1"

        ],

        index=0

    )


    st.caption(

        "DEEPU automatically creates scenes. "
        "Each scene is generated as an AI video clip."

    )


    st.divider()


    st.subheader("Connections")


    gemini_status = (

        "✅ Connected"

        if secret("GEMINI_API_KEY")

        else "⚠️ Optional / Fallback"

    )


    fal_status = (

        "✅ Connected"

        if secret("FAL_KEY")

        else "❌ Missing"

    )


    st.write(

        "Gemini:",

        gemini_status

    )


    st.write(

        "FAL:",

        fal_status

    )


    st.divider()


    st.caption(

        "API keys are stored securely "
        "in Streamlit Secrets."

    )


# ============================================================
# MAIN LAYOUT
# ============================================================

left, right = st.columns(

    [1.35, 0.65],

    gap="large"

)


# ============================================================
# LEFT - SCRIPT STUDIO
# ============================================================

with left:

    st.subheader("Script Studio")

    with st.expander("Content guidelines — read before you paste a script", expanded=False):

        st.markdown(
            "The AI video model (Kling, via FAL) automatically rejects scenes "
            "that include:\n"
            "- **Copyrighted characters, games or franchises** — e.g. Marvel, "
            "GTA, Disney, anime, or any named fictional character you don't own\n"
            "- **Real public figures** depicted doing or saying things they "
            "didn't\n"
            "- **Graphic violence, gore, or weapons used on people**\n"
            "- **Hate symbols, sexual content, or self-harm**\n\n"
            "Keep your script to original or generic descriptions (\"a young "
            "woman\", \"a city street\") instead of named copyrighted "
            "characters, and it will generate cleanly. A rejected scene shows "
            "up as a red error below with the exact reason, and produces no "
            "clip."
        )


    # --------------------------------------------------------
    # DICTATE SCRIPT (MIC)
    # --------------------------------------------------------

    st.markdown("**Dictate your script**")

    MIC_LANGUAGE_CODES = {
        "Auto-detect": None,
        "Telugu": "te",
        "Hindi": "hi",
        "English": "en",
        "Tamil": "ta",
        "Kannada": "kn",
        "Malayalam": "ml",
        "Marathi": "mr",
        "Bengali": "bn",
        "Gujarati": "gu",
        "Punjabi": "pa",
        "Urdu": "ur",
    }

    mic_spoken_language = st.selectbox(
        "Language you'll speak in (helps the mic transcribe accurately)",
        options=list(MIC_LANGUAGE_CODES.keys()),
        index=1,
        key="mic_spoken_language_select"
    )

    mic_recording = st.audio_input(
        "Record your story — speak naturally, then stop the recording"
    )

    if mic_recording is not None:

        transcribe_clicked = st.button(
            "Transcribe Recording Into Script",
            use_container_width=True,
            key="transcribe_mic_button"
        )

        if transcribe_clicked:

            if not secret("FAL_KEY"):

                st.error(
                    "FAL_KEY is missing — add it in Streamlit Secrets to "
                    "transcribe audio (transcription runs on the same FAL "
                    "account as video generation)."
                )

            else:

                try:

                    with st.spinner("Transcribing your recording..."):

                        tmp_dir = tempfile.mkdtemp(prefix="cineluxe_mic_")
                        mic_path = os.path.join(tmp_dir, "recording.wav")

                        with open(mic_path, "wb") as f:
                            f.write(mic_recording.getvalue())

                        result = transcribe_audio_file(
                            mic_path,
                            fal_key=secret("FAL_KEY"),
                            language=MIC_LANGUAGE_CODES.get(mic_spoken_language)
                        )

                        text = transcript_text(result)

                    if text.strip():

                        st.session_state.script = (
                            st.session_state.script + "\n\n" + text
                        ).strip()

                        st.success("Transcribed — added to your script below.")

                        st.rerun()

                    else:

                        st.warning("Could not detect any speech in that recording.")

                except Exception as exc:

                    st.error(f"Transcription failed: {exc}")

    st.divider()


    # --------------------------------------------------------
    # SCRIPT FILE UPLOAD
    # --------------------------------------------------------

    script_file = st.file_uploader(

        "📄 Upload script (.txt)",

        type=["txt"]

    )


    if script_file is not None:

        try:

            content = script_file.read()

            st.session_state.script = content.decode(

                "utf-8"

            )


        except UnicodeDecodeError:

            st.session_state.script = content.decode(

                "utf-8-sig"

            )


        except Exception as exc:

            st.error(

                f"Could not read script file: {exc}"

            )


    # --------------------------------------------------------
    # SCRIPT TEXT AREA
    # --------------------------------------------------------

    script = st.text_area(

        "Paste Telugu, English or mixed script",

        value=st.session_state.script,

        height=330,

        placeholder=(

            "Paste your complete script here...\n\n"

            "DEEPU will understand the meaning, "
            "story, history, characters, locations, "
            "mood and cinematic visuals."

        )

    )


    st.session_state.script = script

    word_count = len(script.split())
    char_count = len(script)

    st.caption(f"{word_count} words · {char_count} characters")


    # --------------------------------------------------------
    # NOTEPAD TOOLS — translate & auto-correct the script
    # --------------------------------------------------------

    NOTEPAD_LANGUAGES = [
        "Telugu", "Hindi", "English", "Tamil", "Kannada", "Malayalam",
        "Marathi", "Bengali", "Gujarati", "Punjabi", "Urdu",
        "Spanish", "French", "Arabic"
    ]

    nt_col1, nt_col2, nt_col3 = st.columns([2, 1, 1])

    with nt_col1:
        notepad_target_language = st.selectbox(
            "Translate script into",
            options=NOTEPAD_LANGUAGES,
            key="notepad_target_language_select",
            label_visibility="collapsed",
            placeholder="Translate script into..."
        )

    with nt_col2:
        translate_script_clicked = st.button(
            "Translate", use_container_width=True, key="translate_script_button"
        )

    with nt_col3:
        autocorrect_script_clicked = st.button(
            "Auto-correct", use_container_width=True, key="autocorrect_script_button"
        )

    if translate_script_clicked or autocorrect_script_clicked:

        if not st.session_state.script.strip():

            st.warning("Write or dictate something into the notepad first.")

        elif not secret("GEMINI_API_KEY"):

            st.error(
                "GEMINI_API_KEY is missing — add it in Streamlit Secrets to "
                "use Translate / Auto-correct."
            )

        else:

            try:

                st.session_state.script_undo = st.session_state.script

                if translate_script_clicked:

                    with st.spinner(f"Translating into {notepad_target_language}..."):

                        st.session_state.script = translate_text(
                            st.session_state.script,
                            notepad_target_language,
                            secret("GEMINI_API_KEY")
                        )

                else:

                    with st.spinner("Auto-correcting spelling & grammar..."):

                        st.session_state.script = autocorrect_text(
                            st.session_state.script,
                            secret("GEMINI_API_KEY")
                        )

                st.rerun()

            except Exception as exc:

                st.error(f"Could not process the script: {exc}")

    if st.session_state.get("script_undo"):

        if st.button("Undo last Translate/Auto-correct", key="undo_notepad_button"):

            st.session_state.script = st.session_state.script_undo
            st.session_state.script_undo = None
            st.rerun()


    # --------------------------------------------------------
    # BUTTONS
    # --------------------------------------------------------

    c1, c2 = st.columns(

        2

    )


    with c1:

        analyze = st.button(

            "Analyze Script",

            type="primary",

            use_container_width=True

        )


    with c2:

        clear = st.button(

            "Clear Project",

            use_container_width=True

        )


    # --------------------------------------------------------
    # CLEAR
    # --------------------------------------------------------

    if clear:

        st.session_state.script = ""

        st.session_state.plan = None

        st.session_state.videos = {}

        st.session_state.generating = False

        st.session_state.final_video_path = None

        st.rerun()


    # --------------------------------------------------------
    # ANALYZE SCRIPT
    # --------------------------------------------------------

    if analyze:

        if not script.strip():

            st.warning(

                "⚠️ Paste a script first."

            )


        else:

            try:

                with st.spinner(

                    "DEEPU is understanding your script..."

                ):

                    plan = analyze_script(

                        script,

                        api_key=secret(

                            "GEMINI_API_KEY"

                        ),

                        target_seconds=duration

                    )


                st.session_state.plan = plan

                st.session_state.videos = {}


                st.success(

                    "✅ DEEPU analysis complete!"

                )


                st.rerun()


            except Exception as exc:

                st.error(

                    f"DEEPU analysis failed: {exc}"

                )


# ============================================================
# RIGHT - AUDIO + REFERENCE
# ============================================================

with right:

    st.subheader(

        "Voice-over & Timing"

    )


    audio = st.file_uploader(

        "Upload voice-over audio",

        type=[

            "mp3",

            "wav",

            "m4a",

            "aac"

        ]

    )


    audio_seconds = None


    if audio:

        st.audio(audio)


        try:

            from mutagen import File as MutagenFile


            meta = MutagenFile(

                audio

            )


            if meta and meta.info:

                audio_seconds = float(

                    meta.info.length

                )


                st.metric(

                    "Voice-over duration",

                    f"{audio_seconds:.1f} sec"

                )


        except Exception:

            st.info(

                "Audio uploaded successfully."

            )


    # --------------------------------------------------------
    # REFERENCE VIDEO
    # --------------------------------------------------------

    st.divider()


    st.subheader(

        "Reference Video"

    )


    reference = st.file_uploader(

        "Optional style / reference video",

        type=[

            "mp4",

            "mov",

            "webm"

        ]

    )


    if reference:

        st.video(reference)


        st.caption(

            "Reference video uploaded for "
            "visual review."

        )


    # --------------------------------------------------------
    # REFERENCE IMAGE (IMAGE-TO-VIDEO)
    # --------------------------------------------------------

    st.divider()

    st.subheader("Reference Image")

    reference_image = st.file_uploader(
        "Optional image to animate (image-to-video)",
        type=["png", "jpg", "jpeg", "webp"],
        key="reference_image_uploader"
    )

    use_image_to_video = False

    if reference_image:

        st.image(reference_image, use_container_width=True)

        use_image_to_video = st.checkbox(
            "Generate every scene from this image (image-to-video) "
            "instead of from text alone",
            value=True
        )

        st.caption(
            "Every scene clip will start from this image. The output "
            "keeps this image's aspect ratio — the Aspect ratio setting "
            "in the sidebar is ignored for image-to-video."
        )


# ============================================================
# VIDEO TO SUBTITLES (standalone tool — works on any uploaded video)
# ============================================================

st.divider()

with st.expander("🎬 Video to Subtitles — transcribe any video", expanded=False):

    st.caption(
        "Upload any video and get a subtitle file, in the spoken language "
        "or translated into another one — independent of the script flow "
        "above."
    )

    vts_video = st.file_uploader(
        "Video to transcribe",
        type=["mp4", "mov", "webm", "mkv"],
        key="vts_video_uploader"
    )

    vts_language = st.text_input(
        "Translate subtitles into (leave blank to keep the spoken language)",
        key="vts_language_input",
        placeholder="e.g. Telugu, Hindi, English, Spanish"
    )

    if vts_video and st.button(
        "Transcribe to Subtitles", use_container_width=True,
        key="vts_transcribe_button"
    ):

        if not secret("FAL_KEY"):
            st.error("FAL_KEY is missing. Add it in Streamlit Secrets.")

        else:

            try:

                with st.spinner("Extracting audio and transcribing..."):

                    workdir = tempfile.mkdtemp(prefix="cineluxe_vts_")

                    ext = os.path.splitext(vts_video.name)[1] or ".mp4"
                    video_path = os.path.join(workdir, "input" + ext)

                    with open(video_path, "wb") as f:
                        f.write(vts_video.getvalue())

                    audio_path = os.path.join(workdir, "audio.wav")
                    extract_audio(video_path, audio_path)

                    result = transcribe_audio_file(audio_path, secret("FAL_KEY"))

                    segments = transcript_segments(result)

                    if not segments:
                        full_text = transcript_text(result)
                        if full_text:
                            fallback_len = get_duration_seconds(video_path) or 5.0
                            segments = [(0.0, fallback_len, full_text)]

                    warn = None

                    if vts_language.strip() and segments:

                        texts = [t for _, _, t in segments]

                        try:
                            translated = translate_lines(
                                texts,
                                vts_language.strip(),
                                secret("GEMINI_API_KEY")
                            )
                            segments = [
                                (start, end, translated[i])
                                for i, (start, end, _) in enumerate(segments)
                            ]
                        except Exception as exc:
                            warn = (
                                f"Could not translate into "
                                f"{vts_language.strip()} ({exc}); using the "
                                "original spoken language instead."
                            )

                    srt_text = build_srt(segments)

                if warn:
                    st.warning(warn)

                if not segments:
                    st.warning("No speech was detected in this video.")
                else:
                    st.session_state.vts_srt = srt_text
                    st.success("Transcription complete.")

            except Exception as exc:

                st.error(f"Could not transcribe video: {exc}")

    if st.session_state.get("vts_srt"):

        st.text_area(
            "Preview", st.session_state.vts_srt, height=160,
            key="vts_srt_preview"
        )

        st.download_button(
            "Download Subtitles (.srt)",
            data=st.session_state.vts_srt,
            file_name="video_subtitles.srt",
            mime="text/plain",
            use_container_width=True,
            key="vts_download_button"
        )


# ============================================================
# DEEPU PLAN
# ============================================================

if st.session_state.plan:


    plan = st.session_state.plan


    scenes = plan.get(

        "scenes",

        []

    )


    st.divider()


    # ========================================================
    # PRODUCTION BLUEPRINT
    # ========================================================

    st.subheader(

        "DEEPU Production Plan"

    )


    summary = plan.get(

        "summary",

        ""

    )


    if summary:

        st.write(

            summary

        )


    style = plan.get(

        "global_style",

        "cinematic"

    )


    st.caption(

        f"Style: {style}"

    )


    # ========================================================
    # METRICS
    # ========================================================

    m1, m2, m3 = st.columns(

        3

    )


    with m1:

        st.metric(

            "Scenes",

            len(scenes)

        )


    with m2:

        total = estimate_total_seconds(

            scenes,

            duration

        )


        st.metric(

            "Estimated Duration",

            f"{total} sec"

        )


    with m3:

        st.metric(

            "Generated",

            len(

                st.session_state.videos

            )

        )


    # ========================================================
    # MAIN VIDEO GENERATION SECTION
    # ========================================================

    st.subheader("Generate")

    st.write("DEEPU has analyzed your script. Generate an AI video clip for each scene below.")


    avg_seconds_per_scene = 60

    eta_seconds = len(scenes) * avg_seconds_per_scene if scenes else 0

    eta_minutes = max(1, round(eta_seconds / 60))

    st.caption(
        f"Estimated time: roughly {eta_minutes} minute(s) for "
        f"{len(scenes)} scene(s) (30–90 seconds per scene)."
    )

    generate_video = st.button(

        "Generate Video",

        type="primary",

        use_container_width=True

    )


    # ========================================================
    # GENERATE ALL VIDEO SCENES
    # ========================================================

    if generate_video:


        if not secret("FAL_KEY"):

            st.error(

                """

                ❌ FAL_KEY is missing.

                Add your FAL API key in:

                Streamlit →
                Manage App →
                Settings →
                Secrets

                """

            )


        elif not scenes:

            st.error(

                "No scenes were created."

            )


        else:


            st.session_state.generating = True

            reference_image_path = None

            if use_image_to_video and reference_image is not None:

                img_dir = tempfile.mkdtemp(prefix="cineluxe_img_")
                ext = os.path.splitext(reference_image.name)[1] or ".jpg"
                reference_image_path = os.path.join(img_dir, "reference" + ext)

                with open(reference_image_path, "wb") as f:
                    f.write(reference_image.getvalue())


            st.info(

                f"Starting generation for "
                f"{len(scenes)} scenes..."
                + (" (image-to-video mode)" if reference_image_path else "")

            )


            progress = st.progress(

                0

            )


            status = st.empty()


            successful = 0

            done = 0

            total = len(scenes)

            generation_start = time.time()

            MAX_WORKERS = min(4, total)

            fal_key = secret("FAL_KEY")


            def _update_status():

                elapsed = time.time() - generation_start

                avg_so_far = elapsed / done if done else avg_seconds_per_scene

                remaining = max(0, round(avg_so_far * (total - done)))

                mins, secs = divmod(round(elapsed), 60)

                status.info(
                    f"Completed {done} / {total} scenes "
                    f"• running {MAX_WORKERS} in parallel "
                    f"• elapsed {mins:02d}:{secs:02d} "
                    f"• est. remaining ~{remaining}s"
                )

                progress.progress(done / total)


            with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:

                future_to_scene = {}

                for idx, scene in enumerate(scenes):

                    scene_number = idx + 1

                    scene_id = scene.get("id", scene_number)

                    prompt = scene.get("kling_prompt", "")

                    if not prompt:

                        st.error(f"❌ Scene {scene_number} failed: Scene prompt is empty.")

                        done += 1

                        continue

                    if reference_image_path:

                        future = executor.submit(
                            generate_kling_image_to_video,
                            prompt,
                            reference_image_path,
                            duration=duration,
                            fal_key=fal_key
                        )

                    else:

                        future = executor.submit(
                            generate_kling_video,
                            prompt,
                            duration=duration,
                            aspect_ratio=aspect_ratio,
                            fal_key=fal_key
                        )

                    future_to_scene[future] = (scene_number, scene_id)

                _update_status()

                pending = set(future_to_scene.keys())

                while pending:

                    finished, pending = concurrent.futures.wait(
                        pending,
                        timeout=1,
                        return_when=concurrent.futures.FIRST_COMPLETED
                    )

                    for future in finished:

                        scene_number, scene_id = future_to_scene[future]

                        try:

                            url = future.result()

                            st.session_state.videos[scene_id] = url

                            successful += 1

                        except Exception as exc:

                            st.error(f"❌ Scene {scene_number} failed: {exc}")

                        done += 1

                    _update_status()


            st.session_state.generating = False


            status.empty()


            if successful > 0:


                st.success(

                    f"""

                    🎉 Video generation completed!

                    Successfully generated:

                    {successful} / {len(scenes)} scenes.

                    """

                )


            else:


                st.error(

                    """

                    ❌ No scenes were generated.

                    Check your FAL API key and
                    video engine configuration.

                    """

                )


    # ========================================================
    # GENERATED VIDEOS
    # ========================================================

    if st.session_state.videos:


        st.divider()


        st.subheader(

            "Generated Clips"

        )


        for idx, scene in enumerate(scenes):


            scene_id = scene.get(

                "id",

                idx + 1

            )


            if scene_id in st.session_state.videos:


                st.markdown(

                    f"""

                    ### Scene {idx + 1}

                    """

                )


                video_url = (

                    st.session_state.videos[

                        scene_id

                    ]

                )


                st.video(

                    video_url

                )


                st.caption(

                    scene.get(

                        "primary_visual",

                        ""

                    )

                )


    # ========================================================
    # FINAL STITCHED VIDEO
    # ========================================================

    if st.session_state.videos:

        st.divider()

        st.subheader("🏆 Official Final Cut")

        ordered_urls = [
            st.session_state.videos[scene.get("id", idx + 1)]
            for idx, scene in enumerate(scenes)
            if scene.get("id", idx + 1) in st.session_state.videos
        ]

        missing = len(scenes) - len(ordered_urls)

        if missing > 0:
            st.caption(
                f"⚠️ {missing} scene(s) haven't been generated yet. "
                "The final video below will combine only the scenes "
                "generated so far, in the correct order."
            )

        st.caption(
            "This downloads every generated clip, matches them to one "
            "resolution/frame rate, and joins them into a single video. "
            "If you uploaded a voice-over above, it replaces the clips' "
            "own audio on the final video."
        )

        stitch_clicked = st.button(
            "Render Final Video",
            type="primary",
            use_container_width=True,
            key="stitch_button"
        )

        if stitch_clicked:

            try:

                with st.spinner(
                    "Downloading clips and stitching the final video... "
                    "this can take a minute for longer videos."
                ):

                    workdir = tempfile.mkdtemp(prefix="cineluxe_")
                    st.session_state.stitch_workdir = workdir

                    width, height = dims_for_aspect(aspect_ratio)

                    voiceover_path = None

                    if audio is not None:
                        ext = os.path.splitext(audio.name)[1] or ".mp3"
                        voiceover_path = os.path.join(workdir, "voiceover" + ext)
                        with open(voiceover_path, "wb") as f:
                            f.write(audio.getvalue())

                    final_path = stitch_final_video(
                        ordered_urls,
                        workdir,
                        voiceover_path=voiceover_path,
                        width=width,
                        height=height
                    )

                st.session_state.final_video_path = final_path

                st.success("✅ Final video is ready below!")

            except Exception as exc:

                st.error(
                    f"❌ Could not stitch the final video: {exc}\n\n"
                    "Make sure `ffmpeg` is installed on the server — on "
                    "Streamlit Cloud, add a `packages.txt` file (already "
                    "included in this repo) with a line containing `ffmpeg`."
                )

        if (
            st.session_state.final_video_path
            and os.path.exists(st.session_state.final_video_path)
        ):

            with st.container(border=True):

                st.video(st.session_state.final_video_path)

                with open(st.session_state.final_video_path, "rb") as f:
                    st.download_button(
                        "Download Final Video",
                        data=f.read(),
                        file_name="cineluxe_final_video.mp4",
                        mime="video/mp4",
                        use_container_width=True,
                        key="download_final_video"
                    )


    # ========================================================
    # FINISHING TOOLS (operate on the final video above, in place)
    # ========================================================

    if (
        st.session_state.final_video_path
        and os.path.exists(st.session_state.final_video_path)
    ):

        st.divider()

        st.subheader("Finishing Tools")

        st.caption(
            "These work on the final video above, and each one updates it "
            "in place — so you can chain them (e.g. trim, then add "
            "subtitles to the trimmed result)."
        )

        tool_tabs = st.tabs(["Subtitles", "Trim", "Replace Audio", "Thumbnail"])

        def _tool_workdir():
            if not st.session_state.stitch_workdir:
                st.session_state.stitch_workdir = tempfile.mkdtemp(prefix="cineluxe_")
            return st.session_state.stitch_workdir

        # -- Subtitles --
        with tool_tabs[0]:

            subtitle_language = st.text_input(
                "Subtitle language (leave blank to keep the script's own "
                "language)",
                key="subtitle_language_input",
                placeholder="e.g. Telugu, Hindi, English, Spanish"
            )

            sub_col1, sub_col2 = st.columns(2)

            with sub_col1:
                build_srt_clicked = st.button(
                    "Generate Subtitles", use_container_width=True,
                    key="build_srt_button"
                )

            with sub_col2:
                burn_clicked = st.button(
                    "Burn Onto Video", use_container_width=True,
                    key="burn_srt_button"
                )

            if build_srt_clicked or burn_clicked:

                try:

                    with st.spinner("Building subtitles..."):

                        srt_text, warn = build_srt_for_scenes(
                            scenes,
                            target_language=subtitle_language.strip() or None,
                            gemini_api_key=secret("GEMINI_API_KEY"),
                            default_seconds=duration
                        )

                    if warn:
                        st.warning(warn)

                    st.session_state.last_srt = srt_text

                    st.success("Subtitles generated.")

                except Exception as exc:

                    st.error(f"Could not build subtitles: {exc}")

            if st.session_state.get("last_srt"):

                st.download_button(
                    "Download Subtitles (.srt)",
                    data=st.session_state.last_srt,
                    file_name="cineluxe_subtitles.srt",
                    mime="text/plain",
                    use_container_width=True,
                    key="download_srt_button"
                )

                if burn_clicked:

                    try:

                        with st.spinner("Burning subtitles onto the final video..."):

                            workdir = _tool_workdir()
                            srt_path = os.path.join(workdir, "subtitles.srt")

                            with open(srt_path, "w", encoding="utf-8") as f:
                                f.write(st.session_state.last_srt)

                            out_path = os.path.join(workdir, "final_subtitled.mp4")

                            burn_subtitles(
                                st.session_state.final_video_path,
                                srt_path,
                                out_path
                            )

                        st.session_state.final_video_path = out_path

                        st.success("Subtitles burned onto the final video.")

                        st.rerun()

                    except Exception as exc:

                        st.error(f"Could not burn subtitles: {exc}")

        # -- Trim --
        with tool_tabs[1]:

            current_duration = get_duration_seconds(
                st.session_state.final_video_path
            ) or 0.0

            st.caption(f"Current video length: {current_duration:.1f} sec")

            trim_col1, trim_col2 = st.columns(2)

            with trim_col1:
                trim_start = st.number_input(
                    "Start at (sec)", min_value=0.0, value=0.0, step=1.0,
                    key="trim_start_input"
                )

            with trim_col2:
                trim_end = st.number_input(
                    "End at (sec) — 0 means end of video",
                    min_value=0.0, value=0.0, step=1.0,
                    key="trim_end_input"
                )

            if st.button(
                "Trim Final Video", use_container_width=True,
                key="trim_button"
            ):

                try:

                    with st.spinner("Trimming..."):

                        workdir = _tool_workdir()
                        out_path = os.path.join(workdir, "final_trimmed.mp4")

                        end_val = (
                            trim_end if trim_end and trim_end > trim_start
                            else None
                        )

                        trim_video(
                            st.session_state.final_video_path,
                            out_path,
                            start_seconds=trim_start,
                            end_seconds=end_val
                        )

                    st.session_state.final_video_path = out_path

                    st.success("Trimmed.")

                    st.rerun()

                except Exception as exc:

                    st.error(f"Could not trim video: {exc}")

        # -- Replace Audio --
        with tool_tabs[2]:

            new_audio = st.file_uploader(
                "New audio track",
                type=["mp3", "wav", "m4a", "aac"],
                key="replace_audio_uploader"
            )

            if new_audio and st.button(
                "Replace Audio on Final Video", use_container_width=True,
                key="replace_audio_button"
            ):

                try:

                    with st.spinner("Replacing audio..."):

                        workdir = _tool_workdir()

                        ext = os.path.splitext(new_audio.name)[1] or ".mp3"
                        audio_path = os.path.join(workdir, "new_audio" + ext)

                        with open(audio_path, "wb") as f:
                            f.write(new_audio.getvalue())

                        out_path = os.path.join(workdir, "final_audio_replaced.mp4")

                        replace_audio(
                            st.session_state.final_video_path,
                            audio_path,
                            out_path
                        )

                    st.session_state.final_video_path = out_path

                    st.success("Audio replaced.")

                    st.rerun()

                except Exception as exc:

                    st.error(f"Could not replace audio: {exc}")

        # -- Thumbnail --
        with tool_tabs[3]:

            thumb_time = st.number_input(
                "Grab frame at (sec)", min_value=0.0, value=1.0, step=0.5,
                key="thumb_time_input"
            )

            if st.button(
                "Generate Thumbnail", use_container_width=True,
                key="thumb_button"
            ):

                try:

                    with st.spinner("Extracting frame..."):

                        workdir = _tool_workdir()
                        out_path = os.path.join(workdir, "thumbnail.jpg")

                        extract_thumbnail(
                            st.session_state.final_video_path,
                            out_path,
                            timestamp_seconds=thumb_time
                        )

                    st.session_state.last_thumbnail = out_path

                    st.success("Thumbnail ready.")

                except Exception as exc:

                    st.error(f"Could not extract thumbnail: {exc}")

            if (
                st.session_state.get("last_thumbnail")
                and os.path.exists(st.session_state.last_thumbnail)
            ):

                st.image(
                    st.session_state.last_thumbnail,
                    use_container_width=True
                )

                with open(st.session_state.last_thumbnail, "rb") as f:
                    st.download_button(
                        "Download Thumbnail",
                        data=f.read(),
                        file_name="cineluxe_thumbnail.jpg",
                        mime="image/jpeg",
                        use_container_width=True,
                        key="download_thumbnail_button"
                    )


    # ========================================================
    # SCENE DETAILS
    # ========================================================

    st.divider()


    st.subheader(

        "Scene Blueprint"

    )


    for idx, scene in enumerate(scenes):


        scene_id = scene.get(

            "id",

            idx + 1

        )


        title = scene.get(

            "primary_visual",

            "Visual Plan"

        )


        with st.expander(

            f"Scene {idx + 1}: {title}",

            expanded=False

        ):


            col1, col2 = st.columns(

                2

            )


            with col1:


                st.markdown(

                    "**Voice-over**"

                )


                st.write(

                    scene.get(

                        "voiceover",

                        ""

                    )

                )


                st.markdown(

                    "**Meaning**"

                )


                st.write(

                    scene.get(

                        "meaning",

                        ""

                    )

                )


                st.markdown(

                    "**Primary Visual**"

                )


                st.write(

                    scene.get(

                        "primary_visual",

                        ""

                    )

                )


                st.markdown(

                    "**Secondary Visual**"

                )


                st.write(

                    scene.get(

                        "secondary_visual",

                        ""

                    )

                )


            with col2:


                st.write(

                    f"""

                    **Visual Type:**

                    {scene.get('visual_type', '')}

                    """

                )


                st.write(

                    f"""

                    **Era / Location:**

                    {scene.get('era_location', '')}

                    """

                )


                st.write(

                    f"""

                    **Mood:**

                    {scene.get('mood', '')}

                    """

                )


                st.write(

                    f"""

                    **Shot:**

                    {scene.get('shot', '')}

                    """

                )


                st.write(

                    f"""

                    **Camera:**

                    {scene.get('camera_movement', '')}

                    """

                )


                st.write(

                    f"""

                    **Transition:**

                    {scene.get('transition', '')}

                    """

                )


            st.markdown(

                "**AI Video Prompt**"

            )


            st.code(

                scene.get(

                    "kling_prompt",

                    ""

                ),

                language=None

            )


    # ========================================================
    # RESET
    # ========================================================

    st.divider()


    if st.button(

        "🗑️ Reset Generated Videos",

        use_container_width=True

    ):


        st.session_state.videos = {}

        st.session_state.final_video_path = None


        st.rerun()


# ============================================================
# INITIAL SCREEN
# ============================================================

else:


    st.info(

        """

        **How it works**

        1. Paste your complete script.

        2. Click **Analyze Script**.

        3. DEEPU understands the story and
           automatically creates cinematic scenes.

        4. Click **Generate Video**.

        5. CineLuxe sends the scene prompts to
           the AI video model and generates
           your video scenes.

        6. Click **Render Final Video**
           to join every generated clip into a single,
           downloadable final video (with your uploaded
           voice-over on top, if you added one).

        """

    )
