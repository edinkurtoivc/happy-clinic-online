import QRCode from "qrcode";

export async function computeHash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface QRPayload {
  reportCode: string;
  patient?: { name: string; jmbg: string };
  type?: string;
  doctor?: string;
  clinicName?: string;
}

export async function buildReportQR({ reportCode, patient, type = "", doctor = "", clinicName = "" }: QRPayload): Promise<string> {
  try {
    const payload = JSON.stringify({ code: reportCode || "", patient: patient || {}, type, doctor, clinic: clinicName, t: new Date().toISOString() });
    const hash = await computeHash(payload);
    const text = `MR:${reportCode || ''}|H:${hash}`;
    const url = await QRCode.toDataURL(text, { margin: 0, width: 128 });
    return url;
  } catch (e) {
    console.warn("[qrUtils] QR generation failed", e);
    return "";
  }
}
