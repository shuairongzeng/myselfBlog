const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');

// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/files');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

// 获取资源列表
router.get('/', (req, res) => {
    try {
        const { category } = req.query;
        let sql = 'SELECT * FROM resources';
        let params = [];

        if (category && category !== '全部') {
            sql += ' WHERE category = ?';
            params.push(category);
        }

        sql += ' ORDER BY created_at DESC';

        const resources = db.prepare(sql).all(...params);
        res.json({ success: true, data: resources });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 获取所有分类
router.get('/categories', (req, res) => {
    try {
        const categories = db.prepare('SELECT DISTINCT category FROM resources').all();
        res.json({ success: true, data: categories.map(c => c.category) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 上传资源
router.post('/', upload.single('file'), (req, res) => {
    try {
        const { title, description, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, error: '请上传文件' });
        }

        const result = db.prepare(`
            INSERT INTO resources (title, description, file_path, file_size, category)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            title || req.file.originalname,
            description || '',
            `/uploads/files/${req.file.filename}`,
            req.file.size,
            category || '其他'
        );

        res.json({ success: true, data: { id: result.lastInsertRowid } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 下载资源（增加下载计数）
router.get('/download/:id', (req, res) => {
    try {
        const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, error: '资源不存在' });
        }

        // 增加下载计数
        db.prepare('UPDATE resources SET download_count = download_count + 1 WHERE id = ?')
            .run(req.params.id);

        const filePath = path.join(__dirname, '../../', resource.file_path);
        res.download(filePath, resource.title + path.extname(resource.file_path));
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 更新资源信息
router.put('/:id', (req, res) => {
    try {
        const { title, description, category } = req.body;
        db.prepare(`
            UPDATE resources SET title = ?, description = ?, category = ?
            WHERE id = ?
        `).run(title, description, category, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 删除资源
router.delete('/:id', (req, res) => {
    try {
        const resource = db.prepare('SELECT file_path FROM resources WHERE id = ?').get(req.params.id);
        if (resource) {
            const filePath = path.join(__dirname, '../../', resource.file_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
