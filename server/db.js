const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 确保数据库目录存在
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'blog.db'));

// 初始化数据库表
function initDatabase() {
    return new Promise((resolve, reject) => {
        try {
            // 创建文章表
            db.exec(`
                CREATE TABLE IF NOT EXISTS articles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT,
                    cover TEXT,
                    featured INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 创建图片表
            db.exec(`
                CREATE TABLE IF NOT EXISTS gallery (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    path TEXT NOT NULL,
                    group_name TEXT DEFAULT '默认',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 创建资源表
            db.exec(`
                CREATE TABLE IF NOT EXISTS resources (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    file_path TEXT NOT NULL,
                    file_size INTEGER,
                    category TEXT DEFAULT '其他',
                    download_count INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('✅ 数据库初始化完成');
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { db, initDatabase };
