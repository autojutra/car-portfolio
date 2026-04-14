import { fixedInquiryEmail, getSiteSettings, type InquiryRecord } from "@/lib/store";

type DeliveryStatus = InquiryRecord["delivery"];
const providerRequestTimeoutMs = 12000;

export async function getNotificationStatus() {
  const settings = await getSiteSettings();

  return {
    emailConfigured: Boolean(
      process.env.RESEND_API_KEY &&
        process.env.NOTIFY_EMAIL_FROM &&
        fixedInquiryEmail,
    ),
    whatsappConfigured: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_WHATSAPP_FROM &&
        settings.publicWhatsapp,
    ),
  };
}

export async function notifyAdmin(
  inquiry: Omit<InquiryRecord, "id" | "createdAt" | "delivery">,
): Promise<DeliveryStatus> {
  const [email, whatsapp] = await Promise.all([
    sendEmail(inquiry).catch(() => "failed"),
    sendWhatsapp(inquiry).catch(() => "failed"),
  ]);

  return { email, whatsapp };
}

async function fetchWithTimeout(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), providerRequestTimeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function sendEmail(inquiry: Omit<InquiryRecord, "id" | "createdAt" | "delivery">) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_EMAIL_FROM;
  const to = fixedInquiryEmail;

  if (!apiKey || !from || !to) {
    return "not configured";
  }

  const response = await fetchWithTimeout("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: inquiry.email,
      subject: `Nowe zapytanie: ${inquiry.carName}`,
      html: buildInquiryEmailHtml(inquiry),
      text: buildInquiryEmailText(inquiry),
    }),
  });

  if (response.ok) {
    return "sent";
  }

  return `failed (${response.status})`;
}

async function sendWhatsapp(
  inquiry: Omit<InquiryRecord, "id" | "createdAt" | "delivery">,
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const settings = await getSiteSettings();
  const to = settings.publicWhatsapp;

  if (!accountSid || !authToken || !from || !to) {
    return "not configured";
  }

  const body = new URLSearchParams({
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    To: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    Body: buildInquiryEmailText(inquiry),
  });

  const response = await fetchWithTimeout(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (response.ok) {
    return "sent";
  }

  return `failed (${response.status})`;
}

function buildInquiryEmailText(
  inquiry: Omit<InquiryRecord, "id" | "createdAt" | "delivery">,
) {
  return [
    "Nowe zapytanie ze strony autojutra.pl",
    "",
    `Samochód: ${inquiry.carName}`,
    `Portfolio: ${getPortfolioLabel(inquiry.portfolioType)}`,
    `Imię i nazwisko: ${inquiry.customerName}`,
    `E-mail: ${inquiry.email}`,
    `Telefon: ${inquiry.phone}`,
    `Wiadomość: ${inquiry.message || "Brak dodatkowej wiadomości"}`,
  ].join("\n");
}

function buildInquiryEmailHtml(
  inquiry: Omit<InquiryRecord, "id" | "createdAt" | "delivery">,
) {
  const message = inquiry.message?.trim() || "Brak dodatkowej wiadomości";

  return `
    <div style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;">
        <div style="padding:28px 28px 20px;background:linear-gradient(180deg,#171717 0%,#0a0a0a 100%);color:#ffffff;">
          <div style="font-size:12px;letter-spacing:0.35em;text-transform:uppercase;color:#a1a1aa;">autojutra.pl</div>
          <h1 style="margin:16px 0 0;font-size:28px;line-height:1.2;font-weight:700;">Nowe zapytanie o samochód</h1>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#d4d4d8;">
            Klient wysłał nowe zapytanie z formularza na stronie.
          </p>
        </div>

        <div style="padding:24px 28px 28px;">
          <div style="padding:18px 20px;border:1px solid #e5e7eb;border-radius:18px;background:#fafafa;">
            <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#71717a;">Samochód</div>
            <div style="margin-top:10px;font-size:24px;line-height:1.3;font-weight:700;color:#111827;">${escapeHtml(inquiry.carName)}</div>
            <div style="margin-top:8px;font-size:14px;line-height:1.6;color:#52525b;">${escapeHtml(getPortfolioLabel(inquiry.portfolioType))}</div>
          </div>

          <div style="margin-top:18px;padding:18px 20px;border:1px solid #e5e7eb;border-radius:18px;background:#ffffff;">
            ${renderInfoRow("Imię i nazwisko", inquiry.customerName)}
            ${renderInfoRow("E-mail", inquiry.email, "mailto")}
            ${renderInfoRow("Telefon", inquiry.phone, "tel")}
          </div>

          <div style="margin-top:18px;padding:18px 20px;border:1px solid #e5e7eb;border-radius:18px;background:#ffffff;">
            <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#71717a;">Wiadomość</div>
            <div style="margin-top:12px;font-size:15px;line-height:1.8;color:#18181b;white-space:pre-wrap;">${escapeHtml(message)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getPortfolioLabel(portfolioType: "example" | "available") {
  return portfolioType === "available"
    ? "Auta dostępne obecnie"
    : "Przykładowe portfolio importowe";
}

function renderInfoRow(
  label: string,
  value: string,
  linkType?: "mailto" | "tel",
) {
  const safeValue = escapeHtml(value);
  const href =
    linkType === "mailto"
      ? `mailto:${safeValue}`
      : linkType === "tel"
        ? `tel:${safeValue}`
        : null;
  const content = href
    ? `<a href="${href}" style="color:#111827;text-decoration:none;font-weight:600;">${safeValue}</a>`
    : `<span style="color:#111827;font-weight:600;">${safeValue}</span>`;
  const borderStyle = "padding:0 0 14px;margin:0 0 14px;border-bottom:1px solid #f1f5f9;";

  return `
    <div style="${borderStyle}">
      <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#71717a;">${label}</div>
      <div style="margin-top:8px;font-size:16px;line-height:1.6;">${content}</div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
