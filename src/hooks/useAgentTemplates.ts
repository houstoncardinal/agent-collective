import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  icon: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  description?: string;
  isPublic: boolean;
  teamId?: string | null;
  createdBy?: string | null;
  createdAt: string;
  useCount: number;
}

export const useAgentTemplates = (teamId?: string | null) => {
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    
    // Fetch templates - public ones, team ones, or personal (null team_id)
    let query = supabase
      .from("agent_templates")
      .select("*")
      .order("use_count", { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      const mapped: AgentTemplate[] = data.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        icon: t.icon,
        systemPrompt: t.system_prompt,
        temperature: Number(t.temperature),
        maxTokens: t.max_tokens,
        description: t.description ?? undefined,
        isPublic: t.is_public,
        teamId: t.team_id,
        createdBy: t.created_by,
        createdAt: t.created_at,
        useCount: t.use_count,
      }));
      setTemplates(mapped);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates, teamId]);

  const createTemplate = async (
    template: Omit<AgentTemplate, "id" | "createdAt" | "useCount" | "createdBy">,
    forTeamId?: string | null
  ) => {
    const { data, error } = await supabase
      .from("agent_templates")
      .insert({
        name: template.name,
        role: template.role,
        icon: template.icon,
        system_prompt: template.systemPrompt,
        temperature: template.temperature,
        max_tokens: template.maxTokens,
        description: template.description || null,
        is_public: template.isPublic,
        team_id: forTeamId || null,
      })
      .select()
      .single();

    if (!error) {
      await loadTemplates();
    }
    return { data, error };
  };

  const updateTemplate = async (id: string, updates: Partial<AgentTemplate>) => {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.systemPrompt !== undefined) updateData.system_prompt = updates.systemPrompt;
    if (updates.temperature !== undefined) updateData.temperature = updates.temperature;
    if (updates.maxTokens !== undefined) updateData.max_tokens = updates.maxTokens;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

    const { error } = await supabase
      .from("agent_templates")
      .update(updateData)
      .eq("id", id);

    if (!error) {
      await loadTemplates();
    }
    return { error };
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from("agent_templates")
      .delete()
      .eq("id", id);

    if (!error) {
      await loadTemplates();
    }
    return { error };
  };

  const incrementUseCount = async (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      await supabase
        .from("agent_templates")
        .update({ use_count: template.useCount + 1 })
        .eq("id", id);
    }
  };

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUseCount,
    refresh: loadTemplates,
  };
};
