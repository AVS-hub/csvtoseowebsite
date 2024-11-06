import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { PGlite } from "@electric-sql/pglite";
import dotenv from 'dotenv';
import morgan from 'morgan';
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1337;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database initialization
const postgres = new PGlite("./db");

// OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './storage')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// User Management

app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    const existingUser = await postgres.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user_id = uuidv4();

    const newUser = await postgres.query(
      'INSERT INTO users (user_id, email, password_hash, first_name, last_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, email, hashedPassword, first_name, last_name, Date.now(), Date.now()]
    );

    const token = generateToken(newUser.rows[0]);

    res.status(201).json({
      user_id: newUser.rows[0].user_id,
      email: newUser.rows[0].email,
      first_name: newUser.rows[0].first_name,
      last_name: newUser.rows[0].last_name,
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await postgres.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.rows[0]);

    await postgres.query('UPDATE users SET last_login = $1 WHERE user_id = $2', [Date.now(), user.rows[0].user_id]);

    const session_id = uuidv4();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    await postgres.query(
      'INSERT INTO user_sessions (session_id, user_id, token, created_at, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [session_id, user.rows[0].user_id, token, Date.now(), expiresAt]
    );

    res.json({
      token: token,
      user_id: user.rows[0].user_id,
      expires_at: expiresAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/logout', authenticateToken, async (req, res) => {
  try {
    await postgres.query('DELETE FROM user_sessions WHERE user_id = $1', [req.user.user_id]);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await postgres.query('SELECT user_id, email, first_name, last_name, created_at, last_login FROM users WHERE user_id = $1', [req.user.user_id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, password } = req.body;
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    let paramCount = 1;

    if (first_name) {
      updateQuery += `first_name = $${paramCount}, `;
      updateValues.push(first_name);
      paramCount++;
    }
    if (last_name) {
      updateQuery += `last_name = $${paramCount}, `;
      updateValues.push(last_name);
      paramCount++;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += `password_hash = $${paramCount}, `;
      updateValues.push(hashedPassword);
      paramCount++;
    }

    updateQuery += `updated_at = $${paramCount} WHERE user_id = $${paramCount + 1} RETURNING *`;
    updateValues.push(Date.now(), req.user.user_id);

    const updatedUser = await postgres.query(updateQuery, updateValues);
    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user_id: updatedUser.rows[0].user_id,
      email: updatedUser.rows[0].email,
      first_name: updatedUser.rows[0].first_name,
      last_name: updatedUser.rows[0].last_name,
      created_at: updatedUser.rows[0].created_at,
      last_login: updatedUser.rows[0].last_login
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Project Management

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, default_language } = req.body;
    const project_id = uuidv4();
    const newProject = await postgres.query(
      'INSERT INTO projects (project_id, user_id, name, description, created_at, updated_at, status, default_language) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [project_id, req.user.user_id, name, description, Date.now(), Date.now(), 'draft', default_language || 'en']
    );
    res.status(201).json(newProject.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const projects = await postgres.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.user_id, limit, offset]
    );

    const totalProjects = await postgres.query('SELECT COUNT(*) FROM projects WHERE user_id = $1', [req.user.user_id]);
    const totalCount = parseInt(totalProjects.rows[0].count);

    res.json({
      data: projects.rows,
      pagination: {
        total_items: totalCount,
        total_pages: Math.ceil(totalCount / limit),
        current_page: page,
        limit: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await postgres.query('SELECT * FROM projects WHERE project_id = $1 AND user_id = $2', [req.params.projectId, req.user.user_id]);
    if (project.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const { name, description, default_language } = req.body;
    const updatedProject = await postgres.query(
      'UPDATE projects SET name = $1, description = $2, default_language = $3, updated_at = $4 WHERE project_id = $5 AND user_id = $6 RETURNING *',
      [name, description, default_language, Date.now(), req.params.projectId, req.user.user_id]
    );
    if (updatedProject.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(updatedProject.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const result = await postgres.query('DELETE FROM projects WHERE project_id = $1 AND user_id = $2', [req.params.projectId, req.user.user_id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CSV Processing

app.post('/api/projects/:projectId/csv', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const upload_id = uuidv4();
    const csvUpload = await postgres.query(
      'INSERT INTO csv_uploads (upload_id, user_id, project_id, file_name, file_path, upload_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [upload_id, req.user.user_id, req.params.projectId, req.file.originalname, req.file.path, Date.now(), 'pending']
    );

    await postgres.query('UPDATE projects SET updated_at = $1 WHERE project_id = $2', [Date.now(), req.params.projectId]);

    res.status(202).json({
      upload_id: csvUpload.rows[0].upload_id,
      file_name: csvUpload.rows[0].file_name,
      status: csvUpload.rows[0].status
    });

    setTimeout(async () => {
      await postgres.query('UPDATE csv_uploads SET status = $1 WHERE upload_id = $2', ['completed', upload_id]);
    }, 5000);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Page Management

app.post('/api/projects/:projectId/pages', authenticateToken, async (req, res) => {
  try {
    const { title, url_slug, content, is_pillar_page, parent_page_id } = req.body;
    const page_id = uuidv4();

    const newPage = await postgres.query(
      'INSERT INTO pages (page_id, project_id, title, url_slug, content, created_at, updated_at, is_pillar_page, parent_page_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [page_id, req.params.projectId, title, url_slug, content, Date.now(), Date.now(), is_pillar_page || false, parent_page_id]
    );

    res.status(201).json(newPage.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:projectId/pages', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const pages = await postgres.query(
      'SELECT * FROM pages WHERE project_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.params.projectId, limit, offset]
    );

    const totalPages = await postgres.query('SELECT COUNT(*) FROM pages WHERE project_id = $1', [req.params.projectId]);
    const totalCount = parseInt(totalPages.rows[0].count);

    res.json({
      data: pages.rows,
      pagination: {
        total_items: totalCount,
        total_pages: Math.ceil(totalCount / limit),
        current_page: page,
        limit: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:projectId/pages/:pageId', authenticateToken, async (req, res) => {
  try {
    const page = await postgres.query('SELECT * FROM pages WHERE page_id = $1 AND project_id = $2', [req.params.pageId, req.params.projectId]);
    if (page.rows.length === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(page.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/projects/:projectId/pages/:pageId', authenticateToken, async (req, res) => {
  try {
    const { title, url_slug, content, is_pillar_page, parent_page_id } = req.body;
    const updatedPage = await postgres.query(
      'UPDATE pages SET title = $1, url_slug = $2, content = $3, is_pillar_page = $4, parent_page_id = $5, updated_at = $6 WHERE page_id = $7 AND project_id = $8 RETURNING *',
      [title, url_slug, content, is_pillar_page, parent_page_id, Date.now(), req.params.pageId, req.params.projectId]
    );
    if (updatedPage.rows.length === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(updatedPage.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/projects/:projectId/pages/:pageId', authenticateToken, async (req, res) => {
  try {
    const result = await postgres.query('DELETE FROM pages WHERE page_id = $1 AND project_id = $2', [req.params.pageId, req.params.projectId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI Content Generation

app.post('/api/projects/:projectId/pages/:pageId/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    const generation_id = uuidv4();

    await postgres.query(
      'INSERT INTO ai_content_generations (generation_id, project_id, page_id, prompt, status) VALUES ($1, $2, $3, $4, $5)',
      [generation_id, req.params.projectId, req.params.pageId, prompt, 'pending']
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedContent = completion.choices[0].message.content;

    await postgres.query(
      'UPDATE pages SET content = $1, updated_at = $2 WHERE page_id = $3 AND project_id = $4',
      [generatedContent, Date.now(), req.params.pageId, req.params.projectId]
    );

    await postgres.query(
      'UPDATE ai_content_generations SET status = $1, generated_content = $2 WHERE generation_id = $3',
      ['completed', generatedContent, generation_id]
    );

    res.status(200).json({
      generation_id: generation_id,
      status: 'completed',
      content: generatedContent
    });
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'An error occurred while generating content' });
    }
  }
});

// SEO Optimization

app.post('/api/projects/:projectId/pages/:pageId/seo', authenticateToken, async (req, res) => {
  try {
    const { meta_title, meta_description, focus_keyword, secondary_keywords } = req.body;
    const metadata_id = uuidv4();

    const seoMetadata = await postgres.query(
      'INSERT INTO seo_metadata (metadata_id, page_id, meta_title, meta_description, focus_keyword, secondary_keywords) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (page_id) DO UPDATE SET meta_title = $3, meta_description = $4, focus_keyword = $5, secondary_keywords = $6 RETURNING *',
      [metadata_id, req.params.pageId, meta_title, meta_description, focus_keyword, secondary_keywords]
    );

    res.status(200).json(seoMetadata.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:projectId/pages/:pageId/seo', authenticateToken, async (req, res) => {
  try {
    const seoMetadata = await postgres.query('SELECT * FROM seo_metadata WHERE page_id = $1', [req.params.pageId]);
    if (seoMetadata.rows.length === 0) {
      return res.status(404).json({ message: 'SEO metadata not found' });
    }
    res.json(seoMetadata.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/projects/:projectId/pages/:pageId/seo', authenticateToken, async (req, res) => {
  try {
    const { meta_title, meta_description, focus_keyword, secondary_keywords } = req.body;
    const updatedSeoMetadata = await postgres.query(
      'UPDATE seo_metadata SET meta_title = $1, meta_description = $2, focus_keyword = $3, secondary_keywords = $4 WHERE page_id = $5 RETURNING *',
      [meta_title, meta_description, focus_keyword, secondary_keywords, req.params.pageId]
    );
    if (updatedSeoMetadata.rows.length === 0) {
      return res.status(404).json({ message: 'SEO metadata not found' });
    }
    res.json(updatedSeoMetadata.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export and Download

app.post('/api/projects/:projectId/export', authenticateToken, async (req, res) => {
  try {
    const export_id = uuidv4();

    await postgres.query(
      'INSERT INTO deployment_logs (log_id, project_id, deployment_status, started_at) VALUES ($1, $2, $3, $4)',
      [export_id, req.params.projectId, 'in_progress', Date.now()]
    );

    res.status(202).json({
      export_id: export_id,
      status: 'pending'
    });

    setTimeout(async () => {
      await postgres.query(
        'UPDATE deployment_logs SET deployment_status = $1, completed_at = $2 WHERE log_id = $3',
        ['completed', Date.now(), export_id]
      );
    }, 5000);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:projectId/export/:exportId', authenticateToken, async (req, res) => {
  try {
    const exportStatus = await postgres.query('SELECT * FROM deployment_logs WHERE log_id = $1 AND project_id = $2', [req.params.exportId, req.params.projectId]);
    if (exportStatus.rows.length === 0) {
      return res.status(404).json({ message: 'Export not found' });
    }
    
    const status = exportStatus.rows[0];
    res.json({
      export_id: status.log_id,
      status: status.deployment_status,
      progress: status.deployment_status === 'completed' ? 100 : 50,
      download_url: status.deployment_status === 'completed' ? `/api/projects/${req.params.projectId}/export/${req.params.exportId}/download` : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:projectId/export/:exportId/download', authenticateToken, async (req, res) => {
  try {
    const exportStatus = await postgres.query('SELECT * FROM deployment_logs WHERE log_id = $1 AND project_id = $2', [req.params.exportId, req.params.projectId]);
    if (exportStatus.rows.length === 0 || exportStatus.rows[0].deployment_status !== 'completed') {
      return res.status(404).json({ message: 'Export not found or not completed' });
    }

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename=project-${req.params.projectId}-export.zip`);
    res.send(Buffer.from('Mock exported website content'));

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Analytics

app.get('/api/projects/:projectId/analytics', authenticateToken, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const analyticsData = {
      project_id: req.params.projectId,
      page_views: 1000,
      unique_visitors: 500,
      average_time_on_site: 120,
      bounce_rate: 0.3,
      top_pages: [
        { page_id: 'page1', url_slug: '/home', views: 300 },
        { page_id: 'page2', url_slug: '/about', views: 200 },
        { page_id: 'page3', url_slug: '/contact', views: 100 }
      ]
    };

    res.json(analyticsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});