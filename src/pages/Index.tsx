import { useState, useCallback } from "react";
import { Plus, History, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GridBackground } from "@/components/GridBackground";
import { HeroSection } from "@/components/HeroSection";
import { CommandInput } from "@/components/CommandInput";
import { AgentCard, AgentStatus } from "@/components/AgentCard";
import { ActivityFeed, Activity } from "@/components/ActivityFeed";
import { StatsPanel } from "@/components/StatsPanel";
import { ResultsPanel, AgentResult } from "@/components/ResultsPanel";
import { MissionHistoryPanel } from "@/components/MissionHistoryPanel";
import { AgentSettingsDialog } from "@/components/AgentSettingsDialog";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { useAgents, defaultAgents, Agent, CustomAgentData } from "@/hooks/useAgents";
import { useMissions, Mission } from "@/hooks/useMissions";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const { toast } = useToast();
  const { agents, setAgents, agentSettings, saveAgentSettings, createCustomAgent, resetAgents } = useAgents();
  const { missions, saveMission } = useMissions();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [results, setResults] = useState<AgentResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentMission, setCurrentMission] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [settingsAgent, setSettingsAgent] = useState<{ id: string; name: string } | null>(null);

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
    async (agent: Agent, mission: string) => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { ...a, status: "active" as AgentStatus, progress: 10, task: mission } : a
        )
      );
      addActivity(agent.name, `started working on mission`, "processing");

      const progressInterval = setInterval(() => {
        setAgents((prev) =>
          prev.map((a) => {
            if (a.id === agent.id && a.status === "active" && a.progress < 85) {
              return { ...a, progress: a.progress + Math.random() * 10 };
            }
            return a;
          })
        );
      }, 500);

      try {
        const settings = agentSettings.get(agent.id);
        const { data, error } = await supabase.functions.invoke("agent-task", {
          body: {
            agentId: agent.id,
            agentName: agent.name,
            agentRole: agent.role,
            mission,
            customPrompt: settings?.customPrompt || agent.systemPrompt,
            temperature: settings?.temperature || agent.temperature || 0.7,
            maxTokens: settings?.maxTokens || agent.maxTokens || 300,
            isCustom: agent.isCustom,
          },
        });

        clearInterval(progressInterval);

        if (error) throw error;

        if (data.success) {
          setAgents((prev) =>
            prev.map((a) =>
              a.id === agent.id ? { ...a, status: "completed" as AgentStatus, progress: 100 } : a
            )
          );
          addActivity(agent.name, "completed task successfully", "success");
          setCompletedTasks((prev) => prev + 1);
          setResults((prev) => [...prev, { agentId: agent.id, agentName: agent.name, result: data.result }]);
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch (error) {
        clearInterval(progressInterval);
        console.error(`Agent ${agent.name} error:`, error);
        setAgents((prev) =>
          prev.map((a) => (a.id === agent.id ? { ...a, status: "error" as AgentStatus, progress: 0 } : a))
        );
        addActivity(agent.name, `encountered an error`, "error");
      }
    },
    [addActivity, agentSettings, setAgents]
  );

  const handleCommand = useCallback(
    async (command: string) => {
      setIsProcessing(true);
      setCurrentMission(command);
      setResults([]);
      setIsSaved(false);
      resetAgents();
      addActivity("SYSTEM", `New mission received: "${command}"`, "info");

      const commandLower = command.toLowerCase();
      let agentIdsToActivate: string[] = [];

      if (commandLower.includes("market") || commandLower.includes("campaign") || commandLower.includes("launch")) {
        agentIdsToActivate = ["1", "3", "5", "7"];
      } else if (commandLower.includes("code") || commandLower.includes("build") || commandLower.includes("develop")) {
        agentIdsToActivate = ["1", "2", "7", "8"];
      } else if (commandLower.includes("research") || commandLower.includes("analyze") || commandLower.includes("data")) {
        agentIdsToActivate = ["1", "4", "6"];
      } else if (commandLower.includes("content") || commandLower.includes("write") || commandLower.includes("blog")) {
        agentIdsToActivate = ["1", "3", "4"];
      } else {
        agentIdsToActivate = agents.map((a) => a.id);
      }

      const agentsToActivate = agents.filter(
        (a) => agentIdsToActivate.includes(a.id) && (agentSettings.get(a.id)?.isEnabled ?? true)
      );

      const promises = agentsToActivate.map((agent, index) => {
        return new Promise<void>((resolve) => {
          setTimeout(async () => {
            await executeAgentTask(agent, command);
            resolve();
          }, index * 300);
        });
      });

      await Promise.all(promises);
      setIsProcessing(false);

      setTimeout(() => {
        setShowResults(true);
        toast({ title: "Mission Complete", description: `${agentsToActivate.length} agents have completed their tasks.` });
      }, 500);
    },
    [addActivity, executeAgentTask, agents, agentSettings, resetAgents, toast]
  );

  const handleSaveMission = async () => {
    if (results.length > 0 && currentMission) {
      await saveMission(currentMission, results);
      setIsSaved(true);
      toast({ title: "Mission Saved", description: "You can find it in your mission history." });
    }
  };

  const handleRerunMission = (mission: Mission) => {
    setShowHistory(false);
    handleCommand(mission.missionText);
  };

  const handleViewMission = (mission: Mission) => {
    setResults(mission.results);
    setCurrentMission(mission.missionText);
    setIsSaved(true);
    setShowResults(true);
    setShowHistory(false);
  };

  const handleCreateAgent = async (agentData: CustomAgentData) => {
    await createCustomAgent(agentData);
    toast({ title: "Agent Created", description: `${agentData.name} is ready for missions.` });
  };

  const handleSaveAgentSettings = async (settings: any) => {
    await saveAgentSettings(settings.agentId, settings);
    toast({ title: "Settings Saved", description: "Agent configuration updated." });
  };

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <HeroSection />

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center gap-3 mb-8">
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="w-4 h-4 mr-2" />
            Mission History
          </Button>
          <Button variant="outline" onClick={() => setShowCreateAgent(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </motion.div>

        <CommandInput onSubmit={handleCommand} isProcessing={isProcessing} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12">
          <StatsPanel totalAgents={agents.length} activeAgents={activeAgents} completedTasks={completedTasks} avgTime="2.4s" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
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
                  isCustom={agent.isCustom}
                  onSettings={() => setSettingsAgent({ id: agent.id, name: agent.name })}
                />
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <ActivityFeed activities={activities} />
          </motion.div>
        </div>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-16 pb-8 text-center">
          <p className="text-muted-foreground text-sm">AI Agent Workforce Platform • Powered by OpenAI GPT-4</p>
        </motion.footer>
      </div>

      <ResultsPanel results={results} isOpen={showResults} onClose={() => setShowResults(false)} mission={currentMission} onSave={handleSaveMission} isSaved={isSaved} />
      <MissionHistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} missions={missions} onRerun={handleRerunMission} onDelete={() => {}} onView={handleViewMission} />
      <CreateAgentDialog isOpen={showCreateAgent} onClose={() => setShowCreateAgent(false)} onSave={handleCreateAgent} />
      {settingsAgent && (
        <AgentSettingsDialog
          isOpen={!!settingsAgent}
          onClose={() => setSettingsAgent(null)}
          agentId={settingsAgent.id}
          agentName={settingsAgent.name}
          currentSettings={agentSettings.get(settingsAgent.id)}
          onSave={handleSaveAgentSettings}
        />
      )}
    </div>
  );
};

export default Index;
