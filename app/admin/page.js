"use client";
import { useEffect, useRef, useState } from "react";
import { drawTicket, downloadCanvas } from "../../lib/drawTicket";

function Thumb({ row }) {
  const box = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    let alive = true;
    drawTicket(row).then((c) => {
      if (!alive || !box.current) return;
      canvasRef.current = c;
      box.current.innerHTML = "";
      box.current.appendChild(c);
    });
    return () => { alive = false; };
  }, [row]);
  return (
    <div className="card">
      <div ref={box} />
      <small>{row.name} - {row.mission_id} - {row.seat}</small>
      <button style={{ marginTop: 8 }} onClick={() => downloadCanvas(canvasRef.current, `ticket-${row.mission_id}.png`)}>
        Save
      </button>
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  async function load(e) {
    e && e.preventDefault();
    setError("");
    const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed."); return; }
    setRows(data.rows);
  }

  // Auto refresh the list every 20 seconds once logged in
  useEffect(() => {
    if (!rows) return;
    const t = setInterval(() => load(), 20000);
    return () => clearInterval(t);
  }, [rows, password]);

  function exportCsv() {
    const head = "mission_id,seat,name,email,team,created_at";
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = rows.map((r) => [r.mission_id, r.seat, r.name, r.email, r.team, r.created_at].map(esc).join(","));
    const blob = new Blob(["\ufeff" + [head, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "participants.csv";
    a.click();
  }

  if (!rows) {
    return (
      <main>
        <h1>Admin</h1>
        <form onSubmit={load}>
          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <div className="error" role="alert">{error}</div>}
          <button>Open</button>
        </form>
      </main>
    );
  }

  return (
    <main>
      <h1>{rows.length} registered</h1>
      <div className="actions"><button onClick={exportCsv}>Download names (CSV)</button></div>
      <div className="scroll">
        <table>
          <thead><tr><th>Mission ID</th><th>Seat</th><th>Name</th><th>Email</th><th>Team</th><th>Time</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.mission_id}</td><td>{r.seat}</td><td>{r.name}</td>
                <td>{r.email}</td><td>{r.team}</td><td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 style={{ marginTop: 32 }}>Tickets</h2>
      <div className="grid">{rows.map((r) => <Thumb key={r.id} row={r} />)}</div>
    </main>
  );
}
