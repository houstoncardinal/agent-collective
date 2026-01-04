import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Check, FileCode, FileText, FileImage, FileSpreadsheet, FileCheck2, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AgentOutput } from "@/components/ResultsPanel";
import { downloadAsFile, downloadImage, getFileExtension, formatOutputForDownload } from "@/lib/downloadUtils";

interface DownloadButtonProps {
  output: AgentOutput;
  agentName: string;
}

const getIcon = (type: AgentOutput['type']) => {
  switch (type) {
    case 'code':
      return FileCode;
    case 'document':
      return FileText;
    case 'image':
      return FileImage;
    case 'chart':
      return FileSpreadsheet;
    case 'table':
      return Table2;
    case 'checklist':
      return FileCheck2;
    default:
      return FileText;
  }
};

export const DownloadButton = ({ output, agentName }: DownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const sanitizedName = agentName.toLowerCase().replace(/\s+/g, '-');
      const extension = getFileExtension(output.type, output.language);
      const filename = `${sanitizedName}-${output.type}-${Date.now()}.${extension}`;

      if (output.type === 'image' && (output.content.startsWith('data:') || output.content.startsWith('http'))) {
        await downloadImage(output.content, filename);
      } else if (output.type === 'table' && output.tableData) {
        // Download as CSV for tables
        const headers = output.tableData.headers.join(',');
        const rows = output.tableData.rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const csvContent = `${headers}\n${rows}`;
        downloadAsFile(csvContent, filename.replace(`.${extension}`, '.csv'), 'text/csv');
      } else {
        const content = formatOutputForDownload(output);
        const mimeType = output.type === 'code' ? 'text/plain' :
                        output.type === 'document' ? 'text/markdown' :
                        output.type === 'chart' ? 'application/json' :
                        'text/plain';
        downloadAsFile(content, filename, mimeType);
      }

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const Icon = downloaded ? Check : getIcon(output.type);
  
  const typeLabels: Record<AgentOutput['type'], string> = {
    code: 'code file',
    document: 'document',
    image: 'image',
    chart: 'chart data',
    table: 'spreadsheet',
    checklist: 'checklist',
    text: 'text file',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant={downloaded ? "default" : "outline"}
              onClick={handleDownload}
              disabled={isDownloading}
              className={`gap-2 ${downloaded ? "bg-glow-success/20 text-glow-success border-glow-success/40 hover:bg-glow-success/30" : ""}`}
            >
              {isDownloading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Download className="w-4 h-4" />
                </motion.div>
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {downloaded ? "Downloaded" : "Download"}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download {typeLabels[output.type]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
