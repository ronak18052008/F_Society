import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name, userAgent, ip } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const timestamp = new Date().toUTCString();
    const clientIp = ip || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown location";
    const clientUa = userAgent || req.headers.get("user-agent") || "Unknown browser / device";

    // If Resend API key is not configured, simulate notification gracefully
    if (!resendApiKey) {
      console.log(`[Notification: Login] (Simulated - no RESEND_API_KEY) User: ${email} (${name || "Member"}), Time: ${timestamp}, IP: ${clientIp}`);
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Login notification recorded (simulated: RESEND_API_KEY not configured)",
      });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f7f6f2; color: #1c1917; margin: 0; padding: 40px 20px; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 4px; padding: 32px; }
            .brand { font-family: Georgia, serif; font-size: 22px; font-weight: bold; letter-spacing: 0.15em; color: #8c6d48; text-transform: uppercase; margin-bottom: 24px; }
            h2 { font-family: Georgia, serif; font-size: 24px; margin-top: 0; color: #1c1917; font-weight: 400; }
            p { font-size: 14px; line-height: 1.6; color: #44403c; margin: 12px 0; }
            .details { background-color: #fafaf9; border-left: 3px solid #8c6d48; padding: 16px; margin: 24px 0; font-family: monospace; font-size: 13px; color: #57534e; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f5f5f4; font-size: 12px; color: #a8a29e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">NESTORA</div>
            <h2>Security Notice: New Account Sign-in</h2>
            <p>Hello ${name || "there"},</p>
            <p>We detected a new sign-in to your NESTORA account associated with <strong>${email}</strong>.</p>
            <div class="details">
              <div><strong>Time:</strong> ${timestamp}</div>
              <div><strong>IP Address:</strong> ${clientIp}</div>
              <div><strong>Device:</strong> ${clientUa}</div>
            </div>
            <p>If this was you, no action is needed. If you did not authorize this access, please change your password immediately in your account settings or initiate a password reset.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} NESTORA Architectural Living. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: "Security Alert: New Sign-in to your NESTORA Account",
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn("[Notification: Login] Resend note:", errData?.message || errData);
      return NextResponse.json({
        success: true,
        delivered: false,
        simulated: true,
        note: "Email logged locally. Verify sending domain on resend.com for inbox delivery.",
      });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[Notification: Login] Internal error:", error);
    return NextResponse.json(
      { error: "Internal server error processing notification" },
      { status: 500 }
    );
  }
}
