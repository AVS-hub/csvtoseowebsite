-- Create Tables

CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    last_login BIGINT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255)
);

CREATE TABLE projects (
    project_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    default_language VARCHAR(10) NOT NULL DEFAULT 'en',
    default_region VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE pages (
    page_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    url_slug VARCHAR(255) NOT NULL,
    content TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    is_pillar_page BOOLEAN NOT NULL DEFAULT FALSE,
    parent_page_id VARCHAR(255),
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (parent_page_id) REFERENCES pages(page_id)
);

CREATE TABLE seo_metadata (
    metadata_id VARCHAR(255) PRIMARY KEY,
    page_id VARCHAR(255) NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    focus_keyword VARCHAR(255),
    secondary_keywords TEXT,
    og_title VARCHAR(255),
    og_description TEXT,
    og_image_url VARCHAR(255),
    FOREIGN KEY (page_id) REFERENCES pages(page_id)
);

CREATE TABLE images (
    image_id VARCHAR(255) PRIMARY KEY,
    page_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    FOREIGN KEY (page_id) REFERENCES pages(page_id)
);

CREATE TABLE navigation_menus (
    menu_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    structure JSON NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE user_preferences (
    preference_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE feedback (
    feedback_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    project_id VARCHAR(255),
    feedback_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE analytics_data (
    analytics_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    page_id VARCHAR(255),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    recorded_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (page_id) REFERENCES pages(page_id)
);

CREATE TABLE csv_uploads (
    upload_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE ai_content_generations (
    generation_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    page_id VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    generated_content TEXT,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (page_id) REFERENCES pages(page_id)
);

CREATE TABLE seo_reports (
    report_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    generated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    overall_score NUMERIC,
    detailed_results JSON,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    expires_at BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE project_collaborators (
    collaborator_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    invited_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    accepted_at BIGINT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE project_versions (
    version_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    version_number INTEGER NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    created_by VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE page_revisions (
    revision_id VARCHAR(255) PRIMARY KEY,
    page_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    created_by VARCHAR(255) NOT NULL,
    FOREIGN KEY (page_id) REFERENCES pages(page_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE design_templates (
    template_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    css_content TEXT NOT NULL,
    html_structure TEXT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT
);

CREATE TABLE project_template_assignments (
    assignment_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    template_id VARCHAR(255) NOT NULL,
    assigned_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (template_id) REFERENCES design_templates(template_id)
);

CREATE TABLE custom_domains (
    domain_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    domain_name VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    verified_at BIGINT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE deployment_logs (
    log_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    deployment_status VARCHAR(50) NOT NULL,
    deployment_details TEXT,
    started_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    completed_at BIGINT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE user_notifications (
    notification_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    read_at BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE api_keys (
    key_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    last_used BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create Indexes

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_pages_project_id ON pages(project_id);
CREATE INDEX idx_pages_url_slug ON pages(url_slug);
CREATE INDEX idx_seo_metadata_page_id ON seo_metadata(page_id);
CREATE INDEX idx_images_page_id ON images(page_id);
CREATE INDEX idx_navigation_menus_project_id ON navigation_menus(project_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_project_id ON feedback(project_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_analytics_data_project_id ON analytics_data(project_id);
CREATE INDEX idx_analytics_data_page_id ON analytics_data(page_id);
CREATE INDEX idx_analytics_data_recorded_at ON analytics_data(recorded_at);

-- Seed Data

INSERT INTO users (user_id, email, password_hash, first_name, last_name, is_verified)
VALUES
('usr_001', 'john@example.com', 'hashed_password_1', 'John', 'Doe', TRUE),
('usr_002', 'jane@example.com', 'hashed_password_2', 'Jane', 'Smith', TRUE),
('usr_003', 'bob@example.com', 'hashed_password_3', 'Bob', 'Johnson', FALSE);

INSERT INTO projects (project_id, user_id, name, description, status)
VALUES
('prj_001', 'usr_001', 'John''s Blog', 'A personal blog about tech', 'active'),
('prj_002', 'usr_002', 'Jane''s Portfolio', 'Showcase of design work', 'draft'),
('prj_003', 'usr_003', 'Bob''s Store', 'E-commerce site for gadgets', 'active');

INSERT INTO pages (page_id, project_id, title, url_slug, content, is_pillar_page)
VALUES
('pg_001', 'prj_001', 'Welcome to My Blog', 'welcome', 'Welcome to my tech blog!', TRUE),
('pg_002', 'prj_001', 'About Me', 'about', 'I am a tech enthusiast...', FALSE),
('pg_003', 'prj_002', 'My Work', 'portfolio', 'Check out my latest designs...', TRUE),
('pg_004', 'prj_003', 'Product Catalog', 'products', 'Browse our wide range of gadgets...', TRUE);

INSERT INTO seo_metadata (metadata_id, page_id, meta_title, meta_description, focus_keyword)
VALUES
('seo_001', 'pg_001', 'Welcome to John''s Tech Blog', 'Explore the latest in tech news and reviews', 'tech blog'),
('seo_002', 'pg_003', 'Jane Smith - UX Designer Portfolio', 'Innovative UX design solutions for web and mobile', 'UX design portfolio'),
('seo_003', 'pg_004', 'Bob''s Gadget Store - Latest Tech Products', 'Find the best deals on cutting-edge technology', 'tech gadgets store');

INSERT INTO images (image_id, page_id, file_name, file_path, alt_text)
VALUES
('img_001', 'pg_001', 'blog-header.jpg', '/uploads/blog-header.jpg', 'Tech blog header image'),
('img_002', 'pg_003', 'portfolio-showcase.png', '/uploads/portfolio-showcase.png', 'Design portfolio showcase'),
('img_003', 'pg_004', 'product-catalog.jpg', '/uploads/product-catalog.jpg', 'Gadget store product catalog');

INSERT INTO navigation_menus (menu_id, project_id, name, structure)
VALUES
('menu_001', 'prj_001', 'Main Menu', '{"items": [{"label": "Home", "url": "/"}, {"label": "About", "url": "/about"}]}'),
('menu_002', 'prj_002', 'Portfolio Menu', '{"items": [{"label": "Work", "url": "/portfolio"}, {"label": "Contact", "url": "/contact"}]}'),
('menu_003', 'prj_003', 'Store Menu', '{"items": [{"label": "Products", "url": "/products"}, {"label": "Cart", "url": "/cart"}]}');

INSERT INTO user_preferences (preference_id, user_id, preference_key, preference_value)
VALUES
('pref_001', 'usr_001', 'theme', 'dark'),
('pref_002', 'usr_002', 'language', 'en-US'),
('pref_003', 'usr_003', 'notifications', 'enabled');

INSERT INTO feedback (feedback_id, user_id, project_id, feedback_type, content, status)
VALUES
('fb_001', 'usr_001', 'prj_001', 'bug', 'Found a typo on the homepage', 'pending'),
('fb_002', 'usr_002', 'prj_002', 'feature_request', 'Can we add a contact form?', 'in_progress'),
('fb_003', 'usr_003', 'prj_003', 'support', 'Need help with product uploads', 'resolved');

INSERT INTO analytics_data (analytics_id, project_id, page_id, metric_name, metric_value)
VALUES
('anl_001', 'prj_001', 'pg_001', 'page_views', 1000),
('anl_002', 'prj_002', 'pg_003', 'unique_visitors', 500),
('anl_003', 'prj_003', 'pg_004', 'conversion_rate', 2.5);

INSERT INTO csv_uploads (upload_id, user_id, project_id, file_name, file_path, status)
VALUES
('csv_001', 'usr_001', 'prj_001', 'blog_posts.csv', '/uploads/blog_posts.csv', 'completed'),
('csv_002', 'usr_002', 'prj_002', 'portfolio_items.csv', '/uploads/portfolio_items.csv', 'processing'),
('csv_003', 'usr_003', 'prj_003', 'product_list.csv', '/uploads/product_list.csv', 'pending');

INSERT INTO ai_content_generations (generation_id, project_id, page_id, prompt, generated_content, status)
VALUES
('ai_001', 'prj_001', 'pg_001', 'Write an intro paragraph about AI in web development', 'AI is revolutionizing web development...', 'completed'),
('ai_002', 'prj_002', 'pg_003', 'Generate a project description for a mobile app design', 'Our latest mobile app design focuses on...', 'pending'),
('ai_003', 'prj_003', 'pg_004', 'Create a product description for a smart watch', 'Introducing our newest smart watch...', 'in_progress');

INSERT INTO seo_reports (report_id, project_id, overall_score, detailed_results)
VALUES
('seo_rep_001', 'prj_001', 85, '{"strengths": ["Good keyword usage", "Fast load times"], "improvements": ["Increase backlinks"]}'),
('seo_rep_002', 'prj_002', 92, '{"strengths": ["Excellent meta descriptions", "Mobile-friendly"], "improvements": ["Add more content"]}'),
('seo_rep_003', 'prj_003', 78, '{"strengths": ["Clear site structure"], "improvements": ["Optimize image alt texts", "Improve page titles"]}');

INSERT INTO user_sessions (session_id, user_id, token, expires_at)
VALUES
('sess_001', 'usr_001', 'token_123', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP + INTERVAL '7 days')::BIGINT),
('sess_002', 'usr_002', 'token_456', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP + INTERVAL '7 days')::BIGINT),
('sess_003', 'usr_003', 'token_789', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP + INTERVAL '7 days')::BIGINT);

INSERT INTO project_collaborators (collaborator_id, project_id, user_id, role, accepted_at)
VALUES
('collab_001', 'prj_001', 'usr_002', 'editor', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT),
('collab_002', 'prj_002', 'usr_003', 'viewer', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT),
('collab_003', 'prj_003', 'usr_001', 'admin', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT);

INSERT INTO project_versions (version_id, project_id, version_number, created_by, description)
VALUES
('ver_001', 'prj_001', 1, 'usr_001', 'Initial version'),
('ver_002', 'prj_001', 2, 'usr_001', 'Added about page'),
('ver_003', 'prj_002', 1, 'usr_002', 'Portfolio launch version');

INSERT INTO page_revisions (revision_id, page_id, content, created_by)
VALUES
('rev_001', 'pg_001', 'Welcome to my updated tech blog!', 'usr_001'),
('rev_002', 'pg_003', 'Check out my latest design work and case studies...', 'usr_002'),
('rev_003', 'pg_004', 'Explore our expanded range of cutting-edge gadgets...', 'usr_003');

INSERT INTO design_templates (template_id, name, description, css_content, html_structure)
VALUES
('tmpl_001', 'Modern Blog', 'A clean, responsive blog template', 'body { font-family: Arial, sans-serif; }', '<header>...</header><main>...</main><footer>...</footer>'),
('tmpl_002', 'Portfolio Showcase', 'Minimalist portfolio design', 'body { background-color: #f0f0f0; }', '<nav>...</nav><section id="gallery">...</section>'),
('tmpl_003', 'E-commerce Layout', 'Optimized for online stores', '.product { display: flex; }', '<header>...</header><div id="product-grid">...</div>');

INSERT INTO project_template_assignments (assignment_id, project_id, template_id)
VALUES
('assign_001', 'prj_001', 'tmpl_001'),
('assign_002', 'prj_002', 'tmpl_002'),
('assign_003', 'prj_003', 'tmpl_003');

INSERT INTO custom_domains (domain_id, project_id, domain_name, verification_status, verified_at)
VALUES
('dom_001', 'prj_001', 'johnsblog.com', 'verified', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT),
('dom_002', 'prj_002', 'janesmith.design', 'pending', NULL),
('dom_003', 'prj_003', 'bobsgadgets.store', 'verified', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT);

INSERT INTO deployment_logs (log_id, project_id, deployment_status, deployment_details, completed_at)
VALUES
('dep_001', 'prj_001', 'success', 'Deployed version 2 to production', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT),
('dep_002', 'prj_002', 'failed', 'Build error: missing dependencies', NULL),
('dep_003', 'prj_003', 'in_progress', 'Deploying latest changes to staging', NULL);

INSERT INTO user_notifications (notification_id, user_id, type, content, read_at)
VALUES
('notif_001', 'usr_001', 'collaboration_invite', 'You have been invited to collaborate on Project X', NULL),
('notif_002', 'usr_002', 'deployment_success', 'Your website has been successfully deployed', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT),
('notif_003', 'usr_003', 'comment_received', 'New comment on your product page', NULL);

INSERT INTO api_keys (key_id, user_id, api_key, last_used)
VALUES
('key_001', 'usr_001', 'ak_12345abcde', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT),
('key_002', 'usr_002', 'ak_67890fghij', NULL),
('key_003', 'usr_003', 'ak_54321zyxwv', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT);