import { motion, AnimatePresence } from "framer-motion";
import { Radio, Users, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TeamMember, LiveMission } from "@/hooks/useRealtimeMission";

interface LiveCollaborationIndicatorProps {
  isCollaborating: boolean;
  teamMembers: TeamMember[];
  liveMission: LiveMission | null;
  onToggle: () => void;
}

export const LiveCollaborationIndicator = ({
  isCollaborating,
  teamMembers,
  liveMission,
  onToggle,
}: LiveCollaborationIndicatorProps) => {
  const onlineCount = teamMembers.filter(m => m.isOnline).length;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {/* Live collaboration toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isCollaborating ? "default" : "outline"}
              size="sm"
              onClick={onToggle}
              className={`gap-2 ${isCollaborating ? "bg-primary/90 hover:bg-primary" : ""}`}
            >
              {isCollaborating ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              {isCollaborating ? "Live" : "Offline"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isCollaborating
              ? "Real-time collaboration is active. Team members can see your progress."
              : "Enable real-time collaboration to share progress with team members."}
          </TooltipContent>
        </Tooltip>

        {/* Online team members */}
        <AnimatePresence>
          {isCollaborating && onlineCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <div className="flex -space-x-2">
                {teamMembers.slice(0, 4).map((member, i) => (
                  <Tooltip key={member.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.currentActivity || "Online"}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {teamMembers.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                    +{teamMembers.length - 4}
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {onlineCount} online
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live mission indicator */}
        <AnimatePresence>
          {liveMission && liveMission.status === 'active' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2"
            >
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 gap-1.5">
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <Radio className="w-3 h-3" />
                Mission in Progress
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};
