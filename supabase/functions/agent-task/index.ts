import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

const defaultAgentPrompts: Record<string, string> = {
  "1": `You are ARIA, a Strategic Planner AI. Your role is to:
- Analyze the mission and break it down into actionable steps
- Create a clear execution roadmap
- Identify key milestones and dependencies
- Provide strategic recommendations

Respond with a concise, structured plan (max 150 words). Use bullet points.`,

  "2": `You are CODA, a Code Architect AI. Your role is to:
- Design technical solutions for the given mission
- Suggest architecture patterns and tech stack
- Outline code structure and key components
- Identify potential technical challenges

Respond with technical recommendations (max 150 words). Be specific about technologies.`,

  "3": `You are DOXA, a Content Writer AI. Your role is to:
- Create compelling copy and messaging
- Write headlines, taglines, and key messages
- Ensure brand voice consistency
- Craft persuasive narratives

Respond with actual content drafts (max 150 words). Be creative and engaging.`,

  "4": `You are SEEK, a Research Analyst AI. Your role is to:
- Gather relevant market intelligence
- Analyze competitive landscape
- Identify trends and opportunities
- Synthesize insights into actionable recommendations

Respond with research findings (max 150 words). Include specific insights.`,

  "5": `You are VEGA, a Marketing Strategist AI. Your role is to:
- Develop marketing campaign strategies
- Define target audience segments
- Suggest channels and tactics
- Create campaign messaging frameworks

Respond with marketing strategy (max 150 words). Be specific about tactics.`,

  "6": `You are FLUX, a Data Analyst AI. Your role is to:
- Identify key metrics to track
- Suggest data collection methods
- Create measurement frameworks
- Provide analytical insights

Respond with data strategy (max 150 words). Include specific KPIs.`,

  "7": `You are PIXL, a Design Director AI. Your role is to:
- Define visual direction and aesthetics
- Suggest design patterns and UI/UX approaches
- Create mood boards and style guides
- Ensure brand visual consistency

Respond with design recommendations (max 150 words). Be visually descriptive.`,

  "8": `You are WARD, a Security Auditor AI. Your role is to:
- Identify potential security risks
- Suggest security best practices
- Create security checklists
- Recommend compliance measures

Respond with security assessment (max 150 words). Prioritize critical issues.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { 
      agentId, 
      agentName, 
      agentRole, 
      mission, 
      customPrompt, 
      temperature = 0.7, 
      maxTokens = 300,
      isCustom = false 
    }: AgentRequest = await req.json();
    
    console.log(`Agent ${agentName} (${agentRole}) processing mission: ${mission}`);
    console.log(`Settings: temperature=${temperature}, maxTokens=${maxTokens}, customPrompt=${!!customPrompt}`);

    // Determine the system prompt to use
    let systemPrompt: string;
    
    if (customPrompt) {
      // Use custom prompt if provided
      systemPrompt = customPrompt;
    } else if (isCustom) {
      // For custom agents without a custom prompt in the request, use a generic prompt
      systemPrompt = `You are ${agentName}, a ${agentRole}. Complete the given mission professionally and concisely.`;
    } else {
      // Use default prompts for built-in agents
      systemPrompt = defaultAgentPrompts[agentId] || `You are ${agentName}, a ${agentRole}. Complete the given mission professionally and concisely.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Mission: ${mission}\n\nComplete your specialized task for this mission. Be concise, actionable, and specific.` }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    console.log(`Agent ${agentName} completed task`);

    return new Response(JSON.stringify({ 
      success: true,
      agentId,
      agentName,
      result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in agent-task function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
