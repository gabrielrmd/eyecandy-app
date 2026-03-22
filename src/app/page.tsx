import Image from "next/image";
import Link from "next/link";
import { UrgencyBar } from "@/components/landing/urgency-bar";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Reveal } from "@/components/landing/reveal";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { PricingToggle } from "@/components/landing/pricing-toggle";

/* ─── Icon helper (inline SVG) ─── */
function Icon({ children, color = "teal" }: { children: React.ReactNode; color?: string }) {
  const bg = color === "teal" ? "rgba(42,185,176,0.08)" : color === "orange" ? "rgba(242,140,40,0.08)" : color === "green" ? "rgba(142,209,106,0.08)" : "rgba(248,206,48,0.1)";
  return (
    <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-[18px] relative overflow-hidden" style={{ background: bg }}>
      {children}
    </div>
  );
}

/* ─── Section header helper ─── */
function SectionHeader({ tag, title, sub, white, center = true }: { tag: string; title: string; sub?: string; white?: boolean; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <Reveal><span className="inline-block text-[var(--teal)] text-[12px] font-bold tracking-[2.5px] uppercase mb-3">{tag}</span></Reveal>
      <Reveal>
        <h2 className={`font-[family-name:var(--font-oswald)] text-[clamp(30px,4vw,44px)] font-bold leading-[1.1] max-w-[750px] uppercase ${center ? "mx-auto" : ""} ${white ? "text-white" : "text-[var(--charcoal)]"}`}>
          {title}
        </h2>
      </Reveal>
      <Reveal><span className={`block w-20 h-1 bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] rounded mt-3 ${center ? "mx-auto" : ""}`} /></Reveal>
      {sub && <Reveal><p className={`text-[16px] max-w-[580px] leading-[1.7] mt-3.5 ${center ? "mx-auto" : ""} ${white ? "text-white/50" : "text-[var(--mid-gray)]"}`}>{sub}</p></Reveal>}
    </div>
  );
}

/* ─── FAQ data ─── */
const faqItems = [
  { q: "How does the platform work?", a: "Start with the AI Strategy Builder — answer 39 expert questions and get a 15-section strategy deck. Then use our 41 templates to execute. Join the Unplugged Circle for community and accountability. And when you're ready to go deeper, book 1-on-1 consulting with our founder. Each step builds on the last." },
  { q: "I've been in marketing for 15 years. Is this too basic for me?", a: "This isn't a beginner course — it's a strategic operating system. The AI Strategy Builder encodes frameworks like brand archetypes, Jobs-To-Be-Done, competitive positioning, and customer journey mapping into a structured 39-question, 15-section workflow. If you're a marketing director, you'll use it to align your team. If you're a consultant, you'll use it to deliver more value to clients faster. The methodology is validated by industry experts and award juries — it scales up, not down." },
  { q: "How is this different from ChatGPT or other AI tools?", a: "ChatGPT gives you generic output based on generic prompts. Advertising Unplugged encodes a complete 15-year methodology into a structured system — 39 questions mapped to 7 strategic areas, producing a 15-section deck with brand archetypes, JTBD analysis, competitive mapping, persona profiles, and a 90-day execution roadmap. Plus you get 41 templates, a strategic community, and direct access to our founder. It's the difference between a search engine and a strategist." },
  { q: "Can agencies white-label the product?", a: "Yes. The Agency plan lets you generate strategy decks under your own brand. You get multi-seat access (5–20), custom templates for your verticals, dedicated onboarding, and API access. Your clients see your brand. You deliver award-winning methodology." },
  { q: "What training and workshop topics are available?", a: "Advertising Unplugged offers corporate training across marketing strategy, product management, business development, PR, public affairs, sustainability, and digital transformation. Each workshop is customized to your team's growth stage, industry context, and strategic priorities — led by our founder, Gabriel Adrian Eremia." },
  { q: "Can I refine my strategy after it's generated?", a: "Yes. Professional and Agency plans include strategy refinements so your strategy evolves as your business does. For deeper guidance, book a 1-on-1 session with our founder at €300/hour." },
  { q: "What if it doesn't work for me?", a: "Every paid plan includes a 14-day money-back guarantee. No questions asked. If you don't feel the strategy brings clarity and direction, you get your money back." },
  { q: "This is new — how do I know it works?", a: "The platform is new. The methodology behind it has 15+ years of proof — award-winning campaigns, strategies deployed across FMCG, tech, retail, finance, healthcare, and education. It's been validated by industry experts, tested on stages reaching 450,000+ entrepreneurs, and refined in MBA classrooms. Early access means launch pricing — not untested thinking." },
  { q: "Is my data secure?", a: "Your data is hosted on EU-based servers via Supabase, fully GDPR compliant, and encrypted at rest and in transit. We never sell or share your data." },
];

export default function HomePage() {
  return (
    <>
      <UrgencyBar />
      <LandingNavbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="bg-[linear-gradient(160deg,#0e0e1e_0%,#1A1A2E_40%,#1e1838_70%,#1A1A2E_100%)] text-white py-[100px] px-5 sm:px-10 relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Orbs */}
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[90px] opacity-40 -top-[150px] -right-20 bg-[radial-gradient(circle,rgba(42,185,176,0.15),transparent_70%)]" style={{ animation: "orb-float 20s ease-in-out infinite" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[90px] opacity-40 -bottom-[100px] -left-20 bg-[radial-gradient(circle,rgba(242,140,40,0.1),transparent_70%)]" style={{ animation: "orb-float 20s ease-in-out infinite 7s" }} />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(42,185,176,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(42,185,176,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black_20%,transparent_100%)]" />

        <div className="relative z-2 max-w-[860px] text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-[rgba(42,185,176,0.1)] border border-[rgba(42,185,176,0.2)] text-[var(--teal)] px-5 py-2 rounded-full text-[12px] font-bold tracking-[1.5px] uppercase mb-8">
              <span className="w-2 h-2 bg-[var(--teal)] rounded-full" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
              Now in Early Access
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-[family-name:var(--font-oswald)] text-[clamp(42px,6vw,72px)] font-bold leading-[1.05] tracking-[1px] uppercase mb-6">
              15 Years of Strategy. Tested, Deployed, and<br />
              <span className="bg-[linear-gradient(135deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] bg-clip-text text-transparent">Proven in Real Markets.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-[18px] text-white/65 max-w-[650px] mx-auto leading-[1.7] mb-5">
              That experience is exactly why we built Advertising Unplugged — to give every business access to the same tools, frameworks, and methodology that won Gold Effies and shaped brands across 7+ industries.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              {["Business Review", "AdHugger", "IQads", "Business Days", "Forbes MarComm"].map((m) => (
                <span key={m} className="inline-flex items-center bg-white/[0.04] border border-white/[0.07] px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white/45 tracking-[0.8px] uppercase hover:bg-[rgba(42,185,176,0.1)] hover:text-[var(--teal)] hover:border-[rgba(42,185,176,0.2)] transition-all">
                  {m}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex justify-center gap-12 mb-12 flex-wrap">
              {[
                { n: "15+", l: "Leading brand strategy for market leaders" },
                { n: "Award-Winning", l: "Validated by industry experts" },
                { n: "64+", l: "Published on IQads, Business Review, AdHugger" },
                { n: "450K+", l: "Reached through Business Days ecosystem" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="font-[family-name:var(--font-oswald)] text-[36px] font-bold text-white leading-[1.1]">{s.n}</div>
                  <div className="text-[11px] text-white/40 uppercase tracking-[1.2px] mt-1 font-semibold">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex gap-3.5 justify-center flex-wrap">
              <a href="#pricing" className="bg-[var(--teal)] text-[var(--navy)] px-9 py-4 rounded-[10px] text-[15px] font-bold shadow-[0_4px_24px_rgba(42,185,176,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(42,185,176,0.35)] transition-all inline-flex items-center gap-2 relative overflow-hidden">
                See the Platform in Action
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#who-its-for" className="bg-white/5 text-white px-9 py-4 rounded-[10px] text-[15px] font-semibold border border-white/10 hover:bg-white/10 hover:border-[rgba(42,185,176,0.4)] transition-all inline-flex items-center gap-2">
                View Plans &amp; Pricing
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-6 text-[12px] text-white/30 flex items-center justify-center gap-4 flex-wrap">
              <span>14-day money-back guarantee</span><span>&bull;</span><span>Built on real campaign methodology</span><span>&bull;</span><span>Strategy + execution + mentorship</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-1 bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)]" />

      {/* ═══════════ PROBLEM ═══════════ */}
      <section className="py-28 px-5 sm:px-10 bg-white">
        <div className="max-w-[1140px] mx-auto">
          <SectionHeader
            tag="The Real Problem"
            title="You Don't Have a Marketing Problem. You Have a Clarity Problem."
            sub="You've sat in the meetings. You've seen the decks. You've hired the agencies. And yet — your strategy still feels like a patchwork of borrowed frameworks, gut calls, and templates that were designed for someone else's business. The problem isn't effort. It's architecture."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { icon: "clock", title: "Strategy Is Either Expensive or Generic", desc: "A decent agency charges €5,000–€50,000 and takes 4–12 weeks. A free template from the internet gives you structure without substance. Neither option gives you what you actually need: a strategic framework built on proven methodology that adapts to YOUR market, YOUR competitive landscape, YOUR growth stage — delivered at the speed your business demands.", color: "teal" as const },
              { icon: "tool", title: "You Know the Theory. Execution Is Where It Falls Apart.", desc: "You understand positioning. You've read about Jobs-To-Be-Done. You know what a customer journey map should look like. But translating that knowledge into a coherent strategy for your specific business, with your specific constraints? That's the gap where most marketing leaders, founders, and consultants get stuck — caught between knowing and doing.", color: "orange" as const },
              { icon: "chart", title: "Tools Without Context Are Just More Noise", desc: "The market is flooded with AI content generators, template libraries, and \"growth hacking\" playbooks. None of them know your industry. None of them have been stress-tested across FMCG, durables, tech, retail, finance, healthcare, and education. None of them were built by someone who's actually had to defend a strategy to a board. Until now.", color: "green" as const },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1} className="h-full">
                <div className="h-full bg-[var(--light-gray)] border border-[#e8eaed] rounded-2xl p-9 text-left transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" />
                  <Icon color={card.color}>
                    {card.icon === "clock" && <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 stroke-[var(--teal)]"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                    {card.icon === "tool" && <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 stroke-[var(--orange)]"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
                    {card.icon === "chart" && <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 stroke-[#5cb040]"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>}
                  </Icon>
                  <h3 className="text-[18px] font-bold text-[var(--charcoal)] mb-2.5 uppercase">{card.title}</h3>
                  <p className="text-[var(--mid-gray)] text-[14px] leading-[1.7]">{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ GABRIEL — FOUNDER ═══════════ */}
      <section className="py-28 px-5 sm:px-10 bg-[linear-gradient(160deg,#1A1A2E,#1e1838,#1A1A2E)] text-white relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[90px] opacity-20 -top-[150px] -right-20 bg-[radial-gradient(circle,rgba(42,185,176,0.15),transparent_70%)]" />
        <div className="max-w-[1140px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-18 items-center">
            <Reveal direction="left">
              <div className="relative">
                <Image
                  src="https://www.adhugger.net/wp-content/uploads/2023/02/Gabriel-Eremia_Advertising_Unplugged-533x800.jpg"
                  alt="Gabriel Adrian Eremia"
                  width={400}
                  height={600}
                  className="w-full max-w-[400px] aspect-[2/3] rounded-[20px] object-cover object-top border-2 border-[rgba(42,185,176,0.15)] shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
                />
                <div className="absolute -bottom-5 -right-5 bg-white/95 backdrop-blur-[20px] text-[var(--charcoal)] p-[18px_22px] rounded-[14px] shadow-[0_16px_48px_rgba(0,0,0,0.2)] z-2">
                  <div className="font-[family-name:var(--font-oswald)] text-[24px] font-bold bg-[linear-gradient(135deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] bg-clip-text text-transparent leading-tight">15+</div>
                  <div className="text-[11px] text-[var(--mid-gray)] font-semibold mt-0.5">Years Leading Strategy for<br/>Market-Leading Companies</div>
                </div>
                <div className="absolute -top-3.5 -left-3.5 bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] text-[var(--navy)] px-4 py-2 rounded-[10px] text-[11px] font-extrabold uppercase tracking-[0.5px] shadow-[0_8px_24px_rgba(42,185,176,0.3)] z-2">
                  Award-Winning Strategist
                </div>
              </div>
            </Reveal>
            <Reveal direction="right">
              <div>
                <span className="inline-block text-[var(--teal)] text-[12px] font-bold tracking-[2.5px] uppercase mb-3">Our Founder</span>
                <h2 className="font-[family-name:var(--font-oswald)] text-[36px] font-bold mb-5 leading-[1.1] uppercase">Gabriel Adrian Eremia</h2>
                <p className="text-white/70 text-[15px] leading-[1.8] mb-3.5">
                  Advertising Unplugged was founded by Gabriel Adrian Eremia — a strategist who doesn&apos;t teach theory from the sidelines. He builds and leads strategy from the inside, with 15+ years directing brand and product strategy for <strong className="text-white">market-leading companies across European markets</strong>.
                </p>
                <p className="text-white/70 text-[15px] leading-[1.8] mb-3.5">
                  He&apos;s built and executed brand strategies across <strong className="text-white">FMCG, consumer durables, tech, retail, finance, healthcare, education, and the NGO sector</strong>. His campaigns have won <strong className="text-white">international industry awards</strong> and been <strong className="text-white">shortlisted at Cannes Lions</strong> — validated by the same juries that judge the world&apos;s best work. He&apos;s taught strategy at the <strong className="text-white">Bucharest Business School MBA</strong> program, completed <strong className="text-white">Harvard Business School Online</strong> coursework, and shared stages at <strong className="text-white">Business Days</strong> — reaching over 450,000 entrepreneurs across 100+ events. With <strong className="text-white">64+ articles published on IQads</strong> and features in <strong className="text-white">Business Review, AdHugger, and Forbes MarComm</strong> — Gabriel has spent 15 years not just practicing strategy, but codifying it into a system any business can use.
                </p>
                <blockquote className="italic text-[18px] bg-[linear-gradient(135deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] bg-clip-text text-transparent border-l-[3px] border-[var(--teal)] pl-[18px] my-7 leading-[1.5]">
                  &ldquo;I built Advertising Unplugged because every business — no matter how small — deserves access to the same strategic thinking that drives the brands everyone knows. Marketing shouldn&apos;t be about noise. It should be about clarity, trust, and building something that lasts.&rdquo;
                </blockquote>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
                  {[
                    "International Award Winner",
                    "Cannes Lions Shortlist",
                    "Harvard Business School Online",
                    "Bucharest Business School MBA Lecturer",
                    "64+ Articles on IQads",
                    "450K+ Entrepreneurs Reached",
                    "7+ Industries Covered",
                    "20+ Hours Podcast Content",
                  ].map((cred) => (
                    <div key={cred} className="flex items-center gap-2.5 px-3 py-[9px] bg-white/[0.03] border border-white/[0.05] rounded-lg text-[12px] font-medium text-white/80 hover:bg-[rgba(42,185,176,0.08)] hover:border-[rgba(42,185,176,0.2)] transition-all">
                      <div className="w-7 h-7 bg-[rgba(42,185,176,0.1)] rounded-[7px] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-[var(--teal)] fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </div>
                      {cred}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="h-1 bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)]" />

      {/* ═══════════ WHO IT'S FOR ═══════════ */}
      <section id="who-its-for" className="py-28 px-5 sm:px-10 bg-white">
        <div className="max-w-[1140px] mx-auto">
          <SectionHeader
            tag="Who It's For"
            title="One System. Three Ways In. Choose Your Starting Point."
            sub="Whether you're building a company, running an agency, or leading marketing inside an organization — this platform meets you where you are and gives you what most tools can't: a complete strategic architecture you can act on immediately."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Business Owners & Entrepreneurs", desc: "Stop Outsourcing Your Strategy to People Who Don't Know Your Business. The AI Strategy Builder gives you a 15-section brand strategy deck — brand archetypes, competitive positioning, customer personas, 90-day roadmap — generated from YOUR answers to 39 expert-crafted questions. No agency. No waiting. No generic output.", features: ["AI Strategy Builder — your full brand strategy", "41 interactive marketing templates", "90-Day Growth Challenge with accountability", "1-on-1 consulting with our founder", "Team training & workshops available"], cta: "Get Started", href: "#pricing" },
              { title: "Agencies & Consultancies", desc: "Deliver Board-Ready Strategy to Every Client. At Scale. Under Your Brand. White-label the same methodology behind award-winning campaigns — generate professional strategy decks under your brand, onboard your team to the framework, and turn strategic consulting into a scalable, repeatable product line.", features: ["White-label strategy builder for client work", "Multi-seat team access", "Full template toolkit for client deliverables", "Team training on our strategy methods", "API access for integration"], cta: "Book a Call", href: "#consulting" },
              { title: "Marketing Directors & Teams", desc: "Align Your Team Around One Strategic Framework. Finally. You report to the board. Your team reports to you. And everyone's working from a different version of \"the strategy.\" Use the platform for brand audits, competitive analysis, and structured planning that gives your entire department a shared strategic language — the same one used to build award-winning campaigns.", features: ["Brand audit & competitive positioning tools", "41 templates for every marketing function", "Team workshops on marketing, product, and BD", "Ongoing consulting with our founder", "Structured 90-day execution sprints"], cta: "Explore Options", href: "#consulting" },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1} className="h-full">
                <div className="h-full bg-[var(--light-gray)] border-2 border-[#e8eaed] rounded-2xl p-10 text-left transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-[var(--teal)] relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)]" />
                  <h4 className="font-[family-name:var(--font-oswald)] text-[20px] font-bold text-[var(--charcoal)] mb-2.5 leading-[1.2] uppercase min-h-[52px]">{card.title}</h4>
                  <p className="text-[var(--mid-gray)] text-[14px] leading-[1.7] mb-5 md:min-h-[264px]">{card.desc}</p>
                  <ul className="list-none p-0 mb-6 flex-1">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 py-[5px] text-[13px] text-[var(--charcoal)] font-medium">
                        <span className="w-[18px] h-[18px] bg-[rgba(42,185,176,0.1)] text-[var(--teal)] rounded-[5px] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href={card.href} className="bg-[var(--teal)] text-[var(--navy)] px-6 py-3 rounded-[10px] text-[13px] font-bold shadow-[0_4px_24px_rgba(42,185,176,0.35)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 mt-auto">
                    {card.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ROADMAP ═══════════ */}
      <section id="how-it-works" className="py-28 px-5 sm:px-10 bg-[var(--light-gray)]">
        <div className="max-w-[1140px] mx-auto">
          <SectionHeader
            tag="Your Growth Roadmap"
            title="A Complete System — Not Just a Tool"
            sub="Each layer builds on the one before — from strategic foundation to execution to community to acceleration. Start wherever you need. Go as deep as your business requires."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14 relative">
            <div className="hidden lg:block absolute top-[38px] left-[calc(12.5%+10px)] right-[calc(12.5%+10px)] h-[3px] bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] z-[1] opacity-25 rounded" />
            {[
              { step: 1, title: "AI Strategy Builder", desc: "Answer 39 expert questions built from 15+ years of real campaign methodology. Receive a 15-section strategy deck: brand archetypes, Jobs-To-Be-Done analysis, competitive positioning, customer journey mapping, persona profiles, and a 90-day action roadmap with weekly milestones. What takes an agency 4–12 weeks, you'll have in minutes.", tag: "Foundation" },
              { step: 2, title: "41 Template Toolkit", desc: "Strategy without execution is a document that collects dust. The toolkit gives you 41 interactive templates across 7 categories — Strategy, Brand, Content, Digital, Growth, Analytics, PR — each with guided workflows, export to PDF & XLSX, and monthly updates. Works standalone or paired with your strategy deck.", tag: "Execution" },
              { step: 3, title: "Unplugged Circle", desc: "Strategy without support is just a document. The Unplugged Circle is where strategy meets accountability — monthly calls with our founder, office hours, peer accountability pods, an exclusive resource vault, and an annual retreat for top members. Three tiers: Core, Plus, Pro.", tag: "Community" },
              { step: 4, title: "1-on-1 Consulting", desc: "When you need our founder in the room — not just the methodology. Book sessions for brand positioning deep-dives, product launch planning, growth strategy, sustainability and CSR strategy, or business development advisory. Or bring us in for full-day corporate workshops and team training.", tag: "Acceleration" },
            ].map((card, i) => (
              <Reveal key={card.step} delay={i * 0.1} className="h-full">
                <div className="h-full bg-white border border-[#e8eaed] rounded-2xl p-[30px_22px] text-center transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative flex flex-col">
                  <div className="w-12 h-12 bg-[linear-gradient(135deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] rounded-full flex items-center justify-center font-[family-name:var(--font-oswald)] text-[18px] font-bold text-[var(--navy)] mx-auto mb-4 relative z-2 shadow-[0_4px_16px_rgba(42,185,176,0.35)]">
                    {card.step}
                  </div>
                  <h3 className="font-[family-name:var(--font-oswald)] text-[16px] font-bold text-[var(--charcoal)] mb-2 uppercase">{card.title}</h3>
                  <p className="text-[var(--mid-gray)] text-[12px] leading-[1.6] flex-1">{card.desc}</p>
                  <span className="inline-block bg-[rgba(42,185,176,0.08)] text-[var(--teal)] px-3 py-1 rounded-full text-[10px] font-bold mt-3 uppercase tracking-[0.5px] self-center">{card.tag}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRODUCTS ═══════════ */}
      <section id="products" className="py-28 px-5 sm:px-10 bg-[linear-gradient(160deg,#1A1A2E,#1e1838,#1A1A2E)] text-white relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[90px] opacity-15 -top-[150px] -right-20 bg-[radial-gradient(circle,rgba(42,185,176,0.15),transparent_70%)]" />
        <div className="max-w-[1140px] mx-auto relative z-2">
          <SectionHeader tag="Products" title="Everything You Need to Grow" white />

          {/* Product 1: Strategy Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-18 items-center mt-18 mb-24">
            <Reveal direction="left">
              <div className="w-full aspect-[4/3] rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] bg-white/[0.03]">
                <div className="bg-black/30 p-2.5 px-4 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="p-5">
                  <div className="font-[family-name:var(--font-oswald)] text-[16px] font-semibold text-white uppercase mb-3">Brand Strategy Deck</div>
                  <div className="flex flex-col gap-[7px]">
                    <div className="h-[7px] rounded w-[92%] bg-[linear-gradient(90deg,var(--teal),var(--green))] opacity-90" />
                    <div className="h-[7px] rounded w-[78%] bg-[linear-gradient(90deg,var(--green),var(--orange))] opacity-70" />
                    <div className="h-[7px] rounded w-[65%] bg-[linear-gradient(90deg,var(--orange),var(--yellow))] opacity-50" />
                    <div className="h-[7px] rounded w-[85%] bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] opacity-30" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3.5">
                    {[{ l: "Archetype", v: "Hero" }, { l: "Sections", v: "15" }, { l: "Personas", v: "3" }, { l: "Roadmap", v: "90 Days" }].map((c) => (
                      <div key={c.l} className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 hover:border-[var(--teal)] transition-colors">
                        <div className="text-[9px] text-white/40 uppercase tracking-[1px] font-bold">{c.l}</div>
                        <div className="font-[family-name:var(--font-oswald)] text-[18px] font-bold text-white mt-0.5">{c.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal direction="right">
              <div>
                <span className="inline-block text-[var(--teal)] text-[12px] font-bold tracking-[2.5px] uppercase mb-1.5">Step 1 — Foundation</span>
                <h3 className="font-[family-name:var(--font-oswald)] text-[32px] font-bold text-white mb-3.5 leading-[1.1] uppercase">AI Strategy Builder</h3>
                <p className="text-white/60 text-[15px] leading-[1.7] mb-3.5">The same strategic thinking behind award-winning campaigns. Personalized to your business. Generated in minutes.</p>
                <ul className="list-none p-0 my-5">
                  {["39 expert-crafted strategic questions (7 sections)", "15-section strategy deck with real frameworks", "Brand archetype, JTBD, competitive analysis", "Customer journey mapping & persona builder", "90-day action roadmap with weekly milestones", "Export as PDF, PPTX, or shareable web link"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 py-[7px] text-[13px] text-white/80 font-medium">
                      <span className="w-5 h-5 bg-[rgba(42,185,176,0.15)] text-[var(--teal)] rounded-md flex items-center justify-center text-[11px] font-bold shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#pricing" className="bg-[var(--teal)] text-[var(--navy)] px-9 py-4 rounded-[10px] text-[15px] font-bold shadow-[0_4px_24px_rgba(42,185,176,0.35)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
                  Try the Strategy Builder
                </a>
              </div>
            </Reveal>
          </div>

          {/* Product 2: Templates (reversed) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-18 items-center mb-24">
            <Reveal direction="left" className="order-2 lg:order-1">
              <div>
                <span className="inline-block text-[var(--teal)] text-[12px] font-bold tracking-[2.5px] uppercase mb-1.5">Step 2 — Execution</span>
                <h3 className="font-[family-name:var(--font-oswald)] text-[32px] font-bold text-white mb-3.5 leading-[1.1] uppercase">41 Interactive Templates</h3>
                <p className="text-white/60 text-[15px] leading-[1.7] mb-3.5">Every template you need to move from strategy to execution. Battle-tested across real campaigns in 7+ industries.</p>
                <ul className="list-none p-0 my-5">
                  {["7 categories: Strategy, Brand, Content, Digital, Growth, Analytics, PR", "Interactive dashboards with guided workflows", "Export to PDF & XLSX", "New templates added every month", "Works standalone or paired with your strategy"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 py-[7px] text-[13px] text-white/80 font-medium">
                      <span className="w-5 h-5 bg-[rgba(42,185,176,0.15)] text-[var(--teal)] rounded-md flex items-center justify-center text-[11px] font-bold shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#pricing" className="bg-[var(--teal)] text-[var(--navy)] px-9 py-4 rounded-[10px] text-[15px] font-bold shadow-[0_4px_24px_rgba(42,185,176,0.35)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
                  Explore Templates
                </a>
              </div>
            </Reveal>
            <Reveal direction="right" className="order-1 lg:order-2">
              <div className="w-full aspect-[4/3] rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] bg-white/[0.03]">
                <div className="bg-black/30 p-2.5 px-4 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="p-5">
                  <div className="font-[family-name:var(--font-oswald)] text-[16px] font-semibold text-white uppercase mb-3">41 Marketing Templates</div>
                  <div className="grid grid-cols-3 gap-[7px] mt-2.5">
                    {[{ l: "Strategy", c: "var(--teal)" }, { l: "Brand", c: "#5cb040" }, { l: "Social", c: "var(--orange)" }, { l: "Growth", c: "#c09a10" }, { l: "Email", c: "var(--teal)" }, { l: "Analytics", c: "#5cb040" }].map((cat) => (
                      <div key={cat.l} className="rounded-lg p-2.5 text-center" style={{ background: `color-mix(in srgb, ${cat.c} 10%, transparent)` }}>
                        <div className="text-[12px] font-bold" style={{ color: cat.c }}>{cat.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2.5 p-2 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                    <div className="text-[9px] text-white/40 font-bold uppercase tracking-[1px]">Categories</div>
                    <div className="font-[family-name:var(--font-oswald)] text-[12px] font-semibold text-white mt-0.5 uppercase">7 groups &bull; 41 templates &bull; Updated monthly</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Product 3: Unplugged Circle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-18 items-center">
            <Reveal direction="left">
              <div className="w-full aspect-[4/3] rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] bg-white/[0.03]">
                <div className="bg-black/30 p-2.5 px-4 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="font-[family-name:var(--font-oswald)] text-[16px] font-semibold text-white uppercase mb-1">Unplugged Circle</div>
                  {[
                    { title: "Monthly Strategy Calls", sub: "Live with our founder", color: "rgba(42,185,176,0.1)", border: "rgba(42,185,176,0.15)" },
                    { title: "Peer Accountability Pods", sub: "5-person growth groups", color: "rgba(142,209,106,0.08)", border: "rgba(142,209,106,0.12)" },
                    { title: "Resource Vault", sub: "Exclusive frameworks & playbooks", color: "rgba(242,140,40,0.08)", border: "rgba(242,140,40,0.12)" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-2.5 rounded-lg p-3 px-3.5" style={{ background: item.color, border: `1px solid ${item.border}` }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: item.border }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-white uppercase tracking-[0.5px]">{item.title}</div>
                        <div className="text-[10px] text-white/40">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal direction="right">
              <div>
                <span className="inline-block text-[var(--teal)] text-[12px] font-bold tracking-[2.5px] uppercase mb-1.5">Step 3 — Community</span>
                <h3 className="font-[family-name:var(--font-oswald)] text-[32px] font-bold text-white mb-3.5 leading-[1.1] uppercase">Unplugged Circle</h3>
                <p className="text-white/60 text-[15px] leading-[1.7] mb-3.5">Strategy without support is just a document. The Unplugged Circle is your inner community — where strategy meets accountability, mentorship, and shared growth with entrepreneurs who think like you.</p>
                <ul className="list-none p-0 my-5">
                  {["Monthly strategy calls with our founder", "Office hours and open Q&A sessions", "Peer accountability pods (5-person groups)", "Exclusive resource vault and playbooks", "Annual retreat for top members", "3 tiers: Core, Plus, Pro"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 py-[7px] text-[13px] text-white/80 font-medium">
                      <span className="w-5 h-5 bg-[rgba(42,185,176,0.15)] text-[var(--teal)] rounded-md flex items-center justify-center text-[11px] font-bold shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#pricing" className="bg-[var(--teal)] text-[var(--navy)] px-9 py-4 rounded-[10px] text-[15px] font-bold shadow-[0_4px_24px_rgba(42,185,176,0.35)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
                  Join the Circle
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" className="py-28 px-5 sm:px-10 bg-[var(--light-gray)]">
        <div className="max-w-[1140px] mx-auto">
          <SectionHeader tag="Launch Pricing" title="Investment That Pays for Itself in the First Strategy Session" sub="Early access pricing is active. When we reach capacity, standard rates apply. Every plan includes a 14-day money-back guarantee — no questions asked." />
          <PricingToggle />
          <Reveal>
            <div className="mt-10 py-5 px-7 bg-white border border-[#e8eaed] rounded-2xl inline-flex items-center gap-3.5 text-[13px] text-[var(--mid-gray)] mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              All paid plans include a <strong>14-day money-back guarantee</strong>. No questions asked. Secure payments via Stripe.
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ CONSULTING ═══════════ */}
      <section id="consulting" className="py-28 px-5 sm:px-10 bg-[linear-gradient(160deg,#1A1A2E,#1e1838,#1A1A2E)] text-white relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[90px] opacity-15 -top-[150px] -right-20 bg-[radial-gradient(circle,rgba(42,185,176,0.15),transparent_70%)]" />
        <div className="max-w-[1140px] mx-auto relative z-2">
          <SectionHeader tag="When You Need the Strategist, Not Just the System" title="Consulting, Training & Workshops" sub="The platform gives you methodology. Our founder gives you judgment. The kind that comes from 15 years of defending strategies in front of boards, launching products across European markets, and building award-winning campaigns." white />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] mt-12">
            {[
              { title: "1-on-1 Consulting", desc: "Personal strategy sessions tailored to your business challenges. Whether you need to refine your positioning, plan a launch, or restructure your marketing operation.", price: "€300", unit: "/hour", features: ["Brand strategy & positioning", "Product launch planning", "Marketing & growth strategy", "Sustainability & CSR strategy", "Business development & fundraising"], cta: "Book a Session" },
              { title: "Training & Workshops", desc: "Bring our expertise to your team. Full-day or multi-day workshops designed for your organization's challenges and growth stage.", price: "Custom", unit: " pricing", features: ["Marketing strategy & planning", "Product management & development", "Business development & partnerships", "PR & public affairs", "Sustainability & social responsibility", "Digital transformation & innovation"], cta: "Request a Workshop" },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1} className="h-full">
                <div className="h-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center transition-all hover:bg-[rgba(42,185,176,0.05)] hover:border-[rgba(42,185,176,0.2)] flex flex-col">
                  <h4 className="font-[family-name:var(--font-oswald)] text-[22px] font-bold text-white mb-2.5 uppercase">{card.title}</h4>
                  <p className="text-white/50 text-[14px] mb-5 leading-[1.7] min-h-[72px]">{card.desc}</p>
                  <div className="font-[family-name:var(--font-oswald)] text-[48px] font-bold bg-[linear-gradient(135deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] bg-clip-text text-transparent mb-1">
                    {card.price}<span className="text-[16px] text-white/40 font-sans" style={{ WebkitTextFillColor: "rgba(255,255,255,0.4)" }}>{card.unit}</span>
                  </div>
                  <ul className="list-none p-0 my-5 text-left flex-1">
                    {card.features.map((f) => (
                      <li key={f} className="py-1.5 text-[13px] text-white/70 flex items-center gap-2">
                        <span className="text-[var(--teal)] font-bold">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#" className="bg-[var(--teal)] text-[var(--navy)] w-full py-4 rounded-[10px] text-[15px] font-bold shadow-[0_4px_24px_rgba(42,185,176,0.35)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-auto">
                    {card.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 90-DAY CHALLENGE ═══════════ */}
      <section id="challenge" className="py-28 px-5 sm:px-10 bg-white">
        <div className="max-w-[1140px] mx-auto">
          <SectionHeader tag="Structured Growth" title="The 90-Day Growth Challenge" sub="90 Days. One Blueprint. Measurable Progress. This isn't a course. It's a structured sprint — designed and guided by our founder, built for entrepreneurs and marketing leaders who are done consuming content and ready to execute." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mt-12">
            {[
              { phase: "Weeks 1–4", title: "Foundation & Positioning", desc: "Define your ICP, lock in your brand identity, and build the strategic foundation. Receive your Mini-Blueprint Pack and start executing immediately." },
              { phase: "Weeks 5–8", title: "Audience & Channel Mastery", desc: "Deep-dive into your customers. Map their journey. Choose channels. Build your content machine. Launch your first test campaign with real accountability." },
              { phase: "Weeks 9–12", title: "Execute, Measure & Scale", desc: "Optimize relentlessly. Before vs. after progress report. Top 5 entrepreneurs recognized publicly and win exclusive upgrades. Graduate with momentum." },
            ].map((card, i) => (
              <Reveal key={card.phase} delay={i * 0.1} className="h-full">
                <div className="h-full bg-[var(--light-gray)] border border-[#e8eaed] rounded-2xl p-7 transition-all hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] hover:border-[var(--teal)]">
                  <div className="text-[11px] uppercase tracking-[2px] font-bold bg-[linear-gradient(135deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] bg-clip-text text-transparent mb-1.5">{card.phase}</div>
                  <h4 className="font-[family-name:var(--font-oswald)] text-[17px] font-semibold text-[var(--charcoal)] mb-1.5 uppercase">{card.title}</h4>
                  <p className="text-[13px] text-[var(--mid-gray)] leading-[1.6]">{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="text-center mt-10">
              <a href="#pricing" className="bg-[var(--teal)] text-[var(--navy)] px-9 py-4 rounded-[10px] text-[16px] font-bold shadow-[0_4px_24px_rgba(42,185,176,0.35)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
                Join the 90-Day Challenge
              </a>
              <p className="text-[11px] text-[var(--mid-gray)] mt-3">Included with Professional & Agency plans &bull; Limited to 50 per cohort</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ ECOSYSTEM ═══════════ */}
      <section id="ecosystem" className="py-28 px-5 sm:px-10 bg-[var(--light-gray)]">
        <div className="max-w-[1140px] mx-auto">
          <SectionHeader tag="The Full Ecosystem" title="More Than a Platform. An Ecosystem Built for Sustained Growth." sub="Advertising Unplugged isn't a tool you use once. It's an ecosystem that grows with you — from free resources to premium strategy, from community to international stage." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px] mt-12">
            {[
              { title: "Unplugged Library", desc: "Free and low-entry library of practical frameworks, blueprints, and templates. The starting point for any entrepreneur seeking structure over noise.", tag: "Business Clarity Hub", tagColor: "teal" },
              { title: "90-Day Growth Challenge", desc: "Gamified 12-week sprints with blueprints, weekly check-ins, community pods, and measurable progress tracking. Not content. Action.", tag: "12-Week Sprint", tagColor: "green" },
              { title: "Unplugged Circle", desc: "Monthly strategy calls with our founder, office hours, peer accountability pods, exclusive playbooks, and an annual retreat.", tag: "Community", tagColor: "orange" },
              { title: "Unplugged Stage", desc: "Advertising Unplugged brings the clarity-first philosophy to global stages — targeting Web Summit, DMEXCO, Brand Minds, Business Days, and beyond.", tag: "International", tagColor: "yellow" },
              { title: "Unplugged Stories", desc: "20+ hours of authentic conversations with entrepreneurs, creatives, and industry leaders. Season 2 features an AI co-host and deeper strategic breakdowns.", tag: "Podcast & Storytelling", tagColor: "charcoal" },
              { title: "Unplugged Summit", desc: "An annual summit for 500–1,000 entrepreneurs, plus city pop-up tours. Immersive, high-energy, and built around the clarity-over-noise philosophy.", tag: "Annual Event", tagColor: "orange" },
            ].map((card, i) => (
              <Reveal key={card.title} delay={(i % 3) * 0.1} className="h-full">
                <div className="h-full p-8 bg-white border border-[#e8eaed] rounded-2xl text-left transition-all relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] flex flex-col">
                  <div className="absolute top-0 left-0 w-1 h-0 bg-[linear-gradient(180deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] group-hover:h-full transition-all duration-500" />
                  <h4 className="font-[family-name:var(--font-oswald)] text-[16px] font-semibold text-[var(--charcoal)] mb-1.5 uppercase">{card.title}</h4>
                  <p className="text-[13px] text-[var(--mid-gray)] leading-[1.6] flex-1">{card.desc}</p>
                  <span className={`inline-block px-2.5 py-[3px] rounded-md text-[10px] font-bold mt-2.5 ${
                    card.tagColor === "teal" ? "bg-[rgba(42,185,176,0.1)] text-[var(--teal)]" :
                    card.tagColor === "green" ? "bg-[rgba(142,209,106,0.1)] text-[#5cb040]" :
                    card.tagColor === "orange" ? "bg-[rgba(242,140,40,0.1)] text-[var(--orange)]" :
                    card.tagColor === "yellow" ? "bg-[rgba(248,206,48,0.15)] text-[#c09a10]" :
                    "bg-[rgba(51,51,51,0.08)] text-[var(--charcoal)]"
                  }`}>{card.tag}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-28 px-5 sm:px-10 bg-white">
        <div className="max-w-[1140px] mx-auto text-center">
          <SectionHeader tag="FAQ" title="Straight Answers. No Fluff." />
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-[130px] px-5 sm:px-10 bg-[var(--navy)] text-white text-center relative overflow-hidden">
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[90px] opacity-15 -top-[100px] -right-[100px] bg-[radial-gradient(circle,rgba(42,185,176,0.15),transparent_70%)]" />
        <div className="relative z-2 max-w-[620px] mx-auto">
          <Reveal>
            <h2 className="font-[family-name:var(--font-oswald)] text-[clamp(30px,4vw,46px)] font-bold mb-[18px] leading-[1.1] uppercase">
              Every Week Without a Clear Strategy Is a Week<br/><span className="bg-[linear-gradient(135deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] bg-clip-text text-transparent">Your Competitors Are Getting Ahead.</span>
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-[16px] text-white/55 mb-9 leading-[1.7]">Our founder spent 15 years building this methodology leading strategy for market-leading companies — validating it with award-winning campaigns and strategies deployed across 7+ industries. Now Advertising Unplugged makes that system available to you — from strategy to execution to mentorship. The question isn&apos;t whether you need it. It&apos;s how much longer you can afford to operate without it.</p>
          </Reveal>
          <Reveal>
            <div className="flex gap-3.5 justify-center flex-wrap">
              <a href="#pricing" className="bg-[var(--teal)] text-[var(--navy)] px-10 py-4 rounded-[10px] text-[16px] font-bold shadow-[0_4px_24px_rgba(42,185,176,0.35)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
                See Plans &amp; Pricing
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#consulting" className="bg-white/5 text-white px-10 py-4 rounded-[10px] text-[16px] font-semibold border border-white/10 hover:bg-white/10 hover:border-[rgba(42,185,176,0.4)] transition-all inline-flex items-center gap-2">
                Book a Consulting Call
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-[#0e0e1e] text-white/40 py-14 px-5 sm:px-10">
        <div className="max-w-[1140px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2.5fr_1fr_1fr_1fr] gap-10 mb-9">
          <div>
            <Image src="/brand/au-logo-white.png" alt="Advertising Unplugged" width={150} height={30} className="h-[30px] w-auto mb-3" />
            <p className="text-[13px] leading-[1.7] mt-3">A complete brand strategy methodology — powered by AI, built on 15 years of award-winning experience across FMCG, durables, tech, retail, finance, healthcare, education, and the NGO sector. Founded by Gabriel Adrian Eremia.</p>
            <div className="text-[12px] font-semibold mt-2.5 italic bg-[linear-gradient(135deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] bg-clip-text text-transparent">&ldquo;Clarity Over Noise. Purpose Beyond Profit.&rdquo;</div>
          </div>
          <div>
            <h4 className="text-white/65 font-[family-name:var(--font-oswald)] text-[12px] uppercase tracking-[1.5px] mb-3 font-semibold">Product</h4>
            <a href="#products" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">Strategy Builder</a>
            <a href="#products" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">Template Toolkit</a>
            <a href="#products" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">Unplugged Circle</a>
            <a href="#pricing" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">Pricing</a>
          </div>
          <div>
            <h4 className="text-white/65 font-[family-name:var(--font-oswald)] text-[12px] uppercase tracking-[1.5px] mb-3 font-semibold">Services</h4>
            <a href="#consulting" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">1-on-1 Consulting</a>
            <a href="#consulting" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">Training & Workshops</a>
            <a href="#challenge" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">90-Day Challenge</a>
            <a href="#gabriel" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">Our Founder</a>
          </div>
          <div>
            <h4 className="text-white/65 font-[family-name:var(--font-oswald)] text-[12px] uppercase tracking-[1.5px] mb-3 font-semibold">Legal</h4>
            <Link href="/legal/terms" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">Terms of Service</Link>
            <Link href="/legal/privacy" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">Privacy Policy</Link>
            <Link href="/legal/cookies" className="block text-white/40 text-[13px] py-[3px] hover:text-[var(--teal)] transition-colors">Cookie Policy</Link>
          </div>
        </div>
        <div className="max-w-[1140px] mx-auto h-[2px] bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] opacity-30 rounded mb-5" />
        <div className="max-w-[1140px] mx-auto text-center text-[11px]">
          &copy; {new Date().getFullYear()} Advertising Unplugged. All rights reserved. Built with purpose by Gabriel Adrian Eremia.
        </div>
      </footer>
    </>
  );
}
