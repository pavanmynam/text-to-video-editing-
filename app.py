import os
import tempfile
import time
import concurrent.futures

import streamlit as st

from modules.deepu_engine import analyze_script
from modules.video_engine import (
    generate_kling_video,
    estimate_total_seconds
)
from modules.stitch_engine import (
    stitch_final_video,
    dims_for_aspect
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
div[data-testid="stTextArea"] textarea,
div[data-testid="stFileUploaderDropzone"],
div[data-baseweb="select"] > div {
    border-radius: 12px !important;
    border-color: var(--clx-line) !important;
    background: var(--clx-panel) !important;
}

div[data-testid="stTextArea"] textarea:focus {
    border-color: var(--clx-purple) !important;
    box-shadow: 0 0 0 1px var(--clx-purple) !important;
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


            st.info(

                f"Starting generation for "
                f"{len(scenes)} scenes..."

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
