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
  EyeOff
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

  // Load configuration from localstorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("abg_openrouter_key");
      const savedModel = localStorage.getItem("abg_selected_model");
      if (savedKey) setOpenRouterKey(savedKey);
      if (savedModel) setSelectedModel(savedModel);
    }
  }, []);

  const handleKeyChange = (val: string) => {
    setOpenRouterKey(val);
    localStorage.setItem("abg_openrouter_key", val);
  };

  const handleModelChange = (val: string) => {
    setSelectedModel(val);
    localStorage.setItem("abg_selected_model", val);
  };

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scrapingFailed, setScrapingFailed] = useState(false);

  // Results
  const [result, setResult] = useState<ApiResponse | null>(null);
  
  // UI Tabs & Toggles
  const [activeTab, setActiveTab] = useState<"analysis" | "bonuses" | "bonusPage" | "emails">("analysis");
  const [selectedEmailType, setSelectedEmailType] = useState<string>("announcement");
  const [viewHtmlMode, setViewHtmlMode] = useState<"preview" | "code">("preview");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Animated loading step simulator
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      const steps = [
        "Connecting to Jina Reader...",
        "Scraping sales page structure...",
        "Cleaning extracted markdown content...",
        "Analyzing product value proposition...",
        "Determining target audience pain points...",
        "Ideating 10 complementary high-value bonuses...",
        "Architecting conversion-optimized bonus page HTML...",
        "Drafting announcement and urgency email swipes...",
        "Validating JSON payload structures...",
        "Polishing copywriting copy..."
      ];
      let currentStep = 0;
      setLoadingStep(steps[0]);

      loadingIntervalRef.current = setInterval(() => {
        currentStep = (currentStep + 1) % steps.length;
        setLoadingStep(steps[currentStep]);
      }, 4000);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [loading]);

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
      setLoadingStep("");
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Get selected email
  const currentEmail = result?.emails.find(e => e.type === selectedEmailType) || result?.emails[0];

  return (
    <div className="min-h-screen grid-bg relative text-slate-100 flex flex-col selection:bg-violet-500/30">
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
            <span className="text-xs font-semibold px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400">
              MVP Validator
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
            Generate Affiliate Bonuses & Emails{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
              Instantly
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Paste a product sales page URL. Our AI extracts core features, designs 10 high-value bonuses, compiles an elegant HTML bonus page, and drafts a 4-part conversion swipe file.
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
                  <span>OpenRouter & Model Settings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-normal">
                    {openRouterKey ? "Key configured" : "Using server fallback"} &bull; {selectedModel.includes("gemini") ? "Gemini 2.5 Flash" : "DeepSeek V4 Flash"}
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
                        className="w-full pl-3 pr-10 py-2 rounded-lg glass-input text-sm text-white placeholder:text-slate-600 font-mono"
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
                      Saved locally in your browser. Leaving this empty uses server-side default keys.
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
                      className="w-full px-3 py-2 rounded-lg glass-input text-sm text-white bg-black focus:outline-none"
                    >
                      <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash (Fast & Structured)</option>
                      <option value="deepseek/deepseek-v4-flash">DeepSeek V4 Flash (High Performance)</option>
                    </select>
                    <span className="text-[10px] text-slate-500">
                      Choose between Google's speed and DeepSeek's analytical precision.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="url" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-400" />
                Product Sales Page URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/awesome-product"
                    className="w-full pl-4 pr-4 py-3.5 rounded-xl glass-input text-white text-base placeholder:text-slate-600"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-95 transition-all text-white min-w-[170px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Suite
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-300 rounded-xl flex items-start gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
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
                {showManualInput ? "Hide sales page content box" : "Or paste sales page content manually (if URL scraping fails/fails to load)"}
              </button>

              {showManualInput && (
                <div className="mt-4 flex flex-col gap-2 animate-fadeIn">
                  <label htmlFor="fallback" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-400" />
                    Sales Page Text Content
                  </label>
                  <textarea
                    id="fallback"
                    rows={8}
                    value={fallbackContent}
                    onChange={(e) => setFallbackContent(e.target.value)}
                    placeholder="Paste headers, body copy, features, benefits and any promotional text from the sales page here..."
                    className="w-full p-4 rounded-xl glass-input text-white text-sm placeholder:text-slate-600 resize-y"
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-500">
                    If scraping fails or the URL requires JS execution, copy all text content from the product page (Ctrl+A / Ctrl+C) and paste it above.
                  </p>
                </div>
              )}
            </div>
          </form>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-violet-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Synthesizing Affiliate Assets</h3>
              <p className="text-violet-400 text-sm max-w-sm font-mono animate-pulse">{loadingStep}</p>
              <span className="text-xs text-slate-500 mt-8">Please wait, compiling the full 10-bonus system. This can take up to 30-40 seconds.</span>
            </div>
          )}
        </div>

        {/* Results Container */}
        {result && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Tabs Header */}
            <div className="flex border-b border-white/5 overflow-x-auto gap-2 p-1 bg-white/5 rounded-2xl backdrop-blur-md">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === "analysis"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <List className="w-4 h-4" />
                1. Product Analysis
              </button>
              <button
                onClick={() => setActiveTab("bonuses")}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === "bonuses"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Package className="w-4 h-4" />
                2. Bonus Finder (10 Ideas)
              </button>
              <button
                onClick={() => setActiveTab("bonusPage")}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === "bonusPage"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <FileCode className="w-4 h-4" />
                3. Bonus Page HTML
              </button>
              <button
                onClick={() => setActiveTab("emails")}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === "emails"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Mail className="w-4 h-4" />
                4. Email Swipes
              </button>
            </div>

            {/* Tab Panels */}
            
            {/* 1. PRODUCT ANALYSIS */}
            {activeTab === "analysis" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Core Details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Overview Panel */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-violet-400" />
                      Product Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Product Name</span>
                        <p className="text-lg font-bold text-white">{result.analysis.productName}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Target Audience</span>
                        <p className="text-sm font-medium text-slate-300">{result.analysis.targetAudience}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Unique Selling Proposition (USP)</span>
                      <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5 font-medium italic leading-relaxed">
                        &ldquo;{result.analysis.usp}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Features & Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
                      <h4 className="font-bold text-white border-b border-white/5 pb-2 text-sm uppercase tracking-wider text-slate-300">
                        Extracted Features
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {result.analysis.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
                      <h4 className="font-bold text-white border-b border-white/5 pb-2 text-sm uppercase tracking-wider text-slate-300">
                        Extracted Benefits
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {result.analysis.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Column 2: Pain points and Marketing angles */}
                <div className="flex flex-col gap-6">
                  {/* Pain Points */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-rose-400" />
                      Pain Points Solved
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {result.analysis.painPoints.map((point, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Marketing Angles */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      Angle Swipes / Marketing Angles
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {result.analysis.marketingAngles.map((angle, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-cyan-400 font-bold mr-1">{idx + 1}.</span>
                          {angle}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 2. BONUS FINDER */}
            {activeTab === "bonuses" && (
              <div className="flex flex-col gap-6">
                <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">10 Custom Bonus Stack Ideas</h3>
                    <p className="text-slate-400 text-sm">Specially generated ideas that resolve product limitations, handle objections, and maximize sales conversions.</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(result.bonuses, null, 2), "json-bonuses")}
                    className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-all focus:outline-none"
                  >
                    {copiedField === "json-bonuses" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Copied JSON
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy JSON
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.bonuses.map((bonus: BonusIdea, idx: number) => (
                    <div key={idx} className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-bl-xl border-l border-b border-white/5">
                        Bonus #{idx + 1}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 self-start">
                          Value: {bonus.estimatedValue}
                        </span>
                        <h4 className="text-lg font-bold text-white pr-16">{bonus.name}</h4>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div>
                          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">Description</span>
                          <p className="text-sm text-slate-300 leading-relaxed">{bonus.description}</p>
                        </div>
                        <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                          <span className="text-xs text-violet-400 font-bold block mb-1 uppercase tracking-wider">Why It Helps Convert</span>
                          <p className="text-sm text-slate-300 leading-relaxed italic">&ldquo;{bonus.whyItHelps}&rdquo;</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. BONUS PAGE HTML */}
            {activeTab === "bonusPage" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Copy / Config Panel */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
                    <div>
                      <h4 className="font-bold text-white text-lg">Bonus Page Panel</h4>
                      <p className="text-slate-400 text-xs mt-1">Rendered and compiled HTML ready for deployment as an affiliate bonus page.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Switch View</span>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-xl border border-white/5">
                        <button
                          onClick={() => setViewHtmlMode("preview")}
                          className={`py-2 rounded-lg font-semibold text-xs transition-all ${
                            viewHtmlMode === "preview"
                              ? "bg-violet-600 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Visual Preview
                        </button>
                        <button
                          onClick={() => setViewHtmlMode("code")}
                          className={`py-2 rounded-lg font-semibold text-xs transition-all ${
                            viewHtmlMode === "code"
                              ? "bg-violet-600 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Source Code
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(result.bonusPage.htmlTemplate, "bonus-page-html")}
                      className="w-full py-3 bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 transition-all focus:outline-none"
                    >
                      {copiedField === "bonus-page-html" ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-300 animate-bounce" />
                          Copied HTML Code!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy Entire HTML
                        </>
                      )}
                    </button>

                    <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                      <div>
                        <span className="text-xs text-slate-500 uppercase block mb-1">Headline Content</span>
                        <p className="text-sm text-slate-300 font-semibold">{result.bonusPage.headline}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 uppercase block mb-1">Scarcity Warning</span>
                        <p className="text-xs text-yellow-400 bg-yellow-950/20 p-2 border border-yellow-500/10 rounded">{result.bonusPage.scarcitySection}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HTML Display Panel */}
                <div className="lg:col-span-3">
                  {viewHtmlMode === "preview" ? (
                    <div className="glass-panel rounded-2xl overflow-hidden h-[650px] flex flex-col border border-white/10 shadow-2xl relative">
                      <div className="bg-black/80 px-4 py-3 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        </div>
                        <span className="font-mono bg-white/5 px-3 py-1 rounded border border-white/5">Bonus Page Sandboxed Preview</span>
                        <span className="w-10" />
                      </div>
                      <iframe
                        srcDoc={result.bonusPage.htmlTemplate}
                        className="flex-1 w-full bg-white border-none"
                        sandbox="allow-scripts"
                        title="Bonus Page Preview"
                      />
                    </div>
                  ) : (
                    <div className="glass-panel rounded-2xl overflow-hidden h-[650px] flex flex-col border border-white/10 shadow-2xl">
                      <div className="bg-black/80 px-4 py-3 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono">bonus-page.html</span>
                        <button
                          onClick={() => copyToClipboard(result.bonusPage.htmlTemplate, "bonus-page-html-source")}
                          className="hover:text-white flex items-center gap-1 focus:outline-none"
                        >
                          {copiedField === "bonus-page-html-source" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy Source
                        </button>
                      </div>
                      <pre className="flex-1 p-6 overflow-auto text-xs font-mono text-violet-300/90 bg-black/60 selection:bg-violet-500/40">
                        <code>{result.bonusPage.htmlTemplate}</code>
                      </pre>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 4. EMAIL SWIPES */}
            {activeTab === "emails" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Email Selector Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-3">
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-500 px-2 py-1">
                    Select Email Swipe Type
                  </div>
                  {[
                    { id: "announcement", label: "1. Announcement", desc: "Launch the offer & bonus stack" },
                    { id: "benefits", label: "2. Benefits Angle", desc: "Deeper look at core values" },
                    { id: "faq", label: "3. FAQ / Obstacles", desc: "Answering objections directly" },
                    { id: "last-chance", label: "4. Last Chance", desc: "Urgency and deadline closing" }
                  ].map((emailOpt) => (
                    <button
                      key={emailOpt.id}
                      onClick={() => setSelectedEmailType(emailOpt.id)}
                      className={`text-left p-4 rounded-xl border transition-all focus:outline-none flex flex-col gap-1 ${
                        selectedEmailType === emailOpt.id
                          ? "bg-violet-600/10 border-violet-500/50 text-white shadow-md shadow-violet-500/5"
                          : "glass-panel border-transparent text-slate-400 hover:text-slate-200 hover:border-white/5"
                      }`}
                    >
                      <span className="font-bold text-sm text-slate-200">{emailOpt.label}</span>
                      <span className="text-xs text-slate-400 leading-tight">{emailOpt.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Email Details Display */}
                {currentEmail && (
                  <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-6 border border-white/10 shadow-2xl relative">
                      <div className="absolute top-0 right-0 p-4">
                        <button
                          onClick={() => {
                            const emailCopy = `Subject: ${currentEmail.subject}\nPreview: ${currentEmail.previewText}\n\n${currentEmail.body}`;
                            copyToClipboard(emailCopy, `email-${currentEmail.type}`);
                          }}
                          className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-all focus:outline-none"
                        >
                          {copiedField === `email-${currentEmail.type}` ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              Copied Entire Email
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Swipe
                            </>
                          )}
                        </button>
                      </div>

                      {/* Subject */}
                      <div className="border-b border-white/5 pb-4 pr-32">
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Subject Line</span>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-white select-all">{currentEmail.subject}</p>
                          <button
                            onClick={() => copyToClipboard(currentEmail.subject, "subj")}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy Subject"
                          >
                            {copiedField === "subj" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Preview Text */}
                      <div className="border-b border-white/5 pb-4">
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Preview Text / Teaser</span>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-300 select-all font-medium italic">{currentEmail.previewText}</p>
                          <button
                            onClick={() => copyToClipboard(currentEmail.previewText, "prev")}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy Preview"
                          >
                            {copiedField === "prev" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Body */}
                      <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-2">Email Body</span>
                        <div className="bg-black/40 border border-white/5 rounded-xl p-5 md:p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans select-all">
                          {currentEmail.body}
                        </div>
                      </div>

                      {/* CTA Info */}
                      <div className="bg-violet-950/20 border border-violet-500/10 rounded-xl p-4 flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase block font-semibold">Recommended Call To Action</span>
                          <span className="text-sm font-bold text-white">{currentEmail.ctaText}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-slate-500 text-xs mt-12 bg-black/20">
        <div className="max-w-7xl mx-auto">
          &copy; {new Date().getFullYear()} Affiliate Bonus Generator. Built as a fast-deployment Vercel MVP. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
