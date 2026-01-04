import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookTemplate,
  Globe,
  Users,
  Thermometer,
  Hash,
  Save,
  X,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableIcons, getIconComponent } from "@/hooks/useAgents";
import { AgentTemplate } from "@/hooks/useAgentTemplates";
import { Team } from "@/hooks/useTeams";

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    template: Omit<AgentTemplate, "id" | "createdAt" | "useCount" | "createdBy">,
    teamId?: string | null
  ) => Promise<void>;
  currentTeam?: Team | null;
  editingTemplate?: AgentTemplate;
  prefillFromAgent?: {
    name: string;
    role: string;
    icon: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
  };
}

export const CreateTemplateDialog = ({
  isOpen,
  onClose,
  onSave,
  currentTeam,
  editingTemplate,
  prefillFromAgent,
}: CreateTemplateDialogProps) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [icon, setIcon] = useState("Bot");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(300);
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [shareWithTeam, setShareWithTeam] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name);
      setRole(editingTemplate.role);
      setIcon(editingTemplate.icon);
      setSystemPrompt(editingTemplate.systemPrompt);
      setTemperature(editingTemplate.temperature);
      setMaxTokens(editingTemplate.maxTokens);
      setDescription(editingTemplate.description || "");
      setIsPublic(editingTemplate.isPublic);
      setShareWithTeam(!!editingTemplate.teamId);
    } else if (prefillFromAgent) {
      setName(prefillFromAgent.name);
      setRole(prefillFromAgent.role);
      setIcon(prefillFromAgent.icon);
      setSystemPrompt(prefillFromAgent.systemPrompt);
      setTemperature(prefillFromAgent.temperature);
      setMaxTokens(prefillFromAgent.maxTokens);
    }
  }, [editingTemplate, prefillFromAgent]);

  const handleSave = async () => {
    if (!name.trim() || !role.trim() || !systemPrompt.trim()) return;

    setIsSaving(true);
    await onSave(
      {
        name: name.trim(),
        role: role.trim(),
        icon,
        systemPrompt: systemPrompt.trim(),
        temperature,
        maxTokens,
        description: description.trim() || undefined,
        isPublic,
        teamId: shareWithTeam && currentTeam ? currentTeam.id : null,
      },
      shareWithTeam && currentTeam ? currentTeam.id : null
    );
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
    setDescription("");
    setIsPublic(false);
    setShareWithTeam(false);
    onClose();
  };

  const IconComponent = getIconComponent(icon);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <BookTemplate className="w-5 h-5 text-primary" />
            {editingTemplate ? "Edit Template" : "Create Agent Template"}
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
                {name || "Template Name"}
              </h3>
              <p className="text-sm text-muted-foreground">{role || "Template Role"}</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-foreground">Template Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="e.g., NOVA"
              className="bg-secondary/50 border-border font-mono"
              maxLength={8}
            />
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

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-foreground">Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this template does..."
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
              className="min-h-[100px] bg-secondary/50 border-border"
            />
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

          {/* Sharing Options */}
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Label className="text-foreground">Make Public</Label>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Public templates can be used by anyone
            </p>

            {currentTeam && !isPublic && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-foreground">Share with {currentTeam.name}</Label>
                  </div>
                  <Switch checked={shareWithTeam} onCheckedChange={setShareWithTeam} />
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  Team members can view and use this template
                </p>
              </>
            )}
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
            {isSaving ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
