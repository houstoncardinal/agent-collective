import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  memberCount?: number;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
}

// Generate a simple anonymous user ID for demo purposes
const getAnonymousUserId = () => {
  let id = localStorage.getItem("anonymous_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("anonymous_user_id", id);
  }
  return id;
};

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = getAnonymousUserId();

  const loadTeams = useCallback(async () => {
    setIsLoading(true);

    // Get teams where user is a member
    const { data: memberData } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId);

    const teamIds = memberData?.map((m) => m.team_id) || [];

    if (teamIds.length > 0) {
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .in("id", teamIds);

      if (teamsData) {
        const teamsWithCounts = await Promise.all(
          teamsData.map(async (team) => {
            const { count } = await supabase
              .from("team_members")
              .select("*", { count: "exact", head: true })
              .eq("team_id", team.id);

            return {
              id: team.id,
              name: team.name,
              description: team.description,
              createdBy: team.created_by,
              createdAt: new Date(team.created_at),
              memberCount: count || 0,
            };
          })
        );
        setTeams(teamsWithCounts);
      }
    } else {
      setTeams([]);
    }

    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const createTeam = async (name: string, description?: string) => {
    const { data, error } = await supabase
      .from("teams")
      .insert({
        name,
        description,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !data) {
      return { error };
    }

    // Add creator as owner
    await supabase.from("team_members").insert({
      team_id: data.id,
      user_id: userId,
      role: "owner",
    });

    await loadTeams();
    return { data, error: null };
  };

  const joinTeam = async (teamId: string) => {
    const { error } = await supabase.from("team_members").insert({
      team_id: teamId,
      user_id: userId,
      role: "member",
    });

    if (!error) {
      await loadTeams();
    }
    return { error };
  };

  const leaveTeam = async (teamId: string) => {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (!error) {
      await loadTeams();
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
      }
    }
    return { error };
  };

  const deleteTeam = async (teamId: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (!error) {
      await loadTeams();
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
      }
    }
    return { error };
  };

  const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId);

    return (data || []).map((m) => ({
      id: m.id,
      teamId: m.team_id,
      userId: m.user_id,
      role: m.role as TeamMember["role"],
      joinedAt: new Date(m.joined_at),
    }));
  };

  return {
    teams,
    currentTeam,
    setCurrentTeam,
    isLoading,
    userId,
    createTeam,
    joinTeam,
    leaveTeam,
    deleteTeam,
    getTeamMembers,
    refresh: loadTeams,
  };
};
