import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentResult } from "@/components/ResultsPanel";

export interface LiveMission {
  id: string;
  missionText: string;
  teamId: string;
  status: 'active' | 'completed';
  agentProgress: Record<string, {
    agentId: string;
    agentName: string;
    status: 'idle' | 'active' | 'completed' | 'error';
    progress: number;
  }>;
  results: AgentResult[];
  startedAt: Date;
  userId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  isOnline: boolean;
  currentActivity?: string;
}

export const useRealtimeMission = (teamId?: string | null) => {
  const [liveMission, setLiveMission] = useState<LiveMission | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);

  // Subscribe to realtime presence for team members
  useEffect(() => {
    if (!teamId || !isCollaborating) return;

    const channel = supabase.channel(`team-presence-${teamId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const members: TeamMember[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            members.push({
              id: presence.user_id,
              name: presence.user_name || 'Team Member',
              isOnline: true,
              currentActivity: presence.activity,
            });
          });
        });
        
        setTeamMembers(members);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Member joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Member left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: Math.random().toString(36).substring(7),
            user_name: 'Agent Operator',
            online_at: new Date().toISOString(),
            activity: 'viewing',
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, isCollaborating]);

  // Subscribe to realtime mission updates
  useEffect(() => {
    if (!teamId || !isCollaborating) return;

    const channel = supabase.channel(`mission-updates-${teamId}`);

    channel
      .on('broadcast', { event: 'mission-start' }, ({ payload }) => {
        setLiveMission({
          id: payload.missionId,
          missionText: payload.missionText,
          teamId: payload.teamId,
          status: 'active',
          agentProgress: payload.agentProgress || {},
          results: [],
          startedAt: new Date(payload.startedAt),
          userId: payload.userId,
        });
      })
      .on('broadcast', { event: 'agent-progress' }, ({ payload }) => {
        setLiveMission(prev => {
          if (!prev) return null;
          return {
            ...prev,
            agentProgress: {
              ...prev.agentProgress,
              [payload.agentId]: {
                agentId: payload.agentId,
                agentName: payload.agentName,
                status: payload.status,
                progress: payload.progress,
              },
            },
          };
        });
      })
      .on('broadcast', { event: 'agent-result' }, ({ payload }) => {
        setLiveMission(prev => {
          if (!prev) return null;
          return {
            ...prev,
            results: [...prev.results, payload.result],
          };
        });
      })
      .on('broadcast', { event: 'mission-complete' }, ({ payload }) => {
        setLiveMission(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'completed',
            results: payload.results,
          };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, isCollaborating]);

  const broadcastMissionStart = useCallback(async (
    missionId: string,
    missionText: string,
    agentIds: string[]
  ) => {
    if (!teamId || !isCollaborating) return;

    const agentProgress: Record<string, any> = {};
    agentIds.forEach(id => {
      agentProgress[id] = { agentId: id, status: 'idle', progress: 0 };
    });

    await supabase.channel(`mission-updates-${teamId}`).send({
      type: 'broadcast',
      event: 'mission-start',
      payload: {
        missionId,
        missionText,
        teamId,
        agentProgress,
        startedAt: new Date().toISOString(),
      },
    });
  }, [teamId, isCollaborating]);

  const broadcastAgentProgress = useCallback(async (
    agentId: string,
    agentName: string,
    status: 'idle' | 'active' | 'completed' | 'error',
    progress: number
  ) => {
    if (!teamId || !isCollaborating) return;

    await supabase.channel(`mission-updates-${teamId}`).send({
      type: 'broadcast',
      event: 'agent-progress',
      payload: { agentId, agentName, status, progress },
    });
  }, [teamId, isCollaborating]);

  const broadcastAgentResult = useCallback(async (result: AgentResult) => {
    if (!teamId || !isCollaborating) return;

    await supabase.channel(`mission-updates-${teamId}`).send({
      type: 'broadcast',
      event: 'agent-result',
      payload: { result },
    });
  }, [teamId, isCollaborating]);

  const broadcastMissionComplete = useCallback(async (results: AgentResult[]) => {
    if (!teamId || !isCollaborating) return;

    await supabase.channel(`mission-updates-${teamId}`).send({
      type: 'broadcast',
      event: 'mission-complete',
      payload: { results },
    });

    setTimeout(() => {
      setLiveMission(null);
    }, 3000);
  }, [teamId, isCollaborating]);

  const toggleCollaboration = useCallback(() => {
    setIsCollaborating(prev => !prev);
  }, []);

  return {
    liveMission,
    teamMembers,
    isCollaborating,
    toggleCollaboration,
    broadcastMissionStart,
    broadcastAgentProgress,
    broadcastAgentResult,
    broadcastMissionComplete,
  };
};
