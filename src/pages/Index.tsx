import { useState, useCallback } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GridBackground } from "@/components/GridBackground";
import { HeroSection } from "@/components/HeroSection";
import { CommandInput } from "@/components/CommandInput";
import { AgentCard, AgentStatus } from "@/components/AgentCard";
import { ActivityFeed, Activity } from "@/components/ActivityFeed";
import { StatsPanel } from "@/components/StatsPanel";
import { ResultsPanel, AgentResult } from "@/components/ResultsPanel";
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

const Index = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [results, setResults] = useState<AgentResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentMission, setCurrentMission] = useState("");

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

  const executeAgentTask = useCallback(
    async (agentId: string, agentName: string, agentRole: string, mission: string) => {
      // Set agent to active
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId ? { ...a, status: "active" as AgentStatus, progress: 10, task: mission } : a
        )
      );
      addActivity(agentName, `started working on mission`, "processing");

      // Simulate progress while waiting for AI
      const progressInterval = setInterval(() => {
        setAgents((prev) =>
          prev.map((a) => {
            if (a.id === agentId && a.status === "active" && a.progress < 85) {
              return { ...a, progress: a.progress + Math.random() * 10 };
            }
            return a;
          })
        );
      }, 500);

      try {
        const { data, error } = await supabase.functions.invoke("agent-task", {
          body: { agentId, agentName, agentRole, mission },
        });

        clearInterval(progressInterval);

        if (error) throw error;

        if (data.success) {
          setAgents((prev) =>
            prev.map((a) =>
              a.id === agentId ? { ...a, status: "completed" as AgentStatus, progress: 100 } : a
            )
          );
          addActivity(agentName, "completed task successfully", "success");
          setCompletedTasks((prev) => prev + 1);

          setResults((prev) => [
            ...prev,
            { agentId, agentName, result: data.result },
          ]);
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch (error) {
        clearInterval(progressInterval);
        console.error(`Agent ${agentName} error:`, error);
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agentId ? { ...a, status: "error" as AgentStatus, progress: 0 } : a
          )
        );
        addActivity(agentName, `encountered an error`, "error");
      }
    },
    [addActivity]
  );

  const handleCommand = useCallback(
    async (command: string) => {
      setIsProcessing(true);
      setCurrentMission(command);
      setResults([]);

      // Reset all agents
      setAgents(initialAgents);
      addActivity("SYSTEM", `New mission received: "${command}"`, "info");

      // Determine which agents to activate based on command
      const commandLower = command.toLowerCase();
      let agentsToActivate: string[] = [];

      if (commandLower.includes("market") || commandLower.includes("campaign") || commandLower.includes("launch")) {
        agentsToActivate = ["1", "3", "5", "7"];
      } else if (commandLower.includes("code") || commandLower.includes("build") || commandLower.includes("develop") || commandLower.includes("app")) {
        agentsToActivate = ["1", "2", "7", "8"];
      } else if (commandLower.includes("research") || commandLower.includes("analyze") || commandLower.includes("data")) {
        agentsToActivate = ["1", "4", "6"];
      } else if (commandLower.includes("content") || commandLower.includes("write") || commandLower.includes("blog")) {
        agentsToActivate = ["1", "3", "4"];
      } else {
        // Default: activate all agents
        agentsToActivate = ["1", "2", "3", "4", "5", "6", "7", "8"];
      }

      // Execute all agents in parallel with staggered starts
      const promises = agentsToActivate.map((id, index) => {
        const agent = initialAgents.find((a) => a.id === id);
        if (!agent) return Promise.resolve();

        return new Promise<void>((resolve) => {
          setTimeout(async () => {
            await executeAgentTask(id, agent.name, agent.role, command);
            resolve();
          }, index * 300);
        });
      });

      await Promise.all(promises);

      setIsProcessing(false);
      
      // Show results after all agents complete
      setTimeout(() => {
        setShowResults(true);
        toast({
          title: "Mission Complete",
          description: `${agentsToActivate.length} agents have completed their tasks.`,
        });
      }, 500);
    },
    [addActivity, executeAgentTask, toast]
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
            AI Agent Workforce Platform • Powered by OpenAI GPT-4
          </p>
        </motion.footer>
      </div>

      {/* Results Panel */}
      <ResultsPanel
        results={results}
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        mission={currentMission}
      />
    </div>
  );
};

export default Index;
