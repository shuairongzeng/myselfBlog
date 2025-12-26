const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/blog.db');
const db = new Database(dbPath);

console.log('Fixing Gallery Data...');
// 强制将乱码标题改为通用名称，因为无法恢复原始字符
db.prepare("UPDATE gallery SET title = 'Gallery Asset 01' WHERE id = 1").run();
db.prepare("UPDATE gallery SET title = 'Gallery Asset 02' WHERE id = 2").run();
db.prepare("UPDATE gallery SET title = 'Gallery Asset 03' WHERE id = 3").run();

console.log('Done.');
