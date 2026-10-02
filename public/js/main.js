const API_BASE = '/api';

let schoolSettings = {};
let heroSlides = [];
let currentSlide = 0;
let slideInterval = null;

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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadSettings() {
  try {
    const data = await fetchJSON(`${API_BASE}/settings/public`);
    schoolSettings = data.settings || {};
    applySettings();
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

function applySettings() {
  document.title = `${schoolSettings.schoolName || 'Chand Mia High School'} | Nesarabad, Pirojpur`;
  
  const logoElements = document.querySelectorAll('.logo-image, .footer-logo');
  logoElements.forEach(el => {
    if (schoolSettings.logo) el.src = schoolSettings.logo;
  });
  
  const titleElements = document.querySelectorAll('.logo-title, .footer-title-main');
  titleElements.forEach(el => {
    el.textContent = schoolSettings.schoolName || 'Chand Mia High School';
  });
  
  const subtitleElements = document.querySelectorAll('.logo-subtitle');
  subtitleElements.forEach(el => {
    el.textContent = schoolSettings.schoolAddress || 'Nesarabad, Pirojpur, Bangladesh';
  });
  
  const descElements = document.querySelectorAll('[data-setting="description"]');
  descElements.forEach(el => {
    el.textContent = schoolSettings.schoolDescription || '';
  });
  
  const aboutElements = document.querySelectorAll('[data-setting="about"]');
  aboutElements.forEach(el => {
    el.textContent = schoolSettings.aboutSchool || '';
  });
  
  const missionElements = document.querySelectorAll('[data-setting="mission"]');
  missionElements.forEach(el => {
    el.textContent = schoolSettings.mission || '';
  });
  
  const visionElements = document.querySelectorAll('[data-setting="vision"]');
  visionElements.forEach(el => {
    el.textContent = schoolSettings.vision || '';
  });
  
  const mottoElements = document.querySelectorAll('[data-setting="motto"]');
  mottoElements.forEach(el => {
    el.textContent = schoolSettings.schoolMotto || '';
  });
  
  const phoneElements = document.querySelectorAll('[data-setting="phone"]');
  phoneElements.forEach(el => {
    el.textContent = schoolSettings.schoolPhone || '';
    if (el.tagName === 'A') el.href = `tel:${schoolSettings.schoolPhone || ''}`;
  });
  
  const emailElements = document.querySelectorAll('[data-setting="email"]');
  emailElements.forEach(el => {
    el.textContent = schoolSettings.schoolEmail || '';
    if (el.tagName === 'A') el.href = `mailto:${schoolSettings.schoolEmail || ''}`;
  });
  
  const addressElements = document.querySelectorAll('[data-setting="address"]');
  addressElements.forEach(el => {
    el.textContent = schoolSettings.schoolAddress || '';
  });
  
  const principalNameElements = document.querySelectorAll('[data-setting="principalName"]');
  principalNameElements.forEach(el => {
    el.textContent = schoolSettings.principalName || '';
  });
  
  const principalPhoneElements = document.querySelectorAll('[data-setting="principalPhone"]');
  principalPhoneElements.forEach(el => {
    el.textContent = schoolSettings.principalPhone || '';
  });
  
  const admissionEmailElements = document.querySelectorAll('[data-setting="admissionEmail"]');
  admissionEmailElements.forEach(el => {
    el.textContent = schoolSettings.admissionEmail || '';
    if (el.tagName === 'A') el.href = `mailto:${schoolSettings.admissionEmail || ''}`;
  });
  
  const socialLinks = {
    facebook: schoolSettings.facebookUrl,
    youtube: schoolSettings.youtubeUrl,
    instagram: schoolSettings.instagramUrl,
    linkedin: schoolSettings.linkedinUrl
  };
  
  Object.entries(socialLinks).forEach(([platform, url]) => {
    const elements = document.querySelectorAll(`[data-social="${platform}"]`);
    elements.forEach(el => {
      if (url) {
        el.href = url;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  });
  
  if (schoolSettings.favicon) {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = schoolSettings.favicon;
  }
}

async function loadHeroSlides() {
  try {
    const data = await fetchJSON(`${API_BASE}/hero/public`);
    heroSlides = data.slides || [];
    renderHero();
    if (heroSlides.length > 1) startHeroSlider();
  } catch (err) {
    console.error('Failed to load hero slides:', err);
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.innerHTML = `
        <div class="hero-content">
          <div class="container">
            <span class="hero-badge">Chand Mia High School</span>
            <h1 class="hero-title">Chand Mia High School</h1>
            <p class="hero-subtitle">Nesarabad, Pirojpur</p>
            <p class="hero-description">A school where students study, take part in activities, and prepare for the next stage of their education.</p>
            <div class="hero-actions">
              <a href="/about.html" class="btn btn-lg hero-btn">Learn More</a>
              <a href="/admissions.html" class="btn btn-lg hero-btn-outline">Admissions</a>
            </div>
          </div>
        </div>
      `;
    }
  }
}

function renderHero() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;
  
  if (heroSlides.length === 0) return;
  
  const slidesHtml = heroSlides.map((slide, index) => `
    <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
      ${slide.image ? `<img src="${slide.image}" alt="${slide.title}" class="hero-slide-image">` : ''}
      <div class="hero-slide-overlay"></div>
    </div>
  `).join('');
  
  const dotsHtml = heroSlides.map((_, index) => `
    <button class="hero-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Slide ${index + 1}"></button>
  `).join('');
  
  const firstSlide = heroSlides[0];
  
  heroSection.innerHTML = `
    <div class="hero-slides">${slidesHtml}</div>
    <div class="hero-content">
      <div class="container">
        <span class="hero-badge">${firstSlide.subtitle || ''}</span>
        <h1 class="hero-title">${firstSlide.title}</h1>
        ${firstSlide.description ? `<p class="hero-description">${firstSlide.description}</p>` : ''}
        <div class="hero-actions">
          ${firstSlide.buttonText && firstSlide.buttonLink ? `
            <a href="${firstSlide.buttonLink}" class="btn btn-lg hero-btn">${firstSlide.buttonText}</a>
          ` : ''}
          <a href="/admissions.html" class="btn btn-lg hero-btn-outline">Admissions</a>
        </div>
      </div>
    </div>
    ${heroSlides.length > 1 ? `
      <div class="hero-controls" role="tablist" aria-label="Hero slides">
        ${dotsHtml}
      </div>
      <button class="hero-arrow prev" aria-label="Previous slide" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="hero-arrow next" aria-label="Next slide" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    ` : ''}
  `;
  
  attachHeroEvents();
}

function attachHeroEvents() {
  const dots = document.querySelectorAll('.hero-dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
  });
  
  const prevBtn = document.querySelector('.hero-arrow.prev');
  const nextBtn = document.querySelector('.hero-arrow.next');
  
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopHeroSlider);
    heroSection.addEventListener('mouseleave', startHeroSlider);
  }
}

function goToSlide(index) {
  if (index < 0) index = heroSlides.length - 1;
  if (index >= heroSlides.length) index = 0;
  
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const heroContent = document.querySelector('.hero-content .container');
  
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
  
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
  
  if (heroContent && heroSlides[index]) {
    const slide = heroSlides[index];
    heroContent.innerHTML = `
      <span class="hero-badge">${slide.subtitle || ''}</span>
      <h1 class="hero-title">${slide.title}</h1>
      ${slide.description ? `<p class="hero-description">${slide.description}</p>` : ''}
      <div class="hero-actions">
        ${slide.buttonText && slide.buttonLink ? `
          <a href="${slide.buttonLink}" class="btn btn-lg hero-btn">${slide.buttonText}</a>
        ` : ''}
        <a href="/admissions.html" class="btn btn-lg hero-btn-outline">Admissions</a>
      </div>
    `;
  }
  
  currentSlide = index;
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function startHeroSlider() {
  stopHeroSlider();
  if (heroSlides.length <= 1) return;
  slideInterval = setInterval(nextSlide, 5000);
}

function stopHeroSlider() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

async function loadStatistics() {
  try {
    const data = await fetchJSON(`${API_BASE}/statistics/public`);
    renderStatistics(data.statistics || []);
  } catch (err) {
    console.error('Failed to load statistics:', err);
  }
}

function renderStatistics(stats) {
  const container = document.querySelector('.stats-grid');
  if (!container) return;
  
  if (stats.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No statistics available</p></div>';
    return;
  }
  
  container.innerHTML = stats.map(stat => `
    <div class="stat-card">
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${stat.label}</div>
    </div>
  `).join('');
}

async function loadAbout() {
  const aboutSection = document.querySelector('#about');
  if (!aboutSection) return;
  
  try {
    const [aboutData, statsData] = await Promise.all([
      fetchJSON(`${API_BASE}/settings/public`),
      fetchJSON(`${API_BASE}/statistics/public`)
    ]);
    
    const aboutText = document.querySelector('[data-setting="about"]');
    if (aboutText) {
      aboutText.textContent = aboutData.settings.aboutSchool || '';
    }
    
    const missionText = document.querySelector('[data-setting="mission"]');
    if (missionText) {
      missionText.textContent = aboutData.settings.mission || '';
    }
    
    const visionText = document.querySelector('[data-setting="vision"]');
    if (visionText) {
      visionText.textContent = aboutData.settings.vision || '';
    }
  } catch (err) {
    console.error('Failed to load about:', err);
  }
}

async function loadAcademics() {
  const container = document.querySelector('.academics-grid');
  if (!container) return;
  
  try {
    const data = await fetchJSON(`${API_BASE}/academics/public`);
    const academics = data.academics || [];
    
    if (academics.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No academic programs available</p></div>';
      return;
    }
    
    const icons = {
      'Science': '🔬',
      'Mathematics': '📐',
      'English': '📚',
      'Bangla': '📖',
      'ICT': '💻',
      'Social Science': '🌍',
      'Commerce': '💼',
      'Arts': '🎨'
    };
    
    container.innerHTML = academics.map(academic => `
      <article class="academic-card">
        <div class="academic-icon">${icons[academic.subject] || '📝'}</div>
        <h3>${academic.subject}</h3>
        <p>${academic.description || ''}</p>
        ${academic.teacher ? `<p class="academic-teacher">${academic.teacher}</p>` : ''}
      </article>
    `).join('');
  } catch (err) {
    console.error('Failed to load academics:', err);
    container.innerHTML = '<div class="empty-state"><p>Failed to load academics</p></div>';
  }
}

async function loadTopStudents() {
  const container = document.querySelector('.students-grid');
  if (!container) return;
  
  try {
    const data = await fetchJSON(`${API_BASE}/students/homepage/top`);
    const students = data.students || [];
    
    if (students.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No top students to display</p></div>';
      return;
    }
    
    container.innerHTML = students.map(student => `
      <article class="student-card">
        ${student.photo ? `
          <img src="${student.photo}" alt="${student.name}" class="student-photo">
        ` : `
          <div class="student-photo" style="display:flex;align-items:center;justify-content:center;background:var(--color-light-gray);color:var(--color-medium-gray);">👤</div>
        `}
        <div class="student-info">
          <h3 class="student-name">${student.name}</h3>
          <p class="student-class">${student.class} ${student.section ? `• Section ${student.section}` : ''}</p>
          <p class="student-achievement">${student.achievement || student.role}</p>
          ${student.gpa ? `<span class="student-gpa">GPA ${student.gpa}</span>` : ''}
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('Failed to load top students:', err);
    container.innerHTML = '<div class="empty-state"><p>Failed to load students</p></div>';
  }
}

async function loadTeachers() {
  const container = document.querySelector('.teachers-grid');
  if (!container) return;
  
  try {
    const data = await fetchJSON(`${API_BASE}/teachers/public`);
    const teachers = data.teachers || [];
    
    if (teachers.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No teachers to display</p></div>';
      return;
    }
    
    container.innerHTML = teachers.map(teacher => `
      <article class="teacher-card">
        ${teacher.photo ? `
          <img src="${teacher.photo}" alt="${teacher.name}" class="teacher-photo">
        ` : `
          <div class="teacher-photo" style="display:flex;align-items:center;justify-content:center;background:var(--color-light-gray);color:var(--color-medium-gray);">👨‍🏫</div>
        `}
        <div class="teacher-info">
          <h3 class="teacher-name">${teacher.name}</h3>
          <p class="teacher-designation">${teacher.designation}</p>
          <p class="teacher-subject">${teacher.subject}</p>
          ${teacher.qualification ? `<p class="teacher-qualification">${teacher.qualification}</p>` : ''}
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('Failed to load teachers:', err);
    container.innerHTML = '<div class="empty-state"><p>Failed to load teachers</p></div>';
  }
}

async function loadAchievements() {
  const container = document.querySelector('.achievements-grid');
  const filterContainer = document.querySelector('.achievements-filter');
  if (!container) return;
  
  try {
    const data = await fetchJSON(`${API_BASE}/achievements/public`);
    const achievements = data.achievements || [];
    const categories = data.categories || [];
    
    if (filterContainer) {
      filterContainer.innerHTML = `
        <button class="filter-btn active" data-category="all">All</button>
        ${categories.map(cat => `
          <button class="filter-btn" data-category="${cat}">${cat}</button>
        `).join('')}
      `;
      
      filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filterAchievements(btn.dataset.category, achievements);
        });
      });
    }
    
    renderAchievements(achievements);
  } catch (err) {
    console.error('Failed to load achievements:', err);
    container.innerHTML = '<div class="empty-state"><p>Failed to load achievements</p></div>';
  }
}

function filterAchievements(category, achievements) {
  const container = document.querySelector('.achievements-grid');
  if (!container) return;
  
  const filtered = category === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === category);
  
  renderAchievements(filtered);
}

function renderAchievements(achievements) {
  const container = document.querySelector('.achievements-grid');
  if (!container) return;
  
  if (achievements.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No achievements to display</p></div>';
    return;
  }
  
  container.innerHTML = achievements.map(achievement => `
    <article class="achievement-card">
      ${achievement.image ? `
        <img src="${achievement.image}" alt="${achievement.title}" class="achievement-image">
      ` : ''}
      <div class="achievement-body">
        <div class="achievement-meta">
          <span class="achievement-year">${achievement.year}</span>
          <span class="badge badge-primary achievement-category">${achievement.category}</span>
        </div>
        <h3 class="achievement-title">${achievement.title}</h3>
        <p class="achievement-description">${achievement.description || ''}</p>
      </div>
    </article>
  `).join('');
}

async function loadActivities() {
  const container = document.querySelector('.activities-grid');
  if (!container) return;
  
  try {
    const data = await fetchJSON(`${API_BASE}/activities/public`);
    const activities = data.activities || [];
    
    if (activities.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No activities to display</p></div>';
      return;
    }
    
    container.innerHTML = activities.map(activity => `
      <article class="activity-card">
        ${activity.image ? `
          <img src="${activity.image}" alt="${activity.title}" class="activity-image">
        ` : ''}
        <div class="activity-body">
          <h3 class="activity-title">${activity.title}</h3>
          <p class="activity-description">${activity.description || ''}</p>
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('Failed to load activities:', err);
    container.innerHTML = '<div class="empty-state"><p>Failed to load activities</p></div>';
  }
}

async function loadGallery() {
  const container = document.querySelector('.gallery-grid');
  const filterContainer = document.querySelector('.gallery-filter');
  if (!container) return;
  
  try {
    const data = await fetchJSON(`${API_BASE}/gallery/public`);
    const images = data.images || [];
    const categories = data.categories || [];
    
    if (filterContainer) {
      filterContainer.innerHTML = `
        <button class="filter-btn active" data-category="all">All</button>
        ${categories.map(cat => `
          <button class="filter-btn" data-category="${cat}">${cat}</button>
        `).join('')}
      `;
      
      filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filterGallery(btn.dataset.category, images);
        });
      });
    }
    
    renderGallery(images);
    initLightbox(images);
  } catch (err) {
    console.error('Failed to load gallery:', err);
    container.innerHTML = '<div class="empty-state"><p>Failed to load gallery</p></div>';
  }
}

function filterGallery(category, images) {
  const container = document.querySelector('.gallery-grid');
  if (!container) return;
  
  const filtered = category === 'all' 
    ? images 
    : images.filter(img => img.category === category);
  
  renderGallery(filtered);
}

function renderGallery(images) {
  const container = document.querySelector('.gallery-grid');
  if (!container) return;
  
  if (images.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No images in gallery</p></div>';
    return;
  }
  
  container.innerHTML = images.map((image, index) => `
    <div class="gallery-item" data-index="${index}" tabindex="0" role="button" aria-label="${image.title}">
      <img src="${image.url}" alt="${image.title}" class="gallery-image" loading="lazy">
      <div class="gallery-overlay">
        <h4 class="gallery-title">${image.title}</h4>
        <span class="gallery-category">${image.category}</span>
      </div>
    </div>
  `).join('');
}

function initLightbox(images) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  
  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxCategory = lightbox.querySelector('.lightbox-category');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  
  let currentIndex = 0;
  let currentImages = images;
  
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index), images));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(parseInt(item.dataset.index), images);
      }
    });
  });
  
  function openLightbox(index, imgs) {
    currentIndex = index;
    currentImages = imgs;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  function updateLightbox() {
    const img = currentImages[currentIndex];
    lightboxImage.src = img.url;
    lightboxImage.alt = img.title;
    lightboxTitle.textContent = img.title;
    lightboxCategory.textContent = img.category;
  }
  
  function showPrev() {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateLightbox();
  }
  
  function showNext() {
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateLightbox();
  }
  
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}

async function loadAdmissionGrades() {
  const container = document.querySelector('.admission-grades');
  if (!container) return;
  
  try {
    const data = await fetchJSON(`${API_BASE}/admission-grades/public`);
    const grades = data.grades || [];
    
    if (grades.length === 0) {
      container.innerHTML = '<p>No admission grades configured</p>';
      return;
    }
    
    container.innerHTML = grades.map(grade => `
      <span class="grade-badge">${grade.grade}</span>
    `).join('');
  } catch (err) {
    console.error('Failed to load admission grades:', err);
  }
}

async function loadContact() {
  try {
    await loadSettings();
  } catch (err) {
    console.error('Failed to load contact:', err);
  }
}

function initAdmissionForm() {
  const form = document.getElementById('admission-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const successDiv = document.getElementById('form-success');
    const errorDiv = document.getElementById('form-error');
    
    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      grade: form.grade.value,
      message: form.message.value.trim()
    };
    
    let hasError = false;
    
    form.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
    
    if (!formData.name) {
      showError(form.querySelector('#name-error'), 'Name is required');
      form.name.closest('.form-group').classList.add('error');
      hasError = true;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError(form.querySelector('#email-error'), 'Valid email is required');
      form.email.closest('.form-group').classList.add('error');
      hasError = true;
    }
    
    if (!formData.phone) {
      showError(form.querySelector('#phone-error'), 'Phone is required');
      form.phone.closest('.form-group').classList.add('error');
      hasError = true;
    }
    
    if (!formData.grade) {
      showError(form.querySelector('#grade-error'), 'Grade is required');
      form.grade.closest('.form-group').classList.add('error');
      hasError = true;
    }
    
    if (hasError) return;
    
    setLoading(submitBtn, true);
    hideError(errorDiv);
    successDiv.style.display = 'none';
    
    try {
      await fetchJSON(`${API_BASE}/inquiries`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      form.reset();
      successDiv.style.display = 'block';
      successDiv.innerHTML = `
        <div class="form-success-icon">✓</div>
        <h3>Inquiry Submitted</h3>
        <p>Thank you for your interest. We will contact you soon.</p>
      `;
    } catch (err) {
      errorDiv.textContent = err.message || 'Failed to submit inquiry. Please try again.';
      errorDiv.style.display = 'block';
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.main-nav');
  
  if (!menuBtn || !nav) return;
  
  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    menuBtn.querySelectorAll('span').forEach((span, i) => {
      if (isOpen) {
        if (i === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
        if (i === 1) span.style.opacity = '0';
        if (i === 2) span.style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        span.style.transform = '';
        span.style.opacity = '';
      }
    });
  });
  
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.querySelectorAll('span').forEach(span => {
        span.style.transform = '';
        span.style.opacity = '';
      });
    });
  });
  
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.querySelectorAll('span').forEach(span => {
        span.style.transform = '';
        span.style.opacity = '';
      });
    }
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
}

function initCircularLogo() {
  const rings = document.querySelectorAll('.circular-logo-ring');
  rings.forEach(ring => {
    const text = ring.querySelector('::before');
    if (text && schoolSettings.schoolName) {
      ring.style.setProperty('--logo-text', `"${schoolSettings.schoolName.toUpperCase()} • ${schoolSettings.schoolAddress?.split(',')[0]?.toUpperCase() || 'NESARABAD'} •"`);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initMobileMenu();
  initHeaderScroll();
  await loadSettings();
  initCircularLogo();
  
  const page = document.body.dataset.page;
  
  switch (page) {
    case 'home':
      await loadHeroSlides();
      await loadStatistics();
      await loadTopStudents();
      await loadTeachers();
      await loadAchievements();
      await loadActivities();
      await loadGallery();
      break;
    case 'about':
      await loadAbout();
      await loadStatistics();
      break;
    case 'academics':
      await loadAcademics();
      break;
    case 'students':
      await loadTopStudents();
      break;
    case 'teachers':
      await loadTeachers();
      break;
    case 'achievements':
      await loadAchievements();
      break;
    case 'activities':
      await loadActivities();
      break;
    case 'gallery':
      await loadGallery();
      break;
    case 'admissions':
      await loadAdmissionGrades();
      initAdmissionForm();
      break;
    case 'contact':
      await loadContact();
      break;
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchJSON, loadSettings, loadHeroSlides };
}