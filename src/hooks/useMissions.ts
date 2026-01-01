import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentResult } from "@/components/ResultsPanel";

export interface Mission {
  id: string;
  missionText: string;
  createdAt: Date;
  completedAt?: Date;
  status: "pending" | "running" | "completed" | "failed";
  results: AgentResult[];
}

export const useMissions = (teamId?: string | null) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMissions = useCallback(async () => {
    setIsLoading(true);

    let query = supabase
      .from("missions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    // Filter by team or personal (null team_id)
    if (teamId) {
      query = query.eq("team_id", teamId);
    } else {
      query = query.is("team_id", null);
    }

    const { data: missionsData, error: missionsError } = await query;

    if (missionsError) {
      console.error("Error loading missions:", missionsError);
      setIsLoading(false);
      return;
    }

    const missionsWithResults: Mission[] = await Promise.all(
      (missionsData || []).map(async (mission) => {
        const { data: resultsData } = await supabase
          .from("mission_results")
          .select("*")
          .eq("mission_id", mission.id);

        return {
          id: mission.id,
          missionText: mission.mission_text,
          createdAt: new Date(mission.created_at),
          completedAt: mission.completed_at ? new Date(mission.completed_at) : undefined,
          status: mission.status as Mission["status"],
          results: (resultsData || []).map((r) => ({
            agentId: r.agent_id,
            agentName: r.agent_name,
            result: r.result,
          })),
        };
      })
    );

    setMissions(missionsWithResults);
    setIsLoading(false);
  }, [teamId]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions, teamId]);

  const saveMission = async (missionText: string, results: AgentResult[], forTeamId?: string | null): Promise<string | null> => {
    const { data: missionData, error: missionError } = await supabase
      .from("missions")
      .insert({
        mission_text: missionText,
        status: "completed",
        completed_at: new Date().toISOString(),
        team_id: forTeamId || null,
      })
      .select()
      .single();

    if (missionError || !missionData) {
      console.error("Error saving mission:", missionError);
      return null;
    }

    const resultsToInsert = results.map((r) => ({
      mission_id: missionData.id,
      agent_id: r.agentId,
      agent_name: r.agentName,
      result: r.result,
    }));

    const { error: resultsError } = await supabase
      .from("mission_results")
      .insert(resultsToInsert);

    if (resultsError) {
      console.error("Error saving mission results:", resultsError);
    }

    await loadMissions();
    return missionData.id;
  };

  const deleteMission = async (missionId: string) => {
    const { error } = await supabase
      .from("missions")
      .delete()
      .eq("id", missionId);

    if (!error) {
      await loadMissions();
    }
    return { error };
  };

  return {
    missions,
    isLoading,
    saveMission,
    deleteMission,
    refresh: loadMissions,
  };
};
