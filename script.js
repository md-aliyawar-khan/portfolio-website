// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all features
  initLoadingScreen();
  initThemeToggle();
  initParticles();
  initGSAPAnimations();
  initTypingAnimation();
  initSmoothScrolling();
  initScrollAnimations();
  initBackToTop();
  initProjectFilters();
  initProjectModal();
  initPlaceholderLinks();
  initContactForm();
  initSkillBars();
  initStatsCounter();
  initMobileMenu();
  initAOS();
  
  // Update footer year
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Performance monitoring
  initPerformanceMonitoring();

  // Language switcher
  const langEnBtn = document.getElementById('lang-en');
  const langFrBtn = document.getElementById('lang-fr');
  if (langEnBtn && langFrBtn) {
    langEnBtn.onclick = () => setLanguage('en');
    langFrBtn.onclick = () => setLanguage('fr');
  }
  // Set language on load
  const savedLang = localStorage.getItem('lang') || 'en';
  setLanguage(savedLang);
});

// Loading Screen with Better Performance
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  
  // Check if page is already loaded
  if (document.readyState === 'complete') {
    hideLoadingScreen();
  } else {
    // Listen for page load completion
    window.addEventListener('load', hideLoadingScreen);
    
    // Fallback: hide after 3 seconds max
    setTimeout(hideLoadingScreen, 3000);
  }
  
  function hideLoadingScreen() {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// Theme Toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  const body = document.body;
  const icon = themeToggle.querySelector('i');
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle-btn i');
  icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// Particle System with Error Handling
function initParticles() {
  try {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#00BFA6'
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          }
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#00BFA6',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 6,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'repulse'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 400,
            line_linked: {
              opacity: 1
            }
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3
          },
          repulse: {
            distance: 200,
            duration: 0.4
          },
          push: {
            particles_nb: 4
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: true
    });
  } else {
    console.warn('Particles.js not loaded. Particle background will not be displayed.');
  }
  } catch (error) {
    console.error('Error initializing particles:', error);
  }
}

// GSAP Animations with Error Handling
function initGSAPAnimations() {
  try {
    if (typeof gsap !== 'undefined') {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero section animations
    gsap.from('.hero-content h1', {
      duration: 1,
      y: 50,
      opacity: 0,
      ease: 'power3.out'
    });
    
    gsap.from('.hero-subtitle', {
      duration: 1,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.3
    });
    
    gsap.from('.hero-description', {
      duration: 1,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.6
    });
    
    gsap.from('.hero-buttons', {
      duration: 1,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.9
    });
    
    // Scroll-triggered animations
    gsap.from('.section-title', {
      scrollTrigger: {
        trigger: '.section-title',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      },
      duration: 1,
      y: 30,
      opacity: 0,
      ease: 'power3.out'
    });
    
    // Project cards animation
    gsap.from('.project-card', {
      scrollTrigger: {
        trigger: '.project-grid',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      },
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out'
    });
    
    // Skills animation
    gsap.from('.skill-progress', {
      scrollTrigger: {
        trigger: '.skills-category',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      },
      duration: 2,
      width: 0,
      ease: 'power2.out',
      stagger: 0.1
    });
  } else {
    console.warn('GSAP not loaded. Animations will be disabled.');
  }
  } catch (error) {
    console.error('Error initializing GSAP animations:', error);
  }
}

// Typing Animation
function initTypingAnimation() {
  const typingElement = document.querySelector('.typing');
  if (!typingElement) return;
  
  const text = "Mohammad Aliyawar Khan";
  let index = 0;
  
  function type() {
    if (index < text.length) {
      typingElement.textContent += text.charAt(index);
      index++;
      setTimeout(type, 100);
    }
  }
  
  // Start typing after a delay
  setTimeout(type, 1000);
}

// Smooth Scrolling
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Scroll Animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  // Observe elements with animation classes
  document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach(el => {
    observer.observe(el);
  });
}

// Back to Top Button
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Project Filters
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectGrid = document.querySelector('.project-grid');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectGrid || !projectCards.length) {
    return;
  }

  function visibleCards() {
    return Array.from(projectCards).filter((card) => !card.classList.contains('hidden'));
  }

  function updateSingleCardClass() {
    projectGrid.classList.toggle('single-card', visibleCards().length === 1);
  }

  function showCard(card, animated = true) {
    card.classList.remove('hidden');
    card.style.display = '';

    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(card);
      if (animated) {
        gsap.to(card, {
          duration: 0.35,
          opacity: 1,
          y: 0,
          ease: 'power2.out'
        });
      } else {
        gsap.set(card, { opacity: 1, y: 0 });
      }
    } else {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }
  }

  function hideCard(card) {
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(card);
      gsap.to(card, {
        duration: 0.2,
        opacity: 0,
        y: 16,
        ease: 'power2.out',
        onComplete: () => {
          card.classList.add('hidden');
        }
      });
    } else {
      card.classList.add('hidden');
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
    }
  }

  function applyFilter(filter, animated = true) {
    filterBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });

    projectGrid.classList.toggle('filtered', filter !== 'all');

    projectCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        showCard(card, animated);
      } else {
        hideCard(card);
      }
    });

    updateSingleCardClass();
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyFilter(btn.getAttribute('data-filter'), true);
    });
  });

  applyFilter('all', false);
}

function renderProjectAction(url, type, label, iconClass) {
  if (!url) {
    return       `
      <button class="btn btn-secondary btn-disabled" type="button" disabled aria-disabled="true">
        <i class="${iconClass}"></i> ${label}
      </button>
    `;
  }

  return     `
    <a href="${url}" class="btn ${type === 'github' ? 'btn-primary' : 'btn-secondary'}" target="_blank" rel="noopener noreferrer">
      <i class="${iconClass}"></i> ${label}
    </a>
  `;
}

// Project Modal
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const modalContent = modal.querySelector('.modal-body');
  const closeBtn = modal.querySelector('.close');
  const projectLinks = document.querySelectorAll('.project-link[data-project]');
  
  const projectData = {
    elasticsearch: {
      title: 'Elasticsearch: Distributed Systems',
      description: 'A comprehensive evaluation of Elasticsearch\'s distributed systems capabilities, focusing on sharding, replication, and fault tolerance mechanisms.',
      details: [
        'Implemented and tested various sharding strategies to optimize query performance',
        'Achieved 30% improvement in query response times through proper index optimization',
        'Ensured 100% data availability during node failures through proper replication setup',
        'Conducted performance benchmarking under different load conditions'
      ],
      technologies: ['Elasticsearch', 'Docker', 'Python', 'Kibana'],
      image: 'Assets/elasticsearch.jpeg',
      github: null,
      live: null
    },
    deepmed: {
      title: 'DeepMed Detection - Medical Image Analysis',
      description: 'Advanced deep learning system for medical image interpretation and analysis, achieving high precision in medical diagnosis.',
      details: [
        'Developed CNN-based models for medical image classification',
        'Implemented image segmentation algorithms for accurate structure recognition',
        'Achieved 95% accuracy in medical image interpretation',
        'Integrated with medical imaging workflows for real-time analysis'
      ],
      technologies: ['TensorFlow', 'PyTorch', 'OpenCV', 'NumPy'],
      image: 'Assets/deepmed.jpg',
      github: null,
      live: null
    },
    fraud: {
      title: 'Fraud Detection System',
      description: 'Machine learning-based fraud detection system for financial transactions with real-time processing capabilities.',
      details: [
        'Built RandomForest classifier for fraudulent transaction detection',
        'Implemented SMOTE for handling imbalanced datasets',
        'Deployed Flask API for real-time fraud detection',
        'Integrated with Heroku for cloud deployment and scalability'
      ],
      technologies: ['Python', 'Flask', 'Heroku', 'RandomForest', 'SMOTE'],
      image: 'Assets/fraud.jpg',
      github: null,
      live: null
    },
    codis: {
      title: 'CODIS: Coding Society Website',
      description: 'Full-stack web application for coding enthusiasts, featuring user registration, content management, and community features.',
      details: [
        'Developed responsive frontend using React.js with modern UI/UX',
        'Built RESTful API backend using Node.js and Express',
        'Implemented user authentication and authorization system',
        'Created admin dashboard for content management'
      ],
      technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
      image: 'Assets/codis.png',
      github: null,
      live: null
    }
  };
  
  projectLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const projectKey = link.getAttribute('data-project');
      const project = projectData[projectKey];
      
      if (project) {
        modalContent.innerHTML = `
          <div class="modal-project">
            <div class="modal-image">
              <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="modal-info">
              <h2>${project.title}</h2>
              <p class="modal-description">${project.description}</p>
              <div class="modal-details">
                <h3>Key Features:</h3>
                <ul>
                  ${project.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
              </div>
              <div class="modal-tech">
                <h3>Technologies Used:</h3>
                <div class="tech-tags">
                  ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
              </div>
              <div class="modal-links">
                ${renderProjectAction(project.github, 'github', 'View Code', 'fab fa-github')}
                ${renderProjectAction(project.live, 'live', 'Live Demo', 'fas fa-external-link-alt')}
              </div>
            </div>
          </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        gsap.from('.modal-content', {
          duration: 0.5,
          scale: 0.8,
          opacity: 0,
          ease: 'power3.out'
        });
      }
    });
  });
  
  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  closeBtn.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });
}

function initPlaceholderLinks() {
  document.querySelectorAll('.pending-link').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const type = link.getAttribute('data-pending');
      const message = type === 'blog-post'
        ? 'This article preview is not published yet. Reach out if you want the write-up or source notes.'
        : 'The project summary is live, but the public code link is not available yet.';
      showNotification(message, 'info');
    });
  });
}

// Contact Form with Enhanced Validation
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearError);
  });
  
  form.addEventListener('submit', handleSubmit);
  
  function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const errorElement = field.parentNode.querySelector('.error-message');
    
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required.';
    }
    
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    }
    
    if (field.hasAttribute('minlength') && value.length < field.getAttribute('minlength')) {
      isValid = false;
      errorMessage = `Minimum ${field.getAttribute('minlength')} characters required.`;
    }
    
    if (field.hasAttribute('maxlength') && value.length > field.getAttribute('maxlength')) {
      isValid = false;
      errorMessage = `Maximum ${field.getAttribute('maxlength')} characters allowed.`;
    }
    
    if (field.hasAttribute('pattern') && value) {
      const pattern = new RegExp(field.getAttribute('pattern'));
      if (!pattern.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid value.';
      }
    }
    
    if (!isValid) {
      field.classList.add('error');
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    } else {
      field.classList.remove('error');
      errorElement.style.display = 'none';
    }
    
    return isValid;
  }
  
  function clearError(e) {
    const field = e.target;
    const errorElement = field.parentNode.querySelector('.error-message');
    field.classList.remove('error');
    errorElement.style.display = 'none';
  }
  
  function validateForm() {
    let isValid = true;
    inputs.forEach(input => {
      if (!validateField({ target: input })) {
        isValid = false;
      }
    });
    return isValid;
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-block';
    
    try {
      const formData = new FormData(form);

      if (form.action.includes('YOUR_FORM_ID')) {
        const params = new URLSearchParams({
          subject: formData.get('subject') || 'Portfolio inquiry',
          body: `Name: ${formData.get('name') || ''}\nEmail: ${formData.get('email') || ''}\n\n${formData.get('message') || ''}`
        });

        showNotification('Formspree is not configured yet, so your email app will open instead.', 'info');
        window.location.href = `mailto:md.aliyawar.khan@gmail.com?${params.toString()}`;
        return;
      }

      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
        clearAllErrors();
      } else {
        throw new Error('Form submission failed');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      showNotification('Failed to send message. Please try again or email me directly.', 'error');
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline-block';
      btnLoading.style.display = 'none';
    }
  }
  
  function clearAllErrors() {
    const errorElements = form.querySelectorAll('.error-message');
    const errorFields = form.querySelectorAll('.error');
    
    errorElements.forEach(el => el.style.display = 'none');
    errorFields.forEach(field => field.classList.remove('error'));
  }
}

// Skill Bars Animation
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-progress');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progress = entry.target;
        const targetWidth = progress.getAttribute('data-progress') + '%';
        
        gsap.to(progress, {
          duration: 2,
          width: targetWidth,
          ease: 'power2.out'
        });
        
        observer.unobserve(progress);
      }
    });
  }, { threshold: 0.5 });
  
  skillBars.forEach(bar => observer.observe(bar));
}

// Stats Counter
function initStatsCounter() {
  const counters = document.querySelectorAll('.stat-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        
        gsap.to(counter, {
          duration: 2,
          innerHTML: target,
          ease: 'power2.out',
          snap: { innerHTML: 1 }
        });
        
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

// Mobile Menu
function initMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('nav ul');

  if (!mobileMenuBtn || !nav) {
    return;
  }

  const setMenuState = (isOpen) => {
    nav.classList.toggle('active', isOpen);
    mobileMenuBtn.classList.toggle('active', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
  };

  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
      setMenuState(false);
    }
  });
}

// AOS Initialization
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }
}

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Close button
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);
}

// Active Navigation Highlighting
function initActiveNavHighlighting() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// Initialize active nav highlighting
initActiveNavHighlighting();

// Performance optimization: Debounce scroll events
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

// Apply debouncing to scroll events
window.addEventListener('scroll', debounce(() => {
  // Scroll-based animations and updates
}, 10));

function normalizeTranslationText(text) {
  if (typeof text !== 'string') {
    return text;
  }

  try {
    return /�|�|�/.test(text) ? decodeURIComponent(escape(text)) : text;
  } catch (error) {
    return text;
  }
}
// Translation data
const translations = {
  en: {
    nav_about: "About",
    nav_experience: "Experience",
    nav_projects: "Projects",
    nav_skills: "Skills",
    nav_blogs: "Blogs",
    nav_contact: "Contact",
    hero_greeting: "Hi, I am",
    hero_subtitle: "Data Scientist | Machine Learning Engineer",
    hero_description: "Transforming data into insights, building intelligent solutions",
    hero_view_work: "View My Work",
    hero_get_in_touch: "Get In Touch",
    hero_badge: "Open to Data Science and ML Engineering roles",
    hero_highlight_1: "<i class='fas fa-location-dot'></i> Montreal, Canada",
    hero_highlight_2: "<i class='fas fa-graduation-cap'></i> MEng, Concordia University",
    hero_highlight_3: "<i class='fas fa-chart-line'></i> ML, analytics, and full-stack delivery",
    hero_proof_projects: "projects shipped across ML, web, and data systems",
    hero_proof_impact: "query performance improvement in distributed systems work",
    hero_proof_accuracy: "accuracy achieved in medical image analysis research",
    highlights_kicker: "Why teams hire me",
    highlights_title: "Focused on outcomes, not just models",
    highlights_subtitle: "I bridge research, engineering, and communication so projects move from idea to measurable result.",
    highlight_card_1_title: "Applied ML that solves real problems",
    highlight_card_1_desc: "From fraud detection to medical imaging, I build models around business or research goals instead of chasing complexity.",
    highlight_card_2_title: "Strong systems and data foundations",
    highlight_card_2_desc: "I enjoy the engineering side too: search, APIs, distributed systems, dashboards, and the tooling that keeps projects reliable.",
    highlight_card_3_title: "Clear collaboration and delivery",
    highlight_card_3_desc: "I turn technical work into readable reports, usable products, and stakeholder-friendly explanations that help teams move faster.",
    about_title: "About Me",
    about_years_experience: "Years Experience",
    about_projects_completed: "Projects Completed",
    about_technologies: "Technologies",
    about_intro: "I am a passionate <strong>Data Scientist</strong> and <strong>Software Engineer</strong> with a Master in Engineering - Software Engineering from Concordia University, Montreal. I specialize in machine learning, data analysis, and distributed systems, with hands-on experience in building scalable solutions and advanced algorithms.",
    about_expertise_intro: "My expertise includes:",
    about_expertise_1: "<i class='fas fa-check'></i> Developing machine learning models for fraud detection and medical image analysis.",
    about_expertise_2: "<i class='fas fa-check'></i> Optimizing distributed systems like Elasticsearch for big data analytics.",
    about_expertise_3: "<i class='fas fa-check'></i> Building full-stack web applications using React, Node.js, and Flask.",
    about_download_resume: "Download Resume",
    about_lets_talk: "Let's Talk",
    experience_title: "Experience",
    experience_role_1: "Software Engineer Intern",
    experience_date_1: "June 2023 - December 2023",
    experience_company_1: "NIMACT | Ghazipur, UP, India",
    experience_desc_1_1: "Completed advanced training in software development, including HTML, CSS, JavaScript, and C++.",
    experience_desc_1_2: "Collaborated with teams to build database systems for analyzing large datasets using machine learning techniques.",
    experience_desc_1_3: "Created informative reports, dashboards, and visualizations for data-driven decision-making.",
    experience_tag_1_1: "HTML/CSS",
    experience_tag_1_2: "JavaScript",
    experience_tag_1_3: "C++",
    experience_tag_1_4: "Machine Learning",
    projects_title: "Projects",
    projects_filter_all: "All",
    projects_filter_ml: "Machine Learning",
    projects_filter_web: "Web Development",
    projects_filter_data: "Data Science",
    project1_title: "Elasticsearch: Distributed Systems",
    project1_desc: "Evaluated Elasticsearch's distributed systems features, including sharding and fault tolerance. Improved query performance by 30% and ensured 100% data availability during node failures.",
    project1_tech1: "Elasticsearch",
    project1_tech2: "Docker",
    project1_tech3: "Python",
    project2_title: "DeepMed Detection - Medical Image Analysis",
    project2_desc: "Developed deep learning models for medical image interpretation, achieving high precision and recall rates. Implemented image segmentation for accurate structure recognition.",
    project2_tech1: "TensorFlow",
    project2_tech2: "PyTorch",
    project2_tech3: "Computer Vision",
    project3_title: "Fraud Detection System",
    project3_desc: "Built a machine learning system using RandomForest for detecting fraudulent transactions. Deployed the model using Flask API and integrated with Heroku.",
    project3_tech1: "Python",
    project3_tech2: "Flask",
    project3_tech3: "Heroku",
    project3_tech4: "RandomForest",
    project4_title: "CODIS: Coding Society Website",
    project4_desc: "Developed a platform for coding enthusiasts using React and Node.js. Designed user-friendly pages, including registration and contact forms.",
    project4_tech1: "React",
    project4_tech2: "Node.js",
    project4_tech3: "JavaScript",
    skills_title: "Technical Skills",
    skills_languages_title: "<i class='fas fa-code'></i> Languages",
    skills_language_python: "Python",
    skills_language_js: "JavaScript",
    skills_language_cpp: "C++",
    skills_language_java: "Java",
    skills_language_sql: "SQL",
    skills_frameworks_title: "<i class='fas fa-layer-group'></i> Libraries & Frameworks",
    skills_framework_tensorflow: "TensorFlow",
    skills_framework_pytorch: "PyTorch",
    skills_framework_react: "React",
    skills_framework_flask: "Flask",
    skills_framework_node: "Node.js",
    skills_tools_title: "<i class='fas fa-tools'></i> Tools & Platforms",
    skills_tool_git: "Git",
    skills_tool_docker: "Docker",
    skills_tool_aws: "AWS",
    skills_tool_tableau: "Tableau",
    skills_tool_jupyter: "Jupyter",
    blogs_title: "Latest Blog Posts",
    blog1_category: "Distributed Systems",
    blog1_title: "Understanding Distributed Systems",
    blog1_desc: "Learn the fundamentals of distributed systems, including sharding, replication, and fault tolerance.",
    blog1_read_more: "Read More",
    blog2_category: "Machine Learning",
    blog2_title: "Introduction to Machine Learning",
    blog2_desc: "A beginner-friendly guide to machine learning concepts, algorithms, and applications.",
    blog2_read_more: "Read More",
    blog3_category: "Data Visualization",
    blog3_title: "Data Visualization with Python",
    blog3_desc: "Explore data visualization techniques using Python libraries like Matplotlib and Seaborn.",
    blog3_read_more: "Read More",
    contact_title: "Get In Touch",
    contact_subtitle: "Feel free to reach out for collaborations or opportunities!",
    contact_email_label: "Email",
    contact_email_value: "md.aliyawar.khan@gmail.com",
    contact_location_label: "Location",
    contact_location_value: "Montreal, Quebec, Canada",
    contact_phone_label: "Phone",
    contact_phone_value: "+1 (438) 787-0249",
    contact_form_name_label: "Name",
    contact_form_name_placeholder: "Enter your name",
    contact_form_email_label: "Email",
    contact_form_email_placeholder: "Enter your email",
    contact_form_subject_label: "Subject",
    contact_form_subject_placeholder: "Enter the subject",
    contact_form_message_label: "Message",
    contact_form_message_placeholder: "Enter your message",
    contact_form_send: "Send Message",
    contact_social_email: "Email",
    contact_social_linkedin: "LinkedIn",
    contact_social_github: "GitHub",
    contact_social_twitter: "Twitter",
    footer_name: "Mohammad Aliyawar Khan",
    footer_desc: "Data Scientist & Machine Learning Engineer passionate about creating intelligent solutions.",
    footer_quick_links: "Quick Links",
    footer_link_about: "About",
    footer_link_experience: "Experience",
    footer_link_projects: "Projects",
    footer_link_skills: "Skills",
    footer_link_blogs: "Blogs",
    footer_link_contact: "Contact",
    footer_connect: "Connect",
    footer_copyright: "Mohammad Aliyawar Khan. All rights reserved."
  },
  fr: {
    nav_about: "À propos",
    nav_experience: "Expérience",
    nav_projects: "Projets",
    nav_skills: "Compétences",
    nav_blogs: "Blogs",
    nav_contact: "Contact",
    hero_greeting: "Bonjour, je suis",
    hero_subtitle: "Data Scientist | Ingénieur Machine Learning",
    hero_description: "Transformer les données en informations, créer des solutions intelligentes",
    hero_view_work: "Voir mes travaux",
    hero_get_in_touch: "Contactez-moi",
    hero_badge: "Disponible pour des roles en data science et ML",
    hero_highlight_1: "<i class='fas fa-location-dot'></i> Montreal, Canada",
    hero_highlight_2: "<i class='fas fa-graduation-cap'></i> MEng, Universite Concordia",
    hero_highlight_3: "<i class='fas fa-chart-line'></i> ML, analytique et livraison full-stack",
    hero_proof_projects: "projets livres en ML, web et systemes de donnees",
    hero_proof_impact: "amelioration des performances de requete en systemes distribues",
    hero_proof_accuracy: "precision atteinte en recherche d'imagerie medicale",
    highlights_kicker: "Pourquoi les equipes me recrutent",
    highlights_title: "Concentre sur les resultats, pas seulement les modeles",
    highlights_subtitle: "Je relie recherche, ingenierie et communication pour faire avancer un projet jusqu'a un resultat mesurable.",
    highlight_card_1_title: "Du ML applique a des problemes reels",
    highlight_card_1_desc: "De la detection de fraude a l'imagerie medicale, je construis les modeles autour du besoin metier ou recherche.",
    highlight_card_2_title: "Des bases solides en systemes et donnees",
    highlight_card_2_desc: "J'aime aussi l'ingenierie: search, API, systemes distribues, dashboards et outillage fiable.",
    highlight_card_3_title: "Collaboration claire et execution",
    highlight_card_3_desc: "Je transforme le travail technique en rapports lisibles, produits utiles et explications claires pour les parties prenantes.",
    about_title: "À propos de moi",
    about_years_experience: "Années d'expérience",
    about_projects_completed: "Projets réalisés",
    about_technologies: "Technologies",
    about_intro: "Je suis un <strong>Data Scientist</strong> et <strong>Ingénieur Logiciel</strong> passionné, titulaire d'un Master en ingénierie logicielle de l'Université Concordia, Montréal. Je me spécialise en apprentissage automatique, analyse de données et systèmes distribués, avec une expérience pratique dans la création de solutions évolutives et d'algorithmes avancés.",
    about_expertise_intro: "Mon expertise comprend :",
    about_expertise_1: "<i class='fas fa-check'></i> Développement de modèles d'apprentissage automatique pour la détection de fraude et l'analyse d'images médicales.",
    about_expertise_2: "<i class='fas fa-check'></i> Optimisation de systèmes distribués comme Elasticsearch pour l'analyse de big data.",
    about_expertise_3: "<i class='fas fa-check'></i> Création d'applications web full-stack avec React, Node.js et Flask.",
    about_download_resume: "Télécharger le CV",
    about_lets_talk: "Discutons-en",
    experience_title: "Expérience",
    experience_role_1: "Stagiaire Ingénieur Logiciel",
    experience_date_1: "Juin 2023 - Décembre 2023",
    experience_company_1: "NIMACT | Ghazipur, UP, Inde",
    experience_desc_1_1: "Formation avancée en développement logiciel, incluant HTML, CSS, JavaScript et C++.",
    experience_desc_1_2: "Collaboration avec des équipes pour construire des bases de données et analyser de grands ensembles de données avec des techniques de machine learning.",
    experience_desc_1_3: "Création de rapports, tableaux de bord et visualisations pour la prise de décision basée sur les données.",
    experience_tag_1_1: "HTML/CSS",
    experience_tag_1_2: "JavaScript",
    experience_tag_1_3: "C++",
    experience_tag_1_4: "Machine Learning",
    projects_title: "Projets",
    projects_filter_all: "Tous",
    projects_filter_ml: "Machine Learning",
    projects_filter_web: "Développement Web",
    projects_filter_data: "Science des Données",
    project1_title: "Elasticsearch : Systèmes Distribués",
    project1_desc: "Évaluation des fonctionnalités distribuées d'Elasticsearch, y compris le sharding et la tolérance aux pannes. Amélioration des performances de requête de 30% et disponibilité des données assurée à 100% lors des pannes de nœuds.",
    project1_tech1: "Elasticsearch",
    project1_tech2: "Docker",
    project1_tech3: "Python",
    project2_title: "DeepMed Detection - Analyse d'Images Médicales",
    project2_desc: "Développement de modèles de deep learning pour l'interprétation d'images médicales, avec une grande précision. Segmentation d'images pour une reconnaissance précise des structures.",
    project2_tech1: "TensorFlow",
    project2_tech2: "PyTorch",
    project2_tech3: "Vision par Ordinateur",
    project3_title: "Système de Détection de Fraude",
    project3_desc: "Système de machine learning utilisant RandomForest pour détecter les transactions frauduleuses. Déploiement du modèle via une API Flask et intégration sur Heroku.",
    project3_tech1: "Python",
    project3_tech2: "Flask",
    project3_tech3: "Heroku",
    project3_tech4: "RandomForest",
    project4_title: "CODIS : Site de la Société de Codage",
    project4_desc: "Plateforme pour passionnés de codage avec React et Node.js. Pages conviviales, formulaires d'inscription et de contact.",
    project4_tech1: "React",
    project4_tech2: "Node.js",
    project4_tech3: "JavaScript",
    skills_title: "Compétences Techniques",
    skills_languages_title: "<i class='fas fa-code'></i> Langages",
    skills_language_python: "Python",
    skills_language_js: "JavaScript",
    skills_language_cpp: "C++",
    skills_language_java: "Java",
    skills_language_sql: "SQL",
    skills_frameworks_title: "<i class='fas fa-layer-group'></i> Bibliothèques & Frameworks",
    skills_framework_tensorflow: "TensorFlow",
    skills_framework_pytorch: "PyTorch",
    skills_framework_react: "React",
    skills_framework_flask: "Flask",
    skills_framework_node: "Node.js",
    skills_tools_title: "<i class='fas fa-tools'></i> Outils & Plateformes",
    skills_tool_git: "Git",
    skills_tool_docker: "Docker",
    skills_tool_aws: "AWS",
    skills_tool_tableau: "Tableau",
    skills_tool_jupyter: "Jupyter",
    blogs_title: "Derniers Articles de Blog",
    blog1_category: "Systèmes Distribués",
    blog1_title: "Comprendre les Systèmes Distribués",
    blog1_desc: "Découvrez les bases des systèmes distribués : sharding, réplication, tolérance aux pannes.",
    blog1_read_more: "Lire la suite",
    blog2_category: "Machine Learning",
    blog2_title: "Introduction au Machine Learning",
    blog2_desc: "Guide pour débutants sur les concepts, algorithmes et applications du machine learning.",
    blog2_read_more: "Lire la suite",
    blog3_category: "Visualisation de Données",
    blog3_title: "Visualisation de Données avec Python",
    blog3_desc: "Explorez les techniques de visualisation de données avec Matplotlib et Seaborn.",
    blog3_read_more: "Lire la suite",
    contact_title: "Contactez-moi",
    contact_subtitle: "N'hésitez pas à me contacter pour toute collaboration ou opportunité !",
    contact_email_label: "Email",
    contact_email_value: "md.aliyawar.khan@gmail.com",
    contact_location_label: "Localisation",
    contact_location_value: "Montréal, Québec, Canada",
    contact_phone_label: "Téléphone",
    contact_phone_value: "+1 (438) 787-0249",
    contact_form_name_label: "Nom",
    contact_form_name_placeholder: "Entrez votre nom",
    contact_form_email_label: "Email",
    contact_form_email_placeholder: "Entrez votre email",
    contact_form_subject_label: "Sujet",
    contact_form_subject_placeholder: "Entrez le sujet",
    contact_form_message_label: "Message",
    contact_form_message_placeholder: "Entrez votre message",
    contact_form_send: "Envoyer le message",
    contact_social_email: "Email",
    contact_social_linkedin: "LinkedIn",
    contact_social_github: "GitHub",
    contact_social_twitter: "Twitter",
    footer_name: "Mohammad Aliyawar Khan",
    footer_desc: "Data Scientist & Ingénieur Machine Learning passionné par la création de solutions intelligentes.",
    footer_quick_links: "Liens rapides",
    footer_link_about: "À propos",
    footer_link_experience: "Expérience",
    footer_link_projects: "Projets",
    footer_link_skills: "Compétences",
    footer_link_blogs: "Blogues",
    footer_link_contact: "Contact",
    footer_connect: "Réseaux",
    footer_copyright: "Mohammad Aliyawar Khan. Tous droits réservés."
  }
};

// Performance Monitoring
function initPerformanceMonitoring() {
  // Monitor page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
      const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
      
      console.log('Performance Metrics:', {
        'Page Load Time': `${loadTime}ms`,
        'DOM Content Loaded': `${domContentLoaded}ms`,
        'Total Page Load': `${perfData.loadEventEnd - perfData.fetchStart}ms`
      });
      
      // Log slow loading if over 3 seconds
      if (loadTime > 3000) {
        console.warn('Slow page load detected:', loadTime + 'ms');
      }
    }, 0);
  });
  
  // Monitor image loading performance
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('load', () => {
      const loadTime = performance.now();
      if (loadTime > 2000) {
        console.warn('Slow image load:', img.src, loadTime + 'ms');
      }
    });
  });
}

function setLanguage(lang) {
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      const value = normalizeTranslationText(translations[lang][key]);
      if (el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'A' || el.tagName === 'LI' || el.tagName === 'SPAN' || el.tagName === 'BUTTON' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'LABEL') {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      el.setAttribute('placeholder', normalizeTranslationText(translations[lang][key]));
    }
  });

  const langEnBtn = document.getElementById('lang-en');
  const langFrBtn = document.getElementById('lang-fr');
  if (langEnBtn && langFrBtn) {
    langEnBtn.classList.toggle('active', lang === 'en');
    langFrBtn.classList.toggle('active', lang === 'fr');
  }

  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}







