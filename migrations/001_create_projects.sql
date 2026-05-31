CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  preset_name TEXT,
  custom_description TEXT,
  created_at TEXT,
  updated_at TEXT,
  user_session_id TEXT
);

CREATE TABLE IF NOT EXISTS project_data (
  project_id TEXT PRIMARY KEY,
  inspiration_url TEXT,
  inspiration_analysis TEXT,
  palette_colors TEXT,
  sections TEXT,
  generated_html TEXT,
  metadata TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_projects_session ON projects(user_session_id);
