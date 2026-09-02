const TOKEN = "applicant_token";
const EXPIRY = "applicant_expiry";
const NUMBER = "applicant_number";
const NAME = "applicant_name";

function tokenExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, applicantNumber: string, name?: string) {
  localStorage.setItem(TOKEN, token);
  localStorage.setItem(EXPIRY, String(tokenExpiryMs(token) ?? Date.now() + 4 * 60 * 60 * 1000));
  localStorage.setItem(NUMBER, applicantNumber);
  if (name) localStorage.setItem(NAME, name);
}

export function clearSession() {
  [TOKEN, EXPIRY, NUMBER, NAME].forEach(k => localStorage.removeItem(k));
}

export function isApplicantLoggedIn(): boolean {
  const token = localStorage.getItem(TOKEN);
  const expiry = localStorage.getItem(EXPIRY);
  if (!token) return false;
  if (expiry && Date.now() > Number(expiry)) {
    clearSession();
    return false;
  }
  return true;
}

export function getApplicantToken(): string | null {
  return localStorage.getItem(TOKEN);
}

export function getApplicantNumber(): string | null {
  return localStorage.getItem(NUMBER);
}

export function getApplicantName(): string | null {
  return localStorage.getItem(NAME);
}
