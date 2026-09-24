const $ = (sel) => document.querySelector(sel);

const LABELS = {
  male: "Nam", female: "Nữ",
  child: "Trẻ em", teenager: "Thiếu niên", "young adult": "Thanh niên",
  "middle-aged": "Trung niên", elderly: "Cao tuổi",
  "very low pitch": "Rất trầm", "low pitch": "Trầm", "moderate pitch": "Vừa",
  "high pitch": "Cao", "very high pitch": "Rất cao",
  "american accent": "Mỹ", "british accent": "Anh", "australian accent": "Úc",
  "chinese accent": "Trung Quốc", "canadian accent": "Canada", "indian accent": "Ấn Độ",
  "korean accent": "Hàn Quốc", "portuguese accent": "Bồ Đào Nha",
  "russian accent": "Nga", "japanese accent": "Nhật Bản",
};

const ADVANCED_DEFAULTS = {
  guidance_scale: 2.0, t_shift: 0.1, class_temperature: 0, position_temperature: 5,
  layer_penalty_factor: 5, audio_chunk_duration: 15, audio_chunk_threshold: 30,
  denoise: true, postprocess_output: true, normalize_text: false,
};

const num = (n, digits = 1) =>
  Number(n).toLocaleString("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) if (c !== null && c !== undefined) node.append(c);
  return node;
}

async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  const body = res.headers.get("content-type")?.includes("json") ? await res.json() : null;
  if (!res.ok) {
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : `Lỗi máy chủ (${res.status})`);
  }
  return body;
}

function remember(key, value) {
  try { localStorage.setItem(`vs:${key}`, value); } catch {}
}
function recall(key) {
  try { return localStorage.getItem(`vs:${key}`); } catch { return null; }
}

/* ---------- tabs ---------- */

const tabs = [...document.querySelectorAll('[role="tab"]')];
function showTab(tab) {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  }
  remember("tab", tab.id);
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => showTab(t));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    showTab(next);
    next.focus();
  });
});

/* ---------- status ---------- */

async function refreshStatus() {
  const pill = $("#model-status");
  try {
    const s = await api("/api/status");
    const queue = s.pending_jobs ? `, ${s.pending_jobs} việc đang chờ` : "";
    const text = {
      idle: "Chuẩn bị nạp mô hình",
      loading: "Đang nạp mô hình",
      ready: `Sẵn sàng (${(s.device || "").toUpperCase()})${queue}`,
      error: "Lỗi nạp mô hình",
    }[s.model] || s.model;
    pill.textContent = text;
    pill.dataset.state = s.model;
    pill.title = s.error || "";
  } catch {
    pill.textContent = "Mất kết nối máy chủ";
    pill.dataset.state = "error";
  }
}

/* ---------- jobs ---------- */

async function waitJob(id, onStep) {
  for (;;) {
    const job = await api(`/api/jobs/${id}`);
    if (job.status === "done") return job;
    if (job.status === "error") throw new Error(job.error || "Việc bị lỗi");
    onStep(job.status === "queued" ? "Đang chờ tới lượt" : job.step);
    await new Promise((r) => setTimeout(r, 1200));
  }
}

function elapsedTimer(target, label) {
  const t0 = Date.now();
  let step = label;
  const tick = () => { target.textContent = `${step}... ${Math.round((Date.now() - t0) / 1000)} giây`; };
  tick();
  const h = setInterval(tick, 1000);
  return { set(s) { step = s; tick(); }, stop() { clearInterval(h); } };
}

/* ---------- design options ---------- */

async function loadOptions() {
  const { design } = await api("/api/options");
  const fill = (sel, values, blank) => {
    sel.replaceChildren(el("option", { value: "" }, blank),
      ...values.map((v) => el("option", { value: v }, LABELS[v] || v)));
  };
  fill($("#d-gender"), design.gender, "Không chọn");
  fill($("#d-age"), design.age, "Không chọn");
  fill($("#d-pitch"), design.pitch, "Không chọn");
  fill($("#d-accent"), design.accent, "Không chọn");
  $("#d-gender").value = "female";
  $("#d-age").value = "middle-aged";
}

function currentMode() {
  return document.querySelector('input[name="mode"]:checked').value;
}
function applyMode() {
  const mode = currentMode();
  $("#clone-options").hidden = mode !== "clone";
  $("#design-options").hidden = mode !== "design";
  remember("mode", mode);
}
document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener("change", applyMode));

/* ---------- voices ---------- */

let voices = [];

async function loadVoices(selectId) {
  voices = await api("/api/voices");
  const select = $("#voice-select");
  const keep = selectId || select.value || recall("voice");
  select.replaceChildren(...voices.map((v) => el("option", { value: v.id }, v.display_name)));
  if (voices.some((v) => v.id === keep)) select.value = keep;
  select.hidden = voices.length === 0;
  $("#no-voice").hidden = voices.length > 0;
  renderLibrary();
}

$("#voice-select").addEventListener("change", (e) => remember("voice", e.target.value));

function armDelete(btn, action) {
  btn.addEventListener("click", async () => {
    if (btn.dataset.armed !== "true") {
      btn.dataset.armed = "true";
      btn.textContent = "Bấm lần nữa để xoá";
      setTimeout(() => { btn.dataset.armed = "false"; btn.textContent = "Xoá"; }, 4000);
      return;
    }
    btn.disabled = true;
    try { await action(); } catch (err) { alertInline(btn, err.message); btn.disabled = false; }
  });
}

function alertInline(anchor, message) {
  const p = el("p", { class: "small error-text", role: "alert" }, message);
  anchor.closest("li")?.append(p);
  setTimeout(() => p.remove(), 6000);
}

function renderLibrary() {
  const list = $("#library");
  $("#library-count").textContent = `${voices.length} giọng`;
  if (!voices.length) {
    list.replaceChildren(el("li", { class: "empty" }, "Chưa có giọng nào."));
    return;
  }
  list.replaceChildren(...voices.map((v) => {
    const title = el("h3", {}, v.display_name);
    const useBtn = el("button", { type: "button", class: "btn ghost small-btn" }, "Dùng để đọc");
    const renameBtn = el("button", { type: "button", class: "btn ghost small-btn" }, "Đổi tên");
    const delBtn = el("button", { type: "button", class: "btn ghost small-btn danger" }, "Xoá");

    useBtn.addEventListener("click", () => {
      $("#mode-clone").checked = true;
      applyMode();
      $("#voice-select").value = v.id;
      remember("voice", v.id);
      showTab($("#tab-tts"));
      $("#tts-text").focus();
    });

    renameBtn.addEventListener("click", () => {
      const input = el("input", { type: "text", value: v.display_name, "aria-label": "Tên mới", maxlength: "80" });
      const save = el("button", { type: "button", class: "btn primary small-btn" }, "Lưu");
      const cancel = el("button", { type: "button", class: "btn ghost small-btn" }, "Huỷ");
      const form = el("div", { class: "rename" }, input, save, cancel);
      title.replaceWith(form);
      input.focus();
      input.select();
      cancel.addEventListener("click", () => form.replaceWith(title));
      const commit = async () => {
        const name = input.value.trim();
        if (!name) return input.focus();
        await api(`/api/voices/${v.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_name: name }),
        });
        await loadVoices();
      };
      save.addEventListener("click", commit);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") form.replaceWith(title);
      });
    });

    armDelete(delBtn, async () => {
      await api(`/api/voices/${v.id}`, { method: "DELETE" });
      await loadVoices();
    });

    const refAudio = el("audio", { controls: true, preload: "none", src: `/api/voices/${v.id}/ref.wav` });
    const details = el("details", { class: "item-details" },
      el("summary", {}, "Chi tiết"),
      v.ref_text ? el("p", { class: "item-quote" }, v.ref_text) : null,
      v.note ? el("p", { class: "item-text" }, v.note) : null,
      v.has_preview ? el("div", {}, el("span", { class: "muted small" }, "Đoạn mẫu gốc"), refAudio) : null,
      el("div", { class: "item-meta" },
        el("span", {}, `Mã: ${v.id}`),
        v.added ? el("span", {}, `Thêm ${v.added.slice(0, 10)}`) : null,
      ),
    );

    return el("li", {},
      el("div", { class: "item-head" }, title,
        v.ref_seconds ? el("span", { class: "muted small" }, `${num(v.ref_seconds)} giây`) : null),
      v.has_preview
        ? el("audio", { controls: true, preload: "none", src: `/api/voices/${v.id}/preview.wav`, "aria-label": `Câu đọc thử của ${v.display_name}` })
        : refAudio,
      el("div", { class: "item-actions" }, useBtn, renameBtn, delBtn),
      details,
    );
  }));
}

$("#voice-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("#voice-job");
  const name = $("#v-name").value.trim();
  const file = $("#v-file").files[0];
  status.classList.remove("error-text");
  if (!name) { status.textContent = "Cần đặt tên cho giọng."; status.classList.add("error-text"); return $("#v-name").focus(); }
  if (!file) { status.textContent = "Cần chọn file ghi âm."; status.classList.add("error-text"); return $("#v-file").focus(); }

  const fd = new FormData();
  fd.append("display_name", name);
  fd.append("file", file);
  fd.append("text", $("#v-text").value);
  fd.append("start", $("#v-start").value);
  fd.append("end", $("#v-end").value);
  fd.append("note", $("#v-note").value);

  const btn = $("#voice-submit");
  btn.disabled = true;
  const timer = elapsedTimer(status, "Đang tải file lên");
  try {
    const job = await api("/api/voices", { method: "POST", body: fd });
    const done = await waitJob(job.id, (s) => timer.set(s));
    timer.stop();
    status.textContent = `Đã thêm giọng "${name}". Lời mẫu: ${done.result.ref_text}`;
    e.target.reset();
    await loadVoices(done.result.voice_id);
  } catch (err) {
    timer.stop();
    status.textContent = err.message;
    status.classList.add("error-text");
  } finally {
    btn.disabled = false;
    refreshStatus();
  }
});

/* ---------- text to speech ---------- */

$("#tts-text").addEventListener("input", (e) => {
  $("#tts-count").textContent = `${e.target.value.length.toLocaleString("vi-VN")} ký tự`;
});
$("#speed").addEventListener("input", (e) => { $("#speed-out").textContent = `${Number(e.target.value).toFixed(2)}×`; });

function resetAdvanced() {
  for (const [k, v] of Object.entries(ADVANCED_DEFAULTS)) {
    const input = document.getElementById(k);
    if (input.type === "checkbox") input.checked = v; else input.value = v;
  }
}
$("#reset-advanced").addEventListener("click", resetAdvanced);

function collectTTS() {
  const mode = currentMode();
  const numOrNull = (id) => { const v = document.getElementById(id).value; return v === "" ? null : Number(v); };
  const body = {
    text: $("#tts-text").value,
    mode,
    language: $("#language").value || null,
    duration: numOrNull("duration"),
    speed: numOrNull("duration") ? null : Number($("#speed").value),
    num_step: Number($("#num_step").value),
  };
  if (mode === "clone") body.voice_id = $("#voice-select").value;
  if (mode === "design") {
    body.gender = $("#d-gender").value || null;
    body.age = $("#d-age").value || null;
    body.pitch = $("#d-pitch").value || null;
    body.accent = $("#d-accent").value || null;
    body.style = $("#d-whisper").checked ? "whisper" : null;
  }
  for (const k of Object.keys(ADVANCED_DEFAULTS)) {
    const input = document.getElementById(k);
    body[k] = input.type === "checkbox" ? input.checked : numOrNull(k);
  }
  return body;
}

function showResult(rec) {
  $("#result-empty").hidden = true;
  $("#result").hidden = false;
  const url = `/media/outputs/${encodeURIComponent(rec.file)}`;
  $("#result-audio").src = url;
  $("#result-download").href = url;
  $("#result-download").setAttribute("download", rec.file);
  $("#result-info").textContent = `${rec.voice}, ${num(rec.seconds)} giây, xử lý ${num(rec.elapsed)} giây`;
}

$("#tts-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("#tts-job");
  status.classList.remove("error-text");
  const body = collectTTS();
  if (!body.text.trim()) { status.textContent = "Chưa có văn bản để đọc."; status.classList.add("error-text"); return $("#tts-text").focus(); }
  if (body.mode === "clone" && !body.voice_id) { status.textContent = "Chưa có giọng mẫu để chọn."; status.classList.add("error-text"); return; }

  const btn = $("#tts-submit");
  btn.disabled = true;
  const timer = elapsedTimer(status, "Đang gửi");
  try {
    const job = await api("/api/tts", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const done = await waitJob(job.id, (s) => timer.set(s));
    timer.stop();
    status.textContent = "Đã xong.";
    showResult(done.result);
    $("#result-audio").play().catch(() => {});
    await loadHistory();
  } catch (err) {
    timer.stop();
    status.textContent = err.message;
    status.classList.add("error-text");
  } finally {
    btn.disabled = false;
    refreshStatus();
  }
});

async function loadHistory() {
  const items = await api("/api/outputs");
  const list = $("#history");
  $("#history-count").textContent = items.length ? `${items.length} bản` : "";
  if (!items.length) {
    list.replaceChildren(el("li", { class: "empty" }, "Chưa có bản đọc nào."));
    return;
  }
  list.replaceChildren(...items.map((rec) => {
    const url = `/media/outputs/${encodeURIComponent(rec.file)}`;
    const delBtn = el("button", { type: "button", class: "btn ghost small-btn danger" }, "Xoá");
    armDelete(delBtn, async () => {
      await api(`/api/outputs/${encodeURIComponent(rec.id)}`, { method: "DELETE" });
      await loadHistory();
    });
    const reuse = el("button", { type: "button", class: "btn ghost small-btn" }, "Dùng lại văn bản");
    reuse.addEventListener("click", () => {
      $("#tts-text").value = rec.text;
      $("#tts-text").dispatchEvent(new Event("input"));
      $("#tts-text").focus();
    });
    return el("li", {},
      el("p", { class: "item-text" }, rec.text.length > 160 ? rec.text.slice(0, 160) + "..." : rec.text),
      el("div", { class: "item-meta" },
        el("span", {}, rec.voice),
        el("span", {}, `${num(rec.seconds)} giây`),
        el("span", {}, rec.created.replace("T", " ").slice(0, 16)),
      ),
      el("audio", { controls: true, preload: "none", src: url }),
      el("div", { class: "item-actions" },
        el("a", { class: "btn ghost small-btn", href: url, download: rec.file }, "Tải về"),
        reuse, delBtn),
    );
  }));
}

/* ---------- boot ---------- */

(async () => {
  const savedMode = recall("mode");
  if (savedMode) document.getElementById(`mode-${savedMode}`)?.click();
  applyMode();
  const savedTab = recall("tab");
  if (savedTab && document.getElementById(savedTab)) showTab(document.getElementById(savedTab));
  refreshStatus();
  setInterval(refreshStatus, 4000);
  await Promise.all([loadOptions(), loadVoices(), loadHistory()]).catch((err) => {
    $("#tts-job").textContent = err.message;
    $("#tts-job").classList.add("error-text");
  });
})();
