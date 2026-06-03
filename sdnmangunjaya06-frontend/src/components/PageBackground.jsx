import React from "react";
import { motion } from "framer-motion";

export default function PageBackground({ role = "default", children }) {
  // Themes: primary school colors are green/teal/emerald, white, slate, and light blue accents.
  const gradientMap = {
    admin: "from-slate-50 via-white to-emerald-50/40",
    guru: "from-slate-50 via-white to-teal-50/40",
    siswa: "from-slate-50 via-white to-cyan-50/30",
    login: "from-slate-50 via-white to-teal-50",
    laporan: "from-slate-50 via-white to-slate-100/50",
    default: "from-slate-50 via-white to-teal-50/20"
  };

  const glowCircles = {
    admin: [
      { color: "bg-emerald-200/20", size: "h-96 w-96", position: "-top-32 -right-32" },
      { color: "bg-teal-200/10", size: "h-[500px] w-[500px]", position: "-bottom-48 -left-48" }
    ],
    guru: [
      { color: "bg-teal-200/20", size: "h-96 w-96", position: "-top-32 -right-32" },
      { color: "bg-emerald-200/15", size: "h-80 w-80", position: "bottom-10 left-10" }
    ],
    siswa: [
      { color: "bg-cyan-200/20", size: "h-[400px] w-[400px]", position: "-top-24 -right-24" },
      { color: "bg-teal-200/15", size: "h-80 w-80", position: "-bottom-20 -left-20" }
    ],
    login: [
      { color: "bg-teal-200/30", size: "h-72 w-72", position: "-right-24 -top-24" },
      { color: "bg-emerald-200/20", size: "h-72 w-72", position: "-left-24 -bottom-24" }
    ],
    laporan: [
      { color: "bg-slate-200/30", size: "h-80 w-80", position: "-top-20 -right-20" },
      { color: "bg-emerald-50/20", size: "h-96 w-96", position: "-bottom-20 -left-20" }
    ],
    default: [
      { color: "bg-teal-100/20", size: "h-72 w-72", position: "-right-20 -top-20" }
    ]
  };

  const activeGlows = glowCircles[role] || glowCircles.default;
  const activeGradient = gradientMap[role] || gradientMap.default;

  return (
    <div className={`relative min-h-screen w-full bg-gradient-to-br ${activeGradient} overflow-hidden`}>
      {activeGlows.map((circle, index) => (
        <motion.div
          key={index}
          className={`absolute ${circle.position} ${circle.size} rounded-full ${circle.color} blur-3xl pointer-events-none`}
          animate={{
            scale: [1, 1.05, 0.95, 1],
            opacity: [0.7, 0.85, 0.7, 0.7],
          }}
          transition={{
            duration: 10 + index * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      <div className="relative z-10 w-full h-full min-h-screen">
        {children}
      </div>
    </div>
  );
}
