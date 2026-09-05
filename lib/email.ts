// Thin wrapper around Resend's HTTP API. No dependency needed — plain fetch.
// If RESEND_API_KEY isn't set, this silently no-ops so the app still works
// locally without email configured (in-app notifications still get created).

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Voltra <onboarding@resend.dev>";

export async function sendEmail(to: string | null | undefined, subject: string, html: string) {
  if (!RESEND_API_KEY || !to) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend email failed:", await res.text());
    }
  } catch (err) {
    console.error("Resend email error:", err);
  }
}
