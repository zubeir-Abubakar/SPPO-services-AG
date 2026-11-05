import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocale, type Locale } from "@/lib/content";
import { t } from "@/lib/i18n";

export const runtime = "nodejs";

const formspreeEndpoint = "https://formspree.io/f/mgaapzjr";
const maxFileSize = 5 * 1024 * 1024;
const maxRequestSize = 12 * 1024 * 1024;
const departmentDestinations = {
  hr: process.env.CONTACT_HR_EMAIL,
  procurement: process.env.CONTACT_PROCUREMENT_EMAIL,
} as const;
const allowedTypes = new Map([
  [".pdf", "application/pdf"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [
    ".docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
]);
const enquiryValues = [
  "Product enquiry",
  "Customer / Buyer enquiry",
  "Supplier / Producer enquiry",
  "Partnership / Cooperation",
  "Product specifications request",
  "Quality and certification enquiry",
  "General enquiry",
  "Other",
] as const;
const formSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  companyName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  country: z.string().trim().min(2).max(100),
  preferredLanguage: z.enum(["de", "en", "fr", "it", "es"]),
  telephone: z.string().trim().max(50),
  website: z.union([z.literal(""), z.string().trim().url().max(240)]),
  enquiryType: z.enum(enquiryValues),
  department: z.enum(["hr", "procurement"]).optional(),
  productCategories: z.array(z.string().trim().max(100)).max(12),
  productRange: z.string().trim().max(1200),
  estimatedVolume: z.string().trim().max(200),
  productNames: z.string().trim().max(1200),
  origin: z.string().trim().max(300),
  quantity: z.string().trim().max(200),
  deliveryPeriod: z.string().trim().max(200),
  packaging: z.string().trim().max(400),
  specifications: z.string().trim().max(3000),
  message: z.string().trim().min(10).max(6000),
  privacyConsent: z.literal("yes"),
});

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value !== "string" && value !== null;
}

class RequestTooLargeError extends Error {}

async function readBoundedFormData(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing contact form body");
  const chunks: Buffer[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxRequestSize) {
        await reader.cancel().catch(() => undefined);
        throw new RequestTooLargeError();
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  const headers = new Headers(request.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  const boundedRequest = new Request(request.url, {
    method: "POST",
    headers,
    body: Buffer.concat(chunks, total),
  });
  return boundedRequest.formData();
}

async function hasExpectedSignature(file: File, extension: string) {
  const signature = Buffer.from(await file.slice(0, 12).arrayBuffer());
  if (extension === ".pdf") return signature.subarray(0, 5).toString() === "%PDF-";
  if (extension === ".jpeg") {
    return signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  }
  if (extension === ".png") {
    return signature.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (extension === ".docx") {
    return signature[0] === 0x50 && signature[1] === 0x4b;
  }
  return false;
}

export async function POST(request: Request) {
  const localeHeader = request.headers.get("x-ppo-locale");
  const responseLocale: Locale =
    localeHeader && isLocale(localeHeader) ? localeHeader : "en";
  const origin = request.headers.get("origin");
  let validOrigin = true;
  if (origin) {
    try {
      validOrigin = new URL(origin).origin === new URL(request.url).origin;
    } catch {
      validOrigin = false;
    }
  }
  if (!validOrigin) {
    return NextResponse.json(
      { message: t(responseLocale, "invalidOrigin") },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxRequestSize) {
    return NextResponse.json(
      { message: t(responseLocale, "requestTooLarge") },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  let formData: FormData;
  try {
    formData = await readBoundedFormData(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) {
      return NextResponse.json(
        { message: t(responseLocale, "requestTooLarge") },
        { status: 413, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { message: t(responseLocale, "formUnreadable") },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (String(formData.get("companyFax") ?? "").trim()) {
    return NextResponse.json(
      { message: t(responseLocale, "invalidSubmission") },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const submittedLocale = formData.get("locale");
  const locale: Locale = typeof submittedLocale === "string" && isLocale(submittedLocale)
    ? submittedLocale
    : "en";
  const parsed = formSchema.safeParse({
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    country: formData.get("country"),
    preferredLanguage: formData.get("preferredLanguage"),
    telephone: formData.get("telephone") ?? "",
    website: formData.get("website") ?? "",
    enquiryType: formData.get("enquiryType"),
    department: formData.get("department") ?? undefined,
    productCategories: formData.getAll("productCategories"),
    productRange: formData.get("productRange") ?? "",
    estimatedVolume: formData.get("estimatedVolume") ?? "",
    productNames: formData.get("productNames") ?? "",
    origin: formData.get("origin") ?? "",
    quantity: formData.get("quantity") ?? "",
    deliveryPeriod: formData.get("deliveryPeriod") ?? "",
    packaging: formData.get("packaging") ?? "",
    specifications: formData.get("specifications") ?? "",
    message: formData.get("message"),
    privacyConsent: formData.get("privacyConsent"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !errors[field]) {
        errors[field] = t(locale, "invalidFields");
      }
    }
    return NextResponse.json(
      { message: t(locale, "invalidFields"), errors },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const files = formData.getAll("attachments").filter(isFile).filter((file) => file.size > 0);
  if (files.length > 4) {
    return NextResponse.json(
      {
        message: t(locale, "attachmentCount"),
        errors: { attachments: t(locale, "attachmentCount") },
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  let attachmentBytes = 0;
  for (const file of files) {
    const dot = file.name.lastIndexOf(".");
    const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
    const expectedType = allowedTypes.get(extension);
    if (
      !expectedType ||
      file.type !== expectedType ||
      file.size > maxFileSize ||
      !(await hasExpectedSignature(file, extension))
    ) {
      return NextResponse.json(
        {
          message: t(locale, "attachmentInvalid"),
          errors: { attachments: t(locale, "attachmentInvalid") },
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    attachmentBytes += file.size;
  }
  if (attachmentBytes > 10 * 1024 * 1024) {
    return NextResponse.json(
      {
        message: t(locale, "attachmentCombined"),
        errors: { attachments: t(locale, "attachmentCombined") },
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const data = parsed.data;
  const outboundData = new FormData();
  outboundData.set("fullName", data.fullName);
  outboundData.set("companyName", data.companyName);
  outboundData.set("email", data.email);
  outboundData.set("_replyto", data.email);
  outboundData.set("_subject", `[PPO Website] ${data.enquiryType}`);
  outboundData.set("country", data.country);
  outboundData.set("preferredLanguage", data.preferredLanguage);
  outboundData.set("telephone", data.telephone);
  outboundData.set("website", data.website);
  outboundData.set("enquiryType", data.enquiryType);
  if (data.department) {
    outboundData.set("department", data.department);
    const destination = departmentDestinations[data.department];
    if (destination) outboundData.set("_to", destination);
  }
  outboundData.set("productCategories", data.productCategories.join(", "));
  outboundData.set("productRange", data.productRange);
  outboundData.set("estimatedVolume", data.estimatedVolume);
  outboundData.set("productNames", data.productNames);
  outboundData.set("origin", data.origin);
  outboundData.set("quantity", data.quantity);
  outboundData.set("deliveryPeriod", data.deliveryPeriod);
  outboundData.set("packaging", data.packaging);
  outboundData.set("specifications", data.specifications);
  outboundData.set("message", data.message);
  outboundData.set("locale", locale);
  for (const file of files) {
    outboundData.append("attachments", file, file.name);
  }

  try {
    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: outboundData,
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      console.error("Formspree contact delivery failed with status:", response.status);
      return NextResponse.json(
        { message: t(locale, "formFailed") },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }
  } catch (error) {
    console.error(
      "Formspree contact delivery failed:",
      error instanceof Error ? error.message : "Unknown network error",
    );
    return NextResponse.json(
      {
        message: t(locale, "formFailed"),
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { message: t(locale, "accepted") },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
