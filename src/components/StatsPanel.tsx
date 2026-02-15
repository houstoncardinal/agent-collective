import { motion } from "framer-motion";
import { Users, CheckCircle, Clock, Zap, TrendingUp, Cpu } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsPanelProps {
  totalAgents: number;
  activeAgents: number;
  completedTasks: number;
  avgTime: string;
}

const AnimatedCounter = ({ value, duration = 1 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed >= 1) {
        setDisplay(value);
        return;
      }
      setDisplay(Math.round(start + diff * elapsed));
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{display}</>;
};

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
      icon: Cpu,
      color: "text-foreground",
      accentBg: "bg-foreground/5",
      accentBorder: "border-foreground/10",
      isNumeric: true,
    },
    {
      label: "Active Now",
      value: activeAgents,
      icon: Zap,
      color: "text-primary",
      accentBg: "bg-primary/5",
      accentBorder: "border-primary/20",
      isNumeric: true,
      glow: activeAgents > 0,
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-glow-success",
      accentBg: "bg-glow-success/5",
      accentBorder: "border-glow-success/20",
      isNumeric: true,
    },
    {
      label: "Avg. Time",
      value: avgTime,
      icon: Clock,
      color: "text-accent",
      accentBg: "bg-accent/5",
      accentBorder: "border-accent/20",
      isNumeric: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className={`relative glass rounded-xl p-4 border ${stat.accentBorder} ${stat.accentBg} overflow-hidden group cursor-default`}
        >
          {/* Subtle glow for active */}
          {stat.glow && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <div className="relative flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.accentBg} border ${stat.accentBorder} flex items-center justify-center transition-colors`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-display font-black ${stat.color} leading-none`}>
                {stat.isNumeric ? <AnimatedCounter value={stat.value as number} /> : stat.value}
              </p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
