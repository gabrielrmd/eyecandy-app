import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Advertising Unplugged platform.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-[var(--navy)]">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: March 22, 2026</p>

        <div className="prose prose-gray mt-10 max-w-none space-y-6 text-gray-700 leading-relaxed">
          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">1. Acceptance of Terms</h2>
          <p>By accessing or using the Advertising Unplugged platform (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">2. Description of Service</h2>
          <p>Advertising Unplugged provides AI-powered brand strategy tools, marketing templates, and community features. The Service includes the AI Strategy Builder, Template Toolkit, 90-Day Growth Challenge, and related features.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">3. User Accounts</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">4. Payment Terms</h2>
          <p>Paid features are billed through Stripe. Subscription plans renew automatically unless cancelled. Refunds are available within 14 days for subscriptions and 7 days for one-time purchases if unused.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">5. Intellectual Property</h2>
          <p>Strategies and content you create using the Service belong to you. The platform, its design, templates, and AI models remain the intellectual property of Advertising Unplugged.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">6. Limitation of Liability</h2>
          <p>The Service is provided &ldquo;as is.&rdquo; Advertising Unplugged is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">7. Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:gabriel@marketingdepartment.ro" className="text-[var(--teal)] hover:underline">gabriel@marketingdepartment.ro</a>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
