import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Plus, Thermometer, Hash, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomAgentData, availableIcons, getIconComponent } from "@/hooks/useAgents";

interface CreateAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentData: CustomAgentData) => Promise<void>;
  editingAgent?: CustomAgentData;
}

export const CreateAgentDialog = ({
  isOpen,
  onClose,
  onSave,
  editingAgent,
}: CreateAgentDialogProps) => {
  const [name, setName] = useState(editingAgent?.name || "");
  const [role, setRole] = useState(editingAgent?.role || "");
  const [icon, setIcon] = useState(editingAgent?.icon || "Bot");
  const [systemPrompt, setSystemPrompt] = useState(editingAgent?.systemPrompt || "");
  const [temperature, setTemperature] = useState(editingAgent?.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(editingAgent?.maxTokens || 300);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !role.trim() || !systemPrompt.trim()) return;

    setIsSaving(true);
    await onSave({
      id: editingAgent?.id,
      name: name.trim(),
      role: role.trim(),
      icon,
      systemPrompt: systemPrompt.trim(),
      temperature,
      maxTokens,
      isActive: true,
    });
    setIsSaving(false);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setRole("");
    setIcon("Bot");
    setSystemPrompt("");
    setTemperature(0.7);
    setMaxTokens(300);
    onClose();
  };

  const IconComponent = getIconComponent(icon);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            {editingAgent ? "Edit Custom Agent" : "Create Custom Agent"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {name || "Agent Name"}
              </h3>
              <p className="text-sm text-muted-foreground">{role || "Agent Role"}</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-foreground">Agent Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="e.g., NOVA"
              className="bg-secondary/50 border-border font-mono"
              maxLength={8}
            />
            <p className="text-xs text-muted-foreground">Max 8 characters, uppercase</p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-foreground">Role / Title</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., AI Assistant"
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-foreground">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((iconName) => {
                  const Icon = getIconComponent(iconName);
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {iconName}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label className="text-foreground">System Prompt</Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are [NAME], a [ROLE] AI. Your responsibilities include..."
              className="min-h-[120px] bg-secondary/50 border-border"
            />
            <p className="text-xs text-muted-foreground">
              Define the agent's personality, capabilities, and response style
            </p>
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Temperature
              </Label>
              <span className="text-sm font-mono text-primary">{temperature.toFixed(1)}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Focused</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Max Response Length
            </Label>
            <Input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Math.min(2000, Math.max(50, Number(e.target.value))))}
              min={50}
              max={2000}
              className="bg-secondary/50 border-border"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !role.trim() || !systemPrompt.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : editingAgent ? "Update Agent" : "Create Agent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
