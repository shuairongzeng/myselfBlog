const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');

// 配置图片上传
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
        cb(null, `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`);
    }
});
const upload = multer({ storage });

// 获取图片列表（支持分组筛选）
router.get('/', (req, res) => {
    try {
        const { group } = req.query;
        let sql = 'SELECT * FROM gallery';
        let params = [];

        if (group && group !== '全部') {
            sql += ' WHERE group_name = ?';
            params.push(group);
        }

        sql += ' ORDER BY created_at DESC';

        const images = db.prepare(sql).all(...params);
        res.json({ success: true, data: images });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 获取所有分组
router.get('/groups', (req, res) => {
    try {
        const groups = db.prepare('SELECT DISTINCT group_name FROM gallery').all();
        res.json({ success: true, data: groups.map(g => g.group_name) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 上传图片（支持批量）
router.post('/', upload.array('images', 20), (req, res) => {
    try {
        const { title, group_name } = req.body;
        const groupName = group_name || '默认';

        const insertStmt = db.prepare(`
            INSERT INTO gallery (title, path, group_name)
            VALUES (?, ?, ?)
        `);

        const insertedIds = [];
        for (const file of req.files) {
            const result = insertStmt.run(
                title || file.originalname,
                `/uploads/images/${file.filename}`,
                groupName
            );
            insertedIds.push(result.lastInsertRowid);
        }

        res.json({ success: true, data: { ids: insertedIds } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 更新图片信息
router.put('/:id', (req, res) => {
    try {
        const { title, group_name } = req.body;
        db.prepare(`
            UPDATE gallery SET title = ?, group_name = ?
            WHERE id = ?
        `).run(title, group_name, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 删除图片
router.delete('/:id', (req, res) => {
    try {
        // 获取图片路径
        const image = db.prepare('SELECT path FROM gallery WHERE id = ?').get(req.params.id);
        if (image) {
            const filePath = path.join(__dirname, '../../', image.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
