import { motion } from "framer-motion";
import { LucideIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentAvatar } from "@/components/AgentAvatar";

export type AgentStatus = "idle" | "active" | "completed" | "error";

interface AgentCardProps {
  name: string;
  role: string;
  icon: LucideIcon;
  status: AgentStatus;
  progress?: number;
  task?: string;
  delay?: number;
  isCustom?: boolean;
  onSettings?: () => void;
}

const statusConfig = {
  idle: {
    color: "border-muted",
    glow: "",
    label: "Standby",
    labelColor: "text-muted-foreground",
    bg: "bg-secondary/30",
  },
  active: {
    color: "border-primary",
    glow: "animate-pulse-glow",
    label: "Working",
    labelColor: "text-primary",
    bg: "bg-primary/5",
  },
  completed: {
    color: "border-glow-success",
    glow: "shadow-[0_0_20px_hsl(var(--glow-success)/0.4)]",
    label: "Complete",
    labelColor: "text-glow-success",
    bg: "bg-glow-success/5",
  },
  error: {
    color: "border-destructive",
    glow: "shadow-[0_0_20px_hsl(var(--destructive)/0.4)]",
    label: "Error",
    labelColor: "text-destructive",
    bg: "bg-destructive/5",
  },
};

export const AgentCard = ({
  name,
  role,
  icon: Icon,
  status,
  progress = 0,
  task,
  delay = 0,
  isCustom,
  onSettings,
}: AgentCardProps) => {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative glass rounded-xl p-5 border-2 ${config.color} ${config.glow} ${config.bg} transition-all duration-300 cursor-pointer group`}
    >
      {/* Custom badge */}
      {isCustom && (
        <div className="absolute top-4 left-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-accent bg-accent/20 px-2 py-0.5 rounded-full">
            Custom
          </span>
        </div>
      )}

      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className={`text-xs font-medium uppercase tracking-wider ${config.labelColor}`}>
          {config.label}
        </span>
        <motion.div
          className={`w-2 h-2 rounded-full ${
            status === "active"
              ? "bg-primary"
              : status === "completed"
              ? "bg-glow-success"
              : status === "error"
              ? "bg-destructive"
              : "bg-muted-foreground"
          }`}
          animate={status === "active" ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Settings button */}
      {onSettings && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onSettings();
          }}
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}

      {/* Agent Avatar */}
      <div className={`mb-4 ${isCustom ? "mt-4" : ""}`}>
        <AgentAvatar
          name={name}
          icon={Icon}
          status={status}
          size="md"
          showPulse={true}
        />
      </div>

      {/* Info */}
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">{name}</h3>
      <p className="text-muted-foreground text-sm mb-3">{role}</p>

      {/* Task */}
      {task && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-primary/80 mb-3 line-clamp-2"
        >
          "{task}"
        </motion.p>
      )}

      {/* Progress bar */}
      {status === "active" && (
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]"
            initial={{ width: 0 }}
            animate={{ 
              width: `${progress}%`,
              backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
            }}
            transition={{ 
              width: { duration: 0.5 },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          />
        </div>
      )}

      {status === "completed" && (
        <div className="w-full h-2 bg-glow-success/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full w-full bg-gradient-to-r from-glow-success to-emerald-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      )}

      {/* Activity ripple effect for active agents */}
      {status === "active" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <motion.div
            className="absolute inset-0 border-2 border-primary/30 rounded-xl"
            animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </motion.div>
  );
};
