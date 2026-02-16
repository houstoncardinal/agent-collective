import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, RefreshCw, Loader2, CheckCircle, AlertCircle, Zap, ArrowRight } from "lucide-react";
import { Agent } from "@/hooks/useAgents";
import { AgentStatus } from "@/components/AgentCard";
import { AgentAvatar } from "@/components/AgentAvatar";
import { Button } from "@/components/ui/button";

interface NodeCanvasProps {
  agents: Agent[];
  isProcessing: boolean;
  currentMission: string;
  onSettings: (agent: { id: string; name: string }) => void;
  onRetry: (agentId: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

const NODE_W = 200;
const NODE_H = 140;

const getNodePositions = (count: number, canvasW: number, canvasH: number): NodePosition[] => {
  const positions: NodePosition[] = [];
  const centerX = canvasW / 2;
  const centerY = canvasH / 2;

  if (count <= 0) return positions;

  // Distribute nodes in concentric arcs
  const radiusX = Math.min(canvasW * 0.35, 380);
  const radiusY = Math.min(canvasH * 0.32, 260);

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / count;
    positions.push({
      x: centerX + radiusX * Math.cos(angle) - NODE_W / 2,
      y: centerY + radiusY * Math.sin(angle) - NODE_H / 2,
    });
  }

  return positions;
};

const StatusDot = ({ status }: { status: AgentStatus }) => {
  const colors: Record<AgentStatus, string> = {
    idle: "bg-muted-foreground/40",
    active: "bg-primary",
    completed: "bg-glow-success",
    error: "bg-destructive",
  };

  return (
    <motion.div
      className={`w-2.5 h-2.5 rounded-full ${colors[status]}`}
      animate={status === "active" ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
    />
  );
};

const ProcessingLabel = ({ agent }: { agent: Agent }) => {
  const labels: Record<string, string> = {
    thinking: "Thinking...",
    generating: "Generating...",
    retrying: "Retrying...",
    completed: "Done",
    error: "Failed",
    idle: "Standby",
  };
  const status = agent.processingStatus || "idle";
  return (
    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {labels[status] || "Standby"}
    </span>
  );
};

// Animated SVG connection line
const ConnectionLine = ({
  x1, y1, x2, y2, status, delay = 0,
}: {
  x1: number; y1: number; x2: number; y2: number;
  status: AgentStatus; delay?: number;
}) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const ctrlOffset = Math.abs(y2 - y1) * 0.3 + 30;
  const path = `M ${x1} ${y1} Q ${midX} ${midY - ctrlOffset} ${x2} ${y2}`;

  const strokeColor =
    status === "active" ? "hsl(var(--primary))" :
    status === "completed" ? "hsl(var(--glow-success))" :
    status === "error" ? "hsl(var(--destructive))" :
    "hsl(var(--border))";

  return (
    <g>
      {/* Background line */}
      <motion.path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={status === "idle" ? 1 : 2}
        strokeOpacity={status === "idle" ? 0.2 : 0.5}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay }}
      />
      {/* Animated data particle */}
      {status === "active" && (
        <motion.circle
          r={3}
          fill="hsl(var(--primary))"
          filter="url(#glow)"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <animateMotion dur="1.5s" repeatCount="indefinite" path={path} />
        </motion.circle>
      )}
      {status === "completed" && (
        <motion.circle
          r={2}
          fill="hsl(var(--glow-success))"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 2, ease: "linear" }}
        >
          <animateMotion dur="2s" fill="freeze" path={path} />
        </motion.circle>
      )}
    </g>
  );
};

// Individual agent node
const AgentNode = ({
  agent,
  position,
  delay,
  onSettings,
  onRetry,
}: {
  agent: Agent;
  position: NodePosition;
  delay: number;
  onSettings: () => void;
  onRetry: () => void;
}) => {
  const Icon = agent.icon;
  const isActive = agent.status !== "idle";

  const borderColor =
    agent.status === "active" ? "border-primary" :
    agent.status === "completed" ? "border-glow-success" :
    agent.status === "error" ? "border-destructive" :
    "border-border/50";

  const glowClass =
    agent.status === "active" ? "shadow-[0_0_25px_hsl(var(--primary)/0.3)]" :
    agent.status === "completed" ? "shadow-[0_0_20px_hsl(var(--glow-success)/0.3)]" :
    agent.status === "error" ? "shadow-[0_0_20px_hsl(var(--destructive)/0.3)]" :
    "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.6, delay, type: "spring", damping: 15 }}
      className={`absolute group`}
      style={{
        left: position.x,
        top: position.y,
        width: NODE_W,
      }}
    >
      <div
        className={`relative glass-strong rounded-2xl p-4 border-2 ${borderColor} ${glowClass} transition-all duration-500 cursor-pointer hover:scale-105`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusDot status={agent.status} />
            <ProcessingLabel agent={agent} />
          </div>
          {agent.isCustom && (
            <span className="text-[9px] font-medium uppercase tracking-wider text-accent bg-accent/20 px-1.5 py-0.5 rounded-full">
              Custom
            </span>
          )}
        </div>

        {/* Icon + Name */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${
            agent.status === "active" ? "bg-primary/20 border border-primary/40" :
            agent.status === "completed" ? "bg-glow-success/20 border border-glow-success/40" :
            agent.status === "error" ? "bg-destructive/20 border border-destructive/40" :
            "bg-secondary border border-border/50"
          }`}>
            <Icon className={`w-4 h-4 ${
              agent.status === "active" ? "text-primary" :
              agent.status === "completed" ? "text-glow-success" :
              agent.status === "error" ? "text-destructive" :
              "text-muted-foreground"
            }`} />
          </div>
          <div className="min-w-0">
            <h4 className="font-display text-xs font-semibold text-foreground truncate">{agent.name}</h4>
            <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
          </div>
        </div>

        {/* Progress bar */}
        {agent.status === "active" && (
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${agent.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
        {agent.status === "completed" && (
          <div className="w-full h-1.5 bg-glow-success/30 rounded-full overflow-hidden">
            <div className="h-full w-full bg-glow-success rounded-full" />
          </div>
        )}
        {agent.status === "error" && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-destructive font-medium">Failed</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:bg-destructive/10"
              onClick={(e) => { e.stopPropagation(); onRetry(); }}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Hover settings */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 bg-secondary border border-border rounded-full"
          onClick={(e) => { e.stopPropagation(); onSettings(); }}
        >
          <Settings className="w-3 h-3" />
        </Button>

        {/* Active ripple */}
        {agent.status === "active" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <motion.div
              className="absolute inset-0 border border-primary/20 rounded-2xl"
              animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const NodeCanvas = ({ agents, isProcessing, currentMission, onSettings, onRetry }: NodeCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 1000, h: 600 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDimensions({
          w: containerRef.current.offsetWidth,
          h: Math.max(containerRef.current.offsetHeight, 550),
        });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const activeAgents = agents.filter(a => a.status !== "idle");
  const displayAgents = activeAgents.length > 0 ? activeAgents : agents;
  const showMissionNode = isProcessing || activeAgents.length > 0;

  const positions = useMemo(
    () => getNodePositions(displayAgents.length, dimensions.w, dimensions.h),
    [displayAgents.length, dimensions.w, dimensions.h]
  );

  const missionCenter = { x: dimensions.w / 2, y: dimensions.h / 2 };

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: 550 }}>
      {/* Canvas grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 rounded-2xl" />

      {/* SVG connections layer */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ minHeight: 550 }}
        viewBox={`0 0 ${dimensions.w} ${dimensions.h}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Draw connections from mission center to each agent */}
        {showMissionNode && positions.map((pos, i) => (
          <ConnectionLine
            key={displayAgents[i]?.id || i}
            x1={missionCenter.x}
            y1={missionCenter.y}
            x2={pos.x + NODE_W / 2}
            y2={pos.y + NODE_H / 2}
            status={displayAgents[i]?.status || "idle"}
            delay={i * 0.1}
          />
        ))}
      </svg>

      {/* Central mission node */}
      <AnimatePresence>
        {showMissionNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", damping: 12 }}
            className="absolute z-20"
            style={{
              left: missionCenter.x - 80,
              top: missionCenter.y - 40,
              width: 160,
            }}
          >
            <div className="glass-strong rounded-2xl p-4 border-2 border-primary shadow-[0_0_40px_hsl(var(--primary)/0.4)] text-center">
              <motion.div
                animate={isProcessing ? { rotate: 360 } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 mx-auto mb-2 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center"
              >
                <Zap className="w-4 h-4 text-primary" />
              </motion.div>
              <h4 className="font-display text-[10px] font-bold text-primary tracking-wider uppercase">Mission</h4>
              <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2">{currentMission}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle state – show all agents in a grid overlay */}
      {!showMissionNode && (
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {agents.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-strong rounded-2xl p-4 border border-border/50 cursor-pointer group hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-secondary border border-border/50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display text-xs font-semibold text-foreground truncate">{agent.name}</h4>
                    <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Ready</span>
                  {agent.isCustom && (
                    <span className="text-[9px] text-accent bg-accent/20 px-1.5 py-0.5 rounded-full">Custom</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Active agent nodes – positioned on canvas */}
      <AnimatePresence>
        {showMissionNode && displayAgents.map((agent, i) => (
          <AgentNode
            key={agent.id}
            agent={agent}
            position={positions[i]}
            delay={0.2 + i * 0.08}
            onSettings={() => onSettings({ id: agent.id, name: agent.name })}
            onRetry={() => onRetry(agent.id)}
          />
        ))}
      </AnimatePresence>

      {/* Summary bar */}
      {showMissionNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="glass-strong rounded-full px-6 py-2 flex items-center gap-5 text-xs text-muted-foreground border border-border/50">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Active: {agents.filter(a => a.status === "active").length}
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-glow-success" />
              Done: {agents.filter(a => a.status === "completed").length}
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              Failed: {agents.filter(a => a.status === "error").length}
            </span>
            <span className="text-foreground font-medium">
              {agents.filter(a => a.status === "completed").length}/{displayAgents.length}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
