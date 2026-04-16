import Link from "next/link";
import { Mic, Zap, CheckCircle, BookOpen, Laugh, Newspaper, ArrowRight, Radio } from "lucide-react";

const personas = [
  {
    icon: "🔍",
    name: "Fact Checker",
    color: "var(--fact-checker)",
    description:
      "Instantly verifies claims as you speak. Never let misinformation slip through live.",
    example: "⚠️ CLAIM: 'The Great Wall is visible from space.' FACT: This is a common myth — it's too narrow to see from orbit. CONFIDENCE: High",
  },
  {
    icon: "📚",
    name: "Context Provider",
    color: "var(--context)",
    description:
      "Surfaces relevant background and history to deepen every conversation.",
    example:
      "The topic you're discussing relates to the 1969 Apollo program, which employed over 400,000 engineers and scientists across the US.",
  },
  {
    icon: "😂",
    name: "Comedy Writer",
    color: "var(--comedy)",
    description:
      "Generates perfectly timed jokes and witty observations for your exact moment.",
    example:
      'ONE-LINER: "So basically they spent billions to get rocks — sounds like my last NFT purchase."',
  },
  {
    icon: "📰",
    name: "News Anchor",
    color: "var(--news)",
    description:
      "Pulls breaking and relevant news related to what you're discussing right now.",
    example:
      "BREAKING: NASA just announced a new Artemis moon landing scheduled for 2026, directly relevant to your current discussion.",
  },
];

const features = [
  {
    icon: <Mic className="w-5 h-5" />,
    title: "Real-Time Transcription",
    description: "Powered by Deepgram — captures every word with high accuracy",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant AI Analysis",
    description: "Claude AI processes your speech in under 3 seconds",
  },
  {
    icon: <Radio className="w-5 h-5" />,
    title: "Broadcast-Ready UI",
    description: "Designed for live use — minimal distraction, maximum impact",
  },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Nav */}
      <nav
        className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm"
        style={{ borderColor: "var(--border)", background: "rgba(13,13,15,0.9)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: "var(--accent-blue)" }}
          >
            🎙️
          </div>
          <span className="font-bold text-lg tracking-tight">Podcast Crew</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "var(--accent-blue)", color: "#fff" }}
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-32 text-center overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(59,139,255,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 border"
            style={{
              background: "rgba(59,139,255,0.1)",
              borderColor: "rgba(59,139,255,0.3)",
              color: "var(--accent-blue)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            NOW LIVE — AI-Powered Podcast Production
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-none">
            Your AI
            <br />
            <span className="gradient-text">Podcast Crew</span>
          </h1>

          <p
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Four AI specialists work in real-time as you record — fact-checking claims,
            providing context, suggesting jokes, and surfacing breaking news. All instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
              style={{ background: "var(--accent-blue)", color: "#fff" }}
            >
              Start Recording Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl font-semibold text-lg border transition-all hover:bg-white/5"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Studio Preview */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            {/* Mock Studio Header */}
            <div
              className="flex items-center justify-between px-6 py-3 border-b"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                  PODCAST CREW — LIVE SESSION
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold recording-indicator"
                  style={{ background: "rgba(255,59,59,0.2)", color: "var(--accent-red)" }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  LIVE REC
                </div>
                <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                  00:12:34
                </span>
              </div>
            </div>

            {/* Mock Studio Body */}
            <div className="grid grid-cols-5 min-h-64">
              {/* Transcript */}
              <div className="col-span-3 p-6 border-r" style={{ borderColor: "var(--border)" }}>
                <div className="text-xs font-mono mb-4" style={{ color: "var(--text-secondary)" }}>
                  LIVE TRANSCRIPT
                </div>
                <div className="space-y-2 font-mono text-sm" style={{ color: "var(--accent-green)" }}>
                  <p>{">"} "So today we're talking about the future of space exploration..."</p>
                  <p>{">"} "And I think what's interesting is that private companies..."</p>
                  <p className="cursor-blink">{">"} "NASA's budget versus SpaceX's approach"</p>
                </div>
              </div>

              {/* Crew Cards Preview */}
              <div className="col-span-2 p-4 space-y-3">
                {[
                  { icon: "🔍", label: "FACT-CHECKER", color: "var(--fact-checker)", text: "⚠️ SpaceX budget claim needs verification..." },
                  { icon: "📚", label: "CONTEXT", color: "var(--context)", text: "NASA's 2024 budget is $25.4B, down 2% from 2023..." },
                  { icon: "😂", label: "COMEDY", color: "var(--comedy)", text: "ONE-LINER: Elon's \"going to Mars\" is just the most expensive way to escape traffic..." },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3 border slide-in-right text-xs"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: card.color,
                      borderLeftWidth: "3px",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span>{card.icon}</span>
                      <span className="font-bold" style={{ color: card.color, fontSize: "10px" }}>
                        {card.label}
                      </span>
                    </div>
                    <p style={{ color: "var(--text-secondary)" }}>{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "rgba(59,139,255,0.15)", color: "var(--accent-blue)" }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Crew Members */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Your Crew</h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Four specialized AI personas, each an expert in their domain
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {personas.map((persona, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border transition-all hover:scale-[1.02]"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  borderLeftWidth: "4px",
                  borderLeftColor: persona.color,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{persona.icon}</span>
                  <div>
                    <h3 className="font-bold" style={{ color: persona.color }}>
                      {persona.name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  {persona.description}
                </p>
                <div
                  className="rounded-lg p-3 text-xs font-mono"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                >
                  {persona.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        className="px-6 py-24 border-t"
        style={{ borderColor: "var(--border)" }}
        id="pricing"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free */}
            <div
              className="p-8 rounded-2xl border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold mb-1">$0</div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Forever free
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {["3 sessions/month", "30 min per session", "All 4 AI crew members", "Basic transcript export"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-green)" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-xl font-semibold border transition-all hover:bg-white/5"
                style={{ borderColor: "var(--border)" }}
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div
              className="p-8 rounded-2xl border-2 relative"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--accent-blue)",
              }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                style={{ background: "var(--accent-blue)", color: "#fff" }}
              >
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-1">
                  $49
                  <span className="text-lg font-normal" style={{ color: "var(--text-secondary)" }}>
                    /mo
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  For serious podcasters
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited sessions",
                  "Unlimited duration",
                  "All 4 AI crew members",
                  "Advanced transcript export",
                  "Session analytics",
                  "Priority AI processing",
                  "Custom crew prompts",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-green)" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--accent-blue)", color: "#fff" }}
              >
                Start Pro Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-24 text-center border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to upgrade your podcast?
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
            Join thousands of podcasters using AI to create better content.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            style={{ background: "var(--accent-blue)", color: "#fff" }}
          >
            Start Recording Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t px-6 py-8 text-center text-sm"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        <p>© 2026 Podcast Crew. Built with Claude AI by Anthropic.</p>
      </footer>
    </div>
  );
}
