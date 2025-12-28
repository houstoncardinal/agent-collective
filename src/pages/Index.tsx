import { useState, useCallback, useEffect } from "react";
import {
  Brain,
  Code,
  FileText,
  Search,
  Megaphone,
  BarChart,
  Palette,
  Shield,
} from "lucide-react";
import { GridBackground } from "@/components/GridBackground";
import { HeroSection } from "@/components/HeroSection";
import { CommandInput } from "@/components/CommandInput";
import { AgentCard, AgentStatus } from "@/components/AgentCard";
import { ActivityFeed, Activity } from "@/components/ActivityFeed";
import { StatsPanel } from "@/components/StatsPanel";
import { motion } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: typeof Brain;
  status: AgentStatus;
  progress: number;
  task?: string;
}

const initialAgents: Agent[] = [
  { id: "1", name: "ARIA", role: "Strategic Planner", icon: Brain, status: "idle", progress: 0 },
  { id: "2", name: "CODA", role: "Code Architect", icon: Code, status: "idle", progress: 0 },
  { id: "3", name: "DOXA", role: "Content Writer", icon: FileText, status: "idle", progress: 0 },
  { id: "4", name: "SEEK", role: "Research Analyst", icon: Search, status: "idle", progress: 0 },
  { id: "5", name: "VEGA", role: "Marketing Strategist", icon: Megaphone, status: "idle", progress: 0 },
  { id: "6", name: "FLUX", role: "Data Analyst", icon: BarChart, status: "idle", progress: 0 },
  { id: "7", name: "PIXL", role: "Design Director", icon: Palette, status: "idle", progress: 0 },
  { id: "8", name: "WARD", role: "Security Auditor", icon: Shield, status: "idle", progress: 0 },
];

const taskAssignments: Record<string, string[]> = {
  "1": ["analyzing mission parameters", "creating execution roadmap", "optimizing resource allocation"],
  "2": ["architecting solution", "implementing core logic", "running test suites"],
  "3": ["drafting content strategy", "writing copy", "refining messaging"],
  "4": ["gathering intelligence", "analyzing competitors", "synthesizing insights"],
  "5": ["developing campaign strategy", "identifying target audience", "crafting messaging"],
  "6": ["processing datasets", "generating visualizations", "extracting insights"],
  "7": ["creating visual concepts", "designing interfaces", "refining aesthetics"],
  "8": ["scanning for vulnerabilities", "auditing permissions", "generating security report"],
};

const Index = () => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);

  const activeAgents = agents.filter((a) => a.status === "active").length;

  const addActivity = useCallback((agent: string, action: string, type: Activity["type"]) => {
    const newActivity: Activity = {
      id: Date.now().toString() + Math.random(),
      agent,
      action,
      timestamp: new Date(),
      type,
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 20));
  }, []);

  const simulateAgentWork = useCallback(
    (agentId: string, task: string) => {
      const agent = initialAgents.find((a) => a.id === agentId);
      if (!agent) return;

      const tasks = taskAssignments[agentId];
      let currentTaskIndex = 0;

      // Start working
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId ? { ...a, status: "active" as AgentStatus, progress: 0, task } : a
        )
      );
      addActivity(agent.name, `started working on: "${task}"`, "processing");

      // Progress updates
      const progressInterval = setInterval(() => {
        setAgents((prev) => {
          const current = prev.find((a) => a.id === agentId);
          if (!current || current.status !== "active") {
            clearInterval(progressInterval);
            return prev;
          }

          const newProgress = Math.min(current.progress + Math.random() * 15 + 5, 100);

          // Log intermediate tasks
          if (newProgress > (currentTaskIndex + 1) * 33 && currentTaskIndex < tasks.length) {
            addActivity(agent.name, tasks[currentTaskIndex], "info");
            currentTaskIndex++;
          }

          if (newProgress >= 100) {
            clearInterval(progressInterval);
            addActivity(agent.name, "completed task successfully", "success");
            setCompletedTasks((prev) => prev + 1);
            return prev.map((a) =>
              a.id === agentId ? { ...a, status: "completed" as AgentStatus, progress: 100 } : a
            );
          }

          return prev.map((a) => (a.id === agentId ? { ...a, progress: newProgress } : a));
        });
      }, 800);
    },
    [addActivity]
  );

  const handleCommand = useCallback(
    (command: string) => {
      setIsProcessing(true);

      // Reset all agents
      setAgents(initialAgents);
      addActivity("SYSTEM", `New mission received: "${command}"`, "info");

      // Determine which agents to activate based on command
      const commandLower = command.toLowerCase();
      let agentsToActivate: string[] = [];

      if (commandLower.includes("market") || commandLower.includes("campaign") || commandLower.includes("launch")) {
        agentsToActivate = ["1", "3", "5", "7"];
      } else if (commandLower.includes("code") || commandLower.includes("build") || commandLower.includes("develop")) {
        agentsToActivate = ["1", "2", "7", "8"];
      } else if (commandLower.includes("research") || commandLower.includes("analyze") || commandLower.includes("data")) {
        agentsToActivate = ["1", "4", "6"];
      } else if (commandLower.includes("content") || commandLower.includes("write") || commandLower.includes("blog")) {
        agentsToActivate = ["1", "3", "4"];
      } else {
        // Default: activate all agents
        agentsToActivate = ["1", "2", "3", "4", "5", "6", "7", "8"];
      }

      // Stagger agent activation
      agentsToActivate.forEach((id, index) => {
        setTimeout(() => {
          simulateAgentWork(id, command);
        }, index * 400);
      });

      // End processing state
      setTimeout(() => {
        setIsProcessing(false);
      }, agentsToActivate.length * 400 + 500);
    },
    [addActivity, simulateAgentWork]
  );

  return (
    <div className="min-h-screen relative">
      <GridBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <HeroSection />

        {/* Command Input */}
        <CommandInput onSubmit={handleCommand} isProcessing={isProcessing} />

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <StatsPanel
            totalAgents={agents.length}
            activeAgents={activeAgents}
            completedTasks={completedTasks}
            avgTime="2.4s"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Agent Grid */}
          <div className="lg:col-span-2">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Agent Workforce
            </motion.h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {agents.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  name={agent.name}
                  role={agent.role}
                  icon={agent.icon}
                  status={agent.status}
                  progress={agent.progress}
                  task={agent.task}
                  delay={0.6 + index * 0.05}
                />
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ActivityFeed activities={activities} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 pb-8 text-center"
        >
          <p className="text-muted-foreground text-sm">
            AI Agent Workforce Platform • Multi-agent orchestration at your command
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
