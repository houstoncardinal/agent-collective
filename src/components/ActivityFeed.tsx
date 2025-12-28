import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, AlertCircle, Zap } from "lucide-react";

export interface Activity {
  id: string;
  agent: string;
  action: string;
  timestamp: Date;
  type: "info" | "success" | "error" | "processing";
}

interface ActivityFeedProps {
  activities: Activity[];
}

const typeConfig = {
  info: {
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  success: {
    icon: CheckCircle,
    color: "text-glow-success",
    bg: "bg-glow-success/10",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  processing: {
    icon: Loader2,
    color: "text-accent",
    bg: "bg-accent/10",
  },
};

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <div className="glass rounded-xl p-6 border border-border">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        Live Activity
      </h3>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color} ${activity.type === "processing" ? "animate-spin" : ""}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold text-primary">{activity.agent}</span>
                    {" "}{activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {activities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No activity yet. Deploy a mission to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};
