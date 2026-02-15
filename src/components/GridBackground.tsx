import { motion } from "framer-motion";

export const GridBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/10" />
      
      {/* Fine grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      {/* Central radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,_hsl(var(--primary)/0.08)_0%,_transparent_60%)]" />
      
      {/* Accent orb */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[120px]"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/3 blur-[120px]"
        animate={{
          x: [0, -20, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Top edge line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
};
