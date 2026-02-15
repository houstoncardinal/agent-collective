import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Cpu, Network, Brain } from "lucide-react";

export const HeroSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16 relative"
    >
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Capabilities pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center gap-3 mb-8 flex-wrap"
      >
        {[
          { icon: Cpu, label: "Multi-Agent Orchestration" },
          { icon: Network, label: "Real-Time Collaboration" },
          { icon: Brain, label: "Adaptive Intelligence" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/50 text-xs text-muted-foreground"
          >
            <item.icon className="w-3 h-3 text-primary" />
            {item.label}
          </motion.div>
        ))}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[0.9]"
      >
        <span className="text-foreground">Deploy Your</span>
        <br />
        <span className="relative">
          <span className="text-gradient-primary">AI Workforce</span>
          <motion.div
            className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{ transformOrigin: "left" }}
          />
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed"
      >
        Orchestrate specialized AI agents that think, collaborate, and deliver.
        <br className="hidden sm:block" />
        <span className="text-foreground font-medium">One mission. Eight minds. Zero limits.</span>
      </motion.p>

      {/* CTA hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="inline-flex items-center gap-2 text-sm text-primary/70"
      >
        <Sparkles className="w-4 h-4" />
        <span>Type your mission below to deploy agents</span>
        <ArrowRight className="w-4 h-4" />
      </motion.div>
    </motion.div>
  );
};
