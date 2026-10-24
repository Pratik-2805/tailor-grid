import { LegalPage } from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        {
          id: "information-we-collect",
          title: "Information we collect",
          body: "RaffuLabs and its consumer platform, Raffu (raffu.com), collect information strictly necessary to allocate tailoring orders and provide accurate garment alterations. This includes your contact details, city/neighborhood postcode, garment specifications, and allocated studio appointment QR passes.",
        },
        {
          id: "how-we-protect-your-data",
          title: "How we protect your data",
          body: "We never sell, rent, or trade your personal data. Your garment alteration notes and contact details are shared exclusively with your allocated certified atelier partner for fitting, tailoring, and order completion.",
        },
        {
          id: "contact",
          title: "Contact us regarding privacy",
          body: (
            <>
              If you have questions about our privacy policies or wish to request data deletion, contact us at{" "}
              <a href="mailto:privacy@raffulabs.in" className="font-semibold text-clay hover:underline">privacy@raffulabs.in</a>.
            </>
          ),
        },
      ]}
    />
  );
}
