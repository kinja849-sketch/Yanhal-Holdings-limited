import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef, useEffect } from "react";

interface EstimateData {
  name: string;
  phone: string;
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

const PROJECT_TYPES = [
  { id: "construction", title: "Construction", baseRate: 45000, icon: "architecture" },
  { id: "interior", title: "Interior Design", baseRate: 25000, icon: "design_services" },
  { id: "renovation", title: "Renovation", baseRate: 30000, icon: "home_repair_service" },
  { id: "commercial", title: "Custom Commercial Setup", baseRate: 35000, icon: "storefront" }
];

const SERVICE_DEPTHS = [
  { id: "basic", title: "Basic", multiplier: 1, description: "Minor upgrades / finishing." },
  { id: "standard", title: "Standard", multiplier: 1.5, description: "Moderate renovation or structured design work." },
  { id: "full", title: "Full Service", multiplier: 2.5, description: "Complete construction, renovation, or end-to-end project handling." }
];

const CURRENCY_RATE = 0.0077; // 1 KES to USD approx

export default function Estimator() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EstimateData>({
    name: "",
    phone: "",
    projectType: "",
    scope: "",
    size: 0,
    budget: "",
    timeline: "",
    location: "",
    serviceDepth: "standard",
    images: [],
    date: new Date().toISOString().split('T')[0]
  });

  const [estimate, setEstimate] = useState<{ min: number; max: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ 
        ...prev, 
        images: [...(prev.images || []), ...Array.from(e.target.files!)] 
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateEstimate = () => {
    const selectedType = PROJECT_TYPES.find(t => t.id === formData.projectType);
    const selectedDepth = SERVICE_DEPTHS.find(d => d.id === formData.serviceDepth);
    
    if (selectedType && selectedDepth && formData.size > 0) {
      const base = selectedType.baseRate * formData.size * selectedDepth.multiplier;
      setEstimate({
        min: base * 0.9,
        max: base * 1.2
      });
      setStep(6);
    }
  };

  const handleRecalculate = () => {
    setStep(1);
    setEstimate(null);
    setIsSubmitted(false);
  };

  const handleSubmit = async (action: string) => {
    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('form-name', 'estimator');
      formPayload.append('name', formData.name);
      formPayload.append('phone', formData.phone);
      formPayload.append('location', formData.location);
      
      const serviceTitle = PROJECT_TYPES.find(t => t.id === formData.projectType)?.title || formData.projectType;
      formPayload.append('service', serviceTitle);
      
      formPayload.append('scope', formData.scope);
      formPayload.append('size', formData.size.toString());
      formPayload.append('budget', formData.budget);
      formPayload.append('message', `Plan: ${formData.serviceDepth}. Timeline: ${formData.timeline}. Requested via ${action}.`);
      
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file) => {
          formPayload.append('images', file);
        });
      }

      const res = await fetch('/', {
        method: 'POST',
        body: formPayload
      });

      if (res.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          handleRecalculate();
        }, 5000);
      } else {
        alert("Submission failed. Please try again later.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed. If you are running locally, please make sure to use http://localhost:8888 to access Netlify functions.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <section 
      id="estimator" 
      className="py-24 sm:py-32 relative overflow-hidden bg-[#2D2926] text-[#FAF8F5]"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Side */}
          <div className="space-y-8 sm:space-y-10">
            <div>
              <span className="text-[#E0B9A0] font-display text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] mb-4 sm:mb-6 block uppercase leading-none flex items-center gap-2 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E0B9A0] shadow-[0_0_6px_#E0B9A0]" />
                Interactive Planning &bull; 11
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-display font-bold text-white uppercase tracking-tighter leading-[1.08]">
                Dynamic Project <br/> <span className="text-[#E0B9A0] font-medium">Estimator</span>
              </h2>
            </div>
            
            <div className="space-y-6">
              <p className="text-stone-300 text-sm sm:text-lg font-normal leading-relaxed">
                Plan Your Project with Clarity and Confidence. The Dynamic Project Estimator is designed to help clients understand the scope, cost, and expected outcome of their project before any physical work begins.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-10 border-t border-white/15">
              <div className="space-y-3">
                <span className="material-symbols-outlined text-[#E0B9A0] text-2xl">analytics</span>
                <h4 className="text-white font-display text-[9px] sm:text-[10px] tracking-widest uppercase font-bold">Intelligent Calculation</h4>
                <p className="text-stone-300 text-[9px] sm:text-[10px] leading-relaxed uppercase tracking-wider font-medium">Based on project type, size, complexity, and location-based adjustments.</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-[#1E1B18] border border-[#AE917E]/30 p-5 sm:p-10 md:p-14 relative rounded-2xl shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 rounded-t-xl overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#AE917E] via-[#E0B9A0] to-[#FAF8F5] shadow-[0_0_10px_rgba(224,185,160,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: isSubmitted ? "100%" : `${(step / 6) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-8 py-10 sm:py-12"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#E0B9A0]/10 border border-[#E0B9A0]/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-[0_0_20px_rgba(224,185,160,0.2)]">
                    <span className="material-symbols-outlined text-[#E0B9A0] text-3xl sm:text-4xl">check_circle</span>
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl text-white font-display uppercase tracking-tight mb-4 leading-tight">Request Sent</h3>
                    <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                      Thank you. Your project data and estimate has been delivered to Yanhal. Our project managers will review and reach out to {formData.phone} shortly.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <>
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div>
                        <span className="text-[#E0B9A0] font-mono text-[10px] tracking-wider uppercase mb-4 block font-semibold">01 / Identity</span>
                        <h3 className="text-xl text-white font-display uppercase mb-8">Who are we preparing for?</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="text-[9px] text-white/50 uppercase mb-3 block font-bold tracking-wider">Client Name</label>
                            <input 
                              type="text" name="name" required value={formData.name} onChange={handleInputChange}
                              className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm focus:border-[#E0B9A0] rounded-xl outline-none transition-colors"
                              placeholder="Full Name"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-white/50 uppercase mb-3 block font-bold tracking-wider">Phone Number</label>
                            <input 
                              type="tel" name="phone" required value={formData.phone} onChange={handleInputChange}
                              className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm focus:border-[#E0B9A0] rounded-xl outline-none transition-colors"
                              placeholder="+254..."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          disabled={!formData.name || !formData.phone}
                          onClick={nextStep}
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#E0B9A0] text-[#2D2926] rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-white transition-all disabled:opacity-30 cursor-pointer shadow-lg active:scale-95"
                        >
                          Continue to Project Type
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div>
                        <span className="text-[#E0B9A0] font-mono text-[10px] tracking-wider uppercase mb-4 block font-semibold">02 / Project Type</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                          {PROJECT_TYPES.map(type => (
                            <button
                              key={type.id}
                              onClick={() => setFormData(prev => ({ ...prev, projectType: type.id }))}
                              className={`p-3.5 sm:p-4 border text-left rounded-xl transition-all cursor-pointer ${formData.projectType === type.id ? "border-[#E0B9A0] bg-[#E0B9A0]/15 text-white shadow-lg" : "border-white/10 text-white/60 hover:border-white/20"}`}
                            >
                              <span className={`material-symbols-outlined mb-2 block ${formData.projectType === type.id ? "text-[#E0B9A0]" : ""}`}>{type.icon}</span>
                              <span className="block font-mono text-[9px] uppercase tracking-wider font-bold">{type.title}</span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-6 sm:mt-8">
                          <label className="text-[9px] text-white/50 uppercase mb-3 block font-bold tracking-wider">Scope of Work</label>
                          <textarea 
                            name="scope" value={formData.scope} onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 p-4 text-white text-sm min-h-[100px] rounded-xl outline-none focus:border-[#E0B9A0] transition-colors"
                            placeholder="Describe project requirements..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={prevStep} className="flex-1 border border-white/15 text-white/80 py-3 sm:py-3.5 rounded-full font-mono text-[10px] font-bold uppercase hover:text-white hover:border-white/30 transition-all cursor-pointer active:scale-95">Back</button>
                        <button onClick={nextStep} disabled={!formData.projectType} className="flex-1 bg-[#E0B9A0] text-[#2D2926] py-3 sm:py-3.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-white disabled:opacity-30 transition-all cursor-pointer shadow-lg active:scale-95">Next</button>
                      </div>
                    </motion.div>
                  )}

                  {/* Steps 3-5 */}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                      <span className="text-[#E0B9A0] font-mono text-[10px] tracking-wider uppercase block font-semibold">03 / Size & Timeline</span>
                      <div className="space-y-6">
                        <input type="number" name="size" placeholder="Size (SQM)" value={formData.size || ""} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-xl focus:border-[#E0B9A0] outline-none transition-colors" />
                        <input type="text" name="budget" placeholder="Budget (Optional)" value={formData.budget} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-xl focus:border-[#E0B9A0] outline-none transition-colors" />
                        <select name="timeline" value={formData.timeline} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-xl focus:border-[#E0B9A0] outline-none transition-colors">
                          <option value="" className="bg-[#121518] text-white">Timeline</option>
                          <option value="urgent" className="bg-[#121518] text-white">Urgent (Within 1 Month)</option>
                          <option value="standard" className="bg-[#121518] text-white">Standard (1-3 Months)</option>
                        </select>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={prevStep} className="flex-1 border border-white/15 text-white/80 py-3 sm:py-3.5 rounded-full font-mono text-[10px] font-bold uppercase hover:text-white hover:border-white/30 transition-all cursor-pointer active:scale-95">Back</button>
                        <button onClick={nextStep} className="flex-1 bg-[#E0B9A0] text-[#2D2926] py-3 sm:py-3.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer shadow-lg active:scale-95">Next</button>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                      <span className="text-[#E0B9A0] font-mono text-[10px] tracking-wider uppercase block font-semibold">04 / Location & Depth</span>
                      <div className="space-y-6">
                        <input type="text" name="location" placeholder="Location (e.g. Westlands, Nairobi)" value={formData.location} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-xl focus:border-[#E0B9A0] outline-none transition-colors" />
                        <div className="flex flex-col gap-2.5">
                          {SERVICE_DEPTHS.map(d => (
                            <button key={d.id} onClick={() => setFormData(p => ({ ...p, serviceDepth: d.id }))} className={`p-4 border text-left rounded-xl transition-all cursor-pointer ${formData.serviceDepth === d.id ? "border-[#E0B9A0] bg-[#E0B9A0]/15 shadow-lg" : "border-white/10 hover:border-white/20"}`}>
                              <p className="text-white text-xs font-bold font-mono uppercase tracking-wider">{d.title}</p>
                              <p className="text-white/50 text-[9.5px] mt-0.5">{d.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={prevStep} className="flex-1 border border-white/15 text-white/80 py-3 sm:py-3.5 rounded-full font-mono text-[10px] font-bold uppercase hover:text-white hover:border-white/30 transition-all cursor-pointer active:scale-95">Back</button>
                        <button onClick={nextStep} className="flex-1 bg-[#E0B9A0] text-[#2D2926] py-3 sm:py-3.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer shadow-lg active:scale-95">Next</button>
                      </div>
                    </motion.div>
                  )}

                  {step === 5 && (
                     <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <span className="text-[#E0B9A0] font-mono text-[10px] tracking-wider uppercase block font-semibold">05 / Images</span>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border border-dashed border-white/15 hover:border-[#E0B9A0]/50 rounded-xl p-6 sm:p-10 text-center cursor-pointer group transition-colors bg-white/[0.02]"
                        >
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                          <span className="material-symbols-outlined text-3xl sm:text-4xl text-white/20 group-hover:text-[#E0B9A0] mb-2 transition-colors">add_photo_alternate</span>
                          <p className="text-white/80 text-xs uppercase font-bold font-mono tracking-wider">Click to Upload Photos</p>
                          <p className="text-white/40 text-[9px] mt-1 uppercase font-mono tracking-wider">You can select multiple images</p>
                        </div>

                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
                            {formData.images.map((file, i) => (
                              <div key={i} className="relative group/image">
                                <div className="aspect-square bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center p-2 text-center">
                                  <span className="material-symbols-outlined text-white/20 mb-1">image</span>
                                  <span className="text-[8px] text-white/50 break-all line-clamp-2">{file.name}</span>
                                </div>
                                <button 
                                  onClick={() => removeFile(i)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[10px]">close</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-4">
                          <button onClick={prevStep} className="flex-1 border border-white/15 text-white/80 py-3 sm:py-3.5 rounded-full font-mono text-[10px] font-bold uppercase hover:text-white hover:border-white/30 transition-all cursor-pointer active:scale-95">Back</button>
                          <button onClick={calculateEstimate} className="flex-1 bg-[#E0B9A0] text-[#2D2926] py-3 sm:py-3.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer shadow-lg active:scale-95">Generate Estimate</button>
                        </div>
                     </motion.div>
                  )}

                  {step === 6 && estimate && (
                    <motion.div key="step6" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                       <h3 className="text-xl sm:text-2xl text-white font-display uppercase text-center">Summary</h3>
                       <div className="bg-white/5 p-6 sm:p-8 border-l-4 border-[#E0B9A0] rounded-xl">
                          <p className="text-white/50 text-[9px] uppercase font-bold mb-2 font-mono tracking-wider">Estimated Range</p>
                          <p className="text-xl sm:text-2xl text-[#E0B9A0] font-display font-bold">KES {estimate.min.toLocaleString()} - {estimate.max.toLocaleString()}</p>
                       </div>
                       <div className="space-y-3 sm:space-y-4">
                          <button 
                            disabled={loading}
                            onClick={() => handleSubmit('Official Consultation')}
                            className="w-full bg-[#E0B9A0] text-[#2D2926] py-3.5 sm:py-4 rounded-full font-mono text-[10px] sm:text-[11px] uppercase font-bold tracking-[0.18em] hover:bg-white disabled:opacity-50 transition-all cursor-pointer shadow-lg active:scale-95"
                          >
                            {loading ? "Processing..." : "Submit for Consultation"}
                          </button>
                          <button onClick={handleRecalculate} className="w-full border border-white/15 py-3 sm:py-3.5 rounded-full text-white/80 font-mono text-[10px] uppercase font-bold tracking-wider hover:text-white hover:border-white/30 transition-all cursor-pointer active:scale-95">Start New</button>
                       </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

