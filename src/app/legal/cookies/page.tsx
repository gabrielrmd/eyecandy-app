import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy for Advertising Unplugged platform.",
};

export default function CookiePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-[var(--navy)]">
          Cookie Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: March 22, 2026</p>

        <div className="prose prose-gray mt-10 max-w-none space-y-6 text-gray-700 leading-relaxed">
          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">1. What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better experience by remembering your preferences and login state.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">2. Essential Cookies</h2>
          <p>These cookies are required for the platform to function. They include authentication session cookies (managed by Supabase) and security tokens. You cannot opt out of essential cookies.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">3. Analytics Cookies</h2>
          <p>We may use analytics cookies to understand how visitors interact with our platform. This data is aggregated and anonymous. You can opt out of analytics cookies through your browser settings.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">4. Third-Party Cookies</h2>
          <p>Stripe may set cookies for payment processing and fraud prevention. These are governed by Stripe&rsquo;s own cookie policy.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">5. Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from using certain features of the platform.</p>

          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">6. Contact</h2>
          <p>For questions about our cookie practices, contact us at <a href="mailto:gabriel@marketingdepartment.ro" className="text-[var(--teal)] hover:underline">gabriel@marketingdepartment.ro</a>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
