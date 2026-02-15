import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRequest {
  agentId: string;
  agentName: string;
  agentRole: string;
  mission: string;
  customPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  isCustom?: boolean;
}

interface AgentOutput {
  type: 'text' | 'code' | 'image' | 'chart' | 'document' | 'checklist' | 'table';
  title: string;
  content: string;
  language?: string; // for code
  chartData?: { label: string; value: number; color?: string }[]; // for charts
  tableData?: { headers: string[]; rows: string[][] }; // for tables
  checklistItems?: { item: string; priority: 'high' | 'medium' | 'low' }[]; // for checklists
}

// Define agent output types based on their role
const agentOutputConfig: Record<string, { outputType: AgentOutput['type']; generateImage?: boolean }> = {
  "1": { outputType: 'checklist' }, // ARIA - Strategic Planner -> Checklists
  "2": { outputType: 'code' }, // CODA - Code Architect -> Code
  "3": { outputType: 'document' }, // DOXA - Content Writer -> Documents
  "4": { outputType: 'table' }, // SEEK - Research Analyst -> Tables
  "5": { outputType: 'chart' }, // VEGA - Marketing Strategist -> Charts
  "6": { outputType: 'chart' }, // FLUX - Data Analyst -> Charts
  "7": { outputType: 'image', generateImage: true }, // PIXL - Design Director -> Images
  "8": { outputType: 'checklist' }, // WARD - Security Auditor -> Checklists
};

const defaultAgentPrompts: Record<string, string> = {
  "1": `You are ARIA, a Strategic Planner AI. Analyze the mission and create a structured action plan.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Strategic Action Plan",
  "checklistItems": [
    { "item": "First priority task description", "priority": "high" },
    { "item": "Second task description", "priority": "medium" },
    { "item": "Third task description", "priority": "low" }
  ],
  "summary": "Brief 2-sentence executive summary"
}

Include 5-8 actionable items with appropriate priority levels.`,

  "2": `You are CODA, a Code Architect AI. Design technical solutions with actual code examples.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Technical Implementation",
  "language": "typescript",
  "code": "// Your actual code implementation here\\nconst example = () => {\\n  // implementation\\n};",
  "explanation": "Brief explanation of the code architecture and key decisions"
}

Provide real, runnable code that addresses the mission. Use TypeScript/React when applicable.`,

  "3": `You are DOXA, a Content Writer AI. Create compelling marketing copy and content.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Content Package",
  "headline": "Main attention-grabbing headline",
  "subheadline": "Supporting subtitle or tagline",
  "bodyCopy": "Main content body with compelling narrative (2-3 paragraphs)",
  "callToAction": "Clear CTA text",
  "additionalAssets": ["Social post 1", "Email subject line", "Meta description"]
}

Be creative, persuasive, and on-brand.`,

  "4": `You are SEEK, a Research Analyst AI. Provide comprehensive research insights.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Research Analysis Report",
  "tableData": {
    "headers": ["Category", "Finding", "Impact", "Recommendation"],
    "rows": [
      ["Market Size", "$X billion", "High", "Focus on segment A"],
      ["Competitors", "3 major players", "Medium", "Differentiate on feature X"]
    ]
  },
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "conclusion": "Brief conclusion with actionable recommendations"
}

Include 4-6 research findings in the table.`,

  "5": `You are VEGA, a Marketing Strategist AI. Develop data-driven marketing strategies.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Marketing Performance Metrics",
  "chartData": [
    { "label": "Social Media", "value": 35, "color": "#00d4ff" },
    { "label": "Email", "value": 25, "color": "#a855f7" },
    { "label": "SEO", "value": 20, "color": "#22c55e" },
    { "label": "Paid Ads", "value": 15, "color": "#f59e0b" },
    { "label": "Other", "value": 5, "color": "#ef4444" }
  ],
  "strategy": "Brief marketing strategy explanation",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Provide realistic percentages that add up to 100.`,

  "6": `You are FLUX, a Data Analyst AI. Provide analytical insights with metrics.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Analytics Dashboard",
  "chartData": [
    { "label": "Q1", "value": 45000, "color": "#00d4ff" },
    { "label": "Q2", "value": 52000, "color": "#a855f7" },
    { "label": "Q3", "value": 61000, "color": "#22c55e" },
    { "label": "Q4", "value": 78000, "color": "#f59e0b" }
  ],
  "kpis": [
    { "metric": "Conversion Rate", "value": "3.2%", "trend": "up" },
    { "metric": "Avg Order Value", "value": "$127", "trend": "up" }
  ],
  "analysis": "Brief analysis of the data trends"
}

Use realistic numbers relevant to the mission.`,

  "7": `You are PIXL, a Design Director AI. Create visual design concepts.

Describe a stunning visual design concept for this mission. Include:
- Color palette (hex codes)
- Typography recommendations
- Layout structure
- Key visual elements
- Mood/aesthetic direction

Be vivid and specific in your visual descriptions. This will be used to generate an actual image.`,

  "8": `You are WARD, a Security Auditor AI. Conduct security assessments.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Security Assessment Report",
  "riskLevel": "medium",
  "checklistItems": [
    { "item": "Critical: Implement input validation", "priority": "high" },
    { "item": "Important: Add rate limiting", "priority": "high" },
    { "item": "Recommended: Enable 2FA", "priority": "medium" }
  ],
  "vulnerabilities": ["Vulnerability 1 description", "Vulnerability 2 description"],
  "recommendations": "Summary of security hardening steps"
}

Prioritize items by severity (high/medium/low).`,
};

async function generateImage(prompt: string, retries = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [
            { 
              role: 'user', 
              content: `Create a professional, modern design mockup or concept visualization: ${prompt}. 
              Style: Clean, minimalist, professional, high-quality digital art, UI/UX design aesthetic.` 
            }
          ],
          modalities: ['image', 'text'],
        }),
      });

      if (response.status === 503 || response.status === 502 || response.status === 429) {
        console.log(`Image API returned ${response.status}, attempt ${attempt}/${retries}`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }

      if (!response.ok) {
        console.error('Image generation failed:', response.status);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        return null;
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      return imageUrl || null;
    } catch (error) {
      console.error(`Image generation attempt ${attempt} failed:`, error);
      if (attempt === retries) return null;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
}

async function generateTextResponse(systemPrompt: string, mission: string, temperature: number, maxTokens: number, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Mission: ${mission}\n\nComplete your specialized task. Respond ONLY with the JSON format specified in your instructions.` }
          ],
          max_tokens: maxTokens,
          temperature: temperature,
        }),
      });

      if (response.status === 503 || response.status === 502 || response.status === 429) {
        console.log(`AI API returned ${response.status}, attempt ${attempt}/${retries}`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          continue;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI error:', response.status, errorText);
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error('Max retries exceeded');
}

function parseAgentResponse(rawResponse: string, agentId: string, config: { outputType: AgentOutput['type'] }): AgentOutput {
  // Try to extract JSON from the response
  let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
  let parsed: any = null;
  
  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.log('Failed to parse JSON, using raw response');
    }
  }

  const output: AgentOutput = {
    type: config.outputType,
    title: parsed?.title || 'Agent Report',
    content: '',
  };

  switch (config.outputType) {
    case 'code':
      output.language = parsed?.language || 'typescript';
      output.content = parsed?.code || rawResponse;
      if (parsed?.explanation) {
        output.content = `${parsed.code}\n\n/* Explanation:\n${parsed.explanation}\n*/`;
      }
      break;

    case 'chart':
      output.chartData = parsed?.chartData || [
        { label: 'Category A', value: 30, color: '#00d4ff' },
        { label: 'Category B', value: 45, color: '#a855f7' },
        { label: 'Category C', value: 25, color: '#22c55e' },
      ];
      output.content = parsed?.strategy || parsed?.analysis || rawResponse;
      break;

    case 'table':
      output.tableData = parsed?.tableData || {
        headers: ['Finding', 'Details'],
        rows: [['Analysis', rawResponse.substring(0, 200)]]
      };
      output.content = parsed?.conclusion || (parsed?.keyInsights?.join('\n\n') || '');
      break;

    case 'checklist':
      output.checklistItems = parsed?.checklistItems || [
        { item: rawResponse.substring(0, 100), priority: 'medium' as const }
      ];
      output.content = parsed?.summary || parsed?.recommendations || '';
      break;

    case 'document':
      if (parsed) {
        output.content = `# ${parsed.headline || 'Content'}\n\n`;
        if (parsed.subheadline) output.content += `## ${parsed.subheadline}\n\n`;
        if (parsed.bodyCopy) output.content += `${parsed.bodyCopy}\n\n`;
        if (parsed.callToAction) output.content += `**${parsed.callToAction}**\n\n`;
        if (parsed.additionalAssets) {
          output.content += `---\n### Additional Assets:\n`;
          parsed.additionalAssets.forEach((asset: string, i: number) => {
            output.content += `${i + 1}. ${asset}\n`;
          });
        }
      } else {
        output.content = rawResponse;
      }
      break;

    default:
      output.content = rawResponse;
  }

  return output;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is missing');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Backend configuration error. Please try again later.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      agentId, 
      agentName, 
      agentRole, 
      mission, 
      customPrompt, 
      temperature = 0.7, 
      maxTokens = 800,
      isCustom = false 
    }: AgentRequest = await req.json();
    
    console.log(`Agent ${agentName} (${agentRole}) processing mission: ${mission}`);

    // Get agent configuration
    const config = agentOutputConfig[agentId] || { outputType: 'text' as const };
    
    // Determine system prompt
    let systemPrompt: string;
    if (customPrompt) {
      systemPrompt = customPrompt;
    } else if (isCustom) {
      systemPrompt = `You are ${agentName}, a ${agentRole}. Complete the given mission professionally. Respond with detailed, actionable insights.`;
    } else {
      systemPrompt = defaultAgentPrompts[agentId] || `You are ${agentName}, a ${agentRole}. Complete the given mission professionally.`;
    }

    // Generate text response
    const rawResponse = await generateTextResponse(systemPrompt, mission, temperature, maxTokens);
    
    // Parse into structured output
    const output = parseAgentResponse(rawResponse, agentId, config);

    // If this is a design agent, also generate an image
    if (config.generateImage) {
      console.log('Generating image for design agent...');
      const imageUrl = await generateImage(`${mission}. ${rawResponse}`);
      if (imageUrl) {
        output.type = 'image';
        output.content = imageUrl;
      }
    }

    console.log(`Agent ${agentName} completed task with output type: ${output.type}`);

    return new Response(JSON.stringify({ 
      success: true,
      agentId,
      agentName,
      output,
      result: output.content // Keep for backward compatibility
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in agent-task function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Surface rate limit and payment errors clearly
    let statusCode = 500;
    let userMessage = errorMessage;
    if (errorMessage.includes('429')) {
      statusCode = 429;
      userMessage = 'Rate limit exceeded. Please wait a moment and retry.';
    } else if (errorMessage.includes('402')) {
      statusCode = 402;
      userMessage = 'AI credits exhausted. Please add credits to continue.';
    } else if (errorMessage.includes('503') || errorMessage.includes('502')) {
      userMessage = 'AI service temporarily unavailable. Retry in a few seconds.';
    }
    
    return new Response(JSON.stringify({ 
      success: false,
      error: userMessage 
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
