const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// GET /api/blog - Récupérer tous les articles publiés (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit = 10, offset = 0 } = req.query;
    
    let query = `
      SELECT bp.*, u.first_name, u.last_name 
      FROM blog_posts bp 
      JOIN users u ON bp.author_id = u.id 
      WHERE bp.status = 'published'
    `;
    const params = [];

    if (category) {
      query += ` AND bp.excerpt LIKE ?`;
      params.push(`%${category}%`);
    }

    query += ` ORDER BY bp.published_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const posts = await db.all(query, params);
    
    const formatted = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.image_url,
      author: `${post.first_name} ${post.last_name}`,
      status: post.status,
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erreur récupération articles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/blog/admin - Récupérer tous les articles (admin)
router.get('/admin', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT bp.*, u.first_name, u.last_name 
      FROM blog_posts bp 
      JOIN users u ON bp.author_id = u.id
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` WHERE bp.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY bp.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const posts = await db.all(query, params);
    
    const formatted = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.image_url,
      author: `${post.first_name} ${post.last_name}`,
      authorId: post.author_id,
      status: post.status,
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erreur récupération articles admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/blog/:slug - Récupérer un article par slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await db.get(`
      SELECT bp.*, u.first_name, u.last_name 
      FROM blog_posts bp 
      JOIN users u ON bp.author_id = u.id 
      WHERE bp.slug = ? AND bp.status = 'published'
    `, [slug]);

    if (!post) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    const formatted = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.image_url,
      author: `${post.first_name} ${post.last_name}`,
      status: post.status,
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    };

    res.json(formatted);
  } catch (error) {
    console.error('Erreur récupération article:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/blog - Créer un nouvel article
router.post('/', async (req, res) => {
  try {
    const { title, content, excerpt, imageUrl, status = 'draft' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Titre et contenu obligatoires' });
    }

    // Générer un slug unique
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Vérifier l'unicité du slug
    while (await db.get('SELECT id FROM blog_posts WHERE slug = ?', [slug])) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const postId = uuidv4();
    const adminId = 'admin-1'; // ID de l'admin par défaut
    const publishedAt = status === 'published' 
      ? new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)
      : null;

    await db.run(`
      INSERT INTO blog_posts (id, title, slug, content, excerpt, image_url, author_id, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [postId, title, slug, content, excerpt || '', imageUrl || null, adminId, status, publishedAt]);

    const newPost = await db.get(`
      SELECT bp.*, u.first_name, u.last_name 
      FROM blog_posts bp 
      JOIN users u ON bp.author_id = u.id 
      WHERE bp.id = ?
    `, [postId]);

    res.status(201).json({
      id: newPost.id,
      title: newPost.title,
      slug: newPost.slug,
      content: newPost.content,
      excerpt: newPost.excerpt,
      imageUrl: newPost.image_url,
      author: `${newPost.first_name} ${newPost.last_name}`,
      status: newPost.status,
      publishedAt: newPost.published_at,
      createdAt: newPost.created_at,
      updatedAt: newPost.updated_at
    });
  } catch (error) {
    console.error('Erreur création article:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/blog/:id - Modifier un article
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, imageUrl, status } = req.body;

    const updates = [];
    const params = [];

    if (title) { 
      updates.push('title = ?'); 
      params.push(title);
      
      // Régénérer le slug si le titre change
      const baseSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      let slug = baseSlug;
      let counter = 1;
      
      while (await db.get('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [slug, id])) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      updates.push('slug = ?');
      params.push(slug);
    }
    
    if (typeof content !== 'undefined') { updates.push('content = ?'); params.push(content); }
    if (typeof excerpt !== 'undefined') { updates.push('excerpt = ?'); params.push(excerpt); }
    if (typeof imageUrl !== 'undefined') { updates.push('image_url = ?'); params.push(imageUrl || null); }
    
    if (status) { 
      updates.push('status = ?'); 
      params.push(status);
      
      // Si on publie l'article, définir published_at
      if (status === 'published') {
        const currentPost = await db.get('SELECT published_at FROM blog_posts WHERE id = ?', [id]);
        if (!currentPost.published_at) {
          updates.push('published_at = ?');
          params.push(new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19));
        }
      }
    }

    updates.push('updated_at = datetime("now")');
    params.push(id);

    if (updates.length === 1) { // Only updated_at
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    await db.run(`UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`, params);

    const updatedPost = await db.get(`
      SELECT bp.*, u.first_name, u.last_name 
      FROM blog_posts bp 
      JOIN users u ON bp.author_id = u.id 
      WHERE bp.id = ?
    `, [id]);

    if (!updatedPost) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    res.json({
      id: updatedPost.id,
      title: updatedPost.title,
      slug: updatedPost.slug,
      content: updatedPost.content,
      excerpt: updatedPost.excerpt,
      imageUrl: updatedPost.image_url,
      author: `${updatedPost.first_name} ${updatedPost.last_name}`,
      status: updatedPost.status,
      publishedAt: updatedPost.published_at,
      createdAt: updatedPost.created_at,
      updatedAt: updatedPost.updated_at
    });
  } catch (error) {
    console.error('Erreur modification article:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/blog/:id - Supprimer un article
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM blog_posts WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression article:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;