"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Globe,
  FileText,
  Mail,
  FileCode,
  List,
  Loader2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Package,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  Settings,
  Eye,
  EyeOff,
  Shield,
  Star,
  Download,
  Inbox,
  Clock,
  ArrowUpRight,
  Lock,
  Briefcase
} from "lucide-react";
import { ApiResponse, EmailSwipe, BonusIdea } from "@/lib/types";

export default function Home() {
  // Inputs
  const [url, setUrl] = useState("");
  const [fallbackContent, setFallbackContent] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Custom configuration states
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyText, setShowKeyText] = useState(false);

  // Email Customizer States
  const [userName, setUserName] = useState("John Doe");
  const [affiliateLink, setAffiliateLink] = useState("https://warriorplus.com/o2/a/12345/0");

  // Accent Swapper state
  const [pageAccent, setPageAccent] = useState("violet");

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scrapingFailed, setScrapingFailed] = useState(false);

  // Results
  const [result, setResult] = useState<ApiResponse | null>(null);
  
  // UI Tabs & Toggles
  const [activeTab, setActiveTab] = useState<"analysis" | "bonuses" | "bonusPage" | "emails" >("analysis");
  const [expandedEmailIdx, setExpandedEmailIdx] = useState<number | null>(0);
  const [viewHtmlMode, setViewHtmlMode] = useState<"preview" | "code">("preview");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load configuration from localstorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("abg_openrouter_key");
      const savedModel = localStorage.getItem("abg_selected_model");
      const savedName = localStorage.getItem("abg_user_name");
      const savedLink = localStorage.getItem("abg_affiliate_link");
      
      if (savedKey) setOpenRouterKey(savedKey);
      if (savedModel) setSelectedModel(savedModel);
      if (savedName) setUserName(savedName);
      if (savedLink) setAffiliateLink(savedLink);
    }
  }, []);

  // Loading step checklist simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => {
          if (prev < 5) return prev + 1;
          return prev;
        });
      }, 5500); // Progress every 5.5 seconds (covers ~33 seconds total)
    } else {
      setLoadingStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleKeyChange = (val: string) => {
    setOpenRouterKey(val);
    localStorage.setItem("abg_openrouter_key", val);
  };

  const handleModelChange = (val: string) => {
    setSelectedModel(val);
    localStorage.setItem("abg_selected_model", val);
  };

  const handleNameChange = (val: string) => {
    setUserName(val);
    localStorage.setItem("abg_user_name", val);
  };

  const handleLinkChange = (val: string) => {
    setAffiliateLink(val);
    localStorage.setItem("abg_affiliate_link", val);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !fallbackContent.trim()) {
      setError("Please enter either a Sales Page URL or paste the content manually.");
      return;
    }

    setLoading(true);
    setError(null);
    setScrapingFailed(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          fallbackContent: fallbackContent.trim(),
          openRouterKey: openRouterKey.trim(),
          selectedModel: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.scrapingFailed) {
          setScrapingFailed(true);
          setShowManualInput(true);
          throw new Error(data.error || "Scraping failed. Please paste the sales page content manually below.");
        }
        throw new Error(data.error || "An error occurred during analysis.");
      }

      setResult(data);
      setActiveTab("analysis");
    } catch (err: any) {
      setError(err.message || "Failed to parse API response. Please check your setup.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Replace placeholders inside email copy dynamically
  const customizeEmailText = (text: string) => {
    if (!text) return "";
    let customized = text;
    if (userName.trim()) {
      customized = customized.replace(/\[Your Name\]/gi, userName).replace(/\[Name\]/gi, userName);
    }
    if (affiliateLink.trim()) {
      customized = customized.replace(/\[Affiliate Link\]/gi, affiliateLink).replace(/\[Link\]/gi, affiliateLink);
    }
    return customized;
  };

  // Swapper function to replace colors inside html template dynamically
  const applyAccentToHtml = (html: string, accent: string) => {
    if (!html) return "";
    if (accent === "violet") return html;
    
    const replacements: Record<string, { primary: string; secondary: string }> = {
      indigo: { primary: "indigo", secondary: "sky" },
      emerald: { primary: "emerald", secondary: "teal" },
      amber: { primary: "amber", secondary: "yellow" }
    };
    
    const colors = replacements[accent];
    if (!colors) return html;
    
    let finalHtml = html;
    // Swap tailwind classes
    finalHtml = finalHtml.replace(/violet/g, colors.primary);
    finalHtml = finalHtml.replace(/fuchsia/g, colors.secondary);
    return finalHtml;
  };

  const downloadHtmlFile = (html: string) => {
    const finalHtml = applyAccentToHtml(html, pageAccent);
    const blob = new Blob([finalHtml], { type: "text/html" });
    const urlStr = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlStr;
    a.download = `${result?.analysis.productName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "affiliate"}-bonuses.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(urlStr);
  };

  const handleQuickFill = (demoUrl: string) => {
    setUrl(demoUrl);
  };

  // Calculate dynamic stats
  const calculateTotalValue = (bonuses: BonusIdea[]) => {
    let total = 0;
    bonuses.forEach(b => {
      const val = parseInt(b.estimatedValue.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(val)) total += val;
    });
    return total > 0 ? `$${total}` : "$1,470";
  };

  const totalBonusValue = result ? calculateTotalValue(result.bonuses) : "$1,470";

  // Calculate estimated time saved based on character word count
  const calculateTimeSaved = () => {
    if (!result) return "4.5 Hours";
    const totalChars = JSON.stringify(result).length;
    const hours = Math.max(3.5, parseFloat((totalChars / 2200).toFixed(1)));
    return `${hours} Hours`;
  };

  const timeSavedMetric = calculateTimeSaved();

  // Delivery format badge styling config
  const getBadgeStyle = (format: string) => {
    const normFormat = format.toLowerCase();
    if (normFormat.includes("video")) return "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";
    if (normFormat.includes("pdf") || normFormat.includes("book") || normFormat.includes("guide")) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    if (normFormat.includes("template")) return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    if (normFormat.includes("swipe")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (normFormat.includes("prompt")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    return "bg-violet-500/10 text-violet-400 border-violet-500/20";
  };

  const loadingSteps = [
    "Scraping Sales Page Structure",
    "Extracting Features & Objections",
    "Identifying Customer Avatar Profile",
    "Generating 10 Custom Bonuses",
    "Designing Landing Page HTML Structure",
    "Writing Gmail Email Swipe Files"
  ];

  return (
    <div className="min-h-screen grid-bg relative text-slate-100 flex flex-col selection:bg-violet-500/30 font-sans">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "-4s" }} />

      {/* Header */}
      <header className="border-b border-white/5 py-4 px-6 md:px-12 backdrop-blur-md sticky top-0 z-50 bg-black/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Affiliate Bonus
              </span>
              <span className="font-semibold text-xl tracking-tight text-violet-400"> Generator</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400">
              Pro Dashboard
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-3.5 py-1.5 rounded-full self-center border border-violet-500/20 animate-pulse">
            High-converting Affiliate Suites
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
            Generate Campaigns That Sell{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
              Instantly
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Transform any sales page URL into a comprehensive marketing funnel complete with audience analysis, 10 bespoke bonuses, a coded landing page, and professional email swipes.
          </p>
        </div>

        {/* Input Card Container */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 max-w-3xl w-full mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
          
          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            
            {/* Settings Accordion */}
            <div className="border border-white/5 bg-white/5 rounded-xl p-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-between w-full text-sm font-semibold text-slate-200 focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-violet-400" />
                  <span>OpenRouter Settings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-normal">
                    {openRouterKey ? "API Key loaded" : "Using server key"} &bull; {selectedModel.includes("gemini") ? "Gemini 2.5 Flash" : selectedModel.includes("v4-flash") ? "DeepSeek V4 Flash" : "DeepSeek Chat"}
                  </span>
                  {showSettings ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </div>
              </button>

              {showSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 border-t border-white/5 pt-3 animate-fadeIn">
                  {/* API Key */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="openrouter-key" className="text-xs font-semibold text-slate-400">
                      OpenRouter API Key
                    </label>
                    <div className="relative">
                      <input
                        id="openrouter-key"
                        type={showKeyText ? "text" : "password"}
                        value={openRouterKey}
                        onChange={(e) => handleKeyChange(e.target.value)}
                        placeholder="sk-or-v1-..."
                        className="w-full pl-3 pr-10 py-2 rounded-lg glass-input text-xs text-white placeholder:text-slate-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeyText(!showKeyText)}
                        className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 focus:outline-none"
                      >
                        {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Saved locally in browser. If blank, server credentials are used.
                    </span>
                  </div>

                  {/* Model Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="model-select" className="text-xs font-semibold text-slate-400">
                      Select AI Model
                    </label>
                    <select
                      id="model-select"
                      value={selectedModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white bg-black focus:outline-none"
                    >
                      <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash (Fast & Structured)</option>
                      <option value="deepseek/deepseek-chat">DeepSeek Chat V3/V4 (Highly Stable & Fast)</option>
                      <option value="deepseek/deepseek-v4-flash">DeepSeek V4 Flash (Alternative)</option>
                    </select>
                    <span className="text-[10px] text-slate-500">
                      Choose between Gemini's fast structured output or DeepSeek.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="url" className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-violet-400" />
                  Product Sales Page URL
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Supports WarriorPlus, JVZoo, ClickBank</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://warriorplus.com/o2/a/..."
                    className="w-full pl-4 pr-4 py-3 rounded-xl glass-input text-white text-sm placeholder:text-slate-600"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-95 transition-all text-sm text-white min-w-[170px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Suite
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-300 rounded-xl flex items-start gap-3 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">Error processing request</span>
                  {error}
                </div>
              </div>
            )}

            {/* Manual Toggle */}
            <div className="border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                {showManualInput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showManualInput ? "Hide custom copy input" : "Or copy & paste sales page copy manually"}
              </button>

              {showManualInput && (
                <div className="mt-4 flex flex-col gap-2 animate-fadeIn">
                  <label htmlFor="fallback" className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-400" />
                    Sales Page Body Text
                  </label>
                  <textarea
                    id="fallback"
                    rows={6}
                    value={fallbackContent}
                    onChange={(e) => setFallbackContent(e.target.value)}
                    placeholder="Paste the headlines, testimonials, and copy of the product sales page here..."
                    className="w-full p-4 rounded-xl glass-input text-white text-xs placeholder:text-slate-600 resize-y"
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          </form>

          {/* Loading Overlay with Stateful Checklist */}
          {loading && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-50">
              <div className="relative mb-8">
                <div className="w-16 h-16 rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-violet-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-6">Compiling Affiliate Suite</h3>
              
              {/* Generation Checklist */}
              <div className="flex flex-col gap-3 w-full max-w-sm text-left border border-white/5 bg-white/5 p-5 rounded-2xl">
                {loadingSteps.map((step, idx) => {
                  const isDone = idx < loadingStepIndex;
                  const isCurrent = idx === loadingStepIndex;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs transition-all duration-300">
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          </div>
                        ) : isCurrent ? (
                          <div className="relative flex items-center justify-center w-4 h-4">
                            <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping absolute" />
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 absolute" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/10" />
                        )}
                        <span className={`font-medium ${isDone ? "text-slate-400" : isCurrent ? "text-white font-bold" : "text-slate-600"}`}>
                          {step}
                        </span>
                      </div>
                      {isDone && <span className="text-[10px] text-emerald-400 font-mono font-semibold">Ready</span>}
                      {isCurrent && <span className="text-[10px] text-violet-400 font-mono font-semibold animate-pulse">Running</span>}
                    </div>
                  );
                })}
              </div>

              <span className="text-[10px] text-slate-500 mt-6 font-mono">Total process time ranges between 15-30 seconds.</span>
            </div>
          )}
        </div>

        {/* Empty State visual */}
        {!result && !loading && (
          <div className="max-w-3xl w-full mx-auto border border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-6 bg-white/[0.01]">
            <div className="p-4 bg-violet-950/10 border border-white/5 rounded-2xl relative shadow-xl">
              <div className="absolute inset-0 bg-violet-500/5 blur-xl rounded-full" />
              <Briefcase className="w-8 h-8 text-violet-400 relative z-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-lg text-white">Campaign Blueprint Pending</h3>
              <p className="text-slate-400 text-sm max-w-md">
                Paste any WarriorPlus, JVZoo, ClickBank, or Sales Page URL and generate a complete affiliate campaign in seconds.
              </p>
            </div>
            {/* Quick Demo Badges */}
            <div className="flex flex-col gap-2.5 items-center mt-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Or try with these example pages:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { name: "YouTube Creator Program", url: "https://getyoutubesuperstar.live" },
                  { name: "ClickFunnels 2.0 Launch", url: "https://www.clickfunnels.com" }
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickFill(demo.url)}
                    className="text-[11px] px-3.5 py-1.5 bg-white/5 border border-white/10 hover:border-violet-500/40 rounded-lg hover:bg-white/10 text-slate-300 font-medium transition-all"
                  >
                    {demo.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success State rewards Banner */}
        {result && (
          <div className="max-w-7xl w-full mx-auto bg-gradient-to-r from-violet-950/20 via-slate-900/40 to-violet-950/20 border border-violet-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl animate-fadeIn">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  Campaign Generated Successfully
                </h3>
                <p className="text-slate-400 text-xs">AI has audited the sales page, mapped avatar objections, and drafted custom promos.</p>
              </div>
            </div>
            {/* Quick Stat tags */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="bg-black/30 border border-white/5 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Time Saved</span>
                <span className="text-sm font-black text-violet-400">{timeSavedMetric}</span>
              </div>
              <div className="bg-black/30 border border-white/5 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Bonus Value</span>
                <span className="text-sm font-black text-emerald-400">{totalBonusValue}</span>
              </div>
              <div className="bg-black/30 border border-white/5 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Funnel Readiness</span>
                <span className="text-sm font-black text-cyan-400">98%</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Ready To Launch
              </div>
            </div>
          </div>
        )}

        {/* Results Container */}
        {result && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Tabs Header */}
            <div className="flex border-b border-white/5 overflow-x-auto gap-2 p-1 bg-white/5 rounded-2xl backdrop-blur-md">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                  activeTab === "analysis"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                1. Product Analysis
              </button>
              <button
                onClick={() => setActiveTab("bonuses")}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                  activeTab === "bonuses"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                2. Bonus Finder (10 Ideas)
              </button>
              <button
                onClick={() => setActiveTab("bonusPage")}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                  activeTab === "bonusPage"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                3. Bonus Page Builder
              </button>
              <button
                onClick={() => setActiveTab("emails")}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                  activeTab === "emails"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                4. Email Swipes
              </button>
            </div>

            {/* Tab Panels */}
            
            {/* 1. PRODUCT ANALYSIS DASHBOARD */}
            {activeTab === "analysis" && (
              <div className="flex flex-col gap-6">
                
                {/* Audit Grid Widget */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Quality Score card */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-violet-500/10"><Zap className="w-12 h-12" /></div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Audited Offer Score</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-black text-violet-400">{result.analysis.offerQualityScore || "8.5"}</span>
                      <span className="text-xs text-slate-500">/ 10 Rating</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal border-t border-white/5 pt-2 mt-2">
                      Audited for copywriting hooks, clarity, and bonus package alignment strength.
                    </p>
                  </div>

                  {/* EPC Potential Card */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-emerald-500/10"><Target className="w-12 h-12" /></div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">EPC Conversion Potential</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-black text-emerald-400 uppercase tracking-wide">
                        {result.analysis.epcPotential || "High"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal border-t border-white/5 pt-2 mt-2">
                      Estimated EPC ranking based on USP strength, price tier structure, and avatar need.
                    </p>
                  </div>

                  {/* Competitor Gap Card */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden col-span-1">
                    <div className="absolute top-0 right-0 p-4 text-cyan-500/10"><Shield className="w-12 h-12" /></div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Competitor Gap Analysis</span>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2.5 italic">
                      &ldquo;{result.analysis.competitorGapAnalysis}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Dashboard layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left block */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Core details */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden">
                      <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
                        <List className="w-4 h-4 text-violet-400" />
                        Product Overview
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1 font-bold">Product Name</span>
                          <p className="text-lg font-black text-white">{result.analysis.productName}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1 font-bold">Ideal Customer Avatar</span>
                          <p className="text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 leading-relaxed">{result.analysis.targetAudience}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5 font-bold">Main Unique Selling Proposition (USP)</span>
                        <p className="text-xs text-slate-200 bg-gradient-to-r from-violet-950/25 to-indigo-950/25 p-4 rounded-xl border border-violet-500/15 font-medium italic leading-relaxed shadow-inner">
                          &ldquo;{result.analysis.usp}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Features vs Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2.5 flex items-center gap-2">
                          <List className="w-3.5 h-3.5 text-violet-400" />
                          Extracted Features
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                          {result.analysis.features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                              <span className="leading-normal">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2.5 flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-emerald-400" />
                          Extracted Benefits
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                          {result.analysis.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              <span className="leading-normal">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right Column details */}
                  <div className="flex flex-col gap-6">
                    {/* Marketing Hook swipes */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        Campaign Hook Swipes
                      </h3>
                      <div className="flex flex-col gap-3">
                        {result.analysis.marketingHooks?.map((hook, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex flex-col gap-2 relative group hover:border-violet-500/30 transition-all">
                            <span className="text-[9px] uppercase font-bold text-violet-400 tracking-wider">
                              Hook Option #{idx + 1}
                            </span>
                            <p className="text-xs font-semibold text-slate-200 select-all leading-relaxed pr-10">
                              &ldquo;{hook}&rdquo;
                            </p>
                            <button
                              onClick={() => copyToClipboard(hook, `hook-${idx}`)}
                              className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                              title="Copy Hook"
                            >
                              {copiedField === `hook-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pain Points */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
                      <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
                        <Target className="w-4 h-4 text-rose-400" />
                        Avatar Pain Points Resolved
                      </h3>
                      <ul className="flex flex-col gap-3">
                        {result.analysis.painPoints.map((point, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                            <span className="leading-normal">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Marketing Angles */}
                    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
                      <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2.5 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        Top Promotion Angles
                      </h3>
                      <ul className="flex flex-col gap-3">
                        {result.analysis.marketingAngles.map((angle, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20 shrink-0">
                              Angle {idx + 1}
                            </span>
                            <span className="leading-normal">{angle}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 2. BONUS FINDER */}
            {activeTab === "bonuses" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                
                {/* Stat Cards Stack Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col gap-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 text-emerald-500/10"><Zap className="w-12 h-12" /></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Bonus Value</span>
                    <span className="text-2xl font-black text-emerald-400">{totalBonusValue}</span>
                  </div>
                  <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col gap-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 text-violet-500/10"><Package className="w-12 h-12" /></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Bonuses</span>
                    <span className="text-2xl font-black text-violet-400">10 Bonuses</span>
                  </div>
                  <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col gap-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 text-cyan-500/10"><Shield className="w-12 h-12" /></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Objection Matrix Strength</span>
                    <span className="text-2xl font-black text-cyan-400">94 / 100</span>
                  </div>
                  <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col gap-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 text-fuchsia-500/10"><Star className="w-12 h-12" /></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">EPC Boost Impact</span>
                    <span className="text-2xl font-black text-fuchsia-400 animate-pulse">High</span>
                  </div>
                </div>

                {/* Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.bonuses.map((bonus: BonusIdea, idx: number) => (
                    <div key={idx} className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-bl-xl border-l border-b border-white/5">
                        Bonus #{idx + 1}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                            {bonus.estimatedValue} Value
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${getBadgeStyle(bonus.deliveryFormat)}`}>
                            Format: {bonus.deliveryFormat}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-white pr-20 leading-tight">{bonus.name}</h4>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-0.5">Description</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{bonus.description}</p>
                        </div>
                        
                        {/* Objection & Conversion details */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                          <div className="flex items-start gap-2">
                            <Shield className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[9px] text-cyan-400 font-bold block uppercase tracking-wider">Objection Solved</span>
                              <p className="text-xs text-slate-300 font-medium leading-relaxed">{bonus.objectionSolved}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 border-t border-white/5 pt-2">
                            <Star className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[9px] text-emerald-400 font-bold block uppercase tracking-wider">Conversion Benefit</span>
                              <p className="text-xs text-slate-300 font-medium leading-relaxed">{bonus.conversionBenefit}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. BONUS PAGE BUILDER */}
            {activeTab === "bonusPage" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                
                {/* Color Swapper preset controls */}
                <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between border border-white/5 gap-4">
                  <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4 text-violet-400" />
                    <span>Custom Landing Page Theme Accent:</span>
                  </div>
                  
                  {/* Buttons presets */}
                  <div className="flex items-center gap-2">
                    {[
                      { id: "violet", label: "Violet Glow", color: "bg-violet-600" },
                      { id: "indigo", label: "Indigo Pulse", color: "bg-indigo-600" },
                      { id: "emerald", label: "Emerald growth", color: "bg-emerald-600" },
                      { id: "amber", label: "Amber Warmth", color: "bg-amber-600" }
                    ].map((accent) => (
                      <button
                        key={accent.id}
                        onClick={() => setPageAccent(accent.id)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all focus:outline-none ${
                          pageAccent === accent.id
                            ? "bg-white/10 text-white border-white/30"
                            : "border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${accent.color}`} />
                        {accent.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Code editor */}
                  <div className="glass-panel rounded-2xl overflow-hidden h-[650px] flex flex-col border border-white/10 shadow-2xl">
                    <div className="bg-black/80 px-4 py-3 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      </div>
                      <span className="font-mono text-[10px]">bonus-page.html</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(applyAccentToHtml(result.bonusPage.htmlTemplate, pageAccent), "bonus-page-html")}
                          className="hover:text-white flex items-center gap-1.5 focus:outline-none transition-colors"
                        >
                          {copiedField === "bonus-page-html" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy HTML
                            </>
                          )}
                        </button>
                        <span className="text-slate-700">|</span>
                        <button
                          onClick={() => downloadHtmlFile(result.bonusPage.htmlTemplate)}
                          className="hover:text-white flex items-center gap-1.5 focus:outline-none transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    </div>
                    <pre className="flex-1 p-6 overflow-auto text-xs font-mono text-violet-300/80 bg-black/60 selection:bg-violet-500/40">
                      <code>{applyAccentToHtml(result.bonusPage.htmlTemplate, pageAccent)}</code>
                    </pre>
                  </div>

                  {/* Iframe Visual Preview */}
                  <div className="glass-panel rounded-2xl overflow-hidden h-[650px] flex flex-col border border-white/10 shadow-2xl">
                    <div className="bg-black/80 px-4 py-3 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">Visual Sales Page Preview</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-500">Rendered via sandboxed iframe</span>
                      </div>
                    </div>
                    <iframe
                      srcDoc={applyAccentToHtml(result.bonusPage.htmlTemplate, pageAccent)}
                      className="flex-1 w-full bg-[#030014] border-none"
                      sandbox="allow-scripts"
                      title="Bonus Page Preview"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* 4. EMAIL SWIPES (GMAIL-STYLE ACCORDION) */}
            {activeTab === "emails" && (
              <div className="flex flex-col gap-6 max-w-4xl w-full mx-auto animate-fadeIn">
                
                {/* Inbox personalization mockup */}
                <div className="glass-panel rounded-xl p-5 border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-400 border-b border-white/5 pb-2">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Email Swipe Personalization Engine</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="user-name-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Sender Name (Replacer)
                      </label>
                      <input
                        id="user-name-input"
                        type="text"
                        value={userName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="John Doe"
                        className="px-3.5 py-2 text-xs rounded-lg glass-input text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="aff-link-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Your Affiliate Link (Replacer)
                      </label>
                      <input
                        id="aff-link-input"
                        type="text"
                        value={affiliateLink}
                        onChange={(e) => handleLinkChange(e.target.value)}
                        placeholder="https://warriorplus.com/..."
                        className="px-3.5 py-2 text-xs rounded-lg glass-input text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Any placeholder like [Name], [Your Name], or [Affiliate Link] inside the subject line and email body is dynamically replaced in real-time as you type.
                  </span>
                </div>

                {/* Accordion List */}
                <div className="flex flex-col gap-4">
                  {result.emails.map((email: EmailSwipe, idx: number) => {
                    const isExpanded = expandedEmailIdx === idx;
                    
                    const getMailAvatarText = (type: string) => {
                      if (type === "announcement") return "A";
                      if (type === "benefits") return "B";
                      if (type === "faq") return "F";
                      return "L";
                    };

                    const getMailBadgeStyle = (type: string) => {
                      if (type === "announcement") return "bg-sky-500/10 text-sky-400 border-sky-500/20";
                      if (type === "benefits") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      if (type === "faq") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
                      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
                    };

                    const customizedSubject = customizeEmailText(email.subject);
                    const customizedBody = customizeEmailText(email.body);

                    return (
                      <div
                        key={idx}
                        className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                          isExpanded
                            ? "bg-white/[0.03] border-violet-500/30 shadow-lg shadow-violet-500/5"
                            : "glass-panel border-transparent hover:border-white/5"
                        }`}
                      >
                        {/* Header bar */}
                        <button
                          onClick={() => setExpandedEmailIdx(isExpanded ? null : idx)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                        >
                          <div className="flex items-center gap-4 flex-1 pr-10 overflow-hidden">
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-xs text-violet-400 shrink-0">
                              {getMailAvatarText(email.type)}
                            </div>
                            
                            <div className="flex flex-col gap-0.5 overflow-hidden w-full">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${getMailBadgeStyle(email.type)}`}>
                                  {email.type}
                                </span>
                                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                                  Curiosity: {email.curiosityScore || "9"}/10
                                </span>
                                <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                                  Urgency: {email.urgencyScore || "8"}/10
                                </span>
                              </div>
                              <span className="font-bold text-sm text-white truncate max-w-lg mt-1">{customizedSubject}</span>
                              {!isExpanded && (
                                <span className="text-xs text-slate-500 truncate max-w-xl font-medium">{email.previewText}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] text-slate-500 font-mono">Inbox</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </button>

                        {/* Expandable Body content */}
                        {isExpanded && (
                          <div className="px-5 pb-6 pt-2 border-t border-white/5 flex flex-col gap-4 animate-fadeIn">
                            
                            {/* Gmail sender header */}
                            <div className="flex items-center justify-between text-xs text-slate-400 bg-white/5 p-3 rounded-lg border border-white/5">
                              <div>
                                <p className="font-semibold text-white">To: <span className="text-slate-400 font-normal">[Affiliate List]</span></p>
                                <p className="mt-0.5">Subject: <span className="text-violet-400 select-all font-semibold">{customizedSubject}</span></p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => copyToClipboard(customizedSubject, `sub-${idx}`)}
                                  className="hover:text-white text-[10px] font-bold flex items-center gap-1 focus:outline-none"
                                >
                                  {copiedField === `sub-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  Subject
                                </button>
                                <span className="text-slate-700">|</span>
                                <button
                                  onClick={() => {
                                    const fullText = `Subject: ${customizedSubject}\nPreview: ${email.previewText}\n\n${customizedBody}`;
                                    copyToClipboard(fullText, `full-${idx}`);
                                  }}
                                  className="hover:text-white text-[10px] font-bold flex items-center gap-1 focus:outline-none"
                                >
                                  {copiedField === `full-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  Full Email
                                </button>
                              </div>
                            </div>

                            {/* Email body block */}
                            <div className="bg-black/50 border border-white/5 rounded-xl p-5 md:p-6 text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-line font-sans select-all shadow-inner">
                              {customizedBody}
                            </div>

                            {/* Recommended Call To Action swipe info */}
                            <div className="bg-violet-950/20 border border-violet-500/10 rounded-xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Recommended Call To Action</span>
                                  <span className="text-xs font-bold text-white leading-normal">{email.ctaText}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => copyToClipboard(customizedBody, `body-${idx}`)}
                                className="px-3.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none"
                              >
                                {copiedField === `body-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                Copy Body
                              </button>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-slate-500 text-xs mt-12 bg-black/20">
        <div className="max-w-7xl mx-auto">
          &copy; {new Date().getFullYear()} Affiliate Bonus Generator. All rights reserved. Powered by OpenRouter.
        </div>
      </footer>
    </div>
  );
}
