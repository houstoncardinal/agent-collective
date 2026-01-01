import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  Code,
  FileText,
  Search,
  Megaphone,
  BarChart,
  Palette,
  Shield,
  Bot,
  Zap,
  Target,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { AgentStatus } from "@/components/AgentCard";

export interface Agent {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  status: AgentStatus;
  progress: number;
  task?: string;
  isCustom?: boolean;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentSettings {
  agentId: string;
  customPrompt?: string;
  temperature: number;
  maxTokens: number;
  isEnabled: boolean;
}

export interface CustomAgentData {
  id?: string;
  name: string;
  role: string;
  icon: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Code,
  FileText,
  Search,
  Megaphone,
  BarChart,
  Palette,
  Shield,
  Bot,
  Zap,
  Target,
  Lightbulb,
};

export const defaultAgents: Agent[] = [
  { id: "1", name: "ARIA", role: "Strategic Planner", icon: Brain, status: "idle", progress: 0 },
  { id: "2", name: "CODA", role: "Code Architect", icon: Code, status: "idle", progress: 0 },
  { id: "3", name: "DOXA", role: "Content Writer", icon: FileText, status: "idle", progress: 0 },
  { id: "4", name: "SEEK", role: "Research Analyst", icon: Search, status: "idle", progress: 0 },
  { id: "5", name: "VEGA", role: "Marketing Strategist", icon: Megaphone, status: "idle", progress: 0 },
  { id: "6", name: "FLUX", role: "Data Analyst", icon: BarChart, status: "idle", progress: 0 },
  { id: "7", name: "PIXL", role: "Design Director", icon: Palette, status: "idle", progress: 0 },
  { id: "8", name: "WARD", role: "Security Auditor", icon: Shield, status: "idle", progress: 0 },
];

export const availableIcons = Object.keys(iconMap);

export const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Bot;
};

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [agentSettings, setAgentSettings] = useState<Map<string, AgentSettings>>(new Map());
  const [customAgents, setCustomAgents] = useState<CustomAgentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAgentSettings = async () => {
    const { data, error } = await supabase
      .from("agent_settings")
      .select("*");

    if (!error && data) {
      const settingsMap = new Map<string, AgentSettings>();
      data.forEach((setting) => {
        settingsMap.set(setting.agent_id, {
          agentId: setting.agent_id,
          customPrompt: setting.custom_prompt ?? undefined,
          temperature: Number(setting.temperature) || 0.7,
          maxTokens: setting.max_tokens || 300,
          isEnabled: setting.is_enabled,
        });
      });
      setAgentSettings(settingsMap);
    }
  };

  const loadCustomAgents = async () => {
    const { data, error } = await supabase
      .from("custom_agents")
      .select("*")
      .eq("is_active", true);

    if (!error && data) {
      const customAgentData: CustomAgentData[] = data.map((agent) => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        icon: agent.icon,
        systemPrompt: agent.system_prompt,
        temperature: Number(agent.temperature),
        maxTokens: agent.max_tokens,
        isActive: agent.is_active,
      }));
      setCustomAgents(customAgentData);

      const customAgentsList: Agent[] = customAgentData.map((agent) => ({
        id: `custom-${agent.id}`,
        name: agent.name,
        role: agent.role,
        icon: getIconComponent(agent.icon),
        status: "idle" as AgentStatus,
        progress: 0,
        isCustom: true,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
      }));

      setAgents([...defaultAgents, ...customAgentsList]);
    }
  };

  const loadAll = async () => {
    setIsLoading(true);
    await Promise.all([loadAgentSettings(), loadCustomAgents()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const saveAgentSettings = async (agentId: string, settings: Partial<AgentSettings>) => {
    const existing = agentSettings.get(agentId);
    const newSettings = {
      agent_id: agentId,
      custom_prompt: settings.customPrompt ?? existing?.customPrompt ?? null,
      temperature: settings.temperature ?? existing?.temperature ?? 0.7,
      max_tokens: settings.maxTokens ?? existing?.maxTokens ?? 300,
      is_enabled: settings.isEnabled ?? existing?.isEnabled ?? true,
    };

    const { error } = await supabase
      .from("agent_settings")
      .upsert(newSettings, { onConflict: "user_id,agent_id" });

    if (!error) {
      await loadAgentSettings();
    }
    return { error };
  };

  const createCustomAgent = async (agentData: CustomAgentData) => {
    const { data, error } = await supabase
      .from("custom_agents")
      .insert({
        name: agentData.name,
        role: agentData.role,
        icon: agentData.icon,
        system_prompt: agentData.systemPrompt,
        temperature: agentData.temperature,
        max_tokens: agentData.maxTokens,
        is_active: true,
      })
      .select()
      .single();

    if (!error) {
      await loadCustomAgents();
    }
    return { data, error };
  };

  const updateCustomAgent = async (id: string, agentData: Partial<CustomAgentData>) => {
    const updateData: Record<string, unknown> = {};
    if (agentData.name !== undefined) updateData.name = agentData.name;
    if (agentData.role !== undefined) updateData.role = agentData.role;
    if (agentData.icon !== undefined) updateData.icon = agentData.icon;
    if (agentData.systemPrompt !== undefined) updateData.system_prompt = agentData.systemPrompt;
    if (agentData.temperature !== undefined) updateData.temperature = agentData.temperature;
    if (agentData.maxTokens !== undefined) updateData.max_tokens = agentData.maxTokens;
    if (agentData.isActive !== undefined) updateData.is_active = agentData.isActive;

    const { error } = await supabase
      .from("custom_agents")
      .update(updateData)
      .eq("id", id);

    if (!error) {
      await loadCustomAgents();
    }
    return { error };
  };

  const deleteCustomAgent = async (id: string) => {
    const { error } = await supabase
      .from("custom_agents")
      .delete()
      .eq("id", id);

    if (!error) {
      await loadCustomAgents();
    }
    return { error };
  };

  const resetAgents = () => {
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        status: "idle" as AgentStatus,
        progress: 0,
        task: undefined,
      }))
    );
  };

  return {
    agents,
    setAgents,
    agentSettings,
    customAgents,
    isLoading,
    saveAgentSettings,
    createCustomAgent,
    updateCustomAgent,
    deleteCustomAgent,
    resetAgents,
    refresh: loadAll,
  };
};
