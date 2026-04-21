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
  const sender = from ? `Nowe zapytania Autojutra <${from}>` : from;

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
      from: sender,
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
    `Samochod: ${inquiry.carName}`,
    `Portfolio: ${getPortfolioLabel(inquiry.portfolioType)}`,
    `Imie i nazwisko: ${inquiry.customerName}`,
    `E-mail: ${inquiry.email}`,
    `Telefon: ${inquiry.phone}`,
    `Wiadomosc: ${inquiry.message || "Brak dodatkowej wiadomosci"}`,
  ].join("\n");
}

function buildInquiryEmailHtml(
  inquiry: Omit<InquiryRecord, "id" | "createdAt" | "delivery">,
) {
  const message = inquiry.message?.trim() || "Brak dodatkowej wiadomosci";
  const portfolioLabel = escapeHtml(getPortfolioLabel(inquiry.portfolioType));
  const customerName = escapeHtml(inquiry.customerName);
  const carName = escapeHtml(inquiry.carName);
  const replySubject = encodeURIComponent(`Re: ${inquiry.carName} - Autojutra`);
  const replyBody = encodeURIComponent(
    [
      `Dzien dobry ${inquiry.customerName},`,
      "",
      "dziekuje za zapytanie dotyczace samochodu.",
      "",
      "",
      "",
      "",
      "Pozdrawiam,",
      "Szymon Banaszek",
      "Autojutra",
    ].join("\n"),
  );
  const emailReplyHref = `mailto:${encodeURIComponent(inquiry.email)}?subject=${replySubject}&body=${replyBody}`;
  const phoneHref = `tel:${normalizePhoneHref(inquiry.phone)}`;

  return `
    <div style="margin:0;padding:20px 10px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Nowe zapytanie o ${carName}. Klient: ${customerName}.
      </div>
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:28px;overflow:hidden;">
        <div style="padding:30px 24px 24px;background:linear-gradient(180deg,#171717 0%,#050505 100%);color:#ffffff;">
          <div style="font-size:14px;letter-spacing:0.32em;text-transform:uppercase;color:#c4c4c5;">autojutra.pl</div>
          <h1 style="margin:18px 0 0;font-size:34px;line-height:1.15;font-weight:800;">Nowe zapytanie o samochod</h1>
          <p style="margin:14px 0 0;font-size:18px;line-height:1.7;color:#e4e4e7;">
            Klient wyslal nowe zapytanie z formularza na stronie.
          </p>
        </div>

        <div style="padding:24px;">
          <div style="padding:22px;border:1px solid #e5e7eb;border-radius:22px;background:#fafafa;">
            <div style="font-size:14px;letter-spacing:0.24em;text-transform:uppercase;color:#71717a;">Samochod</div>
            <div style="margin-top:12px;font-size:36px;line-height:1.12;font-weight:800;color:#111827;">${carName}</div>
            <div style="margin-top:10px;font-size:18px;line-height:1.6;color:#52525b;">${portfolioLabel}</div>
          </div>

          <div style="margin-top:18px;padding:20px;border:1px solid #dbe1e8;border-radius:22px;background:#f8fafc;">
            <div style="font-size:14px;letter-spacing:0.24em;text-transform:uppercase;color:#71717a;">Szybka akcja</div>
            <div style="margin-top:16px;">
              <a href="${emailReplyHref}" style="display:inline-block;margin:0 10px 10px 0;padding:15px 20px;border-radius:999px;background:#111111;color:#ffffff;text-decoration:none;font-size:18px;font-weight:700;">Odpowiedz mailem</a>
              <a href="${phoneHref}" style="display:inline-block;margin:0 10px 10px 0;padding:15px 20px;border-radius:999px;background:#ffffff;color:#111111;text-decoration:none;font-size:18px;font-weight:700;border:1px solid #d4d4d8;">Zadzwon</a>
            </div>
          </div>

          <div style="margin-top:18px;padding:20px;border:1px solid #e5e7eb;border-radius:22px;background:#ffffff;">
            ${renderInfoRow("Imie i nazwisko", inquiry.customerName)}
            ${renderInfoRow("E-mail", inquiry.email, "mailto")}
            ${renderInfoRow("Telefon", inquiry.phone, "tel")}
          </div>

          <div style="margin-top:18px;padding:20px;border:1px solid #e5e7eb;border-radius:22px;background:#ffffff;">
            <div style="font-size:14px;letter-spacing:0.24em;text-transform:uppercase;color:#71717a;">Wiadomosc</div>
            <div style="margin-top:14px;font-size:20px;line-height:1.8;color:#18181b;white-space:pre-wrap;">${escapeHtml(message)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getPortfolioLabel(portfolioType: "example" | "available") {
  return portfolioType === "available"
    ? "Auta dostepne obecnie"
    : "Przykladowe portfolio importowe";
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
    ? `<a href="${href}" style="color:#111827;text-decoration:none;font-weight:700;">${safeValue}</a>`
    : `<span style="color:#111827;font-weight:700;">${safeValue}</span>`;
  const borderStyle = "padding:0 0 16px;margin:0 0 16px;border-bottom:1px solid #f1f5f9;";

  return `
    <div style="${borderStyle}">
      <div style="font-size:14px;letter-spacing:0.24em;text-transform:uppercase;color:#71717a;">${label}</div>
      <div style="margin-top:10px;font-size:24px;line-height:1.5;">${content}</div>
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

function normalizePhoneHref(value: string) {
  const normalized = value.replace(/[^\d+]/g, "");
  return normalized || value;
}
