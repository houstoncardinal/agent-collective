import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      {/* Logo/Icon */}
      <motion.div
        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-6"
        animate={{ 
          boxShadow: [
            "0 0 20px hsl(var(--primary) / 0.3)",
            "0 0 40px hsl(var(--primary) / 0.5)",
            "0 0 20px hsl(var(--primary) / 0.3)",
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Bot className="w-10 h-10 text-primary" />
      </motion.div>

      {/* Title */}
      <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 tracking-tight">
        <span className="text-foreground">AI Agent</span>{" "}
        <span className="text-gradient-primary">Workforce</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
        Deploy an army of specialized AI agents to execute your vision.
        <br />
        <span className="text-foreground">One command. Infinite possibilities.</span>
      </p>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mt-4"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">
          Powered by advanced multi-agent orchestration
        </span>
      </motion.div>
    </motion.div>
  );
};
