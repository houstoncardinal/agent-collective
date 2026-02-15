import { motion } from "framer-motion";
import { Bot, Zap, Activity, Shield, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopNavProps {
  totalAgents: number;
  activeAgents: number;
  isProcessing: boolean;
}

export const TopNav = ({ totalAgents, activeAgents, isProcessing }: TopNavProps) => {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40"
      style={{
        background: "linear-gradient(180deg, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0.85) 100%)",
        backdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              animate={isProcessing ? { boxShadow: ["0 0 0px hsl(var(--primary) / 0)", "0 0 20px hsl(var(--primary) / 0.6)", "0 0 0px hsl(var(--primary) / 0)"] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Bot className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-foreground">NEXUS</span>
              <span className="font-display text-lg font-bold tracking-tight text-primary">AI</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-widest border-primary/30 text-primary bg-primary/5 hidden sm:flex">
              v2.0
            </Badge>
          </div>

          {/* Center Status */}
          <div className="hidden md:flex items-center gap-6">
            <NavStatusItem icon={Activity} label="System" value="Operational" variant="success" />
            <div className="w-px h-5 bg-border/50" />
            <NavStatusItem icon={Shield} label="Security" value="Active" variant="success" />
            <div className="w-px h-5 bg-border/50" />
            <NavStatusItem icon={Globe} label="Network" value="Connected" variant="success" />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Live indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-primary">Processing</span>
              </motion.div>
            )}

            {/* Agent count */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-foreground">
                <span className="text-primary font-bold">{activeAgents}</span>
                <span className="text-muted-foreground">/{totalAgents}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

const NavStatusItem = ({ 
  icon: Icon, 
  label, 
  value, 
  variant 
}: { 
  icon: typeof Activity; 
  label: string; 
  value: string; 
  variant: "success" | "warning" | "error";
}) => {
  const colors = {
    success: "text-glow-success",
    warning: "text-glow-warning",
    error: "text-destructive",
  };

  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${colors[variant]}`} />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">{label}</span>
        <span className={`text-xs font-medium ${colors[variant]} leading-tight`}>{value}</span>
      </div>
    </div>
  );
};
