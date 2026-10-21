"use client";
import { useEffect, useRef, useState } from "react";
import { drawTicket, downloadCanvas } from "../lib/drawTicket";

const STORAGE_KEY = "r2s_my_tickets";

// Renders a ticket row into a canvas and mounts it inside the given container
function TicketCanvas({ row, onReady }) {
  const box = useRef(null);
  useEffect(() => {
    let alive = true;
    drawTicket(row).then((canvas) => {
      if (!alive || !box.current) return;
      box.current.innerHTML = "";
      box.current.appendChild(canvas);
      onReady && onReady(canvas);
    });
    return () => { alive = false; };
  }, [row]);
  return <div ref={box} />;
}

function Rocket() {
  return (
    <svg className="rocket" viewBox="0 0 120 270" aria-hidden="true">
      <defs>
        <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#ffb36b" />
          <stop offset="1" stopColor="#ef4a5f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="flame" d="M48 198 Q60 266 72 198 Z" fill="url(#flameGrad)" />
      <path d="M36 150 L14 196 L36 186 Z" fill="#ef4a5f" />
      <path d="M84 150 L106 196 L84 186 Z" fill="#ef4a5f" />
      <path d="M60 10 C86 50 92 110 84 190 L36 190 C28 110 34 50 60 10 Z" fill="#f4f6ff" />
      <path d="M60 10 C86 50 92 110 84 190 L66 190 C72 110 70 50 60 10 Z" fill="#cfd5ee" />
      <circle cx="60" cy="88" r="14" fill="#0b1226" />
      <circle cx="60" cy="88" r="9" fill="#2a3a7a" />
      <rect x="38" y="170" width="44" height="8" fill="#ef4a5f" />
      <rect x="46" y="190" width="28" height="8" rx="2" fill="#0b1226" />
    </svg>
  );
}

export default function Home() {
  const [form, setForm] = useState({ name: "", country: "" });
  const [current, setCurrent] = useState(null);
  const [mine, setMine] = useState([]);
  const [busy, setBusy] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  // Load tickets this browser already created
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setMine(saved);
    } catch {}
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      // Short launch animation before the ticket is revealed
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setLaunching(true);
      await new Promise((r) => setTimeout(r, reduced ? 300 : 1900));
      setLaunching(false);

      const next = [data.ticket, ...mine];
      setMine(next);
      setCurrent(data.ticket);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function another() {
    setCurrent(null);
    setForm({ name: "", country: "" });
  }

  return (
    <main>
      {launching && (
        <div className="launch" role="status">
          <Rocket />
          <p>Launching your ticket...</p>
        </div>
      )}

      {!current && (
        <section className="hero">
          <div>
            <p className="tag">One team. One mission. Beyond limits.</p>
            <h1>Claim your seat on the launch.</h1>
            <p className="lead">
              Register for free and your Race2Space Oman 2026 ticket is ready in seconds.
              Save it as an image and share it.
            </p>
            <form onSubmit={submit}>
              <label>Full name
                <input required maxLength={60} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>Country
                <input required maxLength={40} placeholder="Oman" value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </label>
              {error && <div className="error" role="alert">{error}</div>}
              <button disabled={busy}>{busy ? "Preparing launch..." : "Get my ticket"}</button>
            </form>
            <p className="foot">Sultan Qaboos University, Race2Space Oman 2026</p>
          </div>
          <div className="stage">
            <Rocket />
          </div>
        </section>
      )}

      {current && (
        <div className="ticket-wrap">
          <h1 style={{ fontFamily: "var(--font-display), Arial, sans-serif", fontSize: "clamp(28px, 5vw, 48px)", margin: "0 0 20px" }}>
            You are cleared for launch.
          </h1>
          <TicketCanvas row={current} onReady={(c) => (canvasRef.current = c)} />
          <div className="actions">
            <button onClick={() => downloadCanvas(canvasRef.current, `ticket-${current.mission_id}.png`)}>
              Save ticket
            </button>
            <button className="ghost" onClick={another}>Make another ticket</button>
          </div>
        </div>
      )}

      {mine.length > 1 && (
        <>
          <h2 style={{ marginTop: 48 }}>Tickets made on this device</h2>
          <div className="grid">
            {mine.map((t) => (
              <div className="card" key={t.id}>
                <TicketCanvas row={t} />
                <small>{t.name} - {t.mission_id}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
