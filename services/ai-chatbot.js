class AIChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.profile = this.buildProfile();
    this.intentHandlers = this.buildIntentHandlers();
    this.init();
  }

  init() {
    this.createChatbotUI();
    this.bindEvents();
    this.loadChatHistory();
    this.applyLanguageToUI();
  }

  createChatbotUI() {
    const chatbotHTML = `
      <div id="ai-chatbot" class="ai-chatbot">
        <div class="chatbot-header">
          <div class="chatbot-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="chatbot-info">
            <h4 data-chatbot-label="title">Portfolio Assistant</h4>
            <span class="status" data-chatbot-label="status">Online</span>
          </div>
          <button class="chatbot-toggle" id="chatbot-toggle" type="button" aria-label="Open portfolio assistant">
            <i class="fas fa-comments"></i>
          </button>
        </div>

        <div class="chatbot-body" id="chatbot-body">
          <div class="chat-messages" id="chat-messages">
            <div class="message bot-message">
              <div class="message-content">
                <p>${this.formatBotMessage(this.getWelcomeMessage())}</p>
              </div>
              <div class="message-time">${this.getCurrentTime()}</div>
            </div>
          </div>

          <div class="chat-input-container">
            <div class="quick-actions" id="chatbot-quick-actions"></div>
            <div class="input-group">
              <input type="text" id="chat-input" placeholder="Ask about education, projects, skills, CV, or contact..." />
              <button id="send-message" type="button" aria-label="Send message">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    this.renderQuickActions();
  }

  bindEvents() {
    const toggle = document.getElementById('chatbot-toggle');
    const header = document.querySelector('#ai-chatbot .chatbot-header');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-message');

    if (toggle) {
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        this.toggleChat();
      });
    }

    if (header) {
      header.addEventListener('click', () => this.toggleChat());
    }

    if (input) {
      input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          this.sendMessage();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    document.addEventListener('languagechange', () => this.refreshLanguage());
    window.addEventListener('storage', (event) => {
      if (event.key === 'lang') {
        this.refreshLanguage();
      }
    });
  }

  toggleChat() {
    const chatbot = document.getElementById('ai-chatbot');
    const body = document.getElementById('chatbot-body');
    const input = document.getElementById('chat-input');

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      chatbot.classList.add('open');
      body.style.display = 'flex';
      if (input) {
        input.focus();
      }
    } else {
      chatbot.classList.remove('open');
      body.style.display = 'none';
    }
  }

  async sendMessage(messageOverride) {
    const input = document.getElementById('chat-input');
    const message = typeof messageOverride === 'string' ? messageOverride.trim() : (input ? input.value.trim() : '');

    if (!message) {
      return;
    }

    this.addMessage(message, 'user');

    if (input && typeof messageOverride !== 'string') {
      input.value = '';
    }

    this.showTypingIndicator();

    try {
      const response = this.generateResponse(message);
      this.addMessage(response, 'bot');
    } catch (error) {
      console.error('Chatbot sendMessage error:', error);
      this.addMessage(this.getFallbackResponse(), 'bot');
    } finally {
      this.hideTypingIndicator();
      this.scrollChatToBottom();
    }
  }

  addMessage(content, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) {
      return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    const safeContent = sender === 'user'
      ? this.escapeHtml(content)
      : this.formatBotMessage(content);

    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${safeContent}</p>
      </div>
      <div class="message-time">${this.getCurrentTime()}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    this.messages.push({ content, sender, timestamp: Date.now() });
    this.saveChatHistory();
    this.scrollChatToBottom();
  }

  formatBotMessage(content) {
    return String(content)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  }

  scrollChatToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) {
      return;
    }

    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer || document.getElementById('typing-indicator')) {
      return;
    }

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    messagesContainer.appendChild(typingDiv);
    this.scrollChatToBottom();
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  renderQuickActions() {
    const container = document.getElementById('chatbot-quick-actions');
    if (!container) {
      return;
    }

    const lang = this.getCurrentLanguage();
    const labels = this.getUiCopy(lang).quickActions;

    container.innerHTML = labels.map((item) => (
      `<button class="quick-action" data-action="${item.action}" type="button">${item.label}</button>`
    )).join('');

    container.querySelectorAll('.quick-action').forEach((button) => {
      button.addEventListener('click', (event) => {
        const action = (event.currentTarget || event.target).dataset.action;
        if (action) {
          this.handleQuickAction(action);
        }
      });
    });
  }

  handleQuickAction(action) {
    const prompts = this.getQuickActionPrompts();
    const prompt = prompts[action];

    if (!prompt) {
      return;
    }

    this.sendMessage(prompt);
  }

  generateResponse(userMessage) {
    const query = this.normalize(userMessage);
    const lang = this.detectLanguage(userMessage);
    const copy = this.getResponseCopy(lang);
    const matchedProject = this.findProject(query);

    if (matchedProject) {
      return this.formatProjectResponse(matchedProject, lang);
    }

    for (const handler of this.intentHandlers) {
      if (handler.match(query)) {
        return handler.respond(copy, lang, userMessage);
      }
    }

    return copy.help;
  }

  buildIntentHandlers() {
    return [
      {
        match: (query) => this.matches(query, ['hello', 'hi', 'hey', 'good morning', 'good evening', 'bonjour', 'salut', 'bonsoir']),
        respond: (copy) => copy.greeting
      },
      {
        match: (query) => this.matches(query, ['how are you', 'how are things', 'ca va', 'comment ca va', 'comment allez vous']),
        respond: (copy) => copy.howAreYou
      },
      {
        match: (query) => this.matches(query, ['thank you', 'thanks', 'thank', 'merci', 'thanks a lot']),
        respond: (copy) => copy.thanks
      },
      {
        match: (query) => this.matches(query, ['bye', 'goodbye', 'see you', 'au revoir', 'a bientot', 'talk later']),
        respond: (copy) => copy.goodbye
      },
      {
        match: (query) => this.matches(query, ['who are you', 'what can you do', 'help', 'assist', 'what do you know']),
        respond: (copy) => copy.identity
      },
      {
        match: (query) => this.matches(query, ['resume', 'cv', 'curriculum vitae', 'download']),
        respond: (_, lang) => this.formatResumeResponse(lang)
      },
      {
        match: (query) => this.matches(query, ['contact', 'email', 'phone', 'call', 'reach', 'hire', 'linkedin', 'github']),
        respond: (_, lang) => this.formatContactResponse(lang)
      },
      {
        match: (query) => this.matches(query, ['education', 'study', 'studied', 'university', 'degree', 'master', 'concordia']),
        respond: (_, lang) => this.formatEducationResponse(lang)
      },
      {
        match: (query) => this.matches(query, ['experience', 'intern', 'work', 'nimact', 'job']),
        respond: (_, lang) => this.formatExperienceResponse(lang)
      },
      {
        match: (query) => this.matches(query, ['skills', 'skill', 'expertise', 'stack', 'technology', 'technologies', 'python', 'javascript', 'java', 'c++', 'sql', 'tensorflow', 'pytorch', 'react', 'flask', 'node', 'docker', 'aws', 'tableau', 'jupyter']),
        respond: (_, lang) => this.formatSkillsResponse(lang)
      },
      {
        match: (query) => this.matches(query, ['projects', 'project', 'portfolio work', 'built', 'portfolio']),
        respond: (_, lang) => this.formatProjectsOverview(lang)
      },
      {
        match: (query) => this.matches(query, ['blog', 'blogs', 'article', 'articles', 'writing']),
        respond: (_, lang) => this.formatBlogsResponse(lang)
      },
      {
        match: (query) => this.matches(query, ['who is mohammad', 'about mohammad', 'about you', 'introduce', 'tell me about mohammad']),
        respond: (_, lang) => this.formatAboutResponse(lang)
      }
    ];
  }

  findProject(query) {
    return this.profile.projects.find((project) => {
      const projectName = this.normalize(project.name);
      if (query.includes(projectName)) {
        return true;
      }

      return project.keywords.some((keyword) => query.includes(this.normalize(keyword)));
    }) || null;
  }

  formatResumeResponse(lang) {
    const profile = this.profile;
    if (lang === 'fr') {
      return `Vous pouvez télécharger le CV de Mohammad ici : [Télécharger le CV](${profile.resumeUrl}). Si vous voulez, je peux aussi résumer sa formation, ses compétences ou ses projets.`;
    }

    return `You can download Mohammad's resume here: [Download Resume](${profile.resumeUrl}). If you want, I can also summarize his education, skills, or projects.`;
  }

  formatContactResponse(lang) {
    const contact = this.profile.contact;
    if (lang === 'fr') {
      return `Vous pouvez contacter Mohammad par email à **${contact.email}** ou par téléphone au **${contact.phone}**. Il est basé à **${contact.location}**. LinkedIn : [Profil](${contact.linkedin}) et GitHub : [Dépôts](${contact.github}).`;
    }

    return `You can contact Mohammad by email at **${contact.email}** or phone at **${contact.phone}**. He is based in **${contact.location}**. LinkedIn: [Profile](${contact.linkedin}) and GitHub: [Repositories](${contact.github}).`;
  }

  formatEducationResponse(lang) {
    const education = this.profile.education;
    if (lang === 'fr') {
      return `**Formation :** ${education.degreeFr} à **${education.school}** à **${education.locationFr}**. ${education.summaryFr}`;
    }

    return `**Education:** ${education.degree} from **${education.school}** in **${education.location}**. ${education.summary}`;
  }

  formatExperienceResponse(lang) {
    const experience = this.profile.experience[0];
    if (lang === 'fr') {
      return `**Expérience :** ${experience.roleFr} chez **${experience.company}** à ${experience.locationFr} (${experience.date}). Points forts : ${experience.highlightsFr.join(' ')}.`;
    }

    return `**Experience:** ${experience.role} at **${experience.company}** in ${experience.location} (${experience.date}). Highlights: ${experience.highlights.join(' ')}.`;
  }

  formatSkillsResponse(lang) {
    const skills = this.profile.skills;
    if (lang === 'fr') {
      return `**Compétences clés :** Langages : ${skills.languages.join(', ')}. Frameworks et bibliothèques : ${skills.frameworks.join(', ')}. Outils : ${skills.tools.join(', ')}.`;
    }

    return `**Core skills:** Languages: ${skills.languages.join(', ')}. Frameworks and libraries: ${skills.frameworks.join(', ')}. Tools: ${skills.tools.join(', ')}.`;
  }

  formatProjectsOverview(lang) {
    const projectNames = this.profile.projects.map((project) => project.name).join('**, **');
    if (lang === 'fr') {
      return `Les projets phares de Mohammad sont **${projectNames}**. Vous pouvez me demander un projet précis comme Elasticsearch, DeepMed, Fraud Detection ou CODIS.`;
    }

    return `Mohammad's featured projects are **${projectNames}**. Ask me about a specific one like Elasticsearch, DeepMed, Fraud Detection, or CODIS.`;
  }

  formatProjectResponse(project, lang) {
    if (lang === 'fr') {
      return `**${project.name}:** ${project.descriptionFr} Technologies utilisées : ${project.tech.join(', ')}.`;
    }

    return `**${project.name}:** ${project.description} Technologies used: ${project.tech.join(', ')}.`;
  }

  formatBlogsResponse(lang) {
    if (lang === 'fr') {
      return `Le site présente actuellement des contenus sur les **systèmes distribués**, le **machine learning** et la **visualisation de données avec Python**. Vous pouvez les parcourir dans la section Blogs.`;
    }

    return `The site currently features posts on **Distributed Systems**, **Machine Learning**, and **Data Visualization with Python**. You can explore them in the Blogs section.`;
  }

  formatAboutResponse(lang) {
    const profile = this.profile;
    if (lang === 'fr') {
      return `Ce portfolio appartient à **${profile.name}**, un **${profile.titleFr}** basé à **${profile.contact.locationFr}**. ${profile.summaryFr}`;
    }

    return `This portfolio belongs to **${profile.name}**, a **${profile.title}** based in **${profile.contact.location}**. ${profile.summary}`;
  }

  getWelcomeMessage() {
    const lang = this.getCurrentLanguage();
    const copy = this.getResponseCopy(lang);
    return copy.welcome;
  }

  getFallbackResponse() {
    const lang = this.getCurrentLanguage();
    return this.getResponseCopy(lang).help;
  }

  getCurrentLanguage() {
    const saved = localStorage.getItem('lang');
    const docLang = document.documentElement.lang;
    const lang = (saved || docLang || 'en').toLowerCase();
    return lang.startsWith('fr') ? 'fr' : 'en';
  }

  detectLanguage(message) {
    const currentLang = this.getCurrentLanguage();
    const normalized = this.normalize(message);
    const frenchSignals = ['bonjour', 'salut', 'merci', 'au revoir', 'competence', 'competences', 'projet', 'formation', 'experience', 'contact', 'cv'];

    if (frenchSignals.some((signal) => normalized.includes(signal))) {
      return 'fr';
    }

    return currentLang;
  }

  getUiCopy(lang) {
    if (lang === 'fr') {
      return {
        title: 'Assistant Portfolio',
        status: 'En ligne',
        placeholder: 'Posez une question sur la formation, les projets, les compétences, le CV ou le contact...',
        toggleLabel: 'Ouvrir l\'assistant portfolio',
        quickActions: [
          { action: 'education', label: 'Formation' },
          { action: 'projects', label: 'Projets' },
          { action: 'skills', label: 'Compétences' },
          { action: 'resume', label: 'CV' },
          { action: 'contact', label: 'Contact' }
        ]
      };
    }

    return {
      title: 'Portfolio Assistant',
      status: 'Online',
      placeholder: 'Ask about education, projects, skills, CV, or contact...',
      toggleLabel: 'Open portfolio assistant',
      quickActions: [
        { action: 'education', label: 'Education' },
        { action: 'projects', label: 'Projects' },
        { action: 'skills', label: 'Skills' },
        { action: 'resume', label: 'Resume' },
        { action: 'contact', label: 'Contact' }
      ]
    };
  }

  getQuickActionPrompts() {
    const lang = this.getCurrentLanguage();
    if (lang === 'fr') {
      return {
        education: 'Parlez-moi de la formation de Mohammad',
        projects: 'Quels projets Mohammad a-t-il réalisés ?',
        skills: 'Quelles sont les principales compétences de Mohammad ?',
        resume: 'Comment puis-je télécharger le CV ?',
        contact: 'Comment puis-je contacter Mohammad ?'
      };
    }

    return {
      education: 'Tell me about Mohammad\'s education',
      projects: 'What projects has Mohammad built?',
      skills: 'What are Mohammad\'s main skills?',
      resume: 'How can I download the resume?',
      contact: 'How can I contact Mohammad?'
    };
  }

  getResponseCopy(lang) {
    if (lang === 'fr') {
      return {
        welcome: 'Bonjour. Je peux répondre aux questions sur la formation, l\'expérience, les compétences, les projets, le CV et les coordonnées de Mohammad. Que souhaitez-vous savoir ?',
        greeting: 'Bonjour. Je suis l\'assistant portfolio de Mohammad. Vous pouvez me demander sa formation, ses projets, ses compétences, son CV ou ses coordonnées.',
        howAreYou: 'Je vais bien, merci. Je suis prêt à vous aider à découvrir le profil de Mohammad, ses projets et ses expériences.',
        thanks: 'Avec plaisir. Si vous voulez, je peux aussi vous parler de ses projets, de sa formation, de ses compétences ou de la manière de le contacter.',
        goodbye: 'Au revoir. N\'hésitez pas à revenir si vous voulez en savoir plus sur Mohammad, son CV ou ses projets.',
        identity: 'Je suis l\'assistant portfolio de Mohammad. Je peux résumer sa formation, ses compétences, ses projets, son expérience, son CV et ses coordonnées.',
        help: 'Je peux vous aider avec la **formation**, l\'**expérience**, les **compétences**, les **projets**, le **CV** et les **coordonnées**. Essayez par exemple : "Quelle est la formation de Mohammad ?", "Parlez-moi du projet CODIS" ou "Comment puis-je le contacter ?"'
      };
    }

    return {
      welcome: 'Hello. I can answer questions about Mohammad\'s education, experience, skills, projects, CV, and contact details. What would you like to know?',
      greeting: 'Hello. I\'m Mohammad\'s portfolio assistant. You can ask about his education, projects, skills, resume, or contact details.',
      howAreYou: 'I\'m doing well, thanks. I\'m here to help you learn about Mohammad\'s profile, projects, and experience.',
      thanks: 'You\'re welcome. If you want, I can also tell you about his projects, education, skills, or how to contact him.',
      goodbye: 'Goodbye. Feel free to come back if you want to know more about Mohammad, his resume, or his projects.',
      identity: 'I\'m Mohammad\'s portfolio assistant. I can summarize his education, skills, projects, experience, resume, and contact details.',
      help: 'I can help with **education**, **experience**, **skills**, **projects**, **resume/CV**, and **contact details**. Try asking something like "What is Mohammad\'s education?", "Tell me about CODIS", or "How do I contact him?"'
    };
  }

  applyLanguageToUI() {
    const lang = this.getCurrentLanguage();
    const copy = this.getUiCopy(lang);
    const title = document.querySelector('[data-chatbot-label="title"]');
    const status = document.querySelector('[data-chatbot-label="status"]');
    const input = document.getElementById('chat-input');
    const toggle = document.getElementById('chatbot-toggle');

    if (title) {
      title.textContent = copy.title;
    }

    if (status) {
      status.textContent = copy.status;
    }

    if (input) {
      input.placeholder = copy.placeholder;
    }

    if (toggle) {
      toggle.setAttribute('aria-label', copy.toggleLabel);
    }

    this.renderQuickActions();
  }

  refreshLanguage() {
    this.applyLanguageToUI();

    const firstBotMessage = document.querySelector('#chat-messages .bot-message .message-content p');
    if (firstBotMessage && this.messages.length === 0) {
      firstBotMessage.innerHTML = this.formatBotMessage(this.getWelcomeMessage());
    }
  }

  buildProfile() {
    return {
      name: 'Mohammad Aliyawar Khan',
      title: 'Data Scientist and Machine Learning Engineer',
      titleFr: 'Data Scientist et ingénieur en machine learning',
      summary: 'He combines machine learning, data analysis, and software engineering to build practical, scalable solutions.',
      summaryFr: 'Il combine le machine learning, l\'analyse de données et l\'ingénierie logicielle pour construire des solutions pratiques et évolutives.',
      education: {
        degree: 'Master in Engineering - Software Engineering',
        degreeFr: 'Maîtrise en ingénierie - génie logiciel',
        school: 'Concordia University',
        location: 'Montreal, Canada',
        locationFr: 'Montréal, Canada',
        summary: 'His work focuses on machine learning, distributed systems, and data-driven product development.',
        summaryFr: 'Son travail se concentre sur le machine learning, les systèmes distribués et le développement de produits guidé par les données.'
      },
      experience: [
        {
          role: 'Software Engineer Intern',
          roleFr: 'Stagiaire ingénieur logiciel',
          company: 'NIMACT',
          location: 'Ghazipur, UP, India',
          locationFr: 'Ghazipur, Uttar Pradesh, Inde',
          date: 'June 2023 - December 2023',
          highlights: [
            'Completed advanced software development training in HTML, CSS, JavaScript, and C++.',
            'Worked on database systems and machine-learning-based analysis for large datasets.',
            'Created reports, dashboards, and visualizations for data-driven decisions.'
          ],
          highlightsFr: [
            'A suivi une formation avancée en développement logiciel en HTML, CSS, JavaScript et C++.',
            'A travaillé sur des systèmes de base de données et des analyses de grands jeux de données basées sur le machine learning.',
            'A créé des rapports, des tableaux de bord et des visualisations pour soutenir la prise de décision.'
          ]
        }
      ],
      projects: [
        {
          name: 'Elasticsearch: Distributed Systems',
          description: 'Evaluated sharding, replication, and fault tolerance in Elasticsearch, improving query performance by 30 percent and maintaining high availability during node failures.',
          descriptionFr: 'A évalué le sharding, la réplication et la tolérance aux pannes dans Elasticsearch, en améliorant les performances des requêtes de 30 pour cent tout en maintenant une haute disponibilité lors des pannes de nœuds.',
          tech: ['Elasticsearch', 'Docker', 'Python', 'Kibana'],
          keywords: ['elasticsearch', 'distributed systems', 'search', 'kibana', 'docker']
        },
        {
          name: 'DeepMed Detection - Medical Image Analysis',
          description: 'Built deep learning models for medical image interpretation and segmentation with strong precision and recall.',
          descriptionFr: 'A développé des modèles de deep learning pour l\'interprétation et la segmentation d\'images médicales avec une très bonne précision et un bon rappel.',
          tech: ['TensorFlow', 'PyTorch', 'Computer Vision'],
          keywords: ['deepmed', 'medical', 'medical image', 'image analysis', 'computer vision']
        },
        {
          name: 'Fraud Detection System',
          description: 'Developed a machine learning fraud detection system using RandomForest and deployed it with Flask for practical use.',
          descriptionFr: 'A développé un système de détection de fraude basé sur le machine learning avec RandomForest et l\'a déployé avec Flask pour un usage pratique.',
          tech: ['Python', 'Flask', 'Heroku', 'RandomForest'],
          keywords: ['fraud', 'fraud detection', 'randomforest', 'flask', 'transactions']
        },
        {
          name: 'CODIS: Coding Society Website',
          description: 'Created a React and Node.js platform for a coding society with user-friendly registration and contact experiences.',
          descriptionFr: 'A créé une plateforme React et Node.js pour une association de codage avec une expérience fluide pour l\'inscription et le contact.',
          tech: ['React', 'Node.js', 'JavaScript'],
          keywords: ['codis', 'coding society', 'react', 'node', 'website']
        }
      ],
      skills: {
        languages: ['Python', 'JavaScript', 'C++', 'Java', 'SQL'],
        frameworks: ['TensorFlow', 'PyTorch', 'React', 'Flask', 'Node.js'],
        tools: ['Git', 'Docker', 'AWS', 'Tableau', 'Jupyter']
      },
      contact: {
        email: 'md.aliyawar.khan@gmail.com',
        phone: '+1 (438) 787-0249',
        location: 'Montreal, Quebec, Canada',
        locationFr: 'Montréal, Québec, Canada',
        linkedin: 'https://linkedin.com/in/md-aliyawar-khan',
        github: 'https://github.com/md-aliyawar-khan'
      },
      resumeUrl: this.getResumeUrl()
    };
  }

  getResumeUrl() {
    const resumeLink = document.querySelector('a[href*="resume"], a[href$=".pdf"]');
    return resumeLink ? resumeLink.getAttribute('href') : 'Assets/khan_resume_Rp.pdf';
  }

  normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9+.#\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  matches(query, keywords) {
    return keywords.some((keyword) => query.includes(this.normalize(keyword)));
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  saveChatHistory() {
    localStorage.setItem('chatbot_history', JSON.stringify(this.messages));
  }

  loadChatHistory() {
    const history = localStorage.getItem('chatbot_history');
    if (!history) {
      return;
    }

    try {
      const parsed = JSON.parse(history);
      this.messages = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Unable to parse chatbot history:', error);
      this.messages = [];
    }
  }

  clearHistory() {
    this.messages = [];
    localStorage.removeItem('chatbot_history');

    const messages = document.getElementById('chat-messages');
    if (messages) {
      messages.innerHTML = `
        <div class="message bot-message">
          <div class="message-content">
            <p>${this.formatBotMessage(this.getWelcomeMessage())}</p>
          </div>
          <div class="message-time">${this.getCurrentTime()}</div>
        </div>
      `;
    }
  }
}

let chatbot;
document.addEventListener('DOMContentLoaded', () => {
  try {
    const enabled = typeof CONFIG !== 'undefined' && CONFIG.FEATURES && CONFIG.FEATURES.AI_CHATBOT;
    if (enabled !== false) {
      chatbot = new AIChatbot();
    }
  } catch (error) {
    console.warn('Chatbot init:', error);
    chatbot = new AIChatbot();
  }
});
