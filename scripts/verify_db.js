const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/blog.db');
console.log('Opening DB:', dbPath);

const db = new Database(dbPath);

console.log('--- Gallery First 5 ---');
const images = db.prepare('SELECT * FROM gallery LIMIT 5').all();
images.forEach(img => {
    console.log(`ID: ${img.id}, Title: ${img.title}, Group: ${img.group_name}`);
});

console.log('--- Articles First 5 ---');
const articles = db.prepare('SELECT id, title FROM articles LIMIT 5').all();
articles.forEach(art => {
    console.log(`ID: ${art.id}, Title: ${art.title}`);
});
