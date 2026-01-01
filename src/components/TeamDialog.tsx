import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Team } from "@/hooks/useTeams";
import { Users, Plus, LogIn, Trash2, LogOut, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  currentTeam: Team | null;
  onCreateTeam: (name: string, description?: string) => Promise<{ error: any }>;
  onJoinTeam: (teamId: string) => Promise<{ error: any }>;
  onLeaveTeam: (teamId: string) => Promise<{ error: any }>;
  onDeleteTeam: (teamId: string) => Promise<{ error: any }>;
  onSelectTeam: (team: Team | null) => void;
}

export const TeamDialog = ({
  isOpen,
  onClose,
  teams,
  currentTeam,
  onCreateTeam,
  onJoinTeam,
  onLeaveTeam,
  onDeleteTeam,
  onSelectTeam,
}: TeamDialogProps) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [joinTeamId, setJoinTeamId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setIsCreating(true);
    await onCreateTeam(newTeamName, newTeamDescription || undefined);
    setNewTeamName("");
    setNewTeamDescription("");
    setIsCreating(false);
  };

  const handleJoinTeam = async () => {
    if (!joinTeamId.trim()) return;
    setIsJoining(true);
    await onJoinTeam(joinTeamId);
    setJoinTeamId("");
    setIsJoining(false);
  };

  const copyTeamId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Collaboration
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="teams" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teams">My Teams</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="mt-4">
            {teams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No teams yet. Create or join a team to collaborate!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {/* Personal workspace option */}
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    !currentTeam
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  onClick={() => onSelectTeam(null)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-medium text-sm">Personal Workspace</span>
                      <p className="text-xs text-muted-foreground">Private agents & missions</p>
                    </div>
                  </div>
                  {!currentTeam && <Badge>Active</Badge>}
                </div>

                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentTeam?.id === team.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => onSelectTeam(team)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-sm">{team.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {currentTeam?.id === team.id && <Badge>Active</Badge>}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyTeamId(team.id);
                        }}
                        title="Copy team ID to share"
                      >
                        {copiedId === team.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeaveTeam(team.id);
                        }}
                        title="Leave team"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g., Marketing Team"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="teamDescription">Description (optional)</Label>
              <Textarea
                id="teamDescription"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                placeholder="What does this team work on?"
                className="mt-1"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreateTeam}
              disabled={!newTeamName.trim() || isCreating}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? "Creating..." : "Create Team"}
            </Button>
          </TabsContent>

          <TabsContent value="join" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="teamId">Team ID</Label>
              <Input
                id="teamId"
                value={joinTeamId}
                onChange={(e) => setJoinTeamId(e.target.value)}
                placeholder="Paste the team ID here"
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ask a team member to share their team ID with you.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleJoinTeam}
              disabled={!joinTeamId.trim() || isJoining}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isJoining ? "Joining..." : "Join Team"}
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
