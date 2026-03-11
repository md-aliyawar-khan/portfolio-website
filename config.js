// Configuration file for dynamic portfolio features
const CONFIG = {
  // API Endpoints
  APIs: {
    // GitHub API for dynamic project loading
    GITHUB: {
      BASE_URL: 'https://api.github.com',
      USERNAME: 'md-aliyawar-khan', // Replace with your GitHub username
      ENDPOINTS: {
        REPOS: '/users/{username}/repos',
        USER: '/users/{username}',
        GISTS: '/users/{username}/gists'
      }
    },
    
    // Medium API for blog posts
    MEDIUM: {
      BASE_URL: 'https://api.rss2json.com/v1/api.json',
      RSS_URL: 'https://medium.com/feed/@your-medium-username' // Replace with your Medium RSS
    },
    
    // LinkedIn API for experience updates
    LINKEDIN: {
      BASE_URL: 'https://api.linkedin.com/v2',
      // Note: Requires OAuth setup
    },
    
    // Weather API for dynamic greeting
    WEATHER: {
      BASE_URL: 'https://api.openweathermap.org/data/2.5',
      API_KEY: 'YOUR_WEATHER_API_KEY', // Get from openweathermap.org
      CITY: 'Montreal' // Your city
    },
    
    // AI Services
    AI: {
      // OpenAI for dynamic content generation
      OPENAI: {
        BASE_URL: 'https://api.openai.com/v1',
        API_KEY: 'YOUR_OPENAI_API_KEY', // Get from openai.com
        MODEL: 'gpt-3.5-turbo'
      },
      
      // Hugging Face for sentiment analysis
      HUGGINGFACE: {
        BASE_URL: 'https://api-inference.huggingface.co/models',
        API_KEY: 'YOUR_HUGGINGFACE_API_KEY', // Get from huggingface.co
        SENTIMENT_MODEL: 'cardiffnlp/twitter-roberta-base-sentiment-latest'
      }
    },
    
    // Analytics and Monitoring
    ANALYTICS: {
      GOOGLE_ANALYTICS: 'G-XXXXXXXXXX', // Your GA4 ID
      HOTJAR: 'YOUR_HOTJAR_ID', // Your Hotjar ID
      MIXPANEL: 'YOUR_MIXPANEL_TOKEN' // Your Mixpanel token
    }
  },
  
  // Dynamic Content Settings
  DYNAMIC: {
    // Control whether dynamic content replaces static content
    REPLACE_STATIC_PROJECTS: false, // Set to false to preserve existing projects
    
    // Auto-update intervals (in milliseconds)
    UPDATE_INTERVALS: {
      PROJECTS: 24 * 60 * 60 * 1000, // 24 hours
      BLOG_POSTS: 6 * 60 * 60 * 1000, // 6 hours
      WEATHER: 30 * 60 * 1000, // 30 minutes
      GITHUB_STATS: 60 * 60 * 1000, // 1 hour
      VISITOR_COUNT: 5 * 60 * 1000 // 5 minutes
    },
    
    // Content generation settings
    AI_CONTENT: {
      ENABLED: true,
      MAX_TOKENS: 150,
      TEMPERATURE: 0.7,
      AUTO_GENERATE: {
        PROJECT_DESCRIPTIONS: true,
        BLOG_SUMMARIES: true,
        SKILL_DESCRIPTIONS: true
      }
    },
    
    // Personalization settings
    PERSONALIZATION: {
      ENABLED: true,
      TRACK_PREFERENCES: true,
      ADAPTIVE_CONTENT: true,
      SMART_RECOMMENDATIONS: true
    }
  },
  
  // Performance Settings
  PERFORMANCE: {
    LAZY_LOADING: true,
    IMAGE_OPTIMIZATION: true,
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    PREFETCH_LINKS: true,
    SERVICE_WORKER: true
  },
  
  // Feature Flags
  FEATURES: {
    AI_CHATBOT: true,
    DYNAMIC_PROJECTS: true,
    LIVE_BLOG_FEED: true,
    WEATHER_INTEGRATION: true,
    VISITOR_COUNTER: true,
    SMART_NOTIFICATIONS: true,
    VOICE_COMMANDS: true,
    GESTURE_CONTROLS: true,
    AR_EXPERIENCE: false, // Augmented Reality
    VR_PORTFOLIO: false   // Virtual Reality
  },
  
  // Localization
  LANGUAGES: {
    DEFAULT: 'en',
    SUPPORTED: ['en', 'fr', 'es', 'ar'],
    AUTO_DETECT: true
  },
  
  // Theme Settings
  THEMES: {
    AUTO_SWITCH: true, // Switch based on time of day
    PREFERRED_THEME: 'dark',
    CUSTOM_COLORS: {
      primary: '#00BFA6',
      secondary: '#FFD700',
      accent: '#73c49f'
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
