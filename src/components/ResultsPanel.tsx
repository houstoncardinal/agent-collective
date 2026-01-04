import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  Download,
  FileText,
  FileJson,
  Code,
  BarChart3,
  Image,
  FileCheck,
  Table2,
  FileType,
  Sparkles,
  Zap,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadMarkdown, exportToPDF } from "@/lib/exportUtils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DownloadButton } from "@/components/DownloadButton";
import { AgentAvatar } from "@/components/AgentAvatar";
import { getIconComponent } from "@/hooks/useAgents";

export interface AgentOutput {
  type: 'text' | 'code' | 'image' | 'chart' | 'document' | 'checklist' | 'table';
  title: string;
  content: string;
  language?: string;
  chartData?: { label: string; value: number; color?: string }[];
  tableData?: { headers: string[]; rows: string[][] };
  checklistItems?: { item: string; priority: 'high' | 'medium' | 'low' }[];
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  result: string;
  output?: AgentOutput;
}

interface ResultsPanelProps {
  results: AgentResult[];
  isOpen: boolean;
  onClose: () => void;
  mission: string;
  onSave?: () => void;
  isSaved?: boolean;
}

const OutputTypeIcon = ({ type }: { type: AgentOutput['type'] }) => {
  const icons = {
    text: FileType,
    code: Code,
    image: Image,
    chart: BarChart3,
    document: FileText,
    checklist: FileCheck,
    table: Table2,
  };
  const Icon = icons[type] || FileType;
  return <Icon className="w-4 h-4" />;
};

const OutputTypeBadge = ({ type }: { type: AgentOutput['type'] }) => {
  const labels = {
    text: 'Report',
    code: 'Code',
    image: 'Visual',
    chart: 'Analytics',
    document: 'Content',
    checklist: 'Action Plan',
    table: 'Research',
  };
  const colors = {
    text: 'bg-muted text-muted-foreground',
    code: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    image: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    chart: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    document: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    checklist: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    table: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <Badge variant="outline" className={`${colors[type]} text-xs font-medium`}>
      <OutputTypeIcon type={type} />
      <span className="ml-1.5">{labels[type]}</span>
    </Badge>
  );
};

const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge variant="secondary" className="text-xs">{language || 'code'}</Badge>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-glow-success" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </div>
      <pre className="bg-background/80 rounded-xl p-4 overflow-x-auto border border-border/50 text-sm font-mono leading-relaxed">
        <code className="text-emerald-400">{code}</code>
      </pre>
    </div>
  );
};

const ChartVisualization = ({ data, title }: { data: { label: string; value: number; color?: string }[]; title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const sharePercentage = ((item.value / total) * 100).toFixed(1);
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{sharePercentage}%</span>
                  <span className="font-mono text-foreground">{item.value.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                  className="h-full rounded-full relative overflow-hidden"
                  style={{ backgroundColor: item.color || 'hsl(var(--primary))' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Mini pie chart visualization */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/30">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.reduce((acc, item, index) => {
              const percentage = (item.value / total) * 100;
              const previousPercentages = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0);
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -previousPercentages;
              
              acc.push(
                <circle
                  key={item.label}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={item.color || 'hsl(var(--primary))'}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                  style={{ strokeLinecap: 'round' }}
                />
              );
              return acc;
            }, [] as JSX.Element[])}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">{data.length}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || 'hsl(var(--primary))' }} />
              <span className="text-muted-foreground truncate max-w-[80px]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TableVisualization = ({ data }: { data: { headers: string[]; rows: string[][] } }) => (
  <div className="overflow-x-auto rounded-xl border border-border/50">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-secondary/50 border-b border-border/50">
          {data.headers.map((header, i) => (
            <th key={i} className="px-4 py-3 text-left font-medium text-foreground">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <motion.tr
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
          >
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-muted-foreground">{cell}</td>
            ))}
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ChecklistVisualization = ({ items }: { items: { item: string; priority: 'high' | 'medium' | 'low' }[] }) => {
  const priorityStyles = {
    high: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', icon: AlertTriangle },
    medium: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', icon: Minus },
    low: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: ChevronRight },
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const style = priorityStyles[item.priority];
        const PriorityIcon = style.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`flex items-start gap-3 p-3 rounded-xl ${style.bg} border ${style.border}`}
          >
            <div className={`mt-0.5 ${style.text}`}>
              <PriorityIcon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground leading-relaxed">{item.item}</p>
            </div>
            <Badge variant="outline" className={`${style.text} text-xs uppercase shrink-0`}>
              {item.priority}
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
};

const ImageVisualization = ({ src, title }: { src: string; title: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative rounded-xl overflow-hidden border border-border/50 bg-secondary/30"
  >
    <img
      src={src}
      alt={title}
      className="w-full h-auto max-h-[400px] object-contain"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm text-foreground font-medium">AI Generated Design Concept</span>
      </div>
    </div>
  </motion.div>
);

const DocumentVisualization = ({ content }: { content: string }) => (
  <div className="prose prose-invert prose-sm max-w-none">
    <div className="bg-secondary/30 rounded-xl p-6 border border-border/50 space-y-4">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('# ')) {
          return <h2 key={i} className="text-xl font-display font-bold text-foreground mb-2">{line.slice(2)}</h2>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-lg font-display font-semibold text-primary mt-4 mb-2">{line.slice(3)}</h3>;
        }
        if (line.startsWith('### ')) {
          return <h4 key={i} className="text-base font-semibold text-muted-foreground mt-3 mb-2">{line.slice(4)}</h4>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-primary font-semibold text-lg my-4">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('---')) {
          return <hr key={i} className="border-border/50 my-4" />;
        }
        if (line.match(/^\d+\./)) {
          return <p key={i} className="text-muted-foreground ml-4 flex gap-2"><span className="text-primary">{line.split('.')[0]}.</span>{line.split('.').slice(1).join('.')}</p>;
        }
        if (line.trim()) {
          return <p key={i} className="text-foreground/90 leading-relaxed">{line}</p>;
        }
        return null;
      })}
    </div>
  </div>
);

const RenderAgentOutput = ({ output, result }: { output?: AgentOutput; result: string }) => {
  if (!output) {
    return <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{result}</div>;
  }

  switch (output.type) {
    case 'code':
      return <CodeBlock code={output.content} language={output.language} />;
    case 'chart':
      return output.chartData ? <ChartVisualization data={output.chartData} title={output.title} /> : null;
    case 'table':
      return output.tableData ? <TableVisualization data={output.tableData} /> : null;
    case 'checklist':
      return output.checklistItems ? <ChecklistVisualization items={output.checklistItems} /> : null;
    case 'image':
      return output.content.startsWith('data:') || output.content.startsWith('http') 
        ? <ImageVisualization src={output.content} title={output.title} />
        : <div className="text-sm text-foreground/90 whitespace-pre-wrap">{output.content}</div>;
    case 'document':
      return <DocumentVisualization content={output.content} />;
    default:
      return <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{output.content || result}</div>;
  }
};

export const ResultsPanel = ({
  results,
  isOpen,
  onClose,
  mission,
  onSave,
  isSaved,
}: ResultsPanelProps) => {
  if (!isOpen) return null;

  const handleExport = (format: "pdf" | "markdown") => {
    const exportData = {
      mission,
      results,
      completedAt: new Date(),
    };

    if (format === "pdf") {
      exportToPDF(exportData);
    } else {
      downloadMarkdown(exportData);
    }
  };

  const outputTypes = results.filter(r => r.output).map(r => r.output!.type);
  const uniqueTypes = [...new Set(outputTypes)];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative rounded-3xl border border-border/50 max-w-5xl w-full max-h-[90vh] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)',
            boxShadow: '0 0 100px hsl(var(--primary) / 0.15), 0 0 40px hsl(var(--primary) / 0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          </div>

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-border/30 bg-gradient-to-r from-secondary/50 to-transparent">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="relative"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-glow-success/30 to-emerald-600/20 flex items-center justify-center border border-glow-success/40">
                  <CheckCircle className="w-7 h-7 text-glow-success" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-glow-success animate-ping" />
              </motion.div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  Mission Complete
                  <Zap className="w-5 h-5 text-primary" />
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">"{mission}"</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {uniqueTypes.length > 0 && (
                <div className="hidden sm:flex items-center gap-2">
                  {uniqueTypes.slice(0, 3).map(type => (
                    <OutputTypeBadge key={type} type={type} />
                  ))}
                  {uniqueTypes.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{uniqueTypes.length - 3}</Badge>
                  )}
                </div>
              )}
              {onSave && !isSaved && (
                <Button variant="outline" size="sm" onClick={onSave} className="border-primary/30 hover:border-primary/60">
                  <FileText className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
              {isSaved && (
                <Badge variant="outline" className="text-glow-success border-glow-success/40">
                  <Check className="w-3 h-3 mr-1" />
                  Saved
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("markdown")}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Export as Markdown
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="relative p-6 overflow-y-auto max-h-[70vh]">
            <div className="grid gap-6">
              {results.map((result, index) => (
                <motion.div
                  key={result.agentId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", damping: 20 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-secondary/40 rounded-2xl p-6 border border-border/40 hover:border-primary/30 transition-colors">
                    {/* Agent Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <AgentAvatar
                          name={result.agentName}
                          icon={getIconComponent(result.agentName.slice(0, 4))}
                          status="completed"
                          size="md"
                          showPulse={false}
                        />
                        <div>
                          <h3 className="font-display font-bold text-foreground text-lg">{result.agentName}</h3>
                          <p className="text-sm text-muted-foreground">Deliverable Ready</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {result.output && <OutputTypeBadge type={result.output.type} />}
                        {result.output && <DownloadButton output={result.output} agentName={result.agentName} />}
                      </div>
                    </div>

                    {/* Output Title */}
                    {result.output?.title && (
                      <h4 className="font-display text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {result.output.title}
                      </h4>
                    )}

                    {/* Rendered Output */}
                    <RenderAgentOutput output={result.output} result={result.result} />

                    {/* Additional content for charts/tables */}
                    {result.output?.content && result.output.type === 'chart' && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <p className="text-sm text-muted-foreground">{result.output.content}</p>
                      </div>
                    )}
                    {result.output?.content && result.output.type === 'table' && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <h5 className="text-sm font-semibold text-foreground mb-2">Key Insights</h5>
                        <p className="text-sm text-muted-foreground">{result.output.content}</p>
                      </div>
                    )}
                    {result.output?.content && result.output.type === 'checklist' && result.output.content && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <p className="text-sm text-muted-foreground">{result.output.content}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {results.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-muted-foreground animate-pulse" />
                  </div>
                  <p className="text-muted-foreground">Agents are still working on deliverables...</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="relative border-t border-border/30 p-4 bg-secondary/20">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-glow-success" />
                  {results.length} deliverables
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {uniqueTypes.length} asset types
                </span>
              </div>
              <span className="text-xs">Powered by AI Agent Workforce</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
