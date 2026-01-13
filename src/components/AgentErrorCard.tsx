import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentErrorCardProps {
  agentId: string;
  agentName: string;
  errorMessage: string;
  onRetry: (agentId: string) => void;
  onDismiss: (agentId: string) => void;
  isRetrying?: boolean;
}

export const AgentErrorCard = ({
  agentId,
  agentName,
  errorMessage,
  onRetry,
  onDismiss,
  isRetrying = false,
}: AgentErrorCardProps) => {
  const friendlyMessages: Record<string, string> = {
    'AI API error: 503': 'The AI service is temporarily busy. Please retry.',
    'AI API error: 502': 'Connection issue with AI service. Retrying may help.',
    'AI API error: 429': 'Too many requests. Please wait a moment and retry.',
    'Network request failed': 'Network connection lost. Check your internet.',
    'Failed to fetch': 'Unable to connect to the server. Please try again.',
  };

  const getFriendlyMessage = (error: string): string => {
    for (const [key, message] of Object.entries(friendlyMessages)) {
      if (error.includes(key)) return message;
    }
    return 'Something went wrong. Please try again.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="relative overflow-hidden rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4"
    >
      {/* Animated warning glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative flex items-start gap-4">
        <div className="shrink-0">
          <motion.div
            className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle className="w-5 h-5 text-destructive" />
          </motion.div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground mb-1">
            {agentName} encountered an error
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            {getFriendlyMessage(errorMessage)}
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRetry(agentId)}
              disabled={isRetrying}
              className="border-primary/30 hover:border-primary/60 hover:bg-primary/10"
            >
              <motion.div
                animate={isRetrying ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
              </motion.div>
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(agentId)}
              className="text-muted-foreground hover:text-foreground"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>

      {/* Technical details (collapsible) */}
      <details className="mt-3 text-xs">
        <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
          Technical details
        </summary>
        <pre className="mt-2 p-2 bg-background/50 rounded text-destructive/70 overflow-x-auto">
          {errorMessage}
        </pre>
      </details>
    </motion.div>
  );
};
