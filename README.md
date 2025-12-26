# 🐉 Antigravity Blog (山海经主题个人博客)

> **"北冥有鱼，其名为鲲。"** —— 这是一个融合了现代简约设计与中国传统神话元素（山海经异兽主题）的暗黑风个人博客系统。

## 🪐 项目简介

本项目旨在构建一个视觉冲击力强、体验流畅的个人内容展示空间。采用暗黑中国风美学，通过动态效果和精致的 UI 设计，将古典文化与现代技术完美融合。

### 特色亮点
- **视觉美学**：沉浸式暗黑主题，精致的 HSL 调色，结合山海经异兽纹样。
- **动效体验**：细腻的加载动画与微交互，让阅读过程富有生命感。
- **轻量架构**：基于 Node.js 与 SQLite，无需复杂配置即可部署运行。
- **SEO 优化**：遵循语义化 HTML 标准，实现极佳的搜索友好性。

## 🛠️ 技术栈

- **前端 (Client)**: 
  - 原生 JavaScript (Vanilla JS)
  - 纯 CSS3 (Vanilla CSS)
  - 响应式网格布局 (CSS Grid / Flexbox)
  - Marked.js (Markdown 解析)
- **后端 (Server)**:
  - Node.js & Express.js
  - SQLite (Better-sqlite3) - 嵌入式数据库
  - Multer - 文件上传管理
  - CORS - 跨域资源共享

## 📂 项目结构

```text
myselfBlog/
├── admin/          # 后台管理系统 (SPA)
├── client/         # 前端展示界面
│   ├── css/        # 样式文件 (山海经主题设计)
│   ├── js/         # 前端核心逻辑 (app.js)
│   └── *.html      # 页面结构 (文章、相册、资源)
├── server/         # 后端 API 服务
│   ├── routes/     # 路由模块 (文章、图库等)
│   ├── db.js       # 数据库初始与连接配置
│   └── index.js    # 程序入口
├── data/           # SQLite 数据库存储目录
└── uploads/        # 静态资源上传目录
```

## 🚀 快速启动

### 1. 克隆仓库
```bash
git clone https://github.com/shuairongzeng/myselfBlog.git
cd myselfBlog
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动项目
```bash
npm start
```
服务启动后，在浏览器访问：
- **前台展示**: `http://localhost:3000`
- **后台管理**: `http://localhost:3000/admin`

## 📄 开源协议

本项目遵循 [MIT](LICENSE) 协议。

---
*由 [Antigravity](https://github.com/shuairongzeng/myselfBlog) 驱动 • 构建属于你的新纪元*
