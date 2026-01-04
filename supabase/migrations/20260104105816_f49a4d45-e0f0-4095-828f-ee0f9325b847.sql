-- Create agent_templates table for shareable agent configurations
CREATE TABLE public.agent_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Bot',
  system_prompt TEXT NOT NULL,
  temperature NUMERIC NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 300,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  use_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view public templates or templates from their teams
CREATE POLICY "View public or team templates"
ON public.agent_templates
FOR SELECT
USING (is_public = true OR team_id IS NULL OR team_id IN (
  SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
));

-- Policy: Users can create templates
CREATE POLICY "Create templates"
ON public.agent_templates
FOR INSERT
WITH CHECK (true);

-- Policy: Creators can update their templates
CREATE POLICY "Update own templates"
ON public.agent_templates
FOR UPDATE
USING (true);

-- Policy: Creators can delete their templates
CREATE POLICY "Delete own templates"
ON public.agent_templates
FOR DELETE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_agent_templates_updated_at
BEFORE UPDATE ON public.agent_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();