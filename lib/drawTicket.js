import { TICKET_DEFAULTS } from "./config";

// Draws the passenger data on top of the blank template (/bg.png).
// Runs in the browser only. Returns a canvas element.
export async function drawTicket(row) {
  const img = new Image();
  img.src = "/bg.png";
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = "#0b1226";
  ctx.textBaseline = "alphabetic";

  // Shrinks the font until the text fits maxWidth
  const put = (text, x, y, size, maxWidth) => {
    const value = String(text || "").toUpperCase();
    let s = size;
    ctx.font = `700 ${s}px Arial, Helvetica, sans-serif`;
    while (ctx.measureText(value).width > maxWidth && s > 16) {
      s -= 2;
      ctx.font = `700 ${s}px Arial, Helvetica, sans-serif`;
    }
    ctx.fillText(value, x, y);
  };

  put(row.name,                          570, 400, 52, 760); // PASSENGER
  put(row.mission_id,                    543, 555, 40, 250); // MISSION ID
  put(row.seat,                          856, 555, 40, 170); // SEAT
  put(row.team,                         1111, 555, 36, 230); // TEAM
  put(TICKET_DEFAULTS.destination,       514, 692, 36, 250); // DESTINATION
  put(TICKET_DEFAULTS.launchDate,        816, 692, 36, 190); // LAUNCH DATE
  put(TICKET_DEFAULTS.status,           1073, 692, 36, 250); // STATUS

  return canvas;
}

export function downloadCanvas(canvas, filename) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = filename;
  a.click();
}
