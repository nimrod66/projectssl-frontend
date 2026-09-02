export function withUploadToken(url?: string | null): string {
  if (!url) return "#";
  const token =
    localStorage.getItem("applicant_token") ||
    localStorage.getItem("token") ||
    "";
  if (!token || url.includes("token=")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
}
