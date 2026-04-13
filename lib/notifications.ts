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
      subject: "Zapytanie klienta o samochód ze strony",
      text: [
        "Zapytanie klienta o samochód ze strony",
        "",
        `Samochód: ${inquiry.carName}`,
        `Portfolio: ${
          inquiry.portfolioType === "available"
            ? "Auta dostępne obecnie"
            : "Przykładowe portfolio importowe"
        }`,
        `Imię i nazwisko: ${inquiry.customerName}`,
        `E-mail: ${inquiry.email}`,
        `Telefon: ${inquiry.phone}`,
        `Wiadomość: ${inquiry.message || "Brak dodatkowej wiadomości"}`,
      ].join("\n"),
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
    Body: [
      "Zapytanie klienta o samochód ze strony",
      `Samochód: ${inquiry.carName}`,
      `Portfolio: ${
        inquiry.portfolioType === "available"
          ? "Auta dostępne obecnie"
          : "Przykładowe portfolio importowe"
      }`,
      `Imię i nazwisko: ${inquiry.customerName}`,
      `E-mail: ${inquiry.email}`,
      `Telefon: ${inquiry.phone}`,
      `Wiadomość: ${inquiry.message || "Brak dodatkowej wiadomości"}`,
    ].join("\n"),
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
