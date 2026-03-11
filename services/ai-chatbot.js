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
        match: (query) => this.matches(query, ['education', 'study', 'studied', 'university', 'degree', 'master', 'concordia', 'bachelor', "bachelor's", 'undergraduate', 'diploma', 'jamia', 'aligarh']),
        respond: (_, lang, userMessage) => this.formatEducationResponse(lang, userMessage)
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
        match: (query) => this.matches(query, ['hobby', 'hobbies', 'interests', 'free time', 'fun', 'outside work', 'soccer', 'football', 'hiking', 'travel', 'travelling', 'traveling']),
        respond: (_, lang) => this.formatHobbiesResponse(lang)
      },
      {
        match: (query) => this.matches(query, ['favorite club', 'favourite club', 'favorite team', 'favourite team', 'real madrid', 'argentina', 'lionel messi', 'messi']),
        respond: (_, lang, userMessage) => this.formatFavoritesResponse(lang, userMessage)
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
        match: (query) => this.matches(query, ['life', 'background', 'story', 'journey', 'born', 'birthplace', 'village', 'dewaitha', 'ghazipur', 'dildarnagar', 'minto circle', 'syedna tahir saifuddin', 'class 10', 'class 12', 'school']),
        respond: (_, lang) => this.formatLifeJourneyResponse(lang)
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
      return `Vous pouvez t�l�charger le CV de Mohammad ici : [T�l�charger le CV](${profile.resumeUrl}). Si vous voulez, je peux aussi r�sumer sa formation, ses comp�tences ou ses projets.`;
    }

    return `You can download Mohammad's resume here: [Download Resume](${profile.resumeUrl}). If you want, I can also summarize his education, skills, or projects.`;
  }

  formatContactResponse(lang) {
    const contact = this.profile.contact;
    if (lang === 'fr') {
      return `Vous pouvez contacter Mohammad par email � **${contact.email}** ou par t�l�phone au **${contact.phone}**. Il est bas� � **${contact.location}**. LinkedIn : [Profil](${contact.linkedin}) et GitHub : [D�p�ts](${contact.github}).`;
    }

    return `You can contact Mohammad by email at **${contact.email}** or phone at **${contact.phone}**. He is based in **${contact.location}**. LinkedIn: [Profile](${contact.linkedin}) and GitHub: [Repositories](${contact.github}).`;
  }

  formatEducationResponse(lang, userMessage) {
    const education = this.profile.education;
    const query = this.normalize(userMessage);

    if (this.matches(query, ['bachelor', "bachelor's", 'undergraduate', 'aligarh', 'mathematics', 'statistics', 'physics'])) {
      if (lang === 'fr') {
        return `**Licence :** ${education.bachelors.degreeFr} ? **${education.bachelors.school}** ? **${education.bachelors.locationFr}** (${education.bachelors.dateFr}). ${education.bachelors.summaryFr}`;
      }

      return `**Bachelor's education:** ${education.bachelors.degree} from **${education.bachelors.school}** in **${education.bachelors.location}** (${education.bachelors.date}). ${education.bachelors.summary}`;
    }

    if (this.matches(query, ['diploma', 'post graduate diploma', 'pgdca', 'jamia', 'computer applications'])) {
      if (lang === 'fr') {
        return `**Dipl?me de troisi?me cycle :** ${education.diploma.degreeFr} ? **${education.diploma.school}** ? **${education.diploma.locationFr}** (${education.diploma.dateFr}). ${education.diploma.summaryFr}`;
      }

      return `**Postgraduate diploma:** ${education.diploma.degree} from **${education.diploma.school}** in **${education.diploma.location}** (${education.diploma.date}). ${education.diploma.summary}`;
    }

    if (this.matches(query, ['master', 'masters', "master's", 'concordia', 'software engineering'])) {
      if (lang === 'fr') {
        return `**Ma?trise :** ${education.masters.degreeFr} ? **${education.masters.school}** ? **${education.masters.locationFr}** (${education.masters.dateFr}). ${education.masters.summaryFr}`;
      }

      return `**Master's education:** ${education.masters.degree} from **${education.masters.school}** in **${education.masters.location}** (${education.masters.date}). ${education.masters.summary}`;
    }

    if (lang === 'fr') {
      return `**Formation :** Mohammad poursuit actuellement une **${education.masters.degreeFr}** ? **${education.masters.school}** ? **${education.masters.locationFr}** (${education.masters.dateFr}). Avant cela, il a obtenu un **${education.diploma.degreeFr}** ? **${education.diploma.school}** et une **${education.bachelors.degreeFr}** ? **${education.bachelors.school}**.`;
    }

    return `**Education:** Mohammad is currently pursuing a **${education.masters.degree}** at **${education.masters.school}** in **${education.masters.location}** (${education.masters.date}). Before that, he completed a **${education.diploma.degree}** at **${education.diploma.school}** and a **${education.bachelors.degree}** at **${education.bachelors.school}**.`;
  }

  formatExperienceResponse(lang) {
    const experience = this.profile.experience[0];
    if (lang === 'fr') {
      return `**Exp�rience :** ${experience.roleFr} chez **${experience.company}** � ${experience.locationFr} (${experience.date}). Points forts : ${experience.highlightsFr.join(' ')}.`;
    }

    return `**Experience:** ${experience.role} at **${experience.company}** in ${experience.location} (${experience.date}). Highlights: ${experience.highlights.join(' ')}.`;
  }

  formatSkillsResponse(lang) {
    const skills = this.profile.skills;
    if (lang === 'fr') {
      return `**Comp?tences cl?s :** Langages : ${skills.languages.join(', ')}. Frameworks et biblioth?ques : ${skills.frameworks.join(', ')}. Outils : ${skills.tools.join(', ')}.`;
    }

    return `**Core skills:** Languages: ${skills.languages.join(', ')}. Frameworks and libraries: ${skills.frameworks.join(', ')}. Tools: ${skills.tools.join(', ')}.`;
  }

  formatHobbiesResponse(lang) {
    const hobbies = this.profile.personal.hobbies;
    if (lang === 'fr') {
      return `**Loisirs :** Mohammad aime jouer au football, faire de la randonn?e et voyager. Ces activit?s refl?tent son ?nergie, sa discipline et sa curiosit? en dehors du travail.`;
    }

    return `**Hobbies:** Mohammad enjoys playing soccer, hiking, and travelling. These interests reflect his energy, discipline, and curiosity outside of work.`;
  }

  formatFavoritesResponse(lang, userMessage) {
    const query = this.normalize(userMessage);
    const favorites = this.profile.personal.favorites;

    if (this.matches(query, ['player', 'footballer', 'soccer player', 'messi', 'lionel messi'])) {
      if (lang === 'fr') {
        return `Le joueur pr?f?r? de Mohammad est **${favorites.player}**.`;
      }

      return `Mohammad's favorite player is **${favorites.player}**.`;
    }

    if (this.matches(query, ['argentina', 'national team'])) {
      if (lang === 'fr') {
        return `Son ?quipe nationale pr?f?r?e est **${favorites.nationalTeam}**.`;
      }

      return `His favorite national team is **${favorites.nationalTeam}**.`;
    }

    if (lang === 'fr') {
      return `Le club pr?f?r? de Mohammad est **${favorites.club}**. Son ?quipe nationale pr?f?r?e est **${favorites.nationalTeam}**, et son joueur pr?f?r? est **${favorites.player}**.`;
    }

    return `Mohammad's favorite club is **${favorites.club}**. His favorite national team is **${favorites.nationalTeam}**, and his favorite player is **${favorites.player}**.`;
  }

  formatProjectsOverview(lang) {
    const projectNames = this.profile.projects.map((project) => project.name).join('**, **');
    if (lang === 'fr') {
      return `Les projets phares de Mohammad sont **${projectNames}**. Vous pouvez me demander un projet pr�cis comme Elasticsearch, DeepMed, Fraud Detection ou CODIS.`;
    }

    return `Mohammad's featured projects are **${projectNames}**. Ask me about a specific one like Elasticsearch, DeepMed, Fraud Detection, or CODIS.`;
  }

  formatProjectResponse(project, lang) {
    if (lang === 'fr') {
      return `**${project.name}:** ${project.descriptionFr} Technologies utilis�es : ${project.tech.join(', ')}.`;
    }

    return `**${project.name}:** ${project.description} Technologies used: ${project.tech.join(', ')}.`;
  }

  formatBlogsResponse(lang) {
    if (lang === 'fr') {
      return `Le site pr?sente actuellement des contenus sur les **syst?mes distribu?s**, le **machine learning** et la **visualisation de donn?es avec Python**. Vous pouvez les parcourir dans la section Blogs.`;
    }

    return `The site currently features posts on **Distributed Systems**, **Machine Learning**, and **Data Visualization with Python**. You can explore them in the Blogs section.`;
  }

  formatLifeJourneyResponse(lang) {
    const life = this.profile.personal.lifeJourney;

    if (lang === 'fr') {
      return `**Parcours personnel :** Mohammad est n? dans le petit village de **Dewaitha**, dans le district de **Ghazipur, Uttar Pradesh**. Il a suivi sa scolarit? primaire jusqu'en classe 10 ? **Noble Senior Secondary School, Dildarnagar**. Ensuite, il a d?m?nag? ? **Aligarh** en **2016** pour poursuivre ses ?tudes secondaires ? **Aligarh Muslim University School - Syedna Tahir Saifuddin School (Minto Circle)**, o? il a termin? sa classe 12. Apr?s cela, il a rejoint le **Department of Mathematics, Aligarh Muslim University** pour poursuivre une **B.Sc. (Hons.) en math?matiques** avec une mineure en **physique** et **statistiques**. Plus tard, il a d?m?nag? ? **Montr?al, Canada** en **2024** et poursuit actuellement une **ma?trise en ing?nierie - g?nie logiciel** ? **Concordia University**.`;
    }

    return `**Life journey:** Mohammad was born in the small village of **Dewaitha** in **Ghazipur district, Uttar Pradesh**. He completed his primary education through class 10 at **Noble Senior Secondary School, Dildarnagar**. Later, he moved to **Aligarh** in **2016** for his secondary education and enrolled at **Aligarh Muslim University School - Syedna Tahir Saifuddin School (Minto Circle)**, where he completed class 12. He then joined the **Department of Mathematics at Aligarh Muslim University** to pursue a **B.Sc. (Hons.) in Mathematics**, with minors in **Physics** and **Statistics**. Later, he moved to **Montreal, Canada** in **2024** and is currently pursuing a **Master of Engineering in Software Engineering** at **Concordia University**.`;
  }

  formatAboutResponse(lang) {
    const profile = this.profile;
    if (lang === 'fr') {
      return `Ce portfolio appartient � **${profile.name}**, un **${profile.titleFr}** bas� � **${profile.contact.locationFr}**. ${profile.summaryFr}`;
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
        placeholder: 'Posez une question sur la formation, les projets, les comp�tences, le CV ou le contact...',
        toggleLabel: 'Ouvrir l\'assistant portfolio',
        quickActions: [
          { action: 'education', label: 'Formation' },
          { action: 'projects', label: 'Projets' },
          { action: 'skills', label: 'Comp�tences' },
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
        projects: 'Quels projets Mohammad a-t-il r�alis�s ?',
        skills: 'Quelles sont les principales comp�tences de Mohammad ?',
        resume: 'Comment puis-je t�l�charger le CV ?',
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
        welcome: 'Bonjour. Je peux r�pondre aux questions sur la formation, l\'exp�rience, les comp�tences, les projets, le CV et les coordonn�es de Mohammad. Que souhaitez-vous savoir ?',
        greeting: 'Bonjour. Je suis l\'assistant portfolio de Mohammad. Vous pouvez me demander sa formation, ses projets, ses comp�tences, son CV ou ses coordonn�es.',
        howAreYou: 'Je vais bien, merci. Je suis pr�t � vous aider � d�couvrir le profil de Mohammad, ses projets et ses exp�riences.',
        thanks: 'Avec plaisir. Si vous voulez, je peux aussi vous parler de ses projets, de sa formation, de ses comp�tences ou de la mani�re de le contacter.',
        goodbye: 'Au revoir. N\'h�sitez pas � revenir si vous voulez en savoir plus sur Mohammad, son CV ou ses projets.',
        identity: 'Je suis l\'assistant portfolio de Mohammad. Je peux r�sumer sa formation, ses comp�tences, ses projets, son exp�rience, son CV et ses coordonn�es.',
        help: 'Je peux vous aider avec la **formation**, l\'**exp�rience**, les **comp�tences**, les **projets**, le **CV** et les **coordonn�es**. Essayez par exemple : "Quelle est la formation de Mohammad ?", "Parlez-moi du projet CODIS" ou "Comment puis-je le contacter ?"'
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
      titleFr: 'Data Scientist et ing�nieur en machine learning',
      summary: 'He combines machine learning, data analysis, and software engineering to build practical, scalable solutions.',
      summaryFr: 'Il combine le machine learning, l\'analyse de donn�es et l\'ing�nierie logicielle pour construire des solutions pratiques et �volutives.',
      education: {
        masters: {
          degree: 'Master of Engineering (Software Engineering)',
          degreeFr: 'Ma?trise en ing?nierie (g?nie logiciel)',
          school: 'Concordia University',
          location: 'Montreal, QC, Canada',
          locationFr: 'Montr?al, QC, Canada',
          date: 'Sep 2024 - Present',
          dateFr: 'Sep 2024 - Pr?sent',
          summary: 'His graduate work focuses on software engineering, machine learning, distributed systems, and practical product development.',
          summaryFr: 'Son parcours de ma?trise se concentre sur le g?nie logiciel, le machine learning, les syst?mes distribu?s et le d?veloppement de produits concrets.'
        },
        diploma: {
          degree: 'Post Graduate Diploma in Computer Applications',
          degreeFr: 'Dipl?me de troisi?me cycle en applications informatiques',
          school: 'Jamia Millia Islamia',
          location: 'New Delhi, India',
          locationFr: 'New Delhi, Inde',
          date: 'Sep 2022 - Jun 2023',
          dateFr: 'Sep 2022 - Juin 2023',
          summary: 'This diploma strengthened his foundation in computer applications and software-focused technical work.',
          summaryFr: 'Ce dipl?me a renforc? ses bases en applications informatiques et en travail technique orient? logiciel.'
        },
        bachelors: {
          degree: 'B.Sc. (Hons.) Mathematics (Minor: Statistics, Physics)',
          degreeFr: 'Licence avec mention en math?matiques (mineure : statistiques, physique)',
          school: 'Aligarh Muslim University',
          location: 'Aligarh, UP, India',
          locationFr: 'Aligarh, Uttar Pradesh, Inde',
          date: 'Jul 2019 - Aug 2022',
          dateFr: 'Juil 2019 - Ao?t 2022',
          summary: 'He built a strong analytical foundation through mathematics, with supporting study in statistics and physics.',
          summaryFr: 'Il a construit une base analytique solide gr?ce aux math?matiques, compl?t?e par des ?tudes en statistiques et en physique.'
        }
      },
      experience: [
        {
          role: 'Software Engineer Intern',
          roleFr: 'Stagiaire ing?nieur logiciel',
          company: 'NIMACT',
          location: 'Ghazipur, UP, India',
          locationFr: 'Ghazipur, Uttar Pradesh, Inde',
          date: 'Jun 2023 - Dec 2023',
          dateFr: 'Juin 2023 - D?c 2023',
          summary: 'He worked on software quality, database performance, testing automation, and machine-learning-based anomaly detection for production-oriented systems.',
          summaryFr: 'Il a travaill? sur la qualit? logicielle, les performances des bases de donn?es, l\'automatisation des tests et la d?tection d\'anomalies bas?e sur le machine learning pour des syst?mes orient?s production.',
          highlights: [
            'Executed end-to-end validation of deployed web platforms, improving production readiness and achieving a 95 percent defect detection rate across responsive UI workflows.',
            'Optimized relational database schemas and queries, reducing response time by 35 percent for key production workloads.',
            'Developed QA test scripts for more than 10 interactive data-visualization pipelines, ensuring full accuracy of dashboard metrics through automated validation checks.',
            'Automated UI and UX regression workflows, reducing regression issues by 40 percent and cutting manual QA effort by 20 hours per month.',
            'Implemented machine-learning-based anomaly detection to flag outliers in real-time data streams, improving reliability and speeding up incident discovery.'
          ],
          highlightsFr: [
            'A r?alis? la validation de bout en bout de plateformes web d?ploy?es, am?liorant la pr?paration ? la production et atteignant un taux de d?tection des d?fauts de 95 pour cent sur les interfaces responsives.',
            'A optimis? les sch?mas et requ?tes de bases de donn?es relationnelles, r?duisant de 35 pour cent le temps de r?ponse sur des charges critiques.',
            'A d?velopp? des scripts QA pour plus de 10 pipelines interactifs de visualisation de donn?es, garantissant l\'exactitude compl?te des m?triques via des validations automatis?es.',
            'A automatis? les workflows de r?gression UI et UX, r?duisant les probl?mes de r?gression de 40 pour cent et ?conomisant 20 heures de QA manuelle par mois.',
            'A mis en place une d?tection d\'anomalies bas?e sur le machine learning pour rep?rer les valeurs aberrantes dans des flux de donn?es en temps r?el.'
          ],
          skills: ['Python', 'SQL', 'REST APIs', 'Git', 'CI/CD', 'Test Automation', 'Debugging', 'Agile/Scrum'],
          skillsFr: ['Python', 'SQL', 'API REST', 'Git', 'CI/CD', 'Automatisation des tests', 'D?bogage', 'Agile/Scrum']
        }
      ],
      projects: [
        {
          name: 'Elasticsearch: Distributed Systems',
          description: 'Evaluated sharding, replication, and fault tolerance in Elasticsearch, improving query performance by 30 percent and maintaining high availability during node failures.',
          descriptionFr: 'A �valu� le sharding, la r�plication et la tol�rance aux pannes dans Elasticsearch, en am�liorant les performances des requ�tes de 30 pour cent tout en maintenant une haute disponibilit� lors des pannes de n�uds.',
          tech: ['Elasticsearch', 'Docker', 'Python', 'Kibana'],
          keywords: ['elasticsearch', 'distributed systems', 'search', 'kibana', 'docker']
        },
        {
          name: 'DeepMed Detection - Medical Image Analysis',
          description: 'Built deep learning models for medical image interpretation and segmentation with strong precision and recall.',
          descriptionFr: 'A d�velopp� des mod�les de deep learning pour l\'interpr�tation et la segmentation d\'images m�dicales avec une tr�s bonne pr�cision et un bon rappel.',
          tech: ['TensorFlow', 'PyTorch', 'Computer Vision'],
          keywords: ['deepmed', 'medical', 'medical image', 'image analysis', 'computer vision']
        },
        {
          name: 'Fraud Detection System',
          description: 'Developed a machine learning fraud detection system using RandomForest and deployed it with Flask for practical use.',
          descriptionFr: 'A d�velopp� un syst�me de d�tection de fraude bas� sur le machine learning avec RandomForest et l\'a d�ploy� avec Flask pour un usage pratique.',
          tech: ['Python', 'Flask', 'Heroku', 'RandomForest'],
          keywords: ['fraud', 'fraud detection', 'randomforest', 'flask', 'transactions']
        },
        {
          name: 'CODIS: Coding Society Website',
          description: 'Created a React and Node.js platform for a coding society with user-friendly registration and contact experiences.',
          descriptionFr: 'A cr�� une plateforme React et Node.js pour une association de codage avec une exp�rience fluide pour l\'inscription et le contact.',
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
        locationFr: 'Montr�al, Qu�bec, Canada',
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
