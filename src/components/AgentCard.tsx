import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export type AgentStatus = "idle" | "active" | "completed" | "error";

interface AgentCardProps {
  name: string;
  role: string;
  icon: LucideIcon;
  status: AgentStatus;
  progress?: number;
  task?: string;
  delay?: number;
}

const statusConfig = {
  idle: {
    color: "border-muted",
    glow: "",
    label: "Standby",
    labelColor: "text-muted-foreground",
  },
  active: {
    color: "border-primary",
    glow: "animate-pulse-glow",
    label: "Working",
    labelColor: "text-primary",
  },
  completed: {
    color: "border-glow-success",
    glow: "shadow-[0_0_20px_hsl(var(--glow-success)/0.4)]",
    label: "Complete",
    labelColor: "text-glow-success",
  },
  error: {
    color: "border-destructive",
    glow: "shadow-[0_0_20px_hsl(var(--destructive)/0.4)]",
    label: "Error",
    labelColor: "text-destructive",
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
}: AgentCardProps) => {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative glass rounded-xl p-5 border-2 ${config.color} ${config.glow} transition-all duration-300 cursor-pointer group`}
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className={`text-xs font-medium uppercase tracking-wider ${config.labelColor}`}>
          {config.label}
        </span>
        <div className={`w-2 h-2 rounded-full ${status === "active" ? "bg-primary animate-pulse" : status === "completed" ? "bg-glow-success" : status === "error" ? "bg-destructive" : "bg-muted-foreground"}`} />
      </div>

      {/* Icon */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${status === "active" ? "bg-primary/20 border border-primary/40" : "bg-secondary border border-border"} group-hover:border-primary/40`}>
        <Icon className={`w-7 h-7 ${status === "active" ? "text-primary" : "text-foreground"}`} />
      </div>

      {/* Info */}
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">{name}</h3>
      <p className="text-muted-foreground text-sm mb-3">{role}</p>

      {/* Task */}
      {task && (
        <p className="text-xs text-primary/80 mb-3 line-clamp-2">
          "{task}"
        </p>
      )}

      {/* Progress bar */}
      {status === "active" && (
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {status === "completed" && (
        <div className="w-full h-1.5 bg-glow-success/30 rounded-full overflow-hidden">
          <div className="h-full w-full bg-glow-success" />
        </div>
      )}
    </motion.div>
  );
};
