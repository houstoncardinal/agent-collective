import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Agent } from "@/hooks/useAgents";
import { Badge } from "@/components/ui/badge";

interface AgentSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onConfirm: (selectedAgentIds: string[]) => void;
  mission: string;
}

export const AgentSelectionDialog = ({
  isOpen,
  onClose,
  agents,
  onConfirm,
  mission,
}: AgentSelectionDialogProps) => {
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(
    new Set(agents.map((a) => a.id))
  );

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedAgents(new Set(agents.map((a) => a.id)));
  };

  const selectNone = () => {
    setSelectedAgents(new Set());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedAgents));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Select Agents for Mission</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            "{mission}"
          </p>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={selectNone}>
            Clear All
          </Button>
          <Badge variant="secondary" className="ml-auto">
            {selectedAgents.size} selected
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAgents.has(agent.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
                onClick={() => toggleAgent(agent.id)}
              >
                <Checkbox
                  checked={selectedAgents.has(agent.id)}
                  onCheckedChange={() => toggleAgent(agent.id)}
                />
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{agent.name}</span>
                    {agent.isCustom && (
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{agent.role}</span>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedAgents.size === 0}>
            Run with {selectedAgents.size} Agent{selectedAgents.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
