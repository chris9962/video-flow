"""Voice Studio web server: voice library + text to speech on OmniVoice.

One worker thread runs every job in order: the MPS device holds one model and
OmniVoice is not safe to call from several threads at once.
"""
import os
import queue
import tempfile
import threading
import time
import traceback
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .engine import DESIGN_OPTIONS, Engine

ROOT = Path(__file__).resolve().parent.parent
VOICES_DIR = Path(os.environ.get("VOICES_DIR", Path.home() / "voice-clone" / "voices")).expanduser()
OUTPUTS_DIR = Path(os.environ.get("OUTPUTS_DIR", ROOT / "outputs")).expanduser()
ALLOWED_UPLOADS = {".mp3", ".mp4", ".m4a", ".wav", ".aac", ".ogg", ".flac", ".mov", ".webm"}

engine = Engine(VOICES_DIR, OUTPUTS_DIR)
jobs: dict[str, dict] = {}
work: queue.Queue = queue.Queue()


def worker() -> None:
    try:
        engine.load()
    except Exception:
        traceback.print_exc()
    while True:
        job_id, fn = work.get()
        job = jobs[job_id]
        if engine.state != "ready":
            job.update(status="error", error="Mô hình chưa nạp được: " + (engine.error or engine.state))
            continue
        job.update(status="running", started=time.time())
        try:
            job["result"] = fn(lambda text: job.update(step=text))
            job["status"] = "done"
        except Exception as exc:
            traceback.print_exc()
            job.update(status="error", error=str(exc))
        job["finished"] = time.time()


threading.Thread(target=worker, daemon=True).start()


def submit(kind: str, label: str, fn) -> dict:
    job_id = uuid.uuid4().hex[:12]
    jobs[job_id] = {"id": job_id, "kind": kind, "label": label, "status": "queued",
                    "step": "Đang chờ", "created": time.time(), "result": None, "error": None}
    work.put((job_id, fn))
    return jobs[job_id]


app = FastAPI(title="Voice Studio")


@app.get("/api/status")
def status():
    pending = sum(1 for j in jobs.values() if j["status"] in ("queued", "running"))
    return {"model": engine.state, "device": engine.device, "error": engine.error,
            "pending_jobs": pending, "voices_dir": str(VOICES_DIR)}


@app.get("/api/options")
def options():
    return {"design": DESIGN_OPTIONS}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Không có việc này")
    return jobs[job_id]


@app.get("/api/voices")
def list_voices():
    return engine.list_voices()


@app.post("/api/voices")
async def add_voice(
    display_name: str = Form(...),
    file: UploadFile = File(...),
    text: str = Form(""),
    start: str = Form(""),
    end: str = Form(""),
    note: str = Form(""),
):
    display_name = display_name.strip()
    if not display_name:
        raise HTTPException(400, "Cần đặt tên cho giọng")
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_UPLOADS:
        raise HTTPException(400, f"Định dạng {suffix or '(không rõ)'} chưa hỗ trợ")
    tmp = Path(tempfile.mkstemp(suffix=suffix)[1])
    tmp.write_bytes(await file.read())

    def to_float(v: str):
        v = v.strip().replace(",", ".")
        return float(v) if v else None

    voice_id = engine.new_voice_id(display_name)
    fn = lambda progress: engine.clone(voice_id, display_name, tmp, file.filename or tmp.name,
                                       text.strip() or None, to_float(start), to_float(end), note,
                                       progress)
    return submit("clone", display_name, fn)


class VoicePatch(BaseModel):
    display_name: str | None = None
    note: str | None = None


@app.patch("/api/voices/{voice_id}")
def patch_voice(voice_id: str, body: VoicePatch):
    try:
        engine.update_voice(voice_id, body.display_name, body.note)
    except KeyError:
        raise HTTPException(404, "Không có giọng này")
    return {"ok": True}


@app.delete("/api/voices/{voice_id}")
def delete_voice(voice_id: str):
    try:
        engine.delete_voice(voice_id)
    except KeyError:
        raise HTTPException(404, "Không có giọng này")
    return {"ok": True}


@app.get("/api/voices/{voice_id}/{kind}.wav")
def voice_audio(voice_id: str, kind: str):
    if kind not in ("ref", "preview"):
        raise HTTPException(404)
    try:
        path = engine.voice_dir(voice_id) / f"{kind}.wav"
    except KeyError:
        raise HTTPException(404)
    if not path.exists():
        raise HTTPException(404)
    return FileResponse(path, media_type="audio/wav")


class TTSRequest(BaseModel):
    text: str
    mode: str = "clone"  # clone | design | auto
    voice_id: str | None = None
    gender: str | None = None
    age: str | None = None
    pitch: str | None = None
    style: str | None = None
    accent: str | None = None
    language: str | None = "vi"
    speed: float | None = None
    duration: float | None = None
    normalize_text: bool = False
    num_step: int | None = None
    guidance_scale: float | None = None
    t_shift: float | None = None
    layer_penalty_factor: float | None = None
    position_temperature: float | None = None
    class_temperature: float | None = None
    denoise: bool | None = None
    postprocess_output: bool | None = None
    audio_chunk_duration: float | None = None
    audio_chunk_threshold: float | None = None


@app.post("/api/tts")
def tts(req: TTSRequest):
    params = req.model_dump()
    label = params["text"].strip()[:60]
    return submit("tts", label, lambda progress: engine.synthesize(params, progress))


@app.get("/api/outputs")
def outputs():
    return engine.list_outputs()


@app.delete("/api/outputs/{output_id}")
def delete_output(output_id: str):
    engine.delete_output(output_id)
    return {"ok": True}


app.mount("/media/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")
app.mount("/", StaticFiles(directory=ROOT / "static", html=True), name="static")
