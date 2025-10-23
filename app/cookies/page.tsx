import CookiesSettingsPage from "../components/CookieSettingsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies Settings | Starnet",
  description: "Manage your cookie preferences.",
};

export default function CookieConsent() {
  return <CookiesSettingsPage />;
}
