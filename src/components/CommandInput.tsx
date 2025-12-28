import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandInputProps {
  onSubmit: (command: string) => void;
  isProcessing: boolean;
}

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
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-500" />
          
          {/* Input container */}
          <div className="relative glass rounded-2xl p-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Describe your mission... e.g., 'Build a marketing campaign for a new product launch'"
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg py-4 font-sans"
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
        
        {/* Hint text */}
        <p className="text-center text-muted-foreground text-sm mt-4">
          Press Enter to deploy your AI workforce • Be specific for best results
        </p>
      </form>
    </motion.div>
  );
};
