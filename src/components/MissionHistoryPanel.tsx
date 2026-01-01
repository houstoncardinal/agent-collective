import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  X,
  ChevronRight,
  Play,
  Trash2,
  FileText,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mission } from "@/hooks/useMissions";
import { downloadMarkdown, exportToPDF } from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MissionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  onRerun: (mission: Mission) => void;
  onDelete: (missionId: string) => void;
  onView: (mission: Mission) => void;
}

export const MissionHistoryPanel = ({
  isOpen,
  onClose,
  missions,
  onRerun,
  onDelete,
  onView,
}: MissionHistoryPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleExport = (mission: Mission, format: "pdf" | "markdown") => {
    const exportData = {
      mission: mission.missionText,
      results: mission.results,
      completedAt: mission.completedAt || mission.createdAt,
    };

    if (format === "pdf") {
      exportToPDF(exportData);
    } else {
      downloadMarkdown(exportData);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full max-w-md z-50 glass border-l border-border"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Mission History
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {missions.length} completed missions
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mission List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {missions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No missions yet</p>
                    <p className="text-xs mt-1">
                      Complete a mission to see it here
                    </p>
                  </div>
                ) : (
                  missions.map((mission) => (
                    <motion.div
                      key={mission.id}
                      layout
                      className="bg-secondary/30 rounded-xl border border-border/50 overflow-hidden"
                    >
                      {/* Mission Header */}
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === mission.id ? null : mission.id)
                        }
                        className="w-full p-4 text-left hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <motion.div
                            animate={{
                              rotate: expandedId === mission.id ? 90 : 0,
                            }}
                          >
                            <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium line-clamp-2">
                              {mission.missionText}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(mission.createdAt)}
                              <span className="text-primary">
                                • {mission.results.length} agents
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Expanded Actions */}
                      <AnimatePresence>
                        {expandedId === mission.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border/50 bg-secondary/20"
                          >
                            <div className="p-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onView(mission)}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View Results
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onRerun(mission)}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Re-run
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => handleExport(mission, "pdf")}
                                  >
                                    Export as PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleExport(mission, "markdown")}
                                  >
                                    Export as Markdown
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => onDelete(mission.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
