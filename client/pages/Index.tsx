import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Rocket, Hammer, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function Index() {
  const [email, setEmail] = useState("");
  const percent = 85;

  const { data: ping, isError, isFetching } = useQuery<{ message: string }>({
    queryKey: ["ping"],
    queryFn: async () => {
      const res = await fetch("/api/ping");
      if (!res.ok) throw new Error("Ping failed");
      return (await res.json()) as { message: string };
    },
    refetchInterval: 30000,
    staleTime: 30000,
  });

  const checklist = useMemo(
    () => [
      { label: "Design polish", done: true },
      { label: "Core features", done: true },
      { label: "Integrations", done: false },
      { label: "QA & performance", done: false },
      { label: "Deploy", done: false },
    ],
    [],
  );

  const onNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    toast.success("We will keep you posted! ✉️");
    setEmail("");
  };

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.12),transparent_60%),radial-gradient(40%_40%_at_100%_20%,hsl(var(--accent)/0.15),transparent_60%),linear-gradient(to_bottom,transparent,transparent_60%,hsl(var(--secondary))/0.4)]" />
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center animate-in fade-in">
            <Badge className="rounded-full px-4 py-2 bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-2 hover-scale animate-in bounce-in">
              <Hammer className="h-3.5 w-3.5" />
              Under construction
            </Badge>
            <div className="mt-4 flex items-center justify-center gap-3 text-sm animate-in slide-up" style={{ animationDelay: '100ms' }}>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 border transition-all duration-200 ${
                  isError
                    ? "bg-red-100/60 text-red-700 border-red-200 hover:shadow-md"
                    : "bg-emerald-100/60 text-emerald-700 border-emerald-200 hover:shadow-md"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full animate-pulse ${
                    isError ? "bg-red-600" : isFetching ? "bg-amber-500" : "bg-emerald-600"
                  }`}
                />
                API {isError ? "offline" : isFetching ? "checking" : "online"}
              </span>
              {!isError && ping?.message && (
                <span className="text-muted-foreground text-sm">({ping.message})</span>
              )}
            </div>
            <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-balance animate-in slide-up" style={{ animationDelay: '200ms' }}>
              Your app is ready to be finished
            </h1>
            <p className="mt-6 text-xl text-muted-foreground text-pretty animate-in slide-up" style={{ animationDelay: '300ms' }}>
              Construction Success gives your nearly-done product a polished, production-ready finish—beautiful, fast, and responsive.
            </p>
            <form onSubmit={onNotify} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:gap-3 animate-in slide-up" style={{ animationDelay: '400ms' }}>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                className="h-12 text-base focus-ring"
              />
              <Button type="submit" variant="gradient" size="lg" className="sm:ml-3 hover-lift">
                Get updates
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <div className="mt-10 flex items-center gap-4 justify-center animate-in slide-up" style={{ animationDelay: '500ms' }}>
              <Progress value={percent} className="max-w-xs h-2" />
              <span className="text-sm text-muted-foreground font-medium">{percent}% complete</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="container py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: <Rocket className="h-6 w-6" />, title: "Performance", desc: "Optimized assets, code-splitting, and accessibility baked in.",
            },
            {
              icon: <Hammer className="h-6 w-6" />, title: "Polish", desc: "Thoughtful micro-interactions, crisp typography, and modern layouts.",
            },
            {
              icon: <CheckCircle2 className="h-6 w-6" />, title: "Production-ready", desc: "CI-friendly build, responsive design, and easy deployments.",
            },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border bg-card/60 p-8 shadow-sm backdrop-blur-sm card-interactive animate-in slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary hover-scale">
                {f.icon}
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-balance">{f.title}</h3>
              <p className="mt-3 text-base text-muted-foreground text-pretty">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border p-5 hover:bg-muted/50 transition-all duration-200 animate-in slide-up" style={{ animationDelay: `${(i + 3) * 100}ms` }}>
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${item.done ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground"}`}>
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-base font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="timeline" className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/30">
        <div className="container py-16 md:py-20">
          <h2 className="text-2xl font-bold">Timeline</h2>
          <p className="mt-2 text-muted-foreground">A simple path to cross the finish line.</p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { step: "1", title: "Define polish", desc: "Tighten copy, refine visuals, finalize flows." },
              { step: "2", title: "Wire integrations", desc: "Hook up auth, data, and any services." },
              { step: "3", title: "Ship", desc: "QA, performance pass, and deploy with confidence." },
            ].map((s, i) => (
              <li key={i} className="relative rounded-2xl border bg-card/60 p-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{s.step}</span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="contact" className="container py-16 md:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border p-6 text-center shadow-sm">
          <h2 className="text-2xl font-bold">Ready to finish?</h2>
          <p className="mt-2 text-muted-foreground">Tell us how you want it to look and we\'ll complete it.</p>
          <form onSubmit={onNotify} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <Button type="submit" className="sm:ml-2">
              Notify me
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
