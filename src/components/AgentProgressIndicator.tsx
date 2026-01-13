import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Brain, Sparkles, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export type AgentProcessingStatus = 
  | 'idle' 
  | 'thinking' 
  | 'generating' 
  | 'retrying' 
  | 'completed' 
  | 'error';

interface AgentProgressIndicatorProps {
  status: AgentProcessingStatus;
  progress: number;
  retryCount?: number;
  maxRetries?: number;
  errorMessage?: string;
}

const statusConfig: Record<AgentProcessingStatus, { 
  icon: typeof Loader2; 
  label: string; 
  color: string;
  bgColor: string;
  animate?: boolean;
}> = {
  idle: {
    icon: Brain,
    label: 'Ready',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
  },
  thinking: {
    icon: Brain,
    label: 'Thinking...',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    animate: true,
  },
  generating: {
    icon: Sparkles,
    label: 'Generating...',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    animate: true,
  },
  retrying: {
    icon: RefreshCw,
    label: 'Retrying...',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    animate: true,
  },
  completed: {
    icon: CheckCircle,
    label: 'Complete',
    color: 'text-glow-success',
    bgColor: 'bg-glow-success/10',
  },
  error: {
    icon: AlertCircle,
    label: 'Failed',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

export const AgentProgressIndicator = ({
  status,
  progress,
  retryCount = 0,
  maxRetries = 3,
  errorMessage,
}: AgentProgressIndicatorProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      {/* Status badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.color}`}
        >
          <motion.div
            animate={config.animate ? { rotate: status === 'retrying' ? 360 : 0, scale: [1, 1.1, 1] } : {}}
            transition={status === 'retrying' 
              ? { rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }
              : { scale: { duration: 0.8, repeat: Infinity } }
            }
          >
            <Icon className="w-4 h-4" />
          </motion.div>
          <span className="text-xs font-medium">{config.label}</span>
          {status === 'retrying' && (
            <span className="text-xs opacity-70">
              ({retryCount}/{maxRetries})
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar with animated gradient */}
      {(status === 'thinking' || status === 'generating' || status === 'retrying') && (
        <div className="relative w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]"
            initial={{ width: 0 }}
            animate={{ 
              width: `${Math.min(progress, 95)}%`,
              backgroundPosition: ['0% 0%', '100% 0%'],
            }}
            transition={{ 
              width: { duration: 0.3 },
              backgroundPosition: { duration: 1.5, repeat: Infinity, ease: 'linear' }
            }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {/* Error message */}
      {status === 'error' && errorMessage && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-destructive/80 mt-1"
        >
          {errorMessage}
        </motion.p>
      )}
    </div>
  );
};
