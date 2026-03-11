// Dynamic Content Service for real-time portfolio updates
class DynamicContentService {
  constructor() {
    this.updateIntervals = {};
    this.cache = new Map();
    this.init();
  }

  init() {
    this.setupAutoUpdates();
    this.loadDynamicContent();
    this.setupRealTimeFeatures();
  }

  setupAutoUpdates() {
    // GitHub stats update
    if (CONFIG.FEATURES.DYNAMIC_PROJECTS) {
      this.updateIntervals.github = setInterval(() => {
        this.updateGitHubContent();
      }, CONFIG.DYNAMIC.UPDATE_INTERVALS.GITHUB_STATS);
    }

    // Blog posts update
    if (CONFIG.FEATURES.LIVE_BLOG_FEED) {
      this.updateIntervals.blogs = setInterval(() => {
        this.updateBlogContent();
      }, CONFIG.DYNAMIC.UPDATE_INTERVALS.BLOG_POSTS);
    }

    // Weather update
    if (CONFIG.FEATURES.WEATHER_INTEGRATION) {
      this.updateIntervals.weather = setInterval(() => {
        this.updateWeatherContent();
      }, CONFIG.DYNAMIC.UPDATE_INTERVALS.WEATHER);
    }

    // Visitor counter update
    if (CONFIG.FEATURES.VISITOR_COUNTER) {
      this.updateIntervals.visitors = setInterval(() => {
        this.updateVisitorCount();
      }, CONFIG.DYNAMIC.UPDATE_INTERVALS.VISITOR_COUNT);
    }
  }

  async loadDynamicContent() {
    try {
      await Promise.all([
        this.updateGitHubContent(),
        this.updateBlogContent(),
        this.updateWeatherContent(),
        this.updateVisitorCount()
      ]);
    } catch (error) {
      console.error('Error loading dynamic content:', error);
    }
  }

  async updateGitHubContent() {
    try {
      const stats = await apiService.getGitHubStats();
      const repos = await apiService.getGitHubRepos();
      
      this.updateGitHubStats(stats);
      this.updateProjectsFromGitHub(repos);
      this.updateSkillsFromGitHub(repos);
      
      // Track analytics
      apiService.trackEvent('github_content_updated', { 
        repos_count: repos.length,
        total_stars: stats.totalStars 
      });
    } catch (error) {
      console.error('Failed to update GitHub content:', error);
    }
  }

  updateGitHubStats(stats) {
    // Update stats in the about section
    const statsElements = {
      'github-followers': stats.followers,
      'github-repos': stats.publicRepos,
      'github-stars': stats.totalStars,
      'github-forks': stats.totalForks
    };

    Object.entries(statsElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        this.animateCounter(element, value);
      }
    });
  }

  updateProjectsFromGitHub(repos) {
    const projectsContainer = document.querySelector('.project-grid');
    if (!projectsContainer) return;

    // Only update if dynamic projects are enabled and user wants to replace static projects
    if (!CONFIG.FEATURES.DYNAMIC_PROJECTS || !CONFIG.DYNAMIC.REPLACE_STATIC_PROJECTS) {
      return;
    }

    // Get top 6 repositories
    const topRepos = repos.slice(0, 6);
    
    topRepos.forEach(async (repo, index) => {
      const projectCard = this.createProjectCard(repo);
      
      // Add AI-generated description if enabled
      if (CONFIG.DYNAMIC.AI_CONTENT.AUTO_GENERATE.PROJECT_DESCRIPTIONS && !repo.description) {
        const aiDescription = await apiService.generateAIContent(
          `Generate a brief description for a GitHub repository named "${repo.name}" written in ${repo.language || 'various languages'}. Keep it under 100 characters.`
        );
        if (aiDescription) {
          repo.description = aiDescription;
        }
      }

      // Replace or add project card
      const existingCard = projectsContainer.children[index];
      if (existingCard) {
        existingCard.replaceWith(projectCard);
      } else {
        projectsContainer.appendChild(projectCard);
      }
    });
  }

  createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-image">
        <img src="https://opengraph.githubassets.com/1/${CONFIG.APIs.GITHUB.USERNAME}/${repo.name}" 
             alt="${repo.name}" 
             loading="lazy" />
        <div class="project-overlay">
          <div class="project-links">
            <a href="${repo.url}" class="project-link" target="_blank" rel="noopener">
              <i class="fab fa-github"></i>
            </a>
            ${repo.homepage ? `<a href="${repo.homepage}" class="project-link" target="_blank" rel="noopener">
              <i class="fas fa-external-link-alt"></i>
            </a>` : ''}
          </div>
        </div>
      </div>
      <div class="project-content">
        <h3>${repo.name}</h3>
        <p>${repo.description || 'A software project showcasing various technologies and best practices.'}</p>
        <div class="project-tech">
          ${repo.language ? `<span class="tech-tag">${repo.language}</span>` : ''}
          ${repo.topics.slice(0, 3).map(topic => `<span class="tech-tag">${topic}</span>`).join('')}
        </div>
        <div class="project-stats">
          <span><i class="fas fa-star"></i> ${repo.stars}</span>
          <span><i class="fas fa-code-branch"></i> ${repo.forks}</span>
        </div>
      </div>
    `;
    return card;
  }

  updateSkillsFromGitHub(repos) {
    const topLanguages = this.getTopLanguages(repos);
    const skillsContainer = document.querySelector('.skills-list');
    if (!skillsContainer) return;

    // Update or add language skills
    topLanguages.forEach(lang => {
      const skillItem = this.createSkillItem(lang.language, lang.count);
      const existingSkill = skillsContainer.querySelector(`[data-skill="${lang.language}"]`);
      
      if (existingSkill) {
        existingSkill.replaceWith(skillItem);
      } else {
        skillsContainer.appendChild(skillItem);
      }
    });
  }

  createSkillItem(language, count) {
    const item = document.createElement('div');
    item.className = 'skill-item';
    item.setAttribute('data-skill', language);
    
    const percentage = Math.min((count / 10) * 100, 95); // Cap at 95%
    
    item.innerHTML = `
      <div class="skill-name">${language}</div>
      <div class="skill-bar">
        <div class="skill-progress" style="width: ${percentage}%"></div>
      </div>
    `;
    return item;
  }

  getTopLanguages(repos) {
    const languages = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    
    return Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([lang, count]) => ({ language: lang, count }));
  }

  async updateBlogContent() {
    try {
      const blogPosts = await apiService.getBlogPosts();
      const blogContainer = document.querySelector('.blog-grid');
      if (!blogContainer) return;

      blogPosts.slice(0, 3).forEach((post, index) => {
        const blogCard = this.createBlogCard(post);
        const existingCard = blogContainer.children[index];
        
        if (existingCard) {
          existingCard.replaceWith(blogCard);
        } else {
          blogContainer.appendChild(blogCard);
        }
      });
    } catch (error) {
      console.error('Failed to update blog content:', error);
    }
  }

  createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.innerHTML = `
      <div class="blog-image">
        <img src="${post.thumbnail || 'Assets/blog1.jpg'}" alt="${post.title}" loading="lazy" />
        <div class="blog-overlay">
          <span class="blog-category">Blog</span>
        </div>
      </div>
      <div class="blog-content">
        <h3>${post.title}</h3>
        <p>${post.description.substring(0, 150)}...</p>
        <div class="blog-meta">
          <span><i class="far fa-calendar"></i> ${new Date(post.published).toLocaleDateString()}</span>
          <span><i class="far fa-clock"></i> 5 min read</span>
        </div>
        <a href="${post.link}" class="btn btn-outline" target="_blank" rel="noopener">Read More</a>
      </div>
    `;
    return card;
  }

  async updateWeatherContent() {
    try {
      const weather = await apiService.getWeather();
      this.updateWeatherDisplay(weather);
    } catch (error) {
      console.error('Failed to update weather:', error);
    }
  }

  updateWeatherDisplay(weather) {
    // Add weather widget to hero section
    let weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) {
      weatherWidget = document.createElement('div');
      weatherWidget.id = 'weather-widget';
      weatherWidget.className = 'weather-widget';
      document.querySelector('.hero-container').appendChild(weatherWidget);
    }

    weatherWidget.innerHTML = `
      <div class="weather-info">
        <i class="fas fa-map-marker-alt"></i>
        <span>${CONFIG.APIs.WEATHER.CITY}</span>
        <div class="weather-details">
          <span class="temperature">${weather.temperature}°C</span>
          <span class="description">${weather.description}</span>
        </div>
      </div>
    `;
  }

  async updateVisitorCount() {
    // Simulate visitor count (in real implementation, this would come from your backend)
    const currentCount = parseInt(localStorage.getItem('visitor_count') || '0');
    const newCount = currentCount + Math.floor(Math.random() * 5) + 1;
    localStorage.setItem('visitor_count', newCount.toString());

    const visitorElement = document.getElementById('visitor-count');
    if (visitorElement) {
      this.animateCounter(visitorElement, newCount);
    }
  }

  animateCounter(element, targetValue) {
    const currentValue = parseInt(element.textContent.replace(/\D/g, '')) || 0;
    const increment = (targetValue - currentValue) / 50;
    let current = currentValue;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        current = targetValue;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 20);
  }

  setupRealTimeFeatures() {
    // Real-time typing effect for hero section
    this.setupTypingEffect();
    
    // Real-time notifications
    this.setupNotifications();
    
    // Real-time visitor tracking
    this.setupVisitorTracking();
  }

  setupTypingEffect() {
    const typingElement = document.querySelector('.typing');
    if (!typingElement) return;

    const titles = [
      'Mohammad Aliyawar Khan',
      'a Data Scientist',
      'a Machine Learning Engineer',
      'an AI Enthusiast'
    ];

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeWriter = () => {
      const currentTitle = titles[titleIndex];
      
      if (isDeleting) {
        typingElement.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 100 : 200;

      if (!isDeleting && charIndex === currentTitle.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        typeSpeed = 500; // Pause before next word
      }

      setTimeout(typeWriter, typeSpeed);
    };

    typeWriter();
  }

  setupNotifications() {
    if (!CONFIG.FEATURES.SMART_NOTIFICATIONS) return;

    // Show welcome notification
    setTimeout(() => {
      this.showNotification('Welcome! 👋 Feel free to explore my portfolio or chat with my AI assistant!');
    }, 3000);

    // Show feature notifications
    setTimeout(() => {
      this.showNotification('💡 Tip: Try asking the AI assistant about my projects!');
    }, 10000);
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'smart-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
  }

  setupVisitorTracking() {
    // Track page views
    apiService.trackEvent('page_view', {
      page: window.location.pathname,
      timestamp: Date.now()
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Track every 25%
          apiService.trackEvent('scroll_depth', { depth: maxScroll });
        }
      }
    });
  }

  // Cleanup method
  cleanup() {
    Object.values(this.updateIntervals).forEach(interval => {
      clearInterval(interval);
    });
  }
}

// Initialize dynamic content service
let dynamicContentService;
document.addEventListener('DOMContentLoaded', () => {
  dynamicContentService = new DynamicContentService();
});
