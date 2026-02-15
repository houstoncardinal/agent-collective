import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Agent } from "@/hooks/useAgents";
import { AgentStatus } from "@/components/AgentCard";

interface WorkflowVisualizationProps {
  agents: Agent[];
  isProcessing: boolean;
  currentMission: string;
}

const getStageFromAgent = (agent: Agent): string => {
  const roleMap: Record<string, string> = {
    "Strategic Planner": "Plan",
    "Research Analyst": "Research",
    "Code Architect": "Build",
    "Content Writer": "Create",
    "Marketing Strategist": "Market",
    "Data Analyst": "Analyze",
    "Design Director": "Design",
    "Security Auditor": "Secure",
  };
  return roleMap[agent.role] || agent.role.split(" ")[0];
};

const StatusIcon = ({ status }: { status: AgentStatus }) => {
  switch (status) {
    case "active":
      return (
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-3 h-3 text-primary" />
        </motion.div>
      );
    case "completed":
      return <CheckCircle className="w-3 h-3 text-glow-success" />;
    case "error":
      return <AlertCircle className="w-3 h-3 text-destructive" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />;
  }
};

export const WorkflowVisualization = ({ agents, isProcessing, currentMission }: WorkflowVisualizationProps) => {
  const activeAgents = agents.filter(a => a.status !== "idle");
  const showWorkflow = isProcessing || activeAgents.length > 0;

  if (!showWorkflow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-8"
      >
        <div className="glass rounded-2xl p-6 border border-border/50 relative overflow-hidden">
          {/* Background animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Header */}
          <div className="relative flex items-center gap-3 mb-5">
            <motion.div
              className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center"
              animate={isProcessing ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 text-primary" />
            </motion.div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">Agent Pipeline</h3>
              <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                {currentMission || "Awaiting mission..."}
              </p>
            </div>
          </div>

          {/* Pipeline nodes */}
          <div className="relative flex items-center gap-1 overflow-x-auto pb-2">
            {/* Input node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-xs font-medium text-primary"
            >
              Mission Input
            </motion.div>

            <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />

            {/* Agent nodes */}
            {agents.filter(a => a.status !== "idle").map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  agent.status === "active"
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : agent.status === "completed"
                    ? "bg-glow-success/10 border-glow-success/40 text-glow-success"
                    : agent.status === "error"
                    ? "bg-destructive/10 border-destructive/40 text-destructive"
                    : "bg-secondary/50 border-border/50 text-muted-foreground"
                }`}>
                  <StatusIcon status={agent.status} />
                  <span>{getStageFromAgent(agent)}</span>
                  {agent.status === "active" && (
                    <span className="text-[10px] opacity-70">{Math.round(agent.progress)}%</span>
                  )}
                </div>
                {i < agents.filter(a => a.status !== "idle").length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
                )}
              </motion.div>
            ))}

            {/* Output node */}
            {agents.some(a => a.status === "completed") && (
              <>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-shrink-0 px-3 py-2 rounded-lg bg-glow-success/10 border border-glow-success/30 text-xs font-medium text-glow-success"
                >
                  Deliverables
                </motion.div>
              </>
            )}
          </div>

          {/* Progress summary */}
          <div className="relative flex items-center justify-between mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
            </div>
            <div className="text-xs text-muted-foreground">
              {agents.filter(a => a.status === "completed").length}/{agents.filter(a => a.status !== "idle").length} complete
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
