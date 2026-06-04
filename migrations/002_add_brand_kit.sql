-- Add brand kit and brief columns to project_data for new direct-flow app
ALTER TABLE project_data ADD COLUMN brand_kit TEXT;
ALTER TABLE project_data ADD COLUMN brief TEXT;
ALTER TABLE project_data ADD COLUMN mood_id TEXT;
