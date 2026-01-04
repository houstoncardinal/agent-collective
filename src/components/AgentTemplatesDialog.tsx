import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookTemplate,
  Globe,
  Users,
  User,
  Plus,
  Trash2,
  Copy,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentTemplate } from "@/hooks/useAgentTemplates";
import { getIconComponent } from "@/hooks/useAgents";
import { Team } from "@/hooks/useTeams";

interface AgentTemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templates: AgentTemplate[];
  currentTeam?: Team | null;
  onUseTemplate: (template: AgentTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateTemplate: () => void;
}

export const AgentTemplatesDialog = ({
  isOpen,
  onClose,
  templates,
  currentTeam,
  onUseTemplate,
  onDeleteTemplate,
  onCreateTemplate,
}: AgentTemplatesDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("public");

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "public") return matchesSearch && t.isPublic;
    if (activeTab === "team") return matchesSearch && t.teamId === currentTeam?.id;
    if (activeTab === "personal") return matchesSearch && !t.isPublic && !t.teamId;
    return matchesSearch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-border max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <BookTemplate className="w-5 h-5 text-primary" />
            Agent Templates
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <Button onClick={onCreateTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="public" className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Public
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1.5" disabled={!currentTeam}>
              <Users className="w-3.5 h-3.5" />
              Team
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Personal
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-1">
            <TabsContent value="public" className="mt-0">
              <TemplateGrid
                templates={filteredTemplates}
                onUse={onUseTemplate}
                onDelete={onDeleteTemplate}
                emptyMessage="No public templates yet"
              />
            </TabsContent>
            <TabsContent value="team" className="mt-0">
              {currentTeam ? (
                <TemplateGrid
                  templates={filteredTemplates}
                  onUse={onUseTemplate}
                  onDelete={onDeleteTemplate}
                  emptyMessage={`No templates shared with ${currentTeam.name}`}
                />
              ) : (
                <EmptyState message="Join a team to see team templates" />
              )}
            </TabsContent>
            <TabsContent value="personal" className="mt-0">
              <TemplateGrid
                templates={filteredTemplates}
                onUse={onUseTemplate}
                onDelete={onDeleteTemplate}
                emptyMessage="No personal templates yet"
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface TemplateGridProps {
  templates: AgentTemplate[];
  onUse: (template: AgentTemplate) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
}

const TemplateGrid = ({ templates, onUse, onDelete, emptyMessage }: TemplateGridProps) => {
  if (templates.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid gap-3">
      <AnimatePresence mode="popLayout">
        {templates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={() => onUse(template)}
            onDelete={() => onDelete(template.id)}
            delay={index * 0.05}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface TemplateCardProps {
  template: AgentTemplate;
  onUse: () => void;
  onDelete: () => void;
  delay: number;
}

const TemplateCard = ({ template, onUse, onDelete, delay }: TemplateCardProps) => {
  const IconComponent = getIconComponent(template.icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay }}
      className="group p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
          <IconComponent className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-foreground truncate">{template.name}</h3>
            {template.isPublic && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{template.role}</p>
          {template.description && (
            <p className="text-xs text-muted-foreground/80 line-clamp-2">{template.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {template.useCount} uses
            </span>
            <span>Temp: {template.temperature}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="default" onClick={onUse}>
            <Copy className="w-3.5 h-3.5 mr-1" />
            Use
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <BookTemplate className="w-12 h-12 text-muted-foreground/50 mb-4" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);
