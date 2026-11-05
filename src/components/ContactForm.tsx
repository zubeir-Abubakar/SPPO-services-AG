"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { type Locale, ppo } from "@/lib/content";
import { enquiryOptions, t } from "@/lib/i18n";

type FormResponse = { message?: string; errors?: Record<string, string> };

export function ContactForm({
  locale,
  categories,
  initialProduct = "",
  initialEnquiry = "",
}: {
  locale: Locale;
  categories: { id: string; name: string }[];
  initialProduct?: string;
  initialEnquiry?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [enquiryType, setEnquiryType] = useState(initialEnquiry);
  const showProductInformation = [
    "Product enquiry",
    "Customer / Buyer enquiry",
    "Product specifications request",
  ].includes(enquiryType);
  const showSupplierInformation = enquiryType === "Supplier / Producer enquiry";
  const showAttachments = showProductInformation || showSupplierInformation;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;
    if (!event.currentTarget.reportValidity()) return;
    setFieldErrors({});
    setStatus(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "x-ppo-locale": locale },
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json()) as FormResponse;
      if (!response.ok) {
        if (result.errors) setFieldErrors(result.errors);
        setStatus({ type: "error", message: result.message ?? t(locale, "formFailed") });
        return;
      }
      setStatus({ type: "success", message: result.message ?? t(locale, "accepted") });
      const form = formRef.current;
      form?.reset();
      const enquiryField = form?.elements.namedItem("enquiryType");
      if (enquiryField instanceof HTMLSelectElement) enquiryField.value = "";
      const productNames = form?.elements.namedItem("productNames");
      if (productNames instanceof HTMLTextAreaElement) productNames.value = "";
      setEnquiryType("");
    } catch {
      setStatus({ type: "error", message: t(locale, "formFailed") });
    } finally {
      setIsSending(false);
    }
  }

  function fieldError(name: string) {
    return fieldErrors[name] ? (
      <span className="field-error" id={`${name}-error`}>
        {fieldErrors[name]}
      </span>
    ) : (
      <span className="field-error" aria-hidden="true" />
    );
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${ppo.map.lat}%2C${ppo.map.lng}`;
  const embedUrl = `https://maps.google.com/maps?q=${ppo.map.lat}%2C${ppo.map.lng}&z=15&output=embed`;
  const countryName = {
    de: "Schweiz",
    en: "Switzerland",
    fr: "Suisse",
    it: "Svizzera",
    es: "Suiza",
  }[locale];
  const address = [
    "PPO Services AG",
    "Herrenmattstrasse 2",
    "Postfach",
    "CH-4658 Däniken",
    countryName,
  ];

  return (
    <div className="contact-layout">
      <div className="contact-form-shell">
        <form className="contact-form" ref={formRef} onSubmit={submit} noValidate>
          <input type="hidden" name="locale" value={locale} />
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="company-fax">Fax</label>
            <input id="company-fax" name="companyFax" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="form-section">
            <div className="form-section-heading">
              <h2>{t(locale, "contactInformation")}</h2>
              <span className="required-note">* {t(locale, "requiredFields")}</span>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="fullName">{t(locale, "fullName")} *</label>
                <input id="fullName" name="fullName" autoComplete="name" minLength={2} maxLength={120} required aria-required="true" aria-invalid={Boolean(fieldErrors.fullName)} aria-describedby="fullName-error" />
                {fieldError("fullName")}
              </div>
              <div className="field">
                <label htmlFor="companyName">{t(locale, "companyName")} *</label>
                <input id="companyName" name="companyName" autoComplete="organization" minLength={2} maxLength={160} required aria-required="true" aria-invalid={Boolean(fieldErrors.companyName)} aria-describedby="companyName-error" />
                {fieldError("companyName")}
              </div>
              <div className="field">
                <label htmlFor="email">{t(locale, "businessEmail")} *</label>
                <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required aria-required="true" aria-invalid={Boolean(fieldErrors.email)} aria-describedby="email-error" />
                {fieldError("email")}
              </div>
              <div className="field">
                <label htmlFor="country">{t(locale, "country")} *</label>
                <input id="country" name="country" autoComplete="country-name" minLength={2} maxLength={100} required aria-required="true" aria-invalid={Boolean(fieldErrors.country)} aria-describedby="country-error" />
                {fieldError("country")}
              </div>
              <div className="field">
                <label htmlFor="preferredLanguage">{t(locale, "preferredLanguage")}</label>
                <select id="preferredLanguage" name="preferredLanguage" defaultValue={locale}>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="it">Italiano</option>
                  <option value="es">Español</option>
                </select>
                {fieldError("preferredLanguage")}
              </div>
              <div className="field">
                <label htmlFor="telephone">{t(locale, "telephone")}</label>
                <input id="telephone" name="telephone" type="tel" autoComplete="tel" aria-invalid={Boolean(fieldErrors.telephone)} aria-describedby="telephone-error" />
                {fieldError("telephone")}
              </div>
              <div className="field field-wide">
                <label htmlFor="website">{t(locale, "website")}</label>
                <input id="website" name="website" type="url" autoComplete="url" placeholder="https://" aria-invalid={Boolean(fieldErrors.website)} aria-describedby="website-error" />
                {fieldError("website")}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-heading"><h2>{t(locale, "enquiry")}</h2></div>
            <div className="field">
              <label htmlFor="enquiryType">{t(locale, "enquiry")} *</label>
              <select
                id="enquiryType"
                name="enquiryType"
                required
                aria-required="true"
                defaultValue={initialEnquiry}
                aria-invalid={Boolean(fieldErrors.enquiryType)}
                aria-describedby="enquiryType-error"
                onChange={(event) => setEnquiryType(event.target.value)}
              >
                <option value="">{t(locale, "selectOption")}</option>
                {enquiryOptions(locale).map((option) => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
              {fieldError("enquiryType")}
            </div>
          </div>

          {showProductInformation && (
            <div className="form-section">
              <div className="form-section-heading"><h2>{t(locale, "productInformation")}</h2></div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="productCategories">{t(locale, "productCategory")}</label>
                  <select id="productCategories" name="productCategories" defaultValue="" aria-invalid={Boolean(fieldErrors.productCategories)} aria-describedby="productCategories-error">
                    <option value="">{t(locale, "selectOption")}</option>
                    {categories.map((category) => (
                      <option value={category.name} key={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {fieldError("productCategories")}
                </div>
                <div className="field">
                  <label htmlFor="productNames">{t(locale, "productName")}</label>
                  <textarea id="productNames" name="productNames" defaultValue={initialProduct} rows={4} aria-invalid={Boolean(fieldErrors.productNames)} aria-describedby="productNames-error" />
                  {fieldError("productNames")}
                </div>
                <div className="field">
                  <label htmlFor="origin">{t(locale, "origin")}</label>
                  <input id="origin" name="origin" aria-invalid={Boolean(fieldErrors.origin)} aria-describedby="origin-error" />
                  {fieldError("origin")}
                </div>
                <div className="field">
                  <label htmlFor="quantity">{t(locale, "quantity")}</label>
                  <input id="quantity" name="quantity" aria-invalid={Boolean(fieldErrors.quantity)} aria-describedby="quantity-error" />
                  {fieldError("quantity")}
                </div>
                <div className="field">
                  <label htmlFor="deliveryPeriod">{t(locale, "deliveryPeriod")}</label>
                  <input id="deliveryPeriod" name="deliveryPeriod" aria-invalid={Boolean(fieldErrors.deliveryPeriod)} aria-describedby="deliveryPeriod-error" />
                  {fieldError("deliveryPeriod")}
                </div>
                <div className="field">
                  <label htmlFor="packaging">{t(locale, "packaging")}</label>
                  <input id="packaging" name="packaging" aria-invalid={Boolean(fieldErrors.packaging)} aria-describedby="packaging-error" />
                  {fieldError("packaging")}
                </div>
                <div className="field field-wide">
                  <label htmlFor="specifications">{t(locale, "specifications")}</label>
                  <textarea id="specifications" name="specifications" rows={3} aria-invalid={Boolean(fieldErrors.specifications)} aria-describedby="specifications-error" />
                  {fieldError("specifications")}
                </div>
              </div>
            </div>
          )}
          {showSupplierInformation && (
            <div className="form-section">
              <div className="form-section-heading"><h2>{t(locale, "productInformation")}</h2></div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="productCategories">{t(locale, "productCategory")}</label>
                  <select id="productCategories" name="productCategories" defaultValue="" aria-invalid={Boolean(fieldErrors.productCategories)} aria-describedby="productCategories-error">
                    <option value="">{t(locale, "selectOption")}</option>
                    {categories.map((category) => (
                      <option value={category.name} key={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {fieldError("productCategories")}
                </div>
                <div className="field">
                  <label htmlFor="origin">{t(locale, "origin")}</label>
                  <input id="origin" name="origin" aria-invalid={Boolean(fieldErrors.origin)} aria-describedby="origin-error" />
                  {fieldError("origin")}
                </div>
                <div className="field field-wide">
                  <label htmlFor="productRange">{t(locale, "productRange")}</label>
                  <textarea id="productRange" name="productRange" rows={3} maxLength={1200} aria-invalid={Boolean(fieldErrors.productRange)} aria-describedby="productRange-error" />
                  {fieldError("productRange")}
                </div>
                <div className="field field-wide">
                  <label htmlFor="estimatedVolume">{t(locale, "estimatedVolume")}</label>
                  <input id="estimatedVolume" name="estimatedVolume" maxLength={200} aria-invalid={Boolean(fieldErrors.estimatedVolume)} aria-describedby="estimatedVolume-error" />
                  {fieldError("estimatedVolume")}
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <div className="form-section-heading"><h2>{t(locale, "message")}</h2></div>
            <div className="field">
              <label htmlFor="message">{t(locale, "message")} *</label>
              <textarea id="message" name="message" minLength={10} maxLength={6000} required aria-required="true" placeholder={t(locale, "messagePlaceholder")} aria-invalid={Boolean(fieldErrors.message)} aria-describedby="message-error" />
              {fieldError("message")}
            </div>
            {showAttachments && (
              <div className="field">
                <label htmlFor="attachments">{showSupplierInformation ? t(locale, "supportingDocuments") : t(locale, "attachments")}</label>
                <input id="attachments" name="attachments" type="file" multiple accept=".pdf,.docx,.png,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg" aria-invalid={Boolean(fieldErrors.attachments)} aria-describedby="attachments-hint attachments-error" />
                <span className="field-hint" id="attachments-hint">{t(locale, "attachmentHelp")}</span>
                {fieldError("attachments")}
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-check">
              <input id="privacyConsent" name="privacyConsent" type="checkbox" value="yes" required aria-required="true" aria-invalid={Boolean(fieldErrors.privacyConsent)} aria-describedby="privacyConsent-error" />
              <label htmlFor="privacyConsent">
                {t(locale, "privacy")}{" "}
                <Link href={`/${locale}/privacy`}>{t(locale, "privacyPolicy")}</Link>.
              </label>
            </div>
            {fieldError("privacyConsent")}
            <p className="field-hint">
              {t(locale, "formProcessingNotice")}{" "}
              <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noreferrer">
                {t(locale, "privacyPolicy")}
              </a>
            </p>
          </div>

          {status && (
            <p className={`form-alert form-alert-${status.type}`} role={status.type === "error" ? "alert" : "status"}>
              {status.message}
            </p>
          )}
          <button className="button button-primary submit-button" type="submit" disabled={isSending} aria-busy={isSending}>
            {isSending ? t(locale, "sending") : t(locale, "submit")}
          </button>
        </form>
      </div>

      <aside className="contact-aside">
        <section className="contact-card">
          <h2>{t(locale, "contactDetails")}</h2>
          <address>
            {address.map((line) => <span key={line}>{line}<br /></span>)}
          </address>
          <p>
            <a href="tel:+41622075454">+41 62 207 54 54</a><br />
            <a href="mailto:info@ppo.ch">info@ppo.ch</a>
          </p>
        </section>
        <section className="contact-card">
          <h2>{t(locale, "visitUs")}</h2>
          <iframe
            className="map-frame"
            title={t(locale, "visitUs")}
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a className="text-link map-link" href={mapUrl} target="_blank" rel="noreferrer">
            {t(locale, "mapLink")} ↗
          </a>
        </section>
      </aside>
    </div>
  );
}
