import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect, useRef } from "react";
import AnimatedHeading from "./AnimatedHeading";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "Construction Services",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('form-name', 'contact');
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('projectType', formData.projectType);
      data.append('message', formData.message);

      const response = await fetch('/', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Submission failed');

      setSubmitted(true);
      setFormData({ name: "", email: "", projectType: "Construction Services", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed. Please check your internet connection or server credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.error("Video play failed:", err));
    }
  }, []);

  return (
    <section 
      id="contact" 
      className="relative py-18 sm:py-24 lg:py-28 px-5 sm:px-8 lg:px-10 overflow-hidden bg-[#2D2926] text-[#FAF8F5]"
    >
      {/* Background Video - Fully Visible & Vibrant */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          src="/hero-video.mp4"
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
        />
        {/* Architectural Atmospheric Scrim - Video remains clearly visible with rich warm espresso & peach ambience instead of dominant black */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2926]/75 via-[#181514]/40 to-[#2D2926]/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2926]/85 via-transparent to-[#2D2926]/60 pointer-events-none" />
        <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-[#E0B9A0]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#AE917E]/15 rounded-full blur-[140px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center relative z-10">
        {/* Contact info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8 sm:space-y-10"
        >
          <div>
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <div className="h-[2px] w-8 sm:w-12 bg-[#E0B9A0] shadow-[0_0_8px_#E0B9A0]"></div>
              <span className="text-[#E0B9A0] font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase flex items-center gap-2 font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                <span className="w-2 h-2 rounded-full bg-[#E0B9A0] shadow-[0_0_8px_#E0B9A0] animate-pulse" />
                Connect With Us &bull; 12
              </span>
            </div>
            <div className="flex flex-col gap-0 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              <AnimatedHeading delay={0.1}>
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold text-white uppercase tracking-tighter leading-none m-0">
                  START YOUR
                </h2>
              </AnimatedHeading>
              <AnimatedHeading delay={0.2}>
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold text-[#E0B9A0] uppercase tracking-tighter leading-none m-0 drop-shadow-[0_0_20px_rgba(224,185,160,0.35)]">
                  PROJECT
                </h2>
              </AnimatedHeading>
            </div>
          </div>
          
          <p className="text-stone-200 text-base sm:text-lg font-light leading-relaxed max-w-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Ready to discuss your construction or design requirements? Our technical team is available for site assessments and project consultations.
          </p>
        </motion.div>

        {/* Frosted Glassmorphism Contact Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-[#181514]/80 backdrop-blur-2xl p-6 sm:p-8 md:p-12 border border-white/20 relative rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#E0B9A0]/40 transition-colors"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#AE917E] via-[#E0B9A0] to-[#FAF8F5] rounded-t-2xl"></div>
          
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <span className="material-symbols-outlined text-[#E0B9A0] text-6xl mb-6 shadow-[0_0_20px_rgba(224,185,160,0.4)]">check_circle</span>
                <h4 className="text-2xl text-white font-display uppercase tracking-tight mb-2">Message Received</h4>
                <p className="text-stone-300 text-sm">We'll get back to you within 24 hours.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-[#E0B9A0] font-display text-[10px] uppercase tracking-widest hover:text-white cursor-pointer"
                >
                  Send Another
                </button>
              </motion.div>
            ) : (
              <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-stone-300 font-bold">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 p-4 text-white placeholder:text-stone-400 focus:outline-none focus:border-[#E0B9A0] focus:bg-white/15 transition-all font-light text-sm rounded-xl"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-stone-300 font-bold">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 p-4 text-white placeholder:text-stone-400 focus:outline-none focus:border-[#E0B9A0] focus:bg-white/15 transition-all font-light text-sm rounded-xl"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-stone-300 font-bold">Project Type</label>
                  <div className="relative">
                    <select 
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 p-4 text-white focus:outline-none focus:border-[#E0B9A0] focus:bg-white/15 transition-all font-light text-sm appearance-none rounded-xl cursor-pointer"
                    >
                      <option className="bg-[#181514] text-white">Construction Services</option>
                      <option className="bg-[#181514] text-white">Interior Design</option>
                      <option className="bg-[#181514] text-white">Renovation</option>
                      <option className="bg-[#181514] text-white">Commercial Project</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-stone-300 font-bold">Message</label>
                  <textarea 
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-white/10 border border-white/20 p-4 text-white placeholder:text-stone-400 focus:outline-none focus:border-[#E0B9A0] focus:bg-white/15 transition-all font-light text-sm resize-none rounded-xl"
                    placeholder="Briefly describe your project requirements..."
                  ></textarea>
                </div>
                <div className="flex justify-start pt-2">
                  <button 
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-3.5 sm:py-4 bg-[#E0B9A0] text-[#2D2926] rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#FAF8F5] transition-all disabled:opacity-50 active:scale-95 shadow-[0_0_20px_rgba(224,185,160,0.3)] cursor-pointer"
                  >
                    {loading ? "Sending..." : "Send Inquiry"}
                  </button>
                </div>
              </form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
