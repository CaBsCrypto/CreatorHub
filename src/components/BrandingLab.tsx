import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ShadowLine = ({ type, mousePos }: { type: string; mousePos: { x: number; y: number } }) => {
  const calculateShadow = () => {
    const dx = mousePos.x - 0.5;
    const dy = mousePos.y - 0.5;
    const skew = dx * 40;
    const opacity = 0.4 - dy * 0.2;
    return { skew, opacity, dx, dy };
  };

  const { skew, opacity, dx, dy } = calculateShadow();

  if (type === 'singularity') {
    return (
      <div className="relative flex flex-col items-center group">
        <div className="w-[2px] h-32 bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600 shadow-[0_0_15px_rgba(254,240,138,0.3)] relative z-10" />
        <motion.div 
          animate={{ skewX: skew, scaleY: 1 + Math.abs(dx) }}
          style={{ opacity }}
          className="absolute top-32 w-10 h-24 border-b-2 border-x-2 border-indigo-500/40 rounded-b-sm blur-[1px] transform-origin-top"
        />
      </div>
    );
  }

  if (type === 'trinity') {
    return (
      <div className="relative flex items-end gap-1 group">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center relative">
            <div className="w-[1.5px] h-24 bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-500 relative z-10" />
            <motion.div 
              animate={{ skewX: skew * (1 + i * 0.1), scaleY: 0.8 + i * 0.1 }}
              style={{ opacity: opacity * 0.6 }}
              className="absolute top-24 w-8 h-12 border-b-[1px] border-x-[1px] border-indigo-400/30 rounded-b-sm blur-[2px] transform-origin-top"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center group">
      <div className="w-[3px] h-32 bg-white/10 backdrop-blur-md border border-white/20 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent animate-pulse" />
      </div>
      <motion.div 
        animate={{ skewX: skew, scaleY: 1.2 }}
        style={{ opacity }}
        className="absolute top-32 w-12 h-20 border-b-2 border-x-2 border-indigo-400/20 rounded-b-lg blur-[4px] bg-gradient-to-r from-indigo-500/5 via-rose-500/5 to-indigo-500/5"
      />
    </div>
  );
};

export default function BrandingLab() {
  const [activeTab, setActiveTab] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  const variants = [
    { title: "Singularity", desc: "The Golden Ratio Standard", type: "singularity" },
    { title: "The Trinity", desc: "Unity through Precision", type: "trinity" },
    { title: "The Spectrum", desc: "Refractive Performance", type: "spectrum" }
  ];

  return (
    <section id="identity" className="py-32 relative overflow-hidden bg-black/40 border-y border-white/05">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10" onMouseMove={handleMouseMove} ref={containerRef}>
            <div className="space-y-2">
              <span className="text-xs font-black tracking-[0.5em] text-indigo-500 uppercase">Identity Lab v1.0</span>
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                The Shadow <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-rose-400">Concept</span>
              </h2>
            </div>

            <div className="flex gap-4">
              {variants.map((v, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === i 
                    ? 'bg-white text-black border-white' 
                    : 'bg-white/5 border-white/10 hover:border-white/30 text-white/60'
                  }`}
                >
                  {v.title}
                </button>
              ))}
            </div>

            <p className="text-white/40 text-sm max-w-md leading-relaxed tracking-wide">
              {variants[activeTab].desc}. Interacción en tiempo real con la "Umbra" proyectada. 
              Mueve el ratón para explorar la profundidad de la marca.
            </p>
          </div>

          <div className="relative aspect-square flex items-center justify-center bg-gradient-to-b from-white/[0.02] to-transparent rounded-[40px] border border-white/05 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08),transparent_70%)]" />
            <ShadowLine type={variants[activeTab].type} mousePos={mousePos} />
            
            <div className="absolute bottom-10 text-center space-y-1">
              <div className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase">Umbra Innovation</div>
              <div className="text-[8px] font-bold tracking-[0.2em] text-indigo-500/40 uppercase italic">Refinement Stage</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
