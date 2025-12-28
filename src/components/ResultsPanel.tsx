import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AgentResult {
  agentId: string;
  agentName: string;
  result: string;
}

interface ResultsPanelProps {
  results: AgentResult[];
  isOpen: boolean;
  onClose: () => void;
  mission: string;
}

export const ResultsPanel = ({ results, isOpen, onClose, mission }: ResultsPanelProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl border border-border max-w-4xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-glow-success/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-glow-success" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Mission Complete</h2>
                <p className="text-sm text-muted-foreground line-clamp-1">"{mission}"</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Results */}
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={result.agentId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary/30 rounded-xl p-5 border border-border/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{result.agentName}</h3>
                </div>
                <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {result.result}
                </div>
              </motion.div>
            ))}

            {results.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No results yet. Agents are still working...</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
