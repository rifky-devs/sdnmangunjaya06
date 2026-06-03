import React from "react";
import { motion } from "framer-motion";

export default function AnimatedCard({
  children,
  className = "",
  hoverEffect = true,
  delay = 0,
  onClick,
}) {
  const hoverStyles = hoverEffect
    ? {
        y: -4,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        borderColor: "rgba(20, 184, 166, 0.15)", // subtle teal border glow
      }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 16,
        delay: delay 
      }}
      whileHover={hoverEffect ? hoverStyles : {}}
      onClick={onClick}
      className={`rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-soft transition-all duration-300 backdrop-blur-sm ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
