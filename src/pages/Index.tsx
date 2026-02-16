import { useState, useCallback } from "react";
import { Plus, History, Users, BookTemplate, Layers, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GridBackground } from "@/components/GridBackground";
import { TopNav } from "@/components/TopNav";
import { HeroSection } from "@/components/HeroSection";
import { CommandInput } from "@/components/CommandInput";
import { AgentStatus } from "@/components/AgentCard";
import { ActivityFeed, Activity } from "@/components/ActivityFeed";
import { StatsPanel } from "@/components/StatsPanel";
import { ResultsPanel, AgentResult, AgentOutput } from "@/components/ResultsPanel";
import { MissionHistoryPanel } from "@/components/MissionHistoryPanel";
import { AgentSettingsDialog } from "@/components/AgentSettingsDialog";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { AgentSelectionDialog } from "@/components/AgentSelectionDialog";
import { TeamDialog } from "@/components/TeamDialog";
import { AgentTemplatesDialog } from "@/components/AgentTemplatesDialog";
import { CreateTemplateDialog } from "@/components/CreateTemplateDialog";
import { LiveCollaborationIndicator } from "@/components/LiveCollaborationIndicator";
import { NodeCanvas } from "@/components/NodeCanvas";
import { useAgents, defaultAgents, Agent, CustomAgentData } from "@/hooks/useAgents";
import { useMissions, Mission } from "@/hooks/useMissions";
import { useTeams } from "@/hooks/useTeams";
import { useAgentTemplates, AgentTemplate } from "@/hooks/useAgentTemplates";
import { useRealtimeMission } from "@/hooks/useRealtimeMission";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const Index = () => {
  const { toast } = useToast();
  const {
    teams,
    currentTeam,
    setCurrentTeam,
    createTeam,
    joinTeam,
    leaveTeam,
    deleteTeam,
  } = useTeams();
  
  const { agents, setAgents, agentSettings, saveAgentSettings, createCustomAgent, resetAgents } = useAgents(currentTeam?.id);
  const { missions, saveMission, deleteMission } = useMissions(currentTeam?.id);
  const { templates, createTemplate, deleteTemplate, incrementUseCount } = useAgentTemplates(currentTeam?.id);
  const {
    liveMission,
    teamMembers,
    isCollaborating,
    toggleCollaboration,
    broadcastMissionStart,
    broadcastAgentProgress,
    broadcastAgentResult,
    broadcastMissionComplete,
  } = useRealtimeMission(currentTeam?.id);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [results, setResults] = useState<AgentResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentMission, setCurrentMission] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showAgentSelection, setShowAgentSelection] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [pendingMission, setPendingMission] = useState("");
  const [settingsAgent, setSettingsAgent] = useState<{ id: string; name: string } | null>(null);

  const activeAgents = agents.filter((a) => a.status === "active").length;
  const errorAgents = agents.filter((a) => a.status === "error");

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
    async (agent: Agent, mission: string, isRetry: boolean = false) => {
      const retryCount = isRetry ? (agent.retryCount || 0) + 1 : 0;
      
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { 
            ...a, 
            status: "active" as AgentStatus, 
            progress: 10, 
            task: mission,
            processingStatus: isRetry ? 'retrying' : 'thinking',
            retryCount,
            errorMessage: undefined,
          } : a
        )
      );
      addActivity(agent.name, isRetry ? `retrying mission (attempt ${retryCount})` : `started working on mission`, "processing");
      broadcastAgentProgress(agent.id, agent.name, "active", 10);

      const progressInterval = setInterval(() => {
        setAgents((prev) =>
          prev.map((a) => {
            if (a.id === agent.id && a.status === "active" && a.progress < 85) {
              const newProgress = a.progress + Math.random() * 10;
              let processingStatus: 'thinking' | 'generating' | 'retrying' = isRetry ? 'retrying' : 'thinking';
              if (newProgress > 40 && !isRetry) {
                processingStatus = 'generating';
              }
              broadcastAgentProgress(agent.id, agent.name, "active", newProgress);
              return { ...a, progress: newProgress, processingStatus };
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
              a.id === agent.id ? { 
                ...a, 
                status: "completed" as AgentStatus, 
                progress: 100,
                processingStatus: 'completed',
                retryCount: 0,
                errorMessage: undefined,
              } : a
            )
          );
          addActivity(agent.name, "completed task successfully", "success");
          setCompletedTasks((prev) => prev + 1);
          
          const agentResult = { 
            agentId: agent.id, 
            agentName: agent.name, 
            result: data.result,
            output: data.output as AgentOutput | undefined
          };
          setResults((prev) => [...prev, agentResult]);
          
          broadcastAgentProgress(agent.id, agent.name, "completed", 100);
          broadcastAgentResult(agentResult);
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch (error) {
        clearInterval(progressInterval);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Agent ${agent.name} error:`, error);
        setAgents((prev) =>
          prev.map((a) => (a.id === agent.id ? { 
            ...a, 
            status: "error" as AgentStatus, 
            progress: 0,
            processingStatus: 'error',
            retryCount,
            errorMessage,
          } : a))
        );
        addActivity(agent.name, `encountered an error: ${errorMessage}`, "error");
        broadcastAgentProgress(agent.id, agent.name, "error", 0);
      }
    },
    [addActivity, agentSettings, setAgents, broadcastAgentProgress, broadcastAgentResult]
  );

  const handleRetryAgent = useCallback(
    async (agentId: string) => {
      const agent = agents.find(a => a.id === agentId);
      if (agent && currentMission) {
        await executeAgentTask(agent, currentMission, true);
      }
    },
    [agents, currentMission, executeAgentTask]
  );

  const handleRetryAllFailed = useCallback(async () => {
    if (!currentMission) return;
    const failedAgents = agents.filter(a => a.status === "error");
    for (const agent of failedAgents) {
      executeAgentTask(agent, currentMission, true);
    }
  }, [agents, currentMission, executeAgentTask]);

  const handleCommandSubmit = useCallback((command: string) => {
    setPendingMission(command);
    setShowAgentSelection(true);
  }, []);

  const handleRunMission = useCallback(
    async (selectedAgentIds: string[]) => {
      const command = pendingMission;
      const missionId = Date.now().toString();
      setIsProcessing(true);
      setCurrentMission(command);
      setResults([]);
      setIsSaved(false);
      resetAgents();
      addActivity("SYSTEM", `New mission received: "${command}"`, "info");

      const agentsToActivate = agents.filter(
        (a) => selectedAgentIds.includes(a.id) && (agentSettings.get(a.id)?.isEnabled ?? true)
      );

      broadcastMissionStart(missionId, command, selectedAgentIds);

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
        broadcastMissionComplete(results);
      }, 500);
    },
    [addActivity, executeAgentTask, agents, agentSettings, resetAgents, toast, pendingMission, broadcastMissionStart, broadcastMissionComplete, results]
  );

  const handleSaveMission = async () => {
    if (results.length > 0 && currentMission) {
      await saveMission(currentMission, results, currentTeam?.id);
      setIsSaved(true);
      toast({ title: "Mission Saved", description: "You can find it in your mission history." });
    }
  };

  const handleRerunMission = (mission: Mission) => {
    setShowHistory(false);
    setPendingMission(mission.missionText);
    setShowAgentSelection(true);
  };

  const handleViewMission = (mission: Mission) => {
    setResults(mission.results);
    setCurrentMission(mission.missionText);
    setIsSaved(true);
    setShowResults(true);
    setShowHistory(false);
  };

  const handleCreateAgent = async (agentData: CustomAgentData) => {
    await createCustomAgent(agentData, currentTeam?.id);
    toast({ title: "Agent Created", description: `${agentData.name} is ready for missions.${currentTeam ? ` Shared with ${currentTeam.name}` : ""}` });
  };

  const handleDeleteMission = async (missionId: string) => {
    await deleteMission(missionId);
    toast({ title: "Mission Deleted", description: "Mission removed from history." });
  };

  const handleSaveAgentSettings = async (settings: any) => {
    await saveAgentSettings(settings.agentId, settings);
    toast({ title: "Settings Saved", description: "Agent configuration updated." });
  };

  const handleUseTemplate = async (template: AgentTemplate) => {
    await createCustomAgent({
      name: template.name,
      role: template.role,
      icon: template.icon,
      systemPrompt: template.systemPrompt,
      temperature: template.temperature,
      maxTokens: template.maxTokens,
      isActive: true,
    }, currentTeam?.id);
    await incrementUseCount(template.id);
    setShowTemplates(false);
    toast({ title: "Agent Created from Template", description: `${template.name} has been added to your agents.` });
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
    toast({ title: "Template Deleted", description: "Template has been removed." });
  };

  const handleCreateTemplate = async (
    template: Omit<AgentTemplate, "id" | "createdAt" | "useCount" | "createdBy">,
    teamId?: string | null
  ) => {
    await createTemplate(template, teamId);
    toast({ title: "Template Created", description: `${template.name} template is now available.${template.isPublic ? " (Public)" : teamId ? " (Team)" : ""}` });
  };

  return (
    <div className="min-h-screen relative">
      <GridBackground />
      <TopNav totalAgents={agents.length} activeAgents={activeAgents} isProcessing={isProcessing} />
      
      <div className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        <HeroSection />

        {/* Team Context and Collaboration Indicator */}
        {currentTeam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Badge variant="secondary" className="text-sm">
              <Users className="w-3 h-3 mr-1" />
              Team: {currentTeam.name}
            </Badge>
            <LiveCollaborationIndicator
              isCollaborating={isCollaborating}
              teamMembers={teamMembers}
              liveMission={liveMission}
              onToggle={toggleCollaboration}
            />
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center gap-2 mb-8 flex-wrap">
          <Button variant="glass" size="sm" onClick={() => setShowTeamDialog(true)}>
            <Users className="w-4 h-4 mr-2" />
            Teams
          </Button>
          <Button variant="glass" size="sm" onClick={() => setShowHistory(true)}>
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button variant="glass" size="sm" onClick={() => setShowTemplates(true)}>
            <BookTemplate className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button variant="glass" size="sm" onClick={() => setShowCreateAgent(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
        </motion.div>

        <CommandInput onSubmit={handleCommandSubmit} isProcessing={isProcessing} />

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
          <StatsPanel totalAgents={agents.length} activeAgents={activeAgents} completedTasks={completedTasks} avgTime="2.4s" />
        </motion.div>

        {/* Retry All Failed Button */}
        {errorAgents.length > 1 && currentMission && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-6"
          >
            <Button variant="outline" onClick={handleRetryAllFailed} className="border-destructive/30 hover:border-destructive/60 text-destructive">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry All Failed ({errorAgents.length})
            </Button>
          </motion.div>
        )}

        {/* Node Canvas - Visual Agent Workforce */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Agent Workforce
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              <Layers className="w-3 h-3 mr-1" />
              {agents.length} agents
            </Badge>
          </div>
          <div className="glass rounded-2xl border border-border/50 overflow-hidden">
            <NodeCanvas
              agents={agents}
              isProcessing={isProcessing}
              currentMission={currentMission}
              onSettings={(agent) => setSettingsAgent(agent)}
              onRetry={handleRetryAgent}
            />
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8">
          <ActivityFeed activities={activities} />
        </motion.div>

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-20 pb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Layers className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold tracking-tight text-foreground">NEXUS AI</span>
          </div>
          <p className="text-muted-foreground text-xs">Multi-Agent Orchestration Platform • Advanced AI Workforce</p>
        </motion.footer>
      </div>

      <ResultsPanel results={results} isOpen={showResults} onClose={() => setShowResults(false)} mission={currentMission} onSave={handleSaveMission} isSaved={isSaved} />
      <MissionHistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} missions={missions} onRerun={handleRerunMission} onDelete={handleDeleteMission} onView={handleViewMission} />
      <CreateAgentDialog isOpen={showCreateAgent} onClose={() => setShowCreateAgent(false)} onSave={handleCreateAgent} />
      <AgentSelectionDialog
        isOpen={showAgentSelection}
        onClose={() => setShowAgentSelection(false)}
        agents={agents.filter((a) => agentSettings.get(a.id)?.isEnabled ?? true)}
        onConfirm={handleRunMission}
        mission={pendingMission}
      />
      <TeamDialog
        isOpen={showTeamDialog}
        onClose={() => setShowTeamDialog(false)}
        teams={teams}
        currentTeam={currentTeam}
        onCreateTeam={createTeam}
        onJoinTeam={joinTeam}
        onLeaveTeam={leaveTeam}
        onDeleteTeam={deleteTeam}
        onSelectTeam={setCurrentTeam}
      />
      <AgentTemplatesDialog
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templates}
        currentTeam={currentTeam}
        onUseTemplate={handleUseTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onCreateTemplate={() => {
          setShowTemplates(false);
          setShowCreateTemplate(true);
        }}
      />
      <CreateTemplateDialog
        isOpen={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
        onSave={handleCreateTemplate}
        currentTeam={currentTeam}
      />
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
