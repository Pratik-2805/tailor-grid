import { LegalPage } from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      sections={[
        {
          id: "acceptance",
          title: "Acceptance of terms",
          body: "By accessing or using RaffuLabs websites, services, or products (including Raffu at raffu.com), you agree to be bound by these terms. If you are using our services on behalf of an enterprise or partner tailoring studio, you confirm you have authority to bind that entity.",
        },
        {
          id: "fit-guarantee",
          title: "In-studio 100% fit guarantee",
          body: "All consumer garment alterations booked via Raffu are accompanied by our 100% Fit Guarantee. Customers try on their freshly altered piece directly inside the allocated partner studio. In the rare event that a garment needs micro-adjustments, your allocated master tailor will refine it complimentary on the spot.",
        },
        {
          id: "studio-standards",
          title: "Partner studio standards",
          body: "Every tailoring atelier allocated via Raffu is verified for certified machinery calibration (OEM blindstitch, overlock, and heavy denim chainstitch) and expert craftsman standards.",
        },
      ]}
    />
  );
}
