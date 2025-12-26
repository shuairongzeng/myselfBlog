const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');

const articlesRouter = require('./routes/articles');
const galleryRouter = require('./routes/gallery');
const resourcesRouter = require('./routes/resources');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../client')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 强制 UTF-8 编码
app.use('/api', (req, res, next) => {
    res.type('json'); // Sets Content-Type to application/json; charset=utf-8
    next();
});

// API路由
app.use('/api/articles', articlesRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/resources', resourcesRouter);

// 前端路由 - SPA支持
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// 初始化数据库并启动服务器
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🐉 山海经博客服务已启动: http://localhost:${PORT}`);
        console.log(`📜 后台管理: http://localhost:${PORT}/admin`);
    });
}).catch(err => {
    console.error('数据库初始化失败:', err);
    process.exit(1);
});
