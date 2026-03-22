import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Advertising Unplugged platform.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-[var(--navy)]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: March 22, 2026</p>

        <div className="prose prose-gray mt-10 max-w-none space-y-6 text-gray-700 leading-relaxed">
          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email address, company details, and payment information. We also collect usage data including pages visited, features used, and device information.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">2. How We Use Your Information</h2>
          <p>Your information is used to provide and improve the Service, process payments, send relevant communications, and personalize your experience. Strategy questionnaire responses are processed by AI to generate your brand strategy.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">3. Data Storage &amp; Security</h2>
          <p>Your data is stored securely using Supabase (hosted on AWS infrastructure in the EU). Payment data is processed by Stripe and never stored on our servers. We use industry-standard encryption in transit and at rest.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">4. Third-Party Services</h2>
          <p>We use the following third-party services: Supabase (database &amp; authentication), Stripe (payments), and Anthropic Claude (AI strategy generation). Each operates under its own privacy policy.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">5. Your Rights (GDPR)</h2>
          <p>If you are in the EU, you have the right to access, correct, delete, or export your personal data. You may also object to processing or withdraw consent at any time. Contact us to exercise these rights.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">6. Data Retention</h2>
          <p>We retain your data for as long as your account is active. Upon account deletion, personal data is removed within 30 days. Anonymized analytics data may be retained longer.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">7. Contact</h2>
          <p>For privacy inquiries, contact our Data Controller at <a href="mailto:gabriel@marketingdepartment.ro" className="text-[var(--teal)] hover:underline">gabriel@marketingdepartment.ro</a>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
