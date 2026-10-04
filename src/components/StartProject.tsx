import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef, useEffect, useMemo } from "react";
import AnimatedHeading from "./AnimatedHeading";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

export interface ProjectInquiryData {
  name: string;
  phone: string;
  email: string;
  projectType: string;
  scope: string;
  size: number;
  budget: string;
  timeline: string;
  location: string;
  serviceDepth: string;
  images: File[];
  date: string;
}

export const PROJECT_TYPES = [
  { 
    id: "construction", 
    title: "Construction & Civil", 
    baseRate: 45000, 
    icon: "architecture",
    desc: "Foundations, structural frame, core & shell, complete new builds."
  },
  { 
    id: "interior", 
    title: "Interior Design & Fit-Out", 
    baseRate: 25000, 
    icon: "design_services",
    desc: "Luxury joinery, spatial optimization, acoustic lighting, MEP."
  },
  { 
    id: "renovation", 
    title: "Renovation & Remodeling", 
    baseRate: 30000, 
    icon: "home_repair_service",
    desc: "Structural restoration, modernization, commercial & home overhaul."
  },
  { 
    id: "commercial", 
    title: "Custom Commercial Setup", 
    baseRate: 35000, 
    icon: "storefront",
    desc: "Corporate headquarters, retail flagships, hospitality complexes."
  },
  { 
    id: "engineering", 
    title: "Structural Engineering", 
    baseRate: 40000, 
    icon: "precision_manufacturing",
    desc: "Load analysis, seismic integrity, concrete reinforcing, civil audits."
  }
];

export const SERVICE_DEPTHS = [
  { 
    id: "basic", 
    title: "Basic / Essential", 
    multiplier: 1.0, 
    description: "Minor upgrades, finishing touches, or essential maintenance." 
  },
  { 
    id: "standard", 
    title: "Standard / Optimized", 
    multiplier: 1.5, 
    description: "Structured architectural design, moderate remodeling, and quality fit-out." 
  },
  { 
    id: "full", 
    title: "Full Turnkey Service", 
    multiplier: 2.5, 
    description: "End-to-end architecture, structural delivery, bespoke interiors, and project supervision." 
  }
];

export const CURRENCY_RATE = 0.0077; // 1 KES to USD approx

export default function StartProject() {
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [formData, setFormData] = useState<ProjectInquiryData>({
    name: "",
    phone: "",
    email: "",
    projectType: "construction",
    scope: "",
    size: 150,
    budget: "",
    timeline: "standard",
    location: "Nairobi, Kenya",
    serviceDepth: "standard",
    images: [],
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log("Video playback handled:", err));
    }
  }, []);

  const [clientCopyFailed, setClientCopyFailed] = useState<boolean>(false);

  // Share live Start Project progress with the chat assistant (read by YanhalBot on each message).
  useEffect(() => {
    try {
      localStorage.setItem("yanhal_project_context", JSON.stringify({
        step,
        totalSteps: 4,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        projectType: formData.projectType,
        serviceDepth: formData.serviceDepth,
        sizeSqm: formData.size,
        location: formData.location,
        scope: formData.scope,
        timeline: formData.timeline,
        submitted: isSubmitted,
        updatedAt: Date.now(),
      }));
    } catch (_) {}
  }, [step, formData.name, formData.email, formData.phone, formData.projectType, formData.serviceDepth, formData.size, formData.location, formData.scope, formData.timeline, isSubmitted]);

  // Real-time Dynamic Cost Estimator Calculation
  const calculation = useMemo(() => {
    const selectedType = PROJECT_TYPES.find(t => t.id === formData.projectType) || PROJECT_TYPES[0];
    const selectedDepth = SERVICE_DEPTHS.find(d => d.id === formData.serviceDepth) || SERVICE_DEPTHS[1];
    
    const size = formData.size > 0 ? formData.size : 100;
    const baseAmount = selectedType.baseRate * size * selectedDepth.multiplier;

    return {
      base: baseAmount,
      minKes: Math.round(baseAmount * 0.9),
      maxKes: Math.round(baseAmount * 1.2),
      minUsd: Math.round(baseAmount * 0.9 * CURRENCY_RATE),
      maxUsd: Math.round(baseAmount * 1.2 * CURRENCY_RATE),
      ratePerSqm: selectedType.baseRate,
      multiplier: selectedDepth.multiplier,
      typeName: selectedType.title,
      depthName: selectedDepth.title
    };
  }, [formData.projectType, formData.size, formData.serviceDepth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "size" ? Math.max(0, Number(value) || 0) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...Array.from(e.target.files!)]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleReset = () => {
    setStep(1);
    setIsSubmitted(false);
  };

  const handleSubmitInquiry = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const selectedTypeTitle = PROJECT_TYPES.find(t => t.id === formData.projectType)?.title || formData.projectType;
      const selectedDepthTitle = SERVICE_DEPTHS.find(d => d.id === formData.serviceDepth)?.title || formData.serviceDepth;

      const formPayload = new FormData();
      formPayload.append("form-name", "estimator");
      formPayload.append("name", formData.name);
      formPayload.append("phone", formData.phone);
      formPayload.append("email", formData.email);
      formPayload.append("location", formData.location);
      formPayload.append("service", selectedTypeTitle);
      formPayload.append("scope", formData.scope || "No custom scope provided.");
      formPayload.append("size", formData.size.toString());
      formPayload.append("budget", formData.budget || `Estimated range: KES ${calculation.minKes.toLocaleString()} - ${calculation.maxKes.toLocaleString()}`);
      formPayload.append("message", `Project Depth: ${selectedDepthTitle}. Timeline: ${formData.timeline}. Estimate Range: KES ${calculation.minKes.toLocaleString()} - ${calculation.maxKes.toLocaleString()} ($${calculation.minUsd.toLocaleString()} - $${calculation.maxUsd.toLocaleString()} USD).`);

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file) => {
          formPayload.append("images", file);
        });
      }

      // Netlify serverless bodies are capped at ~6MB; drop images (and say so) rather than fail the whole enquiry.
      const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
      const totalImageBytes = (formData.images || []).reduce((sum, f) => sum + f.size, 0);
      const apiPayload = new FormData();
      formPayload.forEach((value, key) => {
        if (key === "images" && totalImageBytes > MAX_IMAGE_BYTES) return;
        apiPayload.append(key, value);
      });
      if (totalImageBytes > MAX_IMAGE_BYTES) {
        apiPayload.set("message", `${formPayload.get("message")} (${formData.images.length} image(s) were too large to attach; client will share them via WhatsApp.)`);
      }

      // Netlify Forms capture: awaited, so it counts as a durable record if the API route is down.
      const formsCapture: Promise<boolean> = fetch("/", { method: "POST", body: formPayload })
        .then(r => r.ok)
        .catch(err => { console.warn("Netlify Forms capture failed:", err); return false; });

      let apiOk = false;
      let apiError = "";
      let result: any = null;
      try {
        const res = await fetch("/api/send-estimate", { method: "POST", body: apiPayload });
        try { result = await res.json(); } catch (_) {}
        if (res.ok && result?.success) {
          apiOk = true;
        } else {
          apiError = result?.error || `the server responded with status ${res.status}`;
        }
      } catch (netErr: any) {
        apiError = navigator.onLine === false
          ? "your device appears to be offline"
          : `we could not reach the server (${netErr?.message || "network error"})`;
      }

      const formsOk = await formsCapture;
      if (!apiOk && !formsOk) {
        throw new Error(apiError || "the enquiry could not be recorded");
      }
      if (!apiOk) console.warn("Enquiry stored via Netlify Forms only; API route failed:", apiError);

      setClientCopyFailed(!result?.clientEmailSent);
      setIsSubmitted(true);
      setTimeout(() => {
        handleReset();
      }, 7000);
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert(`We couldn't send your enquiry: ${err?.message || "unexpected error"}. Please try again, or call us directly at +254 724 093256.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      id="contact" 
      className="relative py-24 sm:py-32 px-5 sm:px-8 lg:px-12 overflow-hidden bg-[#2D2926] text-[#FAF8F5]"
    >
      {/* Anchor identifier aliases */}
      <div id="estimator" className="absolute -top-24 left-0 pointer-events-none" aria-hidden="true" />
      <div id="start-project" className="absolute -top-24 left-0 pointer-events-none" aria-hidden="true" />

      {/* Ambient background architectural video */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          src="/hero-video.mp4"
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-85 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2926]/95 via-[#181514]/75 to-[#2D2926]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2926] via-transparent to-[#2D2926]/80 pointer-events-none" />
        <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-[#E0B9A0]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#AE917E]/15 rounded-full blur-[140px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 items-start">
          
          {/* Left Column: Brand Context, Direct Contact & Trust Pillars */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="h-[2px] w-8 sm:w-12 bg-[#E0B9A0] shadow-[0_0_8px_#E0B9A0]" />
                <span className="text-[#E0B9A0] font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase flex items-center gap-2 font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  <span className="w-2 h-2 rounded-full bg-[#E0B9A0] shadow-[0_0_8px_#E0B9A0] animate-pulse" />
                  Connect With Us &bull; 12
                </span>
              </div>
              <div className="flex flex-col gap-0 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                <AnimatedHeading delay={0.1}>
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white uppercase tracking-tighter leading-none m-0">
                    START YOUR
                  </h2>
                </AnimatedHeading>
                <AnimatedHeading delay={0.2}>
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#E0B9A0] uppercase tracking-tighter leading-none m-0 drop-shadow-[0_0_20px_rgba(224,185,160,0.35)]">
                    PROJECT
                  </h2>
                </AnimatedHeading>
              </div>
            </div>

            <p className="text-stone-200 text-sm sm:text-base font-light leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Begin your project enquiry with complete transparency. Specify your parameters, get an instant dynamic budget estimation, and submit your architectural requirements directly to our engineering leads.
            </p>
          </motion.div>

          {/* Right Column: Unified Multi-Step Project & Estimator Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 bg-[#181514]/90 backdrop-blur-2xl p-6 sm:p-8 md:p-10 border border-white/20 relative rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] hover:border-[#E0B9A0]/40 transition-all"
          >
            {/* Top Step Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/10 rounded-t-3xl overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#AE917E] via-[#E0B9A0] to-[#FAF8F5] shadow-[0_0_12px_rgba(224,185,160,0.8)]"
                initial={{ width: "25%" }}
                animate={{ width: isSubmitted ? "100%" : `${(step / 4) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Step Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#E0B9A0]/20 border border-[#E0B9A0]/40 flex items-center justify-center font-mono text-xs font-bold text-[#E0B9A0]">
                  0{step}
                </span>
                <div>
                  <h3 className="text-white font-display text-base sm:text-lg uppercase tracking-tight m-0">
                    {step === 1 && "Identity & Location"}
                    {step === 2 && "Discipline & Project Scope"}
                    {step === 3 && "Sizing, Depth & Dynamic Estimate"}
                    {step === 4 && "Visual Plans & Direct Consultation"}
                  </h3>
                  <p className="text-white/40 text-[10px] font-mono tracking-wider uppercase m-0">
                    Step {step} of 4 &bull; Unified Intake Flow
                  </p>
                </div>
              </div>

              {/* Live Estimate Preview Badge */}
              <div className="hidden sm:flex flex-col items-end bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl">
                <span className="text-[9px] font-mono text-white/50 uppercase tracking-wider">Live Bracket</span>
                <span className="text-[#E0B9A0] font-display text-xs font-bold tracking-wide">
                  KES {(calculation.minKes / 1000000).toFixed(2)}M - {(calculation.maxKes / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isSubmitted ? (
                /* Success Screen */
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="w-20 h-20 bg-[#E0B9A0]/15 border border-[#E0B9A0]/40 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(224,185,160,0.3)]">
                    <span className="material-symbols-outlined text-[#E0B9A0] text-5xl">check_circle</span>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-2xl sm:text-3xl text-white font-display uppercase tracking-tight">
                      Project Intake Delivered
                    </h4>
                    <p className="text-stone-300 text-sm max-w-md mx-auto font-light leading-relaxed">
                      Thank you, <strong className="text-white font-medium">{formData.name}</strong>. Your project data, dynamic estimate calculation, and attached requirements have been transmitted to Yanhal Holdings.
                    </p>
                    <p className={`text-xs max-w-md mx-auto ${clientCopyFailed ? "text-amber-300" : "text-emerald-300"}`}>
                      {clientCopyFailed
                        ? `We received your enquiry, but could not email a copy to ${formData.email}. Our team will contact you directly.`
                        : `A summary has been emailed to ${formData.email}. Please check your spam folder if you don't see it.`}
                    </p>
                    <div className="inline-block bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono text-[#E0B9A0]">
                      Direct Callback: {formData.phone}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={handleReset}
                      className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer"
                    >
                      Start Another Inquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* STEP 1: IDENTITY & LOCATION */}
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] text-stone-300 font-bold flex items-center gap-1.5">
                            <span>Client Name</span>
                            <span className="text-[#E0B9A0]">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Full Name / Company"
                            className="w-full bg-white/5 border border-white/15 p-3.5 text-white placeholder:text-stone-500 rounded-xl focus:border-[#E0B9A0] focus:bg-white/10 outline-none transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] text-stone-300 font-bold flex items-center gap-1.5">
                            <span>Phone Number</span>
                            <span className="text-[#E0B9A0]">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+254 700 000 000"
                            className="w-full bg-white/5 border border-white/15 p-3.5 text-white placeholder:text-stone-500 rounded-xl focus:border-[#E0B9A0] focus:bg-white/10 outline-none transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] text-stone-300 font-bold">
                            Email Address (Your summary is sent here)
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="client@domain.com"
                            className="w-full bg-white/5 border border-white/15 p-3.5 text-white placeholder:text-stone-500 rounded-xl focus:border-[#E0B9A0] focus:bg-white/10 outline-none transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] text-stone-300 font-bold">
                            Site Location
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g. Westlands, Karen, Nairobi"
                            className="w-full bg-white/5 border border-white/15 p-3.5 text-white placeholder:text-stone-500 rounded-xl focus:border-[#E0B9A0] focus:bg-white/10 outline-none transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-white/10">
                        <button
                          type="button"
                          disabled={!formData.name || !formData.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())}
                          onClick={() => setStep(2)}
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#E0B9A0] text-[#2D2926] rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-white transition-all disabled:opacity-30 cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Select Discipline</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: DISCIPLINE & PROJECT SCOPE */}
                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-stone-300 font-bold block">
                          Select Project Category
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {PROJECT_TYPES.map((type) => {
                            const isSelected = formData.projectType === type.id;
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, projectType: type.id }))}
                                className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                                  isSelected
                                    ? "border-[#E0B9A0] bg-[#E0B9A0]/15 text-white shadow-[0_0_15px_rgba(224,185,160,0.15)]"
                                    : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/25 hover:bg-white/5"
                                }`}
                              >
                                <span className={`material-symbols-outlined text-2xl mt-0.5 ${isSelected ? "text-[#E0B9A0]" : "text-white/40"}`}>
                                  {type.icon}
                                </span>
                                <div>
                                  <div className="font-display text-xs uppercase font-bold tracking-wider text-white">
                                    {type.title}
                                  </div>
                                  <div className="text-[9.5px] text-white/50 font-sans mt-0.5">
                                    {type.desc}
                                  </div>
                                  <div className="text-[9px] font-mono text-[#E0B9A0] mt-1.5 font-semibold">
                                    Base Index: KES {type.baseRate.toLocaleString()} / SQM
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-stone-300 font-bold block">
                          Project Requirements / Vision Scope
                        </label>
                        <textarea
                          name="scope"
                          rows={3}
                          value={formData.scope}
                          onChange={handleInputChange}
                          placeholder="Briefly describe your structural, architectural or interior finishing goals..."
                          className="w-full bg-white/5 border border-white/15 p-3.5 text-white placeholder:text-stone-500 rounded-xl focus:border-[#E0B9A0] focus:bg-white/10 outline-none transition-all text-sm resize-none"
                        />
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 border border-white/20 text-white/80 py-3.5 rounded-full font-mono text-[10px] font-bold uppercase hover:text-white hover:border-white/40 transition-all cursor-pointer active:scale-95"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="flex-1 bg-[#E0B9A0] text-[#2D2926] py-3.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Configure Scale & Estimate</span>
                          <span className="material-symbols-outlined text-sm">calculate</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: SIZING, DEPTH & DYNAMIC ESTIMATE */}
                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Sizing Controls */}
                      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase tracking-[0.25em] text-stone-300 font-bold">
                            Estimated Project Area (Square Meters)
                          </label>
                          <span className="font-mono text-xs text-[#E0B9A0] font-bold bg-[#E0B9A0]/10 px-3 py-1 rounded-lg border border-[#E0B9A0]/30">
                            {formData.size} SQM (~{Math.round(formData.size * 10.764)} sq. ft)
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="20"
                            max="2000"
                            step="10"
                            name="size"
                            value={formData.size}
                            onChange={handleInputChange}
                            className="w-full accent-[#E0B9A0] cursor-pointer"
                          />
                          <input
                            type="number"
                            name="size"
                            value={formData.size || ""}
                            onChange={handleInputChange}
                            className="w-24 bg-white/10 border border-white/20 p-2 text-center text-white font-mono text-sm rounded-lg focus:border-[#E0B9A0] outline-none"
                            placeholder="SQM"
                          />
                        </div>
                      </div>

                      {/* Service Execution Depth Packages */}
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-stone-300 font-bold block">
                          Service Package Depth
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {SERVICE_DEPTHS.map((depth) => {
                            const isSelected = formData.serviceDepth === depth.id;
                            return (
                              <button
                                key={depth.id}
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, serviceDepth: depth.id }))}
                                className={`p-3.5 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                                  isSelected
                                    ? "border-[#E0B9A0] bg-[#E0B9A0]/15 text-white shadow-md"
                                    : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20"
                                }`}
                              >
                                <div>
                                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-white block">
                                    {depth.title}
                                  </span>
                                  <span className="text-[9px] text-white/50 leading-tight mt-1 block">
                                    {depth.description}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono text-[#E0B9A0] mt-3 font-semibold">
                                  Multiplier: {depth.multiplier}x
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Reactive Dynamic Intelligent Cost Box */}
                      <div className="bg-gradient-to-br from-[#1E1B18] via-[#2A2420] to-[#1E1B18] border-2 border-[#E0B9A0]/60 p-5 sm:p-6 rounded-2xl shadow-[0_10px_35px_rgba(224,185,160,0.2)] space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-display text-xs uppercase font-bold tracking-wider text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#E0B9A0] text-lg">analytics</span>
                            Dynamic Real-Time Calculation
                          </span>
                          <span className="font-mono text-[9px] text-[#E0B9A0] uppercase bg-[#E0B9A0]/10 px-2 py-0.5 rounded-full border border-[#E0B9A0]/30 font-semibold">
                            Live Scope Index
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          <div>
                            <p className="text-white/50 text-[10px] font-mono uppercase tracking-wider">Estimated Project Range</p>
                            <p className="text-2xl sm:text-3xl text-[#E0B9A0] font-display font-bold mt-1 tracking-tight">
                              KES {calculation.minKes.toLocaleString()} &ndash; {calculation.maxKes.toLocaleString()}
                            </p>
                            <p className="text-stone-400 text-xs font-mono mt-0.5">
                              Approx. ${calculation.minUsd.toLocaleString()} &ndash; ${calculation.maxUsd.toLocaleString()} USD
                            </p>
                          </div>

                          <div className="bg-black/30 border border-white/10 p-3 rounded-xl space-y-1 text-[10px] font-mono">
                            <div className="flex justify-between text-white/60">
                              <span>Base Rate:</span>
                              <span className="text-white font-medium">KES {calculation.ratePerSqm.toLocaleString()} / SQM</span>
                            </div>
                            <div className="flex justify-between text-white/60">
                              <span>Scale Area:</span>
                              <span className="text-white font-medium">{formData.size} SQM</span>
                            </div>
                            <div className="flex justify-between text-white/60">
                              <span>Tier Multiplier:</span>
                              <span className="text-[#E0B9A0] font-bold">{calculation.multiplier}x</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="flex-1 border border-white/20 text-white/80 py-3.5 rounded-full font-mono text-[10px] font-bold uppercase hover:text-white hover:border-white/40 transition-all cursor-pointer active:scale-95"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          className="flex-1 bg-[#E0B9A0] text-[#2D2926] py-3.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Upload Plans & Submit</span>
                          <span className="material-symbols-outlined text-sm">attachment</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: VISUAL PLANS & DIRECT CONSULTATION */}
                  {step === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* File Upload Zone */}
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-stone-300 font-bold block">
                          Attach Plans, Site Drawings or Photos (Optional)
                        </label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/20 hover:border-[#E0B9A0]/70 rounded-2xl p-5 sm:p-6 text-center cursor-pointer group transition-all bg-white/[0.02] hover:bg-[#E0B9A0]/5"
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*,.pdf" 
                            multiple 
                          />
                          <span className="material-symbols-outlined text-3xl text-white/30 group-hover:text-[#E0B9A0] mb-1 transition-colors">
                            add_photo_alternate
                          </span>
                          <p className="text-white text-xs uppercase font-bold font-mono tracking-wider">
                            Click to Upload Blueprints & Photos
                          </p>
                          <p className="text-white/40 text-[9px] mt-0.5 font-mono">
                            Multiple files supported (PNG, JPG, PDF)
                          </p>
                        </div>

                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                            {formData.images.map((file, i) => (
                              <div key={i} className="relative group/image">
                                <div className="aspect-square bg-white/5 border border-white/15 rounded-xl overflow-hidden flex flex-col items-center justify-center p-2 text-center">
                                  <span className="material-symbols-outlined text-white/40 mb-1">description</span>
                                  <span className="text-[8px] text-white/70 break-all line-clamp-2">{file.name}</span>
                                  <span className="text-[7.5px] text-[#E0B9A0] font-mono mt-1">{(file.size / 1024).toFixed(0)} KB</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => removeFile(i)}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md"
                                >
                                  <span className="material-symbols-outlined text-[10px]">close</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Blueprint Review Summary */}
                      <div className="bg-white/5 border border-white/15 p-4 sm:p-5 rounded-2xl space-y-3 text-xs">
                        <h4 className="text-white font-display text-[11px] uppercase tracking-widest border-b border-white/10 pb-2">
                          Project Summary Review
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <span className="text-white/40 block text-[9px] uppercase font-mono">Client Details</span>
                            <span className="text-white font-medium">{formData.name} &bull; {formData.phone}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[9px] uppercase font-mono">Category & Package</span>
                            <span className="text-white font-medium">{calculation.typeName} ({calculation.depthName})</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[9px] uppercase font-mono">Scale & Location</span>
                            <span className="text-white font-medium">{formData.size} SQM &bull; {formData.location}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[9px] uppercase font-mono">Estimated Range</span>
                            <span className="text-[#E0B9A0] font-bold font-mono">
                              KES {calculation.minKes.toLocaleString()} - {calculation.maxKes.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Submission Actions */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="flex-1 border border-white/20 text-white/80 py-4 rounded-full font-mono text-[10px] font-bold uppercase hover:text-white hover:border-white/40 transition-all cursor-pointer active:scale-95"
                        >
                          Adjust Scope
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleSubmitInquiry()}
                          className="flex-[2] bg-[#E0B9A0] text-[#2D2926] py-4 rounded-full font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_25px_rgba(224,185,160,0.4)] active:scale-95 flex items-center justify-center gap-2 font-bold"
                        >
                          {loading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-[#2D2926] border-t-transparent rounded-full animate-spin" />
                              <span>Submitting Blueprint...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Project Consultation</span>
                              <ArrowUpRightIcon className="w-4 h-4 stroke-[2.5]" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
