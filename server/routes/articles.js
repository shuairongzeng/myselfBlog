const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');

// 配置封面图上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/images');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `cover_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

// 获取文章列表（推荐优先）
router.get('/', (req, res) => {
    try {
        const articles = db.prepare(`
            SELECT id, title, cover, featured, created_at, updated_at,
                   SUBSTR(content, 1, 200) as summary
            FROM articles 
            ORDER BY featured DESC, created_at DESC
        `).all();
        res.json({ success: true, data: articles });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 获取单篇文章
router.get('/:id', (req, res) => {
    try {
        const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, error: '文章不存在' });
        }
        res.json({ success: true, data: article });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 创建文章
router.post('/', upload.single('cover'), (req, res) => {
    try {
        const { title, content, featured } = req.body;
        const cover = req.file ? `/uploads/images/${req.file.filename}` : null;

        const result = db.prepare(`
            INSERT INTO articles (title, content, cover, featured)
            VALUES (?, ?, ?, ?)
        `).run(title, content, cover, featured ? 1 : 0);

        res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 更新文章
router.put('/:id', upload.single('cover'), (req, res) => {
    try {
        const { title, content, featured } = req.body;
        const id = req.params.id;

        let sql = 'UPDATE articles SET title = ?, content = ?, featured = ?, updated_at = CURRENT_TIMESTAMP';
        let params = [title, content, featured ? 1 : 0];

        if (req.file) {
            sql += ', cover = ?';
            params.push(`/uploads/images/${req.file.filename}`);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        db.prepare(sql).run(...params);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 删除文章
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
