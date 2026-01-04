import { AgentOutput } from "@/components/ResultsPanel";

export const downloadAsFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadImage = async (src: string, filename: string) => {
  try {
    if (src.startsWith('data:')) {
      // Base64 data URL
      const a = document.createElement("a");
      a.href = src;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Regular URL - fetch and download
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Failed to download image:", error);
  }
};

export const getFileExtension = (type: AgentOutput['type'], language?: string): string => {
  switch (type) {
    case 'code':
      return language === 'typescript' ? 'ts' : 
             language === 'javascript' ? 'js' :
             language === 'python' ? 'py' :
             language === 'html' ? 'html' :
             language === 'css' ? 'css' :
             language === 'json' ? 'json' :
             'txt';
    case 'document':
      return 'md';
    case 'chart':
    case 'table':
      return 'json';
    case 'checklist':
      return 'md';
    case 'image':
      return 'png';
    default:
      return 'txt';
  }
};

export const formatOutputForDownload = (output: AgentOutput): string => {
  switch (output.type) {
    case 'code':
      return output.content;
    case 'document':
      return output.content;
    case 'chart':
      if (output.chartData) {
        return JSON.stringify({
          title: output.title,
          data: output.chartData,
          summary: output.content
        }, null, 2);
      }
      return output.content;
    case 'table':
      if (output.tableData) {
        // Convert to CSV format
        const headers = output.tableData.headers.join(',');
        const rows = output.tableData.rows.map(row => row.join(',')).join('\n');
        return `${headers}\n${rows}`;
      }
      return output.content;
    case 'checklist':
      if (output.checklistItems) {
        return output.checklistItems.map((item, i) => 
          `- [${item.priority.toUpperCase()}] ${item.item}`
        ).join('\n');
      }
      return output.content;
    default:
      return output.content;
  }
};
