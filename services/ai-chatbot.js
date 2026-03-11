class AIChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.profile = this.buildProfile();
    this.init();
  }

  init() {
    this.createChatbotUI();
    this.bindEvents();
    this.loadChatHistory();
    this.applyLanguageToUI();
  }

  createChatbotUI() {
    const html = `
      <div id="ai-chatbot" class="ai-chatbot">
        <div class="chatbot-header">
          <div class="chatbot-avatar"><i class="fas fa-robot"></i></div>
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
              <div class="message-content"><p>${this.formatBotMessage(this.getWelcomeMessage())}</p></div>
              <div class="message-time">${this.getCurrentTime()}</div>
            </div>
          </div>
          <div class="chat-input-container">
            <div class="quick-actions" id="chatbot-quick-actions"></div>
            <div class="chatbot-controls"><button type="button" id="chatbot-clear" class="chatbot-clear">Clear chat</button></div>
            <div class="input-group">
              <input type="text" id="chat-input" placeholder="Ask about education, projects, skills, CV, or contact..." />
              <button id="send-message" type="button" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    this.renderQuickActions();
  }

  bindEvents() {
    const toggle = document.getElementById('chatbot-toggle');
    const header = document.querySelector('#ai-chatbot .chatbot-header');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-message');
    const clearBtn = document.getElementById('chatbot-clear');

    if (toggle) toggle.addEventListener('click', (event) => { event.stopPropagation(); this.toggleChat(); });
    if (header) header.addEventListener('click', () => this.toggleChat());
    if (input) input.addEventListener('keypress', (event) => { if (event.key === 'Enter') this.sendMessage(); });
    if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearHistory());
    document.addEventListener('languagechange', () => this.refreshLanguage());
  }

  toggleChat() {
    const chatbot = document.getElementById('ai-chatbot');
    const body = document.getElementById('chatbot-body');
    const input = document.getElementById('chat-input');
    this.isOpen = !this.isOpen;
    chatbot.classList.toggle('open', this.isOpen);
    body.style.display = this.isOpen ? 'flex' : 'none';
    if (this.isOpen && input) input.focus();
  }

  sendMessage(messageOverride) {
    const input = document.getElementById('chat-input');
    const message = typeof messageOverride === 'string' ? messageOverride.trim() : (input ? input.value.trim() : '');
    if (!message) return;

    this.addMessage(message, 'user');
    if (input && typeof messageOverride !== 'string') input.value = '';
    this.showTypingIndicator();

    try {
      this.addMessage(this.generateResponse(message), 'bot');
    } catch (error) {
      console.error('Chatbot sendMessage error:', error);
      this.addMessage(this.getFallbackResponse(), 'bot');
    } finally {
      this.hideTypingIndicator();
      this.scrollChatToBottom();
    }
  }

  addMessage(content, sender) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    const safeContent = sender === 'user' ? this.escapeHtml(content) : this.formatBotMessage(content);
    messageDiv.innerHTML = `<div class="message-content"><p>${safeContent}</p></div><div class="message-time">${this.getCurrentTime()}</div>`;
    container.appendChild(messageDiv);
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

  escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    if (!container || document.getElementById('typing-indicator')) return;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div class="message-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    container.appendChild(typingDiv);
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.remove();
  }

  scrollChatToBottom() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
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

  hasAny(query, words) {
    return words.some((word) => query.includes(this.normalize(word)));
  }

  hasWholeWord(query, words) {
    return words.some((word) => {
      const normalized = this.normalize(word);
      const escaped = normalized.replace(/[-/\^$*+?.()|[]{}]/g, '\\$&');
      const pattern = new RegExp('(^|\\s)' + escaped + '(\\s|$)');
      return pattern.test(query);
    });
  }

  getCurrentLanguage() {
    const saved = localStorage.getItem('lang');
    const docLang = document.documentElement.lang;
    const lang = (saved || docLang || 'en').toLowerCase();
    return lang.startsWith('fr') ? 'fr' : 'en';
  }

  detectLanguage(message) {
    const query = this.normalize(message);
    return this.hasAny(query, ['bonjour', 'salut', 'merci', 'projet', 'formation', 'competence']) ? 'fr' : this.getCurrentLanguage();
  }

  generateResponse(userMessage) {
    const query = this.normalize(userMessage);
    const lang = this.detectLanguage(userMessage);
    const copy = this.getResponseCopy(lang);

    if (this.hasWholeWord(query, ['hello', 'hi', 'hey', 'bonjour', 'salut'])) return copy.greeting;
    if (this.hasAny(query, ['how are you', 'ca va'])) return copy.howAreYou;
    if (this.hasAny(query, ['thank you', 'thanks', 'merci'])) return copy.thanks;
    if (this.hasAny(query, ['bye', 'goodbye', 'au revoir'])) return copy.goodbye;
    if (this.hasAny(query, ['who are you', 'what can you do', 'help'])) return copy.identity;

    const conciseEntity = this.getConciseEntityResponse(query);
    if (conciseEntity) return conciseEntity;

    const projectMatch = this.findProject(query);
    if (projectMatch) return this.formatProjectResponse(projectMatch, lang);
    const projectTopic = this.findProjectTopic(query);
    if (projectTopic) return this.formatProjectTopicResponse(projectTopic, lang);

    if (this.isCurrentLocationIntent(query)) return this.formatCurrentLocationResponse(lang, query);
    if (this.isMoveToCanadaIntent(query)) return this.formatMoveToCanadaResponse(lang);
    if (this.isCurrentStudyIntent(query) || this.hasAny(query, ['education', 'degree', 'concordia', 'bachelor', 'masters', 'master', 'diploma', 'jamia', 'aligarh'])) return this.formatEducationResponse(lang, query);
    if (this.isLifeJourneyIntent(query)) return this.formatLifeJourneyResponse(lang, query);
    if (this.isGraduationIntent(query)) return this.formatGraduationResponse(lang);
    if (this.isAvailabilityIntent(query)) return this.formatAvailabilityResponse(lang);
    if (this.isHireIntent(query)) return this.formatHireResponse(lang);
    if (this.hasAny(query, ['resume', 'cv', 'download'])) return this.formatResumeResponse(lang);
    if (this.hasAny(query, ['contact', 'email', 'phone', 'linkedin', 'github'])) return this.formatContactResponse(lang);
    if (this.hasAny(query, ['experience', 'intern', 'internship', 'nimact', 'work'])) return this.formatExperienceResponse(lang, query);
    if (this.hasAny(query, ['skills', 'skill', 'python', 'react', 'java', 'sql', 'tensorflow', 'docker'])) return this.formatSkillsResponse(lang);
    if (this.hasAny(query, ['hobby', 'hobbies', 'interested in', 'interests', 'likes to do', 'free time', 'soccer', 'football', 'hiking', 'travel'])) return this.formatHobbiesResponse(lang);
    if (this.hasAny(query, ['favorite', 'favourite', 'club', 'team', 'player', 'messi', 'real madrid', 'argentina'])) return this.formatFavoritesResponse(lang, query);
    if (this.hasAny(query, ['projects', 'portfolio'])) return this.formatProjectsOverview(lang);
    if (this.hasAny(query, ['blog', 'blogs', 'article'])) return this.formatBlogsResponse(lang);
    if (this.hasAny(query, ['about mohammad', 'introduce', 'about you'])) return this.formatAboutResponse(lang);

    return this.formatHelpResponse(lang, query);
  }
  getConciseEntityResponse(query) {
    const conciseMap = [
      { keys: ['montreal', 'canada'], response: '**Montreal, Canada**' },
      { keys: ['real madrid'], response: '**Real Madrid**' },
      { keys: ['argentina'], response: '**Argentina National Soccer Team**' },
      { keys: ['messi', 'lionel messi'], response: '**Lionel Messi**' },
      { keys: ['concordia'], response: 'Mohammad is currently pursuing his **Master of Engineering in Software Engineering** at **Concordia University**.' },
      { keys: ['jamia', 'jamia millia islamia'], response: 'Mohammad completed his **Post Graduate Diploma in Computer Applications** from **Jamia Millia Islamia**.' },
      { keys: ['amu', 'aligarh muslim university'], response: '**Aligarh Muslim University**' },
      { keys: ['minto circle'], response: 'Mohammad completed his **Class 12 / Intermediate** from **Minto Circle**.' },
      { keys: ['dewaitha'], response: 'Mohammad is from **Dewaitha village, Ghazipur, Uttar Pradesh**.' },
      { keys: ['ghazipur'], response: 'Mohammad is from **Ghazipur district, Uttar Pradesh**.' },
      { keys: ['dildarnagar', 'noble senior secondary school'], response: 'Mohammad completed his **Class 10** at **Noble Senior Secondary School, Dildarnagar**.' },
      { keys: ['aligarh'], response: 'Mohammad moved to **Aligarh** in **2016** to pursue his secondary education, completed his **Class 12 / Intermediate** from **Minto Circle**, and later earned his **B.Sc. (Hons.) in Mathematics** from **Aligarh Muslim University**.' },
      { keys: ['nimact'], response: '**NIMACT**' },
      { keys: ['codis'], response: '**CODIS: Coding Society Website**' },
      { keys: ['deepmed'], response: '**DeepMed Detection - Medical Image Analysis**' },
      { keys: ['fraud detection'], response: '**Fraud Detection System**' },
      { keys: ['elasticsearch'], response: '**Elasticsearch: Distributed Systems**' },
      { keys: ['warzone'], response: '**Warzone Game Engine**' }
    ];

    const exact = conciseMap.find((item) => item.keys.some((key) => query === this.normalize(key)));
    return exact ? exact.response : null;
  }

  isCurrentLocationIntent(query) {
    return this.hasAny(query, ['montreal', 'canada', 'where are you now', 'where do you live', 'where do you live now', 'current location'])
      || (this.hasAny(query, ['where']) && this.hasAny(query, ['live', 'based', 'location', 'stay']) && this.hasAny(query, ['now', 'current', 'montreal', 'canada']));
  }

  isMoveToCanadaIntent(query) {
    return this.hasAny(query, ['when did you move to canada', 'when did you move to montreal', 'moved to canada', 'moved to montreal'])
      || (this.hasAny(query, ['when', 'what year']) && this.hasAny(query, ['move', 'moved']) && this.hasAny(query, ['canada', 'montreal']));
  }

  isCurrentStudyIntent(query) {
    return this.hasAny(query, ['what are you studying now', 'what do you study now', 'current program', 'current study'])
      || (this.hasAny(query, ['what', 'current', 'now']) && this.hasAny(query, ['study', 'studying', 'program', 'degree']))
      || (this.hasAny(query, ['master', 'masters']) && this.hasAny(query, ['current', 'now', 'concordia']));
  }

  isLifeJourneyIntent(query) {
    return this.hasAny(query, ['life journey', 'background', 'personal journey', 'birthplace', 'born', 'village', 'dewaitha', 'ghazipur', 'dildarnagar', 'minto circle'])
      || (this.hasAny(query, ['school', 'class 10', 'class 12']) && this.hasAny(query, ['where', 'which', 'what']));
  }

  isGraduationIntent(query) {
    return this.hasAny(query, ['when do you graduate', 'graduation date', 'expected graduation', 'graduating this june'])
      || (this.hasAny(query, ['graduate', 'graduation']) && this.hasAny(query, ['when', 'date', 'expected', 'june']));
  }

  isAvailabilityIntent(query) {
    return this.hasAny(query, ['are you available', 'available for work', 'open to work', 'looking for work', 'job search'])
      || (this.hasAny(query, ['available', 'open']) && this.hasAny(query, ['work', 'role', 'job', 'opportunity']));
  }

  isHireIntent(query) {
    return this.hasAny(query, ['why hire you', 'why should we hire you', 'why are you a good fit', 'strong candidate'])
      || (this.hasAny(query, ['hire', 'candidate', 'fit']) && this.hasAny(query, ['why', 'strong', 'good']));
  }

  findProject(query) {
    return this.profile.projects.find((project) => {
      const name = this.normalize(project.name);
      return query.includes(name) || project.keywords.some((keyword) => query.includes(this.normalize(keyword)));
    }) || null;
  }

  findProjectTopic(query) {
    const topics = [
      { match: this.hasAny(query, ['machine learning', 'ml work', 'ai work', 'deep learning', 'medical image', 'fraud detection']), names: ['DeepMed Detection - Medical Image Analysis', 'Fraud Detection System'] },
      { match: this.hasAny(query, ['react', 'web development', 'frontend', 'node', 'website']), names: ['CODIS: Coding Society Website'] },
      { match: this.hasAny(query, ['distributed systems', 'elasticsearch', 'fault tolerance']), names: ['Elasticsearch: Distributed Systems'] },
      { match: this.hasAny(query, ['testing', 'qa', 'automation', 'junit', 'warzone', 'game engine']), names: ['Warzone Game Engine'] }
    ].find((item) => item.match);

    if (!topics) return null;
    return this.profile.projects.filter((project) => topics.names.includes(project.name));
  }

  formatResumeResponse(lang) {
    const url = this.profile.resumeUrl;
    return lang === 'fr' ? `Vous pouvez telecharger le CV de Mohammad ici : [Telecharger le CV](${url}).` : `You can download Mohammad's resume here: [Download Resume](${url}).`;
  }

  formatContactResponse(lang) {
    const contact = this.profile.contact;
    return lang === 'fr'
      ? `Vous pouvez contacter Mohammad par email a **${contact.email}** ou par telephone au **${contact.phone}**. Il est base a **${contact.locationFr}**. LinkedIn : [Profil](${contact.linkedin}) et GitHub : [Depots](${contact.github}).`
      : `You can contact Mohammad by email at **${contact.email}** or phone at **${contact.phone}**. He is based in **${contact.location}**. LinkedIn: [Profile](${contact.linkedin}) and GitHub: [Repositories](${contact.github}).`;
  }

  formatCurrentLocationResponse(lang, query = '') {
    const life = this.profile.personal.lifeJourney;
    const masters = this.profile.education.masters;

    if (this.hasAny(query, ['montreal', 'canada']) && !this.hasAny(query, ['move', 'moved', 'study', 'studying', 'concordia'])) {
      return lang === 'fr' ? `**${life.currentCity}**` : `**${life.currentCity}**`;
    }

    return lang === 'fr'
      ? `Mohammad vit actuellement a **${life.currentCity}**. Il s'y est installe en **${life.movedToMontrealYear}** et poursuit actuellement une **${masters.degreeFr}** a **${masters.school}**.`
      : `Mohammad is currently based in **${life.currentCity}**. He moved there in **${life.movedToMontrealYear}** and is currently pursuing a **${masters.degree}** at **${masters.school}**.`;
  }

  formatMoveToCanadaResponse(lang) {
    const life = this.profile.personal.lifeJourney;
    return lang === 'fr' ? `Mohammad a demenage a **${life.currentCity}** en **${life.movedToMontrealYear}** pour poursuivre ses etudes superieures.` : `Mohammad moved to **${life.currentCity}** in **${life.movedToMontrealYear}** to continue his higher studies.`;
  }

  formatEducationResponse(lang, query) {
    const education = this.profile.education;
    if (this.hasAny(query, ['bachelor', 'undergraduate', 'mathematics', 'statistics', 'physics', 'aligarh'])) {
      return lang === 'fr'
        ? `**Licence :** Mohammad a commence ${education.bachelors.degreeFr} a **${education.bachelors.school}** a **${education.bachelors.locationFr}** en **juillet 2019** et a obtenu son diplome en **aout 2022**. ${education.bachelors.summaryFr}`
        : `**Bachelor's education:** Mohammad earned his ${education.bachelors.degree} from **${education.bachelors.school}** in **${education.bachelors.location}**. He began the program in **July 2019** and graduated in **August 2022**. He built a strong analytical foundation through mathematics, with minors in **Statistics** and **Physics**.`;
    }

    if (this.hasAny(query, ['diploma', 'post graduate diploma', 'pgdca', 'jamia', 'computer applications'])) {
      return lang === 'fr'
        ? `**Diplome de troisieme cycle :** Mohammad a commence son ${education.diploma.degreeFr} a **${education.diploma.school}** a **${education.diploma.locationFr}** en **septembre 2022** et a obtenu son diplome en **juin 2023**. ${education.diploma.summaryFr}`
        : `**Postgraduate diploma:** Mohammad completed his ${education.diploma.degree} at **${education.diploma.school}** in **${education.diploma.location}**. He started in **September 2022** and graduated in **June 2023**. ${education.diploma.summary}`;
    }

    if (this.hasAny(query, ['master', 'masters', 'concordia', 'software engineering'])) {
      if (this.hasAny(query, ['complete', 'completed', 'graduate', 'graduated', 'finish', 'finished', 'when will'])) {
        return lang === 'fr' ? `Mohammad devrait terminer sa maitrise en **juin 2026**.` : `Mohammad is expected to complete his master's in **June 2026**.`;
      }

      if (this.hasAny(query, ['start', 'started', 'begin', 'began'])) {
        return lang === 'fr' ? `Mohammad a commence sa maitrise en **septembre 2024**.` : `Mohammad started his master's in **September 2024**.`;
      }

      if (this.hasAny(query, ['when is he doing', 'timeline', 'duration'])) {
        return lang === 'fr' ? `Mohammad fait sa maitrise de **septembre 2024** a **juin 2026**.` : `Mohammad is doing his master's from **September 2024** to **June 2026**.`;
      }

      return lang === 'fr'
        ? `**Maitrise :** Mohammad a commence ${education.masters.degreeFr} a **${education.masters.school}** a **${education.masters.locationFr}** en **septembre 2024** et devrait obtenir son diplome en **juin 2026**. ${education.masters.summaryFr}`
        : `**Master's education:** Mohammad is currently pursuing a ${education.masters.degree} at **${education.masters.school}** in **${education.masters.location}**. He started in **September 2024** and is expected to graduate in **June 2026**. ${education.masters.summary}`;
    }

    return lang === 'fr'
      ? `**Formation :** Mohammad poursuit actuellement une **${education.masters.degreeFr}** a **${education.masters.school}**. Avant cela, il a obtenu un **${education.diploma.degreeFr}** a **${education.diploma.school}** et une **${education.bachelors.degreeFr}** a **${education.bachelors.school}**.`
      : `**Education:** Mohammad is currently pursuing a **${education.masters.degree}** at **${education.masters.school}**, with an expected graduation in **June 2026**. He previously completed a **${education.diploma.degree}** at **${education.diploma.school}** and a **${education.bachelors.degree}** at **${education.bachelors.school}**, building a strong foundation across software, computing, mathematics, statistics, and physics.`;
  }

  formatExperienceResponse(lang, query = '') {
    const experience = this.profile.experience[0];

    if (this.hasAny(query, ['complete', 'completed', 'finish', 'finished', 'when did he complete'])) {
      return lang === 'fr' ? `Mohammad a termine son stage en **decembre 2023**.` : `Mohammad completed his internship in **December 2023**.`;
    }

    if (this.hasAny(query, ['start', 'started', 'begin', 'began'])) {
      return lang === 'fr' ? `Mohammad a commence son stage en **juin 2023**.` : `Mohammad started his internship in **June 2023**.`;
    }

    if (this.hasAny(query, ['when did he do', 'timeline', 'duration'])) {
      return lang === 'fr' ? `Mohammad a fait son stage de **juin 2023** a **decembre 2023**.` : `Mohammad did his internship from **June 2023** to **December 2023**.`;
    }

    return lang === 'fr'
      ? `**Stage :** ${experience.roleFr} chez **${experience.company}** a ${experience.locationFr}. Il a commence en **juin 2023** et a termine en **decembre 2023**. ${experience.summaryFr} Competences utilisees : ${experience.skillsFr.join(', ')}.`
      : `**Internship experience:** ${experience.role} at **${experience.company}** in ${experience.location}. He started in **June 2023** and completed it in **December 2023**. ${experience.summary} Skills used: ${experience.skills.join(', ')}.`;
  }

  formatSkillsResponse(lang) {
    const skills = this.profile.skills;
    return lang === 'fr'
      ? `**Competences cles :** Langages : ${skills.languages.join(', ')}. Frameworks et bibliotheques : ${skills.frameworks.join(', ')}. Outils : ${skills.tools.join(', ')}.`
      : `**Core skills:** Languages: ${skills.languages.join(', ')}. Frameworks and libraries: ${skills.frameworks.join(', ')}. Tools: ${skills.tools.join(', ')}.`;
  }

  formatHobbiesResponse(lang) {
    return lang === 'fr' ? `**Loisirs et centres d'interet :** Mohammad aime jouer au football, faire de la randonnee et voyager.` : `**Hobbies and interests:** Mohammad enjoys playing soccer, hiking, and travelling.`;
  }

  formatFavoritesResponse(lang, query) {
    const favorites = this.profile.personal.favorites;
    if (this.hasAny(query, ['player', 'messi', 'lionel messi'])) return lang === 'fr' ? `Le joueur prefere de Mohammad est **${favorites.player}**.` : `Mohammad's favorite player is **${favorites.player}**.`;
    if (this.hasAny(query, ['argentina', 'national team'])) return lang === 'fr' ? `Son equipe nationale preferee est **${favorites.nationalTeam}**.` : `His favorite national team is **${favorites.nationalTeam}**.`;
    return lang === 'fr' ? `Le club prefere de Mohammad est **${favorites.club}**. Son equipe nationale preferee est **${favorites.nationalTeam}**, et son joueur prefere est **${favorites.player}**.` : `Mohammad's favorite club is **${favorites.club}**. His favorite national team is **${favorites.nationalTeam}**, and his favorite player is **${favorites.player}**.`;
  }
  formatProjectsOverview(lang) {
    const names = this.profile.projects.map((project) => project.name).join('**, **');
    return lang === 'fr' ? `Les projets phares de Mohammad sont **${names}**.` : `Mohammad's featured projects are **${names}**.`;
  }

  formatProjectResponse(project, lang) {
    return lang === 'fr' ? `**${project.name}:** ${project.descriptionFr} Technologies utilisees : ${project.tech.join(', ')}.` : `**${project.name}:** ${project.description} Technologies used: ${project.tech.join(', ')}.`;
  }

  formatProjectTopicResponse(projects, lang) {
    if (projects.length === 1) return this.formatProjectResponse(projects[0], lang);
    const names = projects.map((project) => project.name).join('**, **');
    return lang === 'fr' ? `Les projets les plus pertinents sont **${names}**.` : `The most relevant projects are **${names}**.`;
  }

  formatBlogsResponse(lang) {
    return lang === 'fr' ? `Le site presente actuellement des contenus sur les systemes distribues, le machine learning et la visualisation de donnees avec Python.` : `The site currently features posts on Distributed Systems, Machine Learning, and Data Visualization with Python.`;
  }

  formatLifeJourneyResponse(lang, query = '') {
    if (this.hasAny(query, ['minto circle', 'class 12', 'intermediate'])) {
      return lang === 'fr'
        ? `Mohammad a fait sa classe 12 a **Minto Circle**.`
        : `Mohammad completed his Class 12 / Intermediate from **Minto Circle**.`;
    }

    if (this.hasAny(query, ['class 10', 'dildarnagar', 'noble senior secondary'])) {
      return lang === 'fr'
        ? `Mohammad a fait sa classe 10 a **Noble Senior Secondary School, Dildarnagar**.`
        : `Mohammad completed his Class 10 at **Noble Senior Secondary School, Dildarnagar**.`;
    }

    if (this.hasAny(query, ['dewaitha', 'born', 'birthplace', 'village'])) {
      return lang === 'fr'
        ? `Mohammad est originaire de **Dewaitha, Ghazipur, Uttar Pradesh**.`
        : `Mohammad was born in **Dewaitha, Ghazipur, Uttar Pradesh**.`;
    }

    return lang === 'fr'
      ? `**Parcours personnel :** Mohammad est ne dans le village de **Dewaitha**, district de **Ghazipur, Uttar Pradesh**. Il a etudie jusqu'en classe 10 a **Noble Senior Secondary School, Dildarnagar**, puis a demenage a **Aligarh** en **2016** pour ses etudes secondaires a **AMU School - Syedna Tahir Saifuddin School (Minto Circle)**. Il a ensuite rejoint le **Department of Mathematics, Aligarh Muslim University** pour une **licence en mathematiques** avec mineures en **physique** et **statistiques**, puis a demenage a **Montreal, Canada** en **2024**.`
      : `**Life journey:** Mohammad was born in the village of **Dewaitha** in **Ghazipur district, Uttar Pradesh**. He studied through class 10 at **Noble Senior Secondary School, Dildarnagar**, then moved to **Aligarh** in **2016** for secondary education at **AMU School - Syedna Tahir Saifuddin School (Minto Circle)**. He later joined the **Department of Mathematics at Aligarh Muslim University** for a **B.Sc. (Hons.) in Mathematics** with minors in **Physics** and **Statistics**, and then moved to **Montreal, Canada** in **2024**.`;
  }

  formatAboutResponse(lang) {
    const profile = this.profile;
    return lang === 'fr' ? `Ce portfolio appartient a **${profile.name}**, un **${profile.titleFr}** base a **${profile.contact.locationFr}**. ${profile.summaryFr}` : `This portfolio belongs to **${profile.name}**, a **${profile.title}** based in **${profile.contact.location}**. ${profile.summary}`;
  }

  formatGraduationResponse(lang) {
    const career = this.profile.career;
    const masters = this.profile.education.masters;
    return lang === 'fr' ? `Mohammad prevoit d'obtenir son diplome en **${career.expectedGraduation}**. Il termine actuellement sa **${masters.degreeFr}** a **${masters.school}**.` : `Mohammad is expected to graduate in **${career.expectedGraduation}**. He is currently completing his **${masters.degree}** at **${masters.school}**.`;
  }

  formatAvailabilityResponse(lang) {
    const career = this.profile.career;
    return lang === 'fr' ? `Oui, Mohammad est **ouvert aux opportunites** pour des roles comme **${career.targetRoles.join(', ')}**. Sa date de fin d'etudes prevue est **${career.expectedGraduation}**.` : `Yes, Mohammad is **open to opportunities** for roles such as **${career.targetRoles.join(', ')}**. His expected graduation is **${career.expectedGraduation}**.`;
  }

  formatHireResponse(lang) {
    const career = this.profile.career;
    return lang === 'fr' ? `Mohammad est un bon candidat car il combine **genie logiciel**, **machine learning**, **tests et fiabilite**, et **projets concrets**. Il apporte une base analytique solide, une experience de stage chez **NIMACT**, et des projets en **fraude**, **systemes distribues** et **developpement web**. Il vise des roles comme **${career.targetRoles.join(', ')}**.` : `Mohammad is a strong candidate because he combines **software engineering**, **machine learning**, **testing and reliability**, and **hands-on projects**. He brings a strong analytical foundation, internship experience at **NIMACT**, and projects in **fraud detection**, **distributed systems**, and **web development**. He is targeting roles such as **${career.targetRoles.join(', ')}**.`;
  }

  getWelcomeMessage() {
    return this.getResponseCopy(this.getCurrentLanguage()).welcome;
  }

  getFallbackResponse() {
    return this.formatHelpResponse(this.getCurrentLanguage(), '');
  }

  formatHelpResponse(lang, query) {
    const suggestions = this.getSuggestions(query, lang);
    const base = this.getResponseCopy(lang).help;
    return suggestions.length ? `${base}\n\n${suggestions.join('\n')}` : base;
  }

  getSuggestions(query, lang) {
    const normalized = this.normalize(query);
    if (this.hasAny(normalized, ['project', 'react', 'ml', 'fraud', 'codis', 'deepmed'])) {
      return lang === 'fr'
        ? ['Essayez : **Quel projet utilise React ?**', 'Essayez : **Parlez-moi de Fraud Detection**']
        : ['Try: **Which project used React?**', 'Try: **Tell me about Fraud Detection**'];
    }

    if (this.hasAny(normalized, ['education', 'concordia', 'bachelor', 'jamia', 'amu'])) {
      return lang === 'fr'
        ? ['Essayez : **Quand obtiendra-t-il son diplome ?**', 'Essayez : **Parlez-moi de sa licence**']
        : ['Try: **When does he graduate?**', 'Try: **Tell me about his bachelor\'s education**'];
    }

    return lang === 'fr'
      ? ['Essayez : **Ou vit-il maintenant ?**', 'Essayez : **Pourquoi est-il un bon candidat ?**']
      : ['Try: **Where does he live now?**', 'Try: **Why is Mohammad a strong candidate?**'];
  }

  getUiCopy(lang) {
    if (lang === 'fr') {
      return {
        title: 'Assistant Portfolio',
        status: 'En ligne',
        placeholder: 'Posez une question sur la formation, les projets, les competences, le CV ou le contact...',
        clear: 'Effacer la discussion',
        toggleLabel: 'Ouvrir l assistant portfolio',
        quickActions: [
          { action: 'education', label: 'Formation' },
          { action: 'projects', label: 'Projets' },
          { action: 'skills', label: 'Competences' },
          { action: 'resume', label: 'CV' },
          { action: 'contact', label: 'Contact' }
        ]
      };
    }

    return {
      title: 'Portfolio Assistant',
      status: 'Online',
      placeholder: 'Ask about education, projects, skills, CV, or contact...',
      clear: 'Clear chat',
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
    return this.getCurrentLanguage() === 'fr'
      ? { education: 'Parlez-moi de la formation de Mohammad', projects: 'Quels projets Mohammad a-t-il realises ?', skills: 'Quelles sont les principales competences de Mohammad ?', resume: 'Comment puis-je telecharger le CV ?', contact: 'Comment puis-je contacter Mohammad ?' }
      : { education: 'Tell me about Mohammad\'s education', projects: 'What projects has Mohammad built?', skills: 'What are Mohammad\'s main skills?', resume: 'How can I download the resume?', contact: 'How can I contact Mohammad?' };
  }

  getResponseCopy(lang) {
    if (lang === 'fr') {
      return {
        welcome: 'Bonjour. Je peux repondre aux questions sur la formation, l experience, les competences, les projets, le CV et les coordonnees de Mohammad. Que souhaitez-vous savoir ?',
        greeting: 'Bonjour. Je suis l assistant portfolio de Mohammad. Vous pouvez me demander sa formation, ses projets, ses competences, son CV ou ses coordonnees.',
        howAreYou: 'Je vais bien, merci. Je suis pret a vous aider a decouvrir le profil de Mohammad, ses projets et ses experiences.',
        thanks: 'Avec plaisir. Si vous voulez, je peux aussi vous parler de ses projets, de sa formation, de ses competences ou de la maniere de le contacter.',
        goodbye: 'Au revoir. N hesitez pas a revenir si vous voulez en savoir plus sur Mohammad, son CV ou ses projets.',
        identity: 'Je suis l assistant portfolio de Mohammad. Je peux resumer sa formation, ses competences, ses projets, son experience, son CV et ses coordonnees.',
        help: 'Je peux vous aider avec la **formation**, l **experience**, les **competences**, les **projets**, le **CV**, les **coordonnees**, la **date de diplomation** et le **parcours**. Essayez : "Quand a-t-il demenage au Canada ?" ou "Quel projet utilise React ?"'
      };
    }

    return {
      welcome: 'Hello. I can answer questions about Mohammad\'s education, experience, skills, projects, CV, contact details, and career story. What would you like to know?',
      greeting: 'Hello. I\'m Mohammad\'s portfolio assistant. You can ask about his education, projects, skills, resume, contact details, or career journey.',
      howAreYou: 'I\'m doing well, thanks. I\'m here to help you learn about Mohammad\'s profile, projects, and experience.',
      thanks: 'You\'re welcome. If you want, I can also tell you about his projects, education, skills, graduation timeline, or how to contact him.',
      goodbye: 'Goodbye. Feel free to come back if you want to know more about Mohammad, his resume, or his projects.',
      identity: 'I\'m Mohammad\'s portfolio assistant. I can summarize his education, skills, projects, experience, resume, contact details, and job readiness.',
      help: 'I can help with **education**, **experience**, **skills**, **projects**, **resume/CV**, **contact details**, **graduation timing**, and **career fit**. Try asking "What are you studying now?", "Which project used React?", "When did you move to Canada?", or "Why is Mohammad a strong candidate?"'
    };
  }

  applyLanguageToUI() {
    const copy = this.getUiCopy(this.getCurrentLanguage());
    const title = document.querySelector('[data-chatbot-label="title"]');
    const status = document.querySelector('[data-chatbot-label="status"]');
    const input = document.getElementById('chat-input');
    const toggle = document.getElementById('chatbot-toggle');
    if (title) title.textContent = copy.title;
    if (status) status.textContent = copy.status;
    if (input) input.placeholder = copy.placeholder;
    if (toggle) toggle.setAttribute('aria-label', copy.toggleLabel);
    const clearBtn = document.getElementById('chatbot-clear');
    if (clearBtn) clearBtn.textContent = copy.clear;
    this.renderQuickActions();
  }

  refreshLanguage() {
    this.applyLanguageToUI();
    const firstBotMessage = document.querySelector('#chat-messages .bot-message .message-content p');
    if (firstBotMessage && this.messages.length === 0) firstBotMessage.innerHTML = this.formatBotMessage(this.getWelcomeMessage());
  }
  renderQuickActions() {
    const container = document.getElementById('chatbot-quick-actions');
    if (!container) return;
    const labels = this.getUiCopy(this.getCurrentLanguage()).quickActions;
    container.innerHTML = labels.map((item) => `<button class="quick-action" data-action="${item.action}" type="button">${item.label}</button>`).join('');
    container.querySelectorAll('.quick-action').forEach((button) => {
      button.addEventListener('click', (event) => {
        const action = (event.currentTarget || event.target).dataset.action;
        if (action) this.handleQuickAction(action);
      });
    });
  }

  buildProfile() {
    return {
      name: 'Mohammad Aliyawar Khan',
      title: 'Data Scientist and Machine Learning Engineer',
      titleFr: 'Data Scientist et ingenieur en machine learning',
      summary: 'He combines machine learning, data analysis, software engineering, and testing discipline to build practical, scalable solutions.',
      summaryFr: 'Il combine le machine learning, l analyse de donnees, l ingenierie logicielle et la discipline de test pour construire des solutions pratiques et evolutives.',
      education: {
        masters: { degree: 'Master of Engineering (Software Engineering)', degreeFr: 'Maitrise en ingenierie (genie logiciel)', school: 'Concordia University', location: 'Montreal, QC, Canada', locationFr: 'Montreal, QC, Canada', date: 'Sep 2024 - Present', dateFr: 'Sep 2024 - Present', summary: 'His graduate work focuses on software engineering, machine learning, distributed systems, and practical product development.', summaryFr: 'Son parcours de maitrise se concentre sur le genie logiciel, le machine learning, les systemes distribues et le developpement de produits concrets.' },
        diploma: { degree: 'Post Graduate Diploma in Computer Applications', degreeFr: 'Diplome de troisieme cycle en applications informatiques', school: 'Jamia Millia Islamia', location: 'New Delhi, India', locationFr: 'New Delhi, Inde', date: 'Sep 2022 - Jun 2023', dateFr: 'Sep 2022 - Jun 2023', summary: 'This diploma strengthened his foundation in computer applications and software-focused technical work.', summaryFr: 'Ce diplome a renforce ses bases en applications informatiques et en travail technique oriente logiciel.' },
        bachelors: { degree: 'B.Sc. (Hons.) Mathematics (Minor: Statistics, Physics)', degreeFr: 'Licence avec mention en mathematiques (mineure : statistiques, physique)', school: 'Aligarh Muslim University', location: 'Aligarh, UP, India', locationFr: 'Aligarh, Uttar Pradesh, Inde', date: 'Jul 2019 - Aug 2022', dateFr: 'Jul 2019 - Aug 2022', summary: 'He built a strong analytical foundation through mathematics, with supporting study in statistics and physics.', summaryFr: 'Il a construit une base analytique solide grace aux mathematiques, completee par des etudes en statistiques et en physique.' }
      },
      experience: [{ role: 'Software Engineer Intern', roleFr: 'Stagiaire ingenieur logiciel', company: 'NIMACT', location: 'Ghazipur, UP, India', locationFr: 'Ghazipur, Uttar Pradesh, Inde', date: 'Jun 2023 - Dec 2023', dateFr: 'Jun 2023 - Dec 2023', summary: 'He worked on software quality, database performance, test automation, regression coverage, and machine-learning-based anomaly detection for production-oriented systems.', summaryFr: 'Il a travaille sur la qualite logicielle, les performances des bases de donnees, l automatisation des tests, la couverture de regression et la detection d anomalies basee sur le machine learning pour des systemes orientes production.', skills: ['Python', 'SQL', 'REST APIs', 'Git', 'CI/CD', 'Test Automation', 'Debugging', 'Agile/Scrum'], skillsFr: ['Python', 'SQL', 'API REST', 'Git', 'CI/CD', 'Automatisation des tests', 'Debogage', 'Agile/Scrum'] }],
      projects: [
        { name: 'Elasticsearch: Distributed Systems', description: 'Evaluated sharding, replication, and fault tolerance in Elasticsearch, improving query performance and maintaining high availability during node failures.', descriptionFr: 'A evalue le sharding, la replication et la tolerance aux pannes dans Elasticsearch, en ameliorant les performances des requetes et en maintenant une haute disponibilite.', tech: ['Elasticsearch', 'Docker', 'Python', 'Kibana'], keywords: ['elasticsearch', 'distributed systems', 'search', 'kibana', 'docker'] },
        { name: 'DeepMed Detection - Medical Image Analysis', description: 'Built deep learning models for medical image interpretation and segmentation with strong precision and recall.', descriptionFr: 'A developpe des modeles de deep learning pour l interpretation et la segmentation d images medicales avec une tres bonne precision et un bon rappel.', tech: ['TensorFlow', 'PyTorch', 'Computer Vision'], keywords: ['deepmed', 'medical', 'medical image', 'image analysis', 'computer vision'] },
        { name: 'Fraud Detection System', description: 'Developed a machine learning fraud detection system using RandomForest and deployed it with Flask for practical use.', descriptionFr: 'A developpe un systeme de detection de fraude base sur le machine learning avec RandomForest et l a deploye avec Flask pour un usage pratique.', tech: ['Python', 'Flask', 'Heroku', 'RandomForest'], keywords: ['fraud', 'fraud detection', 'randomforest', 'flask', 'transactions'] },
        { name: 'CODIS: Coding Society Website', description: 'Created a React and Node.js platform for a coding society with user-friendly registration and contact experiences.', descriptionFr: 'A cree une plateforme React et Node.js pour une association de codage avec une experience fluide pour l inscription et le contact.', tech: ['React', 'Node.js', 'JavaScript'], keywords: ['codis', 'coding society', 'react', 'node', 'website'] },
        { name: 'Warzone Game Engine', description: 'Contributed to a Java game engine project with JUnit testing, CI/CD support, regression coverage, and debugging of critical logic.', descriptionFr: 'A contribue a un projet de moteur de jeu Java avec des tests JUnit, du support CI/CD, de la couverture de regression et du debogage.', tech: ['Java', 'JUnit', 'CI/CD', 'Design Patterns'], keywords: ['warzone', 'game engine', 'java', 'junit', 'testing', 'automation'] }
      ],
      skills: { languages: ['Java', 'Python', 'C++', 'SQL', 'JavaScript', 'HTML/CSS'], frameworks: ['TensorFlow', 'PyTorch', 'Flask', 'React', 'Node.js', 'scikit-learn'], tools: ['Git', 'Docker', 'AWS EC2', 'Elasticsearch', 'JUnit', 'PyTest'] },
      career: { expectedGraduation: 'June 2026', targetRoles: ['Software Engineer', 'Machine Learning Engineer', 'Data Scientist'] },
      contact: { email: 'md.aliyawar.khan@gmail.com', phone: '+1 (438) 787-0249', location: 'Montreal, Quebec, Canada', locationFr: 'Montreal, Quebec, Canada', linkedin: 'https://linkedin.com/in/md-aliyawar-khan', github: 'https://github.com/md-aliyawar-khan' },
      personal: { hobbies: ['Soccer', 'Hiking', 'Travelling'], favorites: { club: 'Real Madrid', nationalTeam: 'Argentina National Soccer Team', player: 'Lionel Messi' }, lifeJourney: { currentCity: 'Montreal, Canada', movedToMontrealYear: '2024' } },
      resumeUrl: this.getResumeUrl()
    };
  }

  getResumeUrl() {
    const resumeLink = document.querySelector('a[href*="resume"], a[href$=".pdf"]');
    return resumeLink ? resumeLink.getAttribute('href') : 'Assets/KHAN_MD_A.pdf';
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  saveChatHistory() {
    localStorage.setItem('chatbot_history', JSON.stringify(this.messages));
  }

  loadChatHistory() {
    const history = localStorage.getItem('chatbot_history');
    if (!history) return;
    try { this.messages = JSON.parse(history) || []; } catch (error) { console.warn('Unable to parse chatbot history:', error); this.messages = []; }
  }

  clearHistory() {
    this.messages = [];
    localStorage.removeItem('chatbot_history');
    const messages = document.getElementById('chat-messages');
    if (messages) messages.innerHTML = `<div class="message bot-message"><div class="message-content"><p>${this.formatBotMessage(this.getWelcomeMessage())}</p></div><div class="message-time">${this.getCurrentTime()}</div></div>`;
  }
}

let chatbot;
document.addEventListener('DOMContentLoaded', () => {
  try {
    const enabled = typeof CONFIG !== 'undefined' && CONFIG.FEATURES && CONFIG.FEATURES.AI_CHATBOT;
    if (enabled !== false) chatbot = new AIChatbot();
  } catch (error) {
    console.warn('Chatbot init:', error);
    chatbot = new AIChatbot();
  }
});
