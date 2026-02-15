import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Send, Sparkles, Command } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandInputProps {
  onSubmit: (command: string) => void;
  isProcessing: boolean;
}

const exampleMissions = [
  "Build a marketing campaign for a SaaS product launch",
  "Analyze competitors in the fintech space",
  "Create a full-stack app architecture for an e-commerce platform",
  "Design a security audit plan for a healthcare application",
];

export const CommandInput = ({ onSubmit, isProcessing }: CommandInputProps) => {
  const [command, setCommand] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isProcessing) {
      onSubmit(command);
      setCommand("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* Outer glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 blur-md transition-opacity duration-500" />
          
          {/* Input container */}
          <div className="relative glass-strong rounded-2xl p-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
                <Command className="w-5 h-5 text-primary" />
              </div>
              
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Describe your mission..."
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 text-lg py-4 font-sans"
                disabled={isProcessing}
              />
              
              <Button
                type="submit"
                variant="command"
                size="lg"
                disabled={!command.trim() || isProcessing}
                className="relative overflow-hidden"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Deploy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Example missions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-xs text-muted-foreground/50">Try:</span>
          {exampleMissions.slice(0, 2).map((example, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCommand(example)}
              className="text-xs text-muted-foreground/60 hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/5 truncate max-w-[200px]"
              disabled={isProcessing}
            >
              "{example}"
            </button>
          ))}
        </div>
      </form>
    </motion.div>
  );
};
