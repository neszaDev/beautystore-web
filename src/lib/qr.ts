import "server-only";
import QRCode from "qrcode";

/** Render a payload as an SVG data URL (server-side; used with <img>, so no HTML injection surface). */
export async function qrDataUrl(payload: string): Promise<string> {
  const svg = await QRCode.toString(payload, { type: "svg", margin: 1, errorCorrectionLevel: "M", width: 256 });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
