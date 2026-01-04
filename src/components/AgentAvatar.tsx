import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { AgentStatus } from "@/components/AgentCard";

interface AgentAvatarProps {
  name: string;
  icon: LucideIcon;
  status: AgentStatus;
  size?: "sm" | "md" | "lg";
  showPulse?: boolean;
}

// Generate unique gradient based on agent name
const getAgentGradient = (name: string): string => {
  const gradients = [
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-cyan-500 via-blue-500 to-indigo-500",
    "from-emerald-500 via-green-500 to-teal-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-rose-500 via-pink-500 to-purple-500",
    "from-blue-500 via-indigo-500 to-violet-500",
    "from-teal-500 via-cyan-500 to-blue-500",
    "from-orange-500 via-amber-500 to-yellow-500",
  ];
  
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};

const getStatusRing = (status: AgentStatus): string => {
  switch (status) {
    case "active":
      return "ring-2 ring-primary ring-offset-2 ring-offset-background";
    case "completed":
      return "ring-2 ring-glow-success ring-offset-2 ring-offset-background";
    case "error":
      return "ring-2 ring-destructive ring-offset-2 ring-offset-background";
    default:
      return "ring-1 ring-border";
  }
};

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return { container: "w-10 h-10", icon: "w-5 h-5", text: "text-xs", pulse: "w-2.5 h-2.5" };
    case "lg":
      return { container: "w-20 h-20", icon: "w-10 h-10", text: "text-xl", pulse: "w-4 h-4" };
    default:
      return { container: "w-14 h-14", icon: "w-7 h-7", text: "text-sm", pulse: "w-3 h-3" };
  }
};

export const AgentAvatar = ({
  name,
  icon: Icon,
  status,
  size = "md",
  showPulse = true,
}: AgentAvatarProps) => {
  const gradient = getAgentGradient(name);
  const sizeClasses = getSizeClasses(size);
  const statusRing = getStatusRing(status);

  return (
    <div className="relative">
      {/* Outer glow effect for active status */}
      {status === "active" && (
        <motion.div
          className={`absolute inset-0 ${sizeClasses.container} rounded-2xl bg-gradient-to-r ${gradient} opacity-50 blur-lg`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Main avatar container */}
      <motion.div
        className={`relative ${sizeClasses.container} rounded-2xl bg-gradient-to-br ${gradient} ${statusRing} flex items-center justify-center overflow-hidden transition-all duration-300`}
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Scanline effect for active agents */}
        {status === "active" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Icon */}
        <Icon className={`${sizeClasses.icon} text-white drop-shadow-lg relative z-10`} />

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
      </motion.div>

      {/* Status indicator */}
      {showPulse && (
        <motion.div
          className={`absolute -bottom-0.5 -right-0.5 ${sizeClasses.pulse} rounded-full border-2 border-background ${
            status === "active"
              ? "bg-primary"
              : status === "completed"
              ? "bg-glow-success"
              : status === "error"
              ? "bg-destructive"
              : "bg-muted-foreground"
          }`}
          animate={
            status === "active"
              ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
              : {}
          }
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Processing spinner for active agents */}
      {status === "active" && (
        <svg
          className={`absolute inset-0 ${sizeClasses.container}`}
          viewBox="0 0 100 100"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary/50"
            strokeDasharray="50 200"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50%", originY: "50%" }}
          />
        </svg>
      )}
    </div>
  );
};
