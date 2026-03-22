import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Award, Users, Lightbulb } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Advertising Unplugged was founded to bridge the gap between enterprise-level brand strategy and the entrepreneurs who need it most.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[var(--navy)] via-[#1e2538] to-[#141824] px-6 pb-20 pt-28 text-center text-white">
          <h1 className="font-[family-name:var(--font-oswald)] text-4xl font-bold sm:text-5xl">
            Clarity Over Noise.
            <br />
            <span className="text-[var(--teal)]">Purpose Beyond Profit.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Advertising Unplugged was founded to bridge the gap between
            enterprise-level brand strategy and the entrepreneurs who need it most.
          </p>
        </section>

        {/* Story */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
            Our Story
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-gray-700">
            <p>
              After 15+ years in brand strategy and advertising&mdash;working
              with brands across Europe&mdash;founder Gabriel Adrian Eremia saw
              the same pattern repeat: talented entrepreneurs with great products
              were struggling with generic marketing advice that didn&rsquo;t
              fit their reality.
            </p>
            <p>
              The consulting world offered two extremes: expensive agencies
              charging tens of thousands for strategies, or free content that
              was too generic to execute. There was nothing in between.
            </p>
            <p>
              Advertising Unplugged changes that. By combining AI with proven
              strategic frameworks, we deliver personalized, actionable brand
              strategies in 24 hours&mdash;at a fraction of the cost.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="bg-off-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
              What We Believe
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {[
                {
                  icon: <Lightbulb className="h-6 w-6" />,
                  title: "Clarity Over Noise",
                  text: "The best strategy is the one you can actually execute. We cut through marketing jargon to deliver clear, actionable plans.",
                },
                {
                  icon: <Users className="h-6 w-6" />,
                  title: "Community Over Competition",
                  text: "Growth happens faster together. Our 90-Day Challenge and community create real accountability and shared learning.",
                },
                {
                  icon: <Award className="h-6 w-6" />,
                  title: "Purpose Beyond Profit",
                  text: "We believe in building brands that stand for something. Strategy without purpose is just noise.",
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl border border-gray-200 bg-white p-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--teal)]/10 text-[var(--teal)]">
                    {value.icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-oswald)] text-lg font-bold text-[var(--navy)]">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 text-center">
          <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
            Ready to Build Your Strategy?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Join thousands of entrepreneurs who chose clarity over noise.
          </p>
          <a
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--coral)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[var(--coral)]/25 transition-all hover:bg-[var(--coral-hover)] hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
