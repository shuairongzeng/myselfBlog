// 山海经博客 - 后台管理逻辑

const API_BASE = '/api';

// ========== 工具函数 ==========
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// ========== 标签页切换 ==========
document.querySelectorAll('.nav-item a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;

        // 更新导航
        document.querySelectorAll('.nav-item a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // 更新内容
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        // 加载数据
        if (tab === 'dashboard') loadDashboard();
        if (tab === 'articles') loadArticles();
        if (tab === 'gallery') loadGallery();
        if (tab === 'resources') loadResources();
    });
});

// ========== 仪表盘 ==========
async function loadDashboard() {
    try {
        const [articles, gallery, resources] = await Promise.all([
            fetch(`${API_BASE}/articles`).then(r => r.json()),
            fetch(`${API_BASE}/gallery`).then(r => r.json()),
            fetch(`${API_BASE}/resources`).then(r => r.json())
        ]);

        document.getElementById('stat-articles').textContent = articles.data?.length || 0;
        document.getElementById('stat-featured').textContent = articles.data?.filter(a => a.featured).length || 0;
        document.getElementById('stat-images').textContent = gallery.data?.length || 0;
        document.getElementById('stat-resources').textContent = resources.data?.length || 0;
    } catch (error) {
        console.error('加载仪表盘失败:', error);
    }
}

// ========== 文章管理 ==========
async function loadArticles() {
    const tbody = document.getElementById('articles-table-body');
    tbody.innerHTML = '<tr><td colspan="5"><div class="loading"><div class="loading-spinner"></div></div></td></tr>';

    try {
        const response = await fetch(`${API_BASE}/articles`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(article => `
                <tr>
                    <td>
                        ${article.cover
                    ? `<img src="${article.cover}" class="table-image" alt="">`
                    : '<div class="table-placeholder">🐉</div>'
                }
                    </td>
                    <td><strong>${article.title}</strong></td>
                    <td>${article.featured ? '<span class="badge badge-featured">⭐ 推荐</span>' : '-'}</td>
                    <td>${formatDate(article.created_at)}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-secondary btn-sm" onclick="editArticle(${article.id})">编辑</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteArticle(${article.id})">删除</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📜</div><div class="empty-text">暂无文章</div></div></td></tr>';
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-text">加载失败</div></div></td></tr>';
    }
}

function openArticleModal(article = null) {
    document.getElementById('article-modal-title').textContent = article ? '编辑文章' : '新建文章';
    document.getElementById('article-id').value = article?.id || '';
    document.getElementById('article-title').value = article?.title || '';
    document.getElementById('article-content').value = article?.content || '';
    document.getElementById('article-featured').checked = article?.featured === 1;
    document.getElementById('cover-preview').style.display = article?.cover ? 'block' : 'none';
    document.getElementById('cover-preview').src = article?.cover || '';
    document.getElementById('article-modal').classList.add('active');
}

async function editArticle(id) {
    try {
        const response = await fetch(`${API_BASE}/articles/${id}`);
        const result = await response.json();
        if (result.success) {
            openArticleModal(result.data);
        }
    } catch (error) {
        showToast('加载文章失败', 'error');
    }
}

async function saveArticle() {
    const id = document.getElementById('article-id').value;
    const formData = new FormData();

    formData.append('title', document.getElementById('article-title').value);
    formData.append('content', document.getElementById('article-content').value);
    formData.append('featured', document.getElementById('article-featured').checked ? 1 : 0);

    const coverFile = document.getElementById('article-cover').files[0];
    if (coverFile) {
        formData.append('cover', coverFile);
    }

    try {
        const url = id ? `${API_BASE}/articles/${id}` : `${API_BASE}/articles`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, { method, body: formData });
        const result = await response.json();

        if (result.success) {
            showToast(id ? '文章更新成功' : '文章创建成功');
            closeModal('article-modal');
            loadArticles();
            loadDashboard();
        } else {
            showToast(result.error || '保存失败', 'error');
        }
    } catch (error) {
        showToast('保存失败', 'error');
    }
}

async function deleteArticle(id) {
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
        const response = await fetch(`${API_BASE}/articles/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            showToast('文章删除成功');
            loadArticles();
            loadDashboard();
        } else {
            showToast('删除失败', 'error');
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

// ========== 图片管理 ==========
async function loadGallery() {
    const tbody = document.getElementById('gallery-table-body');
    tbody.innerHTML = '<tr><td colspan="5"><div class="loading"><div class="loading-spinner"></div></div></td></tr>';

    try {
        const response = await fetch(`${API_BASE}/gallery`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(image => `
                <tr>
                    <td><img src="${image.path}" class="table-image" alt=""></td>
                    <td>${image.title || '-'}</td>
                    <td><span class="badge badge-category">${image.group_name}</span></td>
                    <td>${formatDate(image.created_at)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteImage(${image.id})">删除</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🖼️</div><div class="empty-text">暂无图片</div></div></td></tr>';
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-text">加载失败</div></div></td></tr>';
    }
}

function openGalleryModal() {
    document.getElementById('gallery-title').value = '';
    document.getElementById('gallery-group').value = '';
    document.getElementById('gallery-files').value = '';
    document.getElementById('gallery-files-text').textContent = '点击上传图片（支持多选）';
    document.getElementById('gallery-modal').classList.add('active');
}

async function uploadImages() {
    const files = document.getElementById('gallery-files').files;
    if (files.length === 0) {
        showToast('请选择图片', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('gallery-title').value);
    formData.append('group_name', document.getElementById('gallery-group').value || '默认');

    for (const file of files) {
        formData.append('images', file);
    }

    try {
        const response = await fetch(`${API_BASE}/gallery`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            showToast(`成功上传 ${files.length} 张图片`);
            closeModal('gallery-modal');
            loadGallery();
            loadDashboard();
        } else {
            showToast(result.error || '上传失败', 'error');
        }
    } catch (error) {
        showToast('上传失败', 'error');
    }
}

async function deleteImage(id) {
    if (!confirm('确定要删除这张图片吗？')) return;

    try {
        const response = await fetch(`${API_BASE}/gallery/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            showToast('图片删除成功');
            loadGallery();
            loadDashboard();
        } else {
            showToast('删除失败', 'error');
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

// ========== 资源管理 ==========
async function loadResources() {
    const tbody = document.getElementById('resources-table-body');
    tbody.innerHTML = '<tr><td colspan="5"><div class="loading"><div class="loading-spinner"></div></div></td></tr>';

    try {
        const response = await fetch(`${API_BASE}/resources`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(resource => `
                <tr>
                    <td><strong>${resource.title}</strong></td>
                    <td><span class="badge badge-category">${resource.category}</span></td>
                    <td>${formatFileSize(resource.file_size)}</td>
                    <td>${resource.download_count}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteResource(${resource.id})">删除</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📦</div><div class="empty-text">暂无资源</div></div></td></tr>';
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-text">加载失败</div></div></td></tr>';
    }
}

function openResourceModal() {
    document.getElementById('resource-title').value = '';
    document.getElementById('resource-description').value = '';
    document.getElementById('resource-category').value = '';
    document.getElementById('resource-file').value = '';
    document.getElementById('resource-file-text').textContent = '点击上传文件';
    document.getElementById('resource-modal').classList.add('active');
}

async function uploadResource() {
    const file = document.getElementById('resource-file').files[0];
    if (!file) {
        showToast('请选择文件', 'error');
        return;
    }

    const title = document.getElementById('resource-title').value;
    if (!title) {
        showToast('请输入资源名称', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', document.getElementById('resource-description').value);
    formData.append('category', document.getElementById('resource-category').value || '其他');
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/resources`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            showToast('资源上传成功');
            closeModal('resource-modal');
            loadResources();
            loadDashboard();
        } else {
            showToast(result.error || '上传失败', 'error');
        }
    } catch (error) {
        showToast('上传失败', 'error');
    }
}

async function deleteResource(id) {
    if (!confirm('确定要删除这个资源吗？')) return;

    try {
        const response = await fetch(`${API_BASE}/resources/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            showToast('资源删除成功');
            loadResources();
            loadDashboard();
        } else {
            showToast('删除失败', 'error');
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

// ========== 通用函数 ==========
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function updateFileText(input) {
    const text = document.getElementById('gallery-files-text');
    text.textContent = input.files.length > 0
        ? `已选择 ${input.files.length} 个文件`
        : '点击上传图片（支持多选）';
}

function updateResourceFileText(input) {
    const text = document.getElementById('resource-file-text');
    text.textContent = input.files.length > 0
        ? input.files[0].name
        : '点击上传文件';
}

// 点击模态框外部关闭
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
});

// ESC键关闭模态框
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
});

// 初始加载
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
