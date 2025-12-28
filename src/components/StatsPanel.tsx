import { motion } from "framer-motion";
import { Users, CheckCircle, Clock, Zap } from "lucide-react";

interface StatsPanelProps {
  totalAgents: number;
  activeAgents: number;
  completedTasks: number;
  avgTime: string;
}

export const StatsPanel = ({
  totalAgents,
  activeAgents,
  completedTasks,
  avgTime,
}: StatsPanelProps) => {
  const stats = [
    {
      label: "Total Agents",
      value: totalAgents,
      icon: Users,
      color: "text-foreground",
    },
    {
      label: "Active Now",
      value: activeAgents,
      icon: Zap,
      color: "text-primary",
    },
    {
      label: "Tasks Complete",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-glow-success",
    },
    {
      label: "Avg. Time",
      value: avgTime,
      icon: Clock,
      color: "text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="glass rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
