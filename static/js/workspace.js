
document.addEventListener('DOMContentLoaded', function() {
    initWorkspace();
});

function initWorkspace() {
    initPlatformSelector();
    initGenerateButton();
    initFormActions();
    loadPostsHistory();
    setupAutoSave();
}


function initPlatformSelector() {
    const platformCheckboxes = document.querySelectorAll('.platform-checkbox');
    
    platformCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const selectedPlatforms = getSelectedPlatforms();
            updatePreviewPlatform(selectedPlatforms);
        });
    });
}

function getSelectedPlatforms() {
    const checkboxes = document.querySelectorAll('.platform-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.id.replace('platform-', ''));
}


function initGenerateButton() {
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    generateBtn.addEventListener('click', generateContent);
    clearBtn.addEventListener('click', clearForm);
}

async function generateContent() {
    const theme = document.getElementById('themeInput').value.trim();
    const tone = document.getElementById('toneSelect').value;
    const platforms = getSelectedPlatforms();
    const length = document.getElementById('lengthSelect').value;
    const context = document.getElementById('contextInput').value.trim();
    
    if (!theme) {
        showAlert('Please enter a theme or topic', 'warning');
        return;
    }
    
    if (platforms.length === 0) {
        showAlert('Please select at least one platform', 'warning');
        return;
    }
    
    
    const processingModal = new bootstrap.Modal(document.getElementById('processingModal'));
    processingModal.show();
    
    try {
        const response = await fetch('/api/generate-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                theme: theme,
                tone: tone,
                platforms: platforms,
                length: length,
                context: context
            })
        });
        
        const data = await response.json();
        console.log('Generated content:', data);
        
        if (data.success) {
            displayGeneratedContent(data);
            showAlert('Content generated successfully!', 'success');
            loadPostsHistory(); 
        } else {
            showAlert('Failed to generate content. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error generating content:', error);
        showAlert('Error connecting to server. Please try again.', 'error');
    } finally {
        processingModal.hide();
    }
}

function displayGeneratedContent(data) {
    const preview = document.getElementById('postPreview');
    const actions = document.querySelector('.preview-actions');
    
    
    const previewPlatform = data.platforms && data.platforms.length > 0 ? data.platforms[0] : 'instagram';
    
    preview.innerHTML = createPostPreview(data, previewPlatform);
    actions.style.display = 'block';
    
    
    if (data.ai_error) {
        showAlert(`AI Generation: ${data.ai_error}`, 'warning');
    }
    
    
    preview.dataset.postData = JSON.stringify(data);
}

function createPostPreview(data, platform) {
    const platformConfigs = {
        instagram: {
            name: 'Instagram',
            username: 'ai_auto_publisher',
            class: 'instagram-preview'
        },
        facebook: {
            name: 'Facebook',
            username: 'AI Auto Publisher',
            class: 'facebook-preview'
        },
        linkedin: {
            name: 'LinkedIn',
            username: 'AI Auto Publisher',
            class: 'linkedin-preview'
        },
        twitter: {
            name: 'Twitter',
            username: '@ai_publisher',
            class: 'twitter-preview'
        }
    };
    
    const config = platformConfigs[platform] || platformConfigs.instagram;
    
    return `
        <div class="social-preview ${config.class}">
            <div class="post-header">
                <div class="profile-pic"></div>
                <div class="profile-info">
                    <div class="username">${config.username}</div>
                    <div class="platform-name">${config.name}</div>
                </div>
            </div>
            <div class="post-content">
                <div class="post-text">${data.caption}</div>
                <div class="post-hashtags">${data.hashtags}</div>
            </div>
            <div class="post-actions">
                <i class="far fa-heart"></i>
                <i class="far fa-comment"></i>
                <i class="far fa-share"></i>
            </div>
        </div>
    `;
}

function clearForm() {
    document.getElementById('themeInput').value = '';
    document.getElementById('contextInput').value = '';
    document.getElementById('toneSelect').value = 'professional';
    document.getElementById('lengthSelect').value = 'medium';
    
    
    document.querySelectorAll('.platform-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('.platform-option[data-platform="instagram"]').classList.add('active');
    
    
    const preview = document.getElementById('postPreview');
    preview.innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-image fa-3x mb-3"></i>
            <p>Generated content will appear here</p>
        </div>
    `;
    
    document.querySelector('.preview-actions').style.display = 'none';
}


function initFormActions() {
    const saveBtn = document.getElementById('saveBtn');
    const editBtn = document.getElementById('editBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');
    
    saveBtn.addEventListener('click', savePost);
    editBtn.addEventListener('click', editPost);
    regenerateBtn.addEventListener('click', generateContent);
}

function savePost() {
    const preview = document.getElementById('postPreview');
    const postData = JSON.parse(preview.dataset.postData || '{}');
    
    if (postData.post_id) {
        showAlert('Post saved successfully!', 'success');
        loadPostsHistory();
    } else {
        showAlert('No post to save', 'warning');
    }
}

function editPost() {
    showAlert('Edit functionality coming soon!', 'info');
}


async function loadPostsHistory() {
    const historyContainer = document.getElementById('postsHistory');
    
    try {
        const response = await fetch('/api/user-posts');
        const data = await response.json();
        
        if (data.posts && data.posts.length > 0) {
            historyContainer.innerHTML = data.posts.map(post => createPostCard(post)).join('');
        } else {
            historyContainer.innerHTML = `
                <div class="empty-state text-center py-4">
                    <i class="fas fa-plus-circle fa-3x text-muted mb-3"></i>
                    <h5>No posts yet</h5>
                    <p class="text-muted">Generate your first AI-powered post above!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        historyContainer.innerHTML = `
            <div class="error-state text-center py-4">
                <i class="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
                <p>Unable to load posts history</p>
            </div>
        `;
    }
}

function createPostCard(post) {
    const date = new Date(post.created_at).toLocaleDateString();
    
    
    const platforms = Array.isArray(post.platforms) ? post.platforms : (post.platforms ? post.platforms.split(',') : []);
    const platformIcons = platforms.map(platform => {
        const iconMap = {
            instagram: 'fab fa-instagram',
            facebook: 'fab fa-facebook',
            linkedin: 'fab fa-linkedin',
            twitter: 'fab fa-twitter'
        };
        return iconMap[platform.trim()] || 'fas fa-share-alt';
    }).join(' ');
    
    const uploadButtonText = post.status === 'published' ? 'Published' : 'Upload All';
    const uploadButtonClass = post.status === 'published' ? 'btn-success' : 'btn-primary';
    const uploadButtonIcon = post.status === 'published' ? 'fas fa-check' : 'fas fa-upload';
    
    return `
        <div class="post-card">
            <button class="upload-btn ${post.status === 'published' ? 'success' : ''}" 
                    onclick="uploadPost(${post.id})" 
                    ${post.status === 'published' ? 'disabled' : ''}>
                <i class="${uploadButtonIcon}"></i> ${uploadButtonText}
            </button>
            <div class="post-card-header">
                <div class="platform-badges">
                    ${platforms.map(platform => `
                        <span class="platform-badge">
                            <i class="${{
                                instagram: 'fab fa-instagram',
                                facebook: 'fab fa-facebook',
                                linkedin: 'fab fa-linkedin',
                                twitter: 'fab fa-twitter'
                            }[platform.trim()] || 'fas fa-share-alt'}"></i>
                            ${platform.trim().charAt(0).toUpperCase() + platform.trim().slice(1)}
                        </span>
                    `).join('')}
                </div>
                <div class="post-date">${date}</div>
            </div>
            <div class="post-card-content">
                <div class="post-theme">${post.theme}</div>
                <div class="post-caption">${post.caption.substring(0, 100)}${post.caption.length > 100 ? '...' : ''}</div>
                <div class="post-hashtags">${post.hashtags}</div>
            </div>
            <div class="post-card-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="reloadPost(${post.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="duplicatePost(${post.id})">
                    <i class="fas fa-copy"></i> Duplicate
                </button>
            </div>
        </div>
    `;
}

function reloadPost(postId) {
    showAlert('Loading post...', 'info');
    
}

function duplicatePost(postId) {
    showAlert('Duplicating post...', 'info');
    
}


async function uploadPost(postId) {
    const uploadBtn = event.target.closest('.upload-btn');
    const originalContent = uploadBtn.innerHTML;
    
    uploadBtn.classList.add('uploading');
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    uploadBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/upload-post/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            uploadBtn.classList.remove('uploading');
            uploadBtn.classList.add('success');
            uploadBtn.innerHTML = '<i class="fas fa-check"></i> Published';
            showAlert(data.message, 'success');
            
            
            setTimeout(() => {
                loadPostsHistory();
            }, 1000);
        } else {
            throw new Error(data.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Error uploading post:', error);
        uploadBtn.classList.remove('uploading');
        uploadBtn.innerHTML = originalContent;
        uploadBtn.disabled = false;
        showAlert('Failed to upload post. Please try again.', 'error');
    }
}


function setupAutoSave() {
    const inputs = ['themeInput', 'contextInput'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', debounce(() => {
                saveFormState();
            }, 1000));
        }
    });
    
    
    loadFormState();
}

function saveFormState() {
    const formData = {
        theme: document.getElementById('themeInput').value,
        context: document.getElementById('contextInput').value,
        tone: document.getElementById('toneSelect').value,
        length: document.getElementById('lengthSelect').value,
        platform: document.querySelector('.platform-option.active').dataset.platform
    };
    
    localStorage.setItem('workspaceFormData', JSON.stringify(formData));
}

function loadFormState() {
    const savedData = localStorage.getItem('workspaceFormData');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            if (formData.theme) document.getElementById('themeInput').value = formData.theme;
            if (formData.context) document.getElementById('contextInput').value = formData.context;
            if (formData.tone) document.getElementById('toneSelect').value = formData.tone;
            if (formData.length) document.getElementById('lengthSelect').value = formData.length;
            
            if (formData.platform) {
                document.querySelectorAll('.platform-option').forEach(opt => opt.classList.remove('active'));
                const platformOption = document.querySelector(`[data-platform="${formData.platform}"]`);
                if (platformOption) platformOption.classList.add('active');
            }
        } catch (error) {
            console.error('Error loading form state:', error);
        }
    }
}


function updatePreviewPlatform(platform) {
    
    const preview = document.getElementById('postPreview');
    preview.className = `post-preview ${platform}-preview`;
}

function showAlert(message, type = 'info') {
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}