import { z } from "zod";

export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const PIN_PATTERN = /^[1-9][0-9]{5}$/;
export const PHONE_PATTERN = /^(?:\+91[\s-]?|0)?[6-9]\d{9}$/;
export const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,119}$/;

export type FieldErrors = Record<string, string>;

export function firstZodMessage(err: z.ZodError): string {
  const issue = err.issues[0];
  return issue?.message || "Please check the form and try again.";
}

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  throw new Error(firstZodMessage(result.error));
}

export function friendlyCaughtError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof z.ZodError) return firstZodMessage(err);
  if (err instanceof Error) {
    const msg = err.message.trim();
    if (!msg) return fallback;
    if (msg.startsWith("[") || msg.startsWith("{")) {
      try {
        const parsed = JSON.parse(msg) as unknown;
        const first = Array.isArray(parsed) ? parsed[0] : parsed;
        if (first && typeof first === "object" && "message" in first && typeof first.message === "string") {
          return first.message;
        }
      } catch {
        return "Please check the form and try again.";
      }
    }
    return msg;
  }
  return fallback;
}

export function validateName(value: string, label = "Name"): string | null {
  const v = value.trim();
  if (!v) return `Enter your ${label.toLowerCase()}.`;
  if (v.length < 2) return `${label} must be at least 2 characters.`;
  if (v.length > 120) return `${label} is too long (120 characters max).`;
  if (!NAME_PATTERN.test(v)) return `${label} can only include letters, spaces, apostrophes, and hyphens.`;
  return null;
}

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter your email address.";
  if (v.length > 160) return "Email is too long.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
  return null;
}

export function validatePhone(value: string, required = false): string | null {
  const v = value.trim();
  if (!v) return required ? "Enter a phone number." : null;
  if (v.length > 15) return "Phone number is too long.";
  if (!PHONE_PATTERN.test(v.replace(/[()\s-]/g, "").replace(/^0/, "0"))) {
    if (!/^[0-9+\s-]{8,15}$/.test(v)) return "Enter a valid phone number.";
  }
  const digits = v.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 12) return "Enter a 10-digit Indian mobile number.";
  return null;
}

export function validatePan(value: string, required = false): string | null {
  const v = value.trim().toUpperCase();
  if (!v) return required ? "Enter PAN for tax-related documentation." : null;
  if (v.length !== 10) return `PAN is 10 characters (${v.length}/10). Format ABCDE1234F.`;
  if (!PAN_PATTERN.test(v)) return "PAN format is five letters, four digits, one letter (ABCDE1234F).";
  return null;
}

export function validatePin(value: string, required = false): string | null {
  const v = value.trim();
  if (!v) return required ? "Enter PIN code." : null;
  if (!PIN_PATTERN.test(v)) return "PIN code must be 6 digits.";
  return null;
}

export function validateCityOrState(value: string, label: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (v.length > 80) return `${label} is too long (80 characters max).`;
  if (!/^[A-Za-z][A-Za-z .'-]{0,79}$/.test(v)) return `${label} can only include letters and spaces.`;
  return null;
}

export function validateAddress(value: string, required = false): string | null {
  const v = value.trim();
  if (!v) return required ? "Enter your address." : null;
  if (v.length > 200) return "Address is too long (200 characters max).";
  return null;
}

export function validateMessage(value: string, opts?: { required?: boolean; min?: number; max?: number }): string | null {
  const v = value.trim();
  const min = opts?.min ?? 10;
  const max = opts?.max ?? 4000;
  if (!v) return opts?.required === false ? null : "Enter a message.";
  if (v.length < min) return `Message must be at least ${min} characters.`;
  if (v.length > max) return `Message is too long (${max} characters max).`;
  return null;
}

export function validateShortText(value: string, label: string, max = 160, required = false): string | null {
  const v = value.trim();
  if (!v) return required ? `Enter ${label.toLowerCase()}.` : null;
  if (v.length > max) return `${label} is too long (${max} characters max).`;
  return null;
}

export function validateDonor(donor: {
  full_name: string;
  email: string;
  phone: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  wants_tax_docs: boolean;
}): FieldErrors {
  const errors: FieldErrors = {};
  const name = validateName(donor.full_name, "Full name");
  if (name) errors.full_name = name;
  const email = validateEmail(donor.email);
  if (email) errors.email = email;
  const phone = validatePhone(donor.phone);
  if (phone) errors.phone = phone;
  if (donor.wants_tax_docs || donor.pan) {
    const pan = validatePan(donor.pan, false);
    if (pan) errors.pan = pan;
    const address = validateAddress(donor.address);
    if (address) errors.address = address;
    const city = validateCityOrState(donor.city, "City");
    if (city) errors.city = city;
    const state = validateCityOrState(donor.state, "State");
    if (state) errors.state = state;
    const pin = validatePin(donor.pin);
    if (pin) errors.pin = pin;
  }
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
