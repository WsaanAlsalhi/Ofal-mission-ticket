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

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", team: "" });
  const [current, setCurrent] = useState(null);
  const [mine, setMine] = useState([]);
  const [busy, setBusy] = useState(false);
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
    setForm({ name: "", email: "", team: "" });
  }

  return (
    <main>
      <h1>Your seat on the Rocket Mission</h1>
      <p className="lead">Register for free. Your ticket appears right away and you can save it as an image.</p>

      {!current && (
        <form onSubmit={submit}>
          <label>Full name
            <input required maxLength={60} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>Email
            <input type="email" maxLength={100} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>Team
            <input maxLength={40} value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })} />
          </label>
          {error && <div className="error" role="alert">{error}</div>}
          <button disabled={busy}>{busy ? "Creating ticket..." : "Get my ticket"}</button>
        </form>
      )}

      {current && (
        <div className="ticket-wrap">
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
          <h2 style={{ marginTop: 40 }}>Tickets made on this device</h2>
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
