import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DOMPurify from "dompurify";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown as SelectChevron } from "lucide-react";
import {
  Calculator,
  MapPin,
  Mountain,
  Clock,
  Ruler,
  FileText,
  Loader2,
  ChevronRight,
  Sparkles,
  HardHat,
  ArrowRight,
  Download,
  RotateCcw,
  Zap,
  Database,
  TrendingUp,
  Shield,
  Cpu,
  Target,
  BarChart3,
  Layers,
} from "lucide-react";
import { useFlashReveal } from "@/hooks/useFlashReveal";
import { useToast } from "@/hooks/use-toast";

const ESTIMATOR_VIDEOS = [
  "/images/estimator-bg-1.mp4",
  "/images/estimator-bg-2.mp4",
];

const PROJECT_TYPES = [
  "Highway / Road Construction",
  "Bridge Construction",
  "Commercial Building",
  "Residential Development",
  "Mining / Quarry Operation",
  "Pipeline / Utility Installation",
  "Demolition Project",
  "Land Clearing / Grading",
  "Dam / Reservoir Construction",
  "Airport Construction",
  "Port / Marine Construction",
  "Rail Infrastructure",
  "Solar Farm / Wind Farm",
  "Landfill / Environmental",
  "Industrial Facility",
  "Other",
];

const TERRAIN_TYPES = [
  "Flat / Open Plain",
  "Hilly / Rolling Terrain",
  "Mountainous",
  "Swamp / Wetland",
  "Sandy / Desert",
  "Rocky / Hard Ground",
  "Forest / Wooded",
  "Urban / Developed",
  "Coastal / Marine",
  "Mixed Terrain",
];

const PROJECT_SIZES = [
  "Small (Under 5 acres)",
  "Medium (5–25 acres)",
  "Large (25–100 acres)",
  "Very Large (100–500 acres)",
  "Mega Project (500+ acres)",
];

const DURATIONS = [
  "1–3 Months",
  "3–6 Months",
  "6–12 Months",
  "12–24 Months",
  "24–36 Months",
  "36+ Months",
];

function RotatingVideoBackground() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextIndexRef = useRef(1);

  const handleVideoEnd = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => {
      setActiveIndex(nextIndexRef.current);
      nextIndexRef.current = (nextIndexRef.current + 1) % ESTIMATOR_VIDEOS.length;
      setFadingOut(false);
    }, 600);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [activeIndex]);

  return (
    <>
      <video
        ref={videoRef}
        key={activeIndex}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: fadingOut ? 0 : 1 }}
        muted
        playsInline
        onEnded={handleVideoEnd}
        data-testid="estimator-hero-video"
      >
        <source src={ESTIMATOR_VIDEOS[activeIndex]} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
    </>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className="inline-block transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {value}{suffix}
    </span>
  );
}

function FieldCompletionRing({ filled, total }: { filled: number; total: number }) {
  const pct = (filled / total) * 100;
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
        <circle
          cx="20" cy="20" r="18" fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-accent">{filled}/{total}</span>
      </div>
    </div>
  );
}

export default function ProjectEstimator() {
  const heroRef = useFlashReveal();
  const formRef = useFlashReveal();
  const resultRef = useFlashReveal();

  const { toast } = useToast();

  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [location, setLocation] = useState("");
  const [terrain, setTerrain] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [duration, setDuration] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [estimateResult, setEstimateResult] = useState("");
  const [showResult, setShowResult] = useState(false);

  const resultContainerRef = useRef<HTMLDivElement>(null);

  const filledFields = [projectName, projectType, location, terrain, projectSize, duration].filter(Boolean).length;

  useEffect(() => {
    if (showResult && resultContainerRef.current) {
      resultContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName || !projectType || !location || !terrain || !projectSize || !duration) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields before generating an estimate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setEstimateResult("");
    setShowResult(true);

    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          projectType,
          location,
          terrain,
          projectSize,
          duration,
          additionalDetails,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate estimate");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.content) {
              setEstimateResult((prev) => prev + event.content);
            }
            if (event.done) {
              setIsGenerating(false);
            }
            if (event.error) {
              throw new Error(event.error);
            }
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
          }
        }
      }
      setIsGenerating(false);
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate estimate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setProjectName("");
    setProjectType("");
    setLocation("");
    setTerrain("");
    setProjectSize("");
    setDuration("");
    setAdditionalDetails("");
    setEstimateResult("");
    setShowResult(false);
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: JSX.Element[] = [];

    lines.forEach((line, i) => {
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-accent mt-6 mb-3">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-xl font-bold mt-5 mb-2 text-foreground border-b border-accent/30 pb-1">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold mt-4 mb-1 text-accent">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("---")) {
        elements.push(<hr key={i} className="border-border my-4" />);
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        const content = line.slice(2);
        elements.push(
          <div key={i} className="flex gap-2 ml-4 my-0.5">
            <span className="text-accent mt-1.5 shrink-0">•</span>
            <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </div>
        );
      } else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          elements.push(
            <div key={i} className="flex gap-2 ml-4 my-0.5">
              <span className="text-accent font-semibold shrink-0">{match[1]}.</span>
              <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(match[2]) }} />
            </div>
          );
        }
      } else if (line.startsWith("|")) {
        if (!line.includes("---")) {
          const cells = line.split("|").filter(Boolean).map((c) => c.trim());
          const isHeader = i + 1 < lines.length && lines[i + 1]?.includes("---");
          elements.push(
            <div key={i} className={`grid gap-2 py-1 px-2 ${isHeader ? "font-semibold bg-accent/10 rounded" : "border-b border-border/30"}`} style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
              {cells.map((cell, j) => (
                <span key={j} className="text-sm" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
              ))}
            </div>
          );
        }
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        );
      }
    });

    return elements;
  };

  const sanitize = (html: string) => DOMPurify.sanitize(html, { ALLOWED_TAGS: ["strong", "em", "code"], ALLOWED_ATTR: ["class"] });

  const formatInlineMarkdown = (text: string) => {
    const formatted = text
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="text-foreground italic">$1</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-accent/10 px-1 rounded text-accent text-sm">$1</code>');
    return sanitize(formatted);
  };

  return (
    <div className="flash-page-transition">
      {/* Hero with Video Background */}
      <section className="relative py-28 lg:py-36 overflow-hidden bg-black" ref={heroRef}>
        <RotatingVideoBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flash-reveal inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-semibold tracking-widest uppercase" data-testid="text-estimator-badge">AMERICAN IRON AI POWERED TOOL</span>
            </div>
            <h1 className="flash-reveal text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight leading-tight" style={{ "--flash-index": 1 } as any} data-testid="text-estimator-title">
              IRON <span className="text-accent-3d">Estimator</span>
            </h1>
            <p className="flash-reveal text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl" style={{ "--flash-index": 2 } as any} data-testid="text-estimator-description">
              Get an institutional-grade equipment estimate for your construction project. Our AI analyzes your project requirements against our inventory of 2,100+ equipment items and 12,200+ parts to deliver comprehensive cost projections.
            </p>

            {/* Hero Stats Row */}
            <div className="flash-reveal grid grid-cols-3 gap-3 sm:gap-4 max-w-lg" style={{ "--flash-index": 3 } as any}>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-xl sm:text-2xl font-black text-accent">
                  <AnimatedCounter value="2,100" suffix="+" />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 uppercase tracking-wider">Equipment</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-xl sm:text-2xl font-black text-accent">
                  <AnimatedCounter value="12,200" suffix="+" />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 uppercase tracking-wider">Parts</div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-xl sm:text-2xl font-black text-accent">
                  <AnimatedCounter value="AI" />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 uppercase tracking-wider">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Control Panel Section */}
      <section className="py-16 bg-background" ref={formRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* System Status Bar */}
          <div className="flash-reveal mb-8 iron-panel rounded-xl p-4">
            <div className="iron-scan" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-50" />
                </div>
                <span className="text-sm font-semibold text-foreground">IRON ESTIMATOR — SYSTEM ONLINE</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-accent" />
                  <span>Inventory Synced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-accent" />
                  <span>AI Model Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span>Enterprise Grade</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Control Panel */}
            <div className="lg:col-span-2">
              <div className="iron-panel iron-panel-glow rounded-2xl p-4 sm:p-8" data-testid="form-estimator">
                <div className="iron-scan" />

                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
                        <Target className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                        <Zap className="w-2.5 h-2.5 text-black" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">CONTROL PANEL</h2>
                      <p className="text-sm text-muted-foreground">Configure project parameters for AI analysis</p>
                    </div>
                  </div>
                  <FieldCompletionRing filled={filledFields} total={6} />
                </div>

                {/* Readiness Gauge */}
                <div className="mb-8 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimation Readiness</span>
                    <span className="text-xs font-bold text-accent">{Math.round((filledFields / 6) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent transition-all duration-700 ease-out"
                      style={{ width: `${(filledFields / 6) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    {["Name", "Type", "Location", "Terrain", "Size", "Duration"].map((label, idx) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          [projectName, projectType, location, terrain, projectSize, duration][idx]
                            ? "bg-accent"
                            : "bg-muted-foreground/30"
                        }`} />
                        <span className="text-[10px] text-muted-foreground hidden sm:block">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Name */}
                    <div className="iron-input-group space-y-2">
                      <Label htmlFor="projectName" className="flex items-center gap-2 text-sm font-semibold">
                        <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-accent" />
                        </div>
                        Project Name *
                      </Label>
                      <Input
                        id="projectName"
                        placeholder="e.g. I-75 Highway Expansion Phase 2"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="bg-muted/30"
                        data-testid="input-project-name"
                      />
                      <div className="iron-input-indicator" />
                    </div>

                    {/* Project Type */}
                    <div className="iron-input-group space-y-2">
                      <Label htmlFor="projectType" className="flex items-center gap-2 text-sm font-semibold">
                        <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center">
                          <HardHat className="w-3.5 h-3.5 text-accent" />
                        </div>
                        Project Type *
                      </Label>
                      <div className="relative">
                        <select
                          id="projectType"
                          value={projectType}
                          onChange={(e) => setProjectType(e.target.value)}
                          className="flex h-9 w-full appearance-none items-center rounded-md border border-input bg-muted/30 px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                          data-testid="select-project-type"
                        >
                          <option value="" disabled>Select project type</option>
                          {PROJECT_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <SelectChevron className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                      </div>
                      <div className="iron-input-indicator" />
                    </div>

                    {/* Location */}
                    <div className="iron-input-group space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold">
                        <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                        </div>
                        Project Location *
                      </Label>
                      <Input
                        id="location"
                        placeholder="e.g. Tampa, FL or Houston, TX"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-muted/30"
                        data-testid="input-location"
                      />
                      <div className="iron-input-indicator" />
                    </div>

                    {/* Terrain */}
                    <div className="iron-input-group space-y-2">
                      <Label htmlFor="terrain" className="flex items-center gap-2 text-sm font-semibold">
                        <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center">
                          <Mountain className="w-3.5 h-3.5 text-accent" />
                        </div>
                        Terrain Type *
                      </Label>
                      <div className="relative">
                        <select
                          id="terrain"
                          value={terrain}
                          onChange={(e) => setTerrain(e.target.value)}
                          className="flex h-9 w-full appearance-none items-center rounded-md border border-input bg-muted/30 px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                          data-testid="select-terrain"
                        >
                          <option value="" disabled>Select terrain type</option>
                          {TERRAIN_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <SelectChevron className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                      </div>
                      <div className="iron-input-indicator" />
                    </div>

                    {/* Project Size */}
                    <div className="iron-input-group space-y-2">
                      <Label htmlFor="projectSize" className="flex items-center gap-2 text-sm font-semibold">
                        <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center">
                          <Ruler className="w-3.5 h-3.5 text-accent" />
                        </div>
                        Project Size *
                      </Label>
                      <div className="relative">
                        <select
                          id="projectSize"
                          value={projectSize}
                          onChange={(e) => setProjectSize(e.target.value)}
                          className="flex h-9 w-full appearance-none items-center rounded-md border border-input bg-muted/30 px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                          data-testid="select-project-size"
                        >
                          <option value="" disabled>Select project size</option>
                          {PROJECT_SIZES.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <SelectChevron className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                      </div>
                      <div className="iron-input-indicator" />
                    </div>

                    {/* Duration */}
                    <div className="iron-input-group space-y-2">
                      <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold">
                        <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                        </div>
                        Estimated Duration *
                      </Label>
                      <div className="relative">
                        <select
                          id="duration"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="flex h-9 w-full appearance-none items-center rounded-md border border-input bg-muted/30 px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                          data-testid="select-duration"
                        >
                          <option value="" disabled>Select duration</option>
                          {DURATIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <SelectChevron className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                      </div>
                      <div className="iron-input-indicator" />
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="iron-input-group space-y-2">
                    <Label htmlFor="additionalDetails" className="flex items-center gap-2 text-sm font-semibold">
                      <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-accent" />
                      </div>
                      Additional Project Details (Optional)
                    </Label>
                    <Textarea
                      id="additionalDetails"
                      placeholder="Describe any special requirements, environmental considerations, specific equipment preferences, access constraints, or other relevant project information..."
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      rows={4}
                      className="bg-muted/30 resize-none"
                      data-testid="textarea-additional-details"
                    />
                    <div className="iron-input-indicator" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      size="lg"
                      className="bg-accent text-accent-foreground font-black px-10 gap-2 shadow-lg shadow-accent/20"
                      data-testid="button-generate-estimate"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          GENERATING ESTIMATE...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          GENERATE ESTIMATE
                        </>
                      )}
                    </Button>
                    {showResult && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        size="lg"
                        className="px-6 font-semibold"
                        data-testid="button-reset-estimate"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        New Estimate
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Engine Card */}
              <div className="iron-panel rounded-xl p-6" style={{ "--flash-index": 1 } as any}>
                <div className="iron-scan" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 iron-ring" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(var(--accent) / 0.2)" strokeWidth="1.5" />
                      <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeDasharray="12 8" />
                    </svg>
                    <Cpu className="absolute inset-0 m-auto w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm">AI ENGINE</h3>
                    <p className="text-[11px] text-accent">GPT-5.2 Active</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-[10px] font-black text-accent">1</div>
                    <p>Enter your project parameters including type, location, terrain, and scale</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-[10px] font-black text-accent">2</div>
                    <p>AI cross-references your needs against 2,100+ equipment items</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-[10px] font-black text-accent">3</div>
                    <p>Receive comprehensive estimate with equipment, parts, logistics, and costs</p>
                  </div>
                </div>
              </div>

              {/* Capabilities Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="iron-stat-card text-center">
                  <BarChart3 className="w-5 h-5 text-accent mx-auto mb-2" />
                  <div className="text-xs font-bold">Cost Analysis</div>
                  <div className="text-[10px] text-muted-foreground">Low/Mid/High</div>
                </div>
                <div className="iron-stat-card text-center">
                  <TrendingUp className="w-5 h-5 text-accent mx-auto mb-2" />
                  <div className="text-xs font-bold">ROI Projections</div>
                  <div className="text-[10px] text-muted-foreground">Buy vs Rent</div>
                </div>
                <div className="iron-stat-card text-center">
                  <Layers className="w-5 h-5 text-accent mx-auto mb-2" />
                  <div className="text-xs font-bold">Fleet Planning</div>
                  <div className="text-[10px] text-muted-foreground">Full Breakdown</div>
                </div>
                <div className="iron-stat-card text-center">
                  <Calculator className="w-5 h-5 text-accent mx-auto mb-2" />
                  <div className="text-xs font-bold">Parts Budget</div>
                  <div className="text-[10px] text-muted-foreground">Maintenance</div>
                </div>
              </div>

              {/* Estimate Includes */}
              <div className="iron-panel rounded-xl p-6" style={{ "--flash-index": 2 } as any}>
                <h3 className="font-black text-sm mb-3 uppercase tracking-wider">Estimate Includes</h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {[
                    "Primary equipment with models & quantities",
                    "Supporting equipment & power generation",
                    "Transportation & logistics costs",
                    "Maintenance & replacement parts budget",
                    "Personnel requirements",
                    "Complete cost summary (low/mid/high)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Card */}
              <div className="iron-panel rounded-xl p-6 border-accent/30 bg-accent/5" style={{ "--flash-index": 3 } as any}>
                <h3 className="font-black text-sm mb-2 text-accent uppercase">Need a Formal Quote?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  This AI estimate provides budget guidance. For exact pricing and availability, request a formal quote from our team.
                </p>
                <Link href="/quote">
                  <Button variant="outline" size="sm" className="border-accent/30 hover:bg-accent/10 font-semibold" data-testid="link-request-quote">
                    Request Quote <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Result Section */}
      {showResult && (
        <section className="py-16 bg-muted/30 border-t border-border" ref={resultRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={resultContainerRef}>
            <Card className="iron-panel rounded-2xl p-4 sm:p-8" data-testid="card-estimate-result">
              <div className="iron-scan" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-black truncate">IRON ESTIMATE REPORT</h2>
                    <p className="text-sm text-muted-foreground truncate">{projectName} — {projectType}</p>
                  </div>
                </div>
                {!isGenerating && estimateResult && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([estimateResult], { type: "text/markdown" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${projectName.replace(/\s+/g, "_")}_IRON_Estimate.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="font-semibold shrink-0"
                    data-testid="button-download-estimate"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download
                  </Button>
                )}
              </div>

              <div className="prose prose-sm max-w-none">
                {isGenerating && !estimateResult && (
                  <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 iron-ring" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--accent) / 0.2)" strokeWidth="2" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="20 12" />
                      </svg>
                      <Cpu className="absolute inset-0 m-auto w-6 h-6 text-accent" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Analyzing Project Requirements</p>
                      <p className="text-sm">Cross-referencing inventory data and generating estimate...</p>
                    </div>
                  </div>
                )}

                {estimateResult && (
                  <div className="space-y-1" data-testid="text-estimate-content">
                    {renderMarkdown(estimateResult)}
                  </div>
                )}

                {isGenerating && estimateResult && (
                  <div className="flex items-center gap-2 mt-4 text-accent text-sm font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </div>
                )}
              </div>

              {!isGenerating && estimateResult && (
                <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row gap-4">
                  <Link href="/quote">
                    <Button size="lg" className="bg-accent text-accent-foreground font-black px-8 shadow-lg shadow-accent/20" data-testid="button-request-formal-quote">
                      Request Formal Quote <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/equipment">
                    <Button variant="outline" size="lg" className="font-semibold" data-testid="button-browse-equipment">
                      Browse Equipment <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/parts">
                    <Button variant="outline" size="lg" className="font-semibold" data-testid="button-browse-parts">
                      Browse Parts Catalog <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
