const API_BASE = '/api';

let currentPage = 1;
let currentFilters = {};
let currentEditId = null;

async function fetchJSON(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
}

async function fetchFormData(url, formData) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
}

function showError(element, message) {
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
  }
}

function hideError(element) {
  if (element) element.style.display = 'none';
}

function setLoading(button, loading) {
  if (!button) return;
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span>';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    z-index: 2000;
    animation: slideIn 0.3s ease;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

/* Sidebar */
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
  }
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }
  
  const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (collapsed && window.innerWidth > 992) {
    sidebar.classList.add('collapsed');
  }
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (window.innerWidth <= 992) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      }
    });
  });
}

/* Auth */
async function checkAuth() {
  try {
    const data = await fetchJSON(`${API_BASE}/auth/me`);
    return data.admin;
  } catch (err) {
    return null;
  }
}

async function login(email, password) {
  const data = await fetchJSON(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return data;
}

async function logout() {
  await fetchJSON(`${API_BASE}/auth/logout`, { method: 'POST' });
  window.location.href = '/admin/login.html';
}

/* Modal */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
  
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('active');
    });
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
  });
}

/* File Upload */
function initFileUpload(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const uploadArea = input?.parentElement;
  
  if (!input || !preview) return;
  
  uploadArea.addEventListener('click', () => input.click());
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      handleFileSelect(input, preview);
    }
  });
  
  input.addEventListener('change', () => handleFileSelect(input, preview));
}

function handleFileSelect(input, preview) {
  const file = input.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', 'error');
    input.value = '';
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    showToast('File size must be less than 5MB', 'error');
    input.value = '';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = `
      <div class="file-preview-item">
        <img src="${e.target.result}" alt="Preview">
        <button type="button" class="file-preview-remove" onclick="removeFilePreview('${input.id}', '${preview.id}')">&times;</button>
      </div>
    `;
  };
  reader.readAsDataURL(file);
}

function removeFilePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (input) input.value = '';
  if (preview) preview.innerHTML = '';
}

/* Form Validation */
function validateForm(form) {
  let isValid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) {
      group.classList.add('error');
      isValid = false;
    } else {
      group.classList.remove('error');
    }
    
    if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        group.classList.add('error');
        isValid = false;
      }
    }
  });
  return isValid;
}

function serializeForm(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (value instanceof File) return;
    data[key] = value;
  });
  return data;
}

/* Pagination */
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }
  
  let html = '';
  
  html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>`;
  
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  
  if (start > 1) {
    html += `<button class="pagination-btn" data-page="1">1</button>`;
    if (start > 2) html += `<span class="pagination-btn" style="border:none;background:none;cursor:default;">...</span>`;
  }
  
  for (let i = start; i <= end; i++) {
    html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  
  if (end < totalPages) {
    if (end < totalPages - 1) html += `<span class="pagination-btn" style="border:none;background:none;cursor:default;">...</span>`;
    html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
  }
  
  html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>`;
  
  container.innerHTML = html;
  
  container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page);
      if (page !== currentPage) onPageChange(page);
    });
  });
}

/* Delete Confirmation */
let deleteCallback = null;
let deleteItemId = null;

function confirmDelete(id, callback) {
  deleteItemId = id;
  deleteCallback = callback;
  openModal('delete-modal');
}

function executeDelete() {
  if (deleteCallback && deleteItemId) {
    deleteCallback(deleteItemId);
  }
  closeModal('delete-modal');
  deleteCallback = null;
  deleteItemId = null;
}

/* Initialize on DOM Ready */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initModals();
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  `;
  document.head.appendChild(style);
});

/* Export for use in admin pages */
window.AdminUtils = {
  fetchJSON,
  fetchFormData,
  showToast,
  formatDate,
  escapeHtml,
  debounce,
  validateForm,
  serializeForm,
  renderPagination,
  confirmDelete,
  executeDelete,
  openModal,
  closeModal,
  initFileUpload,
  handleFileSelect,
  removeFilePreview,
  setLoading
};