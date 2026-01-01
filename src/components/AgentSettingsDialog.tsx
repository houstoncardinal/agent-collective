import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Thermometer, Hash, FileText, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentSettings } from "@/hooks/useAgents";

interface AgentSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  currentSettings?: AgentSettings;
  defaultPrompt?: string;
  onSave: (settings: Partial<AgentSettings>) => Promise<void>;
}

export const AgentSettingsDialog = ({
  isOpen,
  onClose,
  agentId,
  agentName,
  currentSettings,
  defaultPrompt,
  onSave,
}: AgentSettingsDialogProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(300);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setCustomPrompt(currentSettings.customPrompt || "");
      setTemperature(currentSettings.temperature);
      setMaxTokens(currentSettings.maxTokens);
      setIsEnabled(currentSettings.isEnabled);
    } else {
      setCustomPrompt("");
      setTemperature(0.7);
      setMaxTokens(300);
      setIsEnabled(true);
    }
  }, [currentSettings, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      agentId,
      customPrompt: customPrompt || undefined,
      temperature,
      maxTokens,
      isEnabled,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configure {agentName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Agent Enabled</Label>
              <p className="text-xs text-muted-foreground">
                Include this agent in missions
              </p>
            </div>
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Custom System Prompt
            </Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={defaultPrompt || "Enter a custom prompt to override the default behavior..."}
              className="min-h-[120px] bg-secondary/50 border-border"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the default agent prompt
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
            <p className="text-xs text-muted-foreground">
              50 - 2000 tokens (higher = longer responses)
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
