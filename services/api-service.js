// API Service for handling all external API calls
class APIService {
  constructor() {
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
  }

  // Generic API request method with caching and error handling
  async request(url, options = {}) {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CONFIG.PERFORMANCE.CACHE_DURATION) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GitHub API methods
  async getGitHubProfile() {
    const url = `${CONFIG.APIs.GITHUB.BASE_URL}${CONFIG.APIs.GITHUB.ENDPOINTS.USER.replace('{username}', CONFIG.APIs.GITHUB.USERNAME)}`;
    return this.request(url);
  }

  async getGitHubRepos() {
    const url = `${CONFIG.APIs.GITHUB.BASE_URL}${CONFIG.APIs.GITHUB.ENDPOINTS.REPOS.replace('{username}', CONFIG.APIs.GITHUB.USERNAME)}`;
    const repos = await this.request(url);
    
    // Filter and enhance repository data
    return repos
      .filter(repo => !repo.fork && !repo.private)
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updated: repo.updated_at,
        topics: repo.topics || [],
        homepage: repo.homepage
      }))
      .sort((a, b) => b.stars - a.stars);
  }

  async getGitHubStats() {
    const profile = await this.getGitHubProfile();
    const repos = await this.getGitHubRepos();
    
    return {
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
      totalStars: repos.reduce((sum, repo) => sum + repo.stars, 0),
      totalForks: repos.reduce((sum, repo) => sum + repo.forks, 0),
      topLanguages: this.getTopLanguages(repos)
    };
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
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, count }));
  }

  // Medium/Blog API methods
  async getBlogPosts() {
    const url = `${CONFIG.APIs.MEDIUM.BASE_URL}?rss_url=${encodeURIComponent(CONFIG.APIs.MEDIUM.RSS_URL)}`;
    const data = await this.request(url);
    
    if (data.status === 'ok') {
      return data.items.map(item => ({
        title: item.title,
        description: item.description,
        link: item.link,
        published: item.pubDate,
        thumbnail: item.thumbnail,
        categories: item.categories || []
      }));
    }
    
    return [];
  }

  // Weather API methods
  async getWeather() {
    const url = `${CONFIG.APIs.WEATHER.BASE_URL}/weather?q=${CONFIG.APIs.WEATHER.CITY}&appid=${CONFIG.APIs.WEATHER.API_KEY}&units=metric`;
    const data = await this.request(url);
    
    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    };
  }

  // AI Content Generation
  async generateAIContent(prompt, type = 'general') {
    if (!CONFIG.DYNAMIC.AI_CONTENT.ENABLED) {
      return null;
    }

    try {
      const response = await fetch(`${CONFIG.APIs.AI.OPENAI.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.APIs.AI.OPENAI.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: CONFIG.APIs.AI.OPENAI.MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a professional portfolio content generator. Generate concise, engaging content for a data scientist's portfolio. Keep responses under ${CONFIG.DYNAMIC.AI_CONTENT.MAX_TOKENS} characters.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: CONFIG.DYNAMIC.AI_CONTENT.MAX_TOKENS,
          temperature: CONFIG.DYNAMIC.AI_CONTENT.TEMPERATURE
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI content generation failed:', error);
      return null;
    }
  }

  // Sentiment Analysis
  async analyzeSentiment(text) {
    try {
      const response = await fetch(`${CONFIG.APIs.AI.HUGGINGFACE.BASE_URL}/${CONFIG.APIs.AI.HUGGINGFACE.SENTIMENT_MODEL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.APIs.AI.HUGGINGFACE.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: text })
      });

      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return null;
    }
  }

  // Contact Form Submission
  async submitContactForm(formData) {
    // This would typically send to your backend or email service
    // For now, we'll simulate a successful submission
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Message sent successfully!' });
      }, 1000);
    });
  }

  // Analytics tracking
  async trackEvent(eventName, eventData = {}) {
    if (CONFIG.APIs.ANALYTICS.GOOGLE_ANALYTICS) {
      // Google Analytics 4 tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
      }
    }

    if (CONFIG.APIs.ANALYTICS.MIXPANEL) {
      // Mixpanel tracking
      if (typeof mixpanel !== 'undefined') {
        mixpanel.track(eventName, eventData);
      }
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const apiService = new APIService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIService;
}
