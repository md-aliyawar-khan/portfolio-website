# Advanced Portfolio Website - Mohammad Aliyawar Khan

A modern, interactive portfolio website showcasing skills, projects, and experience with advanced features and animations.

## Features

### Core Features
- **Responsive Design** - Optimized for all devices and screen sizes
- **Dark/Light Theme Toggle** - User preference system with localStorage persistence
- **Smooth Animations** - GSAP-powered animations for professional feel
- **Interactive Elements** - Hover effects, transitions, and micro-interactions
- **Working Contact Form** - Formspree integration with validation and error handling
- **Performance Optimized** - Lazy loading, error boundaries, and performance monitoring
- **Accessibility Enhanced** - ARIA labels, keyboard navigation, and WCAG compliance

### Advanced Features

#### 1. Loading Screen
- Professional loading animation with spinner
- Simulated loading time for better UX
- Smooth fade-out transition

#### 2. Particle Background
- Interactive particle system in hero section
- Mouse hover effects and click interactions
- Configurable particle density and behavior

#### 3. GSAP Animations
- Scroll-triggered animations
- Staggered element reveals
- Smooth timeline animations
- Performance-optimized animations

#### 4. Interactive Project Showcase
- Project filtering by category (ML, Web Dev, Data Science)
- Modal popups with detailed project information
- Smooth transitions and hover effects
- Technology tags and links

#### 5. Animated Skill Bars
- Progress bars with percentage indicators
- Scroll-triggered animations
- Shimmer effects for visual appeal
- Categorized skills display

#### 6. Interactive Timeline
- Animated timeline for experience section
- Pulsing markers with visual effects
- Responsive design for mobile devices
- Technology tags for each experience

#### 7. Advanced Contact Form
- **Formspree Integration** - Real email functionality with spam protection
- **Enhanced Validation** - Real-time validation with length and pattern checks
- **Error Handling** - Comprehensive error messages and visual feedback
- **Loading States** - Professional loading animations and success notifications
- **Security Features** - Honeypot fields and input sanitization
- **Responsive Design** - Mobile-optimized with proper spacing

#### 8. Statistics Counter
- Animated number counters in about section
- Scroll-triggered animations
- Smooth counting effect with GSAP

#### 9. Blog Section
- Modern card design with hover effects
- Category tags and metadata
- Responsive grid layout
- Read more functionality

#### 10. Mobile-First Design
- Hamburger menu for mobile devices
- Touch-friendly interactions
- Optimized typography and spacing
- Responsive images and layouts

##  Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Interactive functionality
- **GSAP** - Professional animations
- **AOS (Animate On Scroll)** - Scroll animations
- **Particles.js** - Interactive particle system

### Libraries & Frameworks
- **Font Awesome** - Icons
- **Three.js** - 3D graphics (ready for future enhancements)
- **ScrollTrigger** - GSAP scroll animations

### Design Features
- **CSS Variables** - Theme system
- **CSS Grid & Flexbox** - Modern layouts
- **Backdrop Filter** - Glassmorphism effects
- **CSS Animations** - Smooth transitions
- **Responsive Images** - Optimized loading

##  Project Structure

```
Portfolio Website/
├── index.html          # Main HTML file
├── style.css           # Complete CSS styles
├── script.js           # JavaScript functionality
├── README.md           # Project documentation
└── Assets/             # Images and assets
    ├── Profile images
    ├── Project screenshots
    ├── Blog images
    └── Favicon files
```

##  Design System

### Color Palette
- **Primary**: #00BFA6 (Teal)
- **Secondary**: #FFD700 (Gold)
- **Accent**: #73c49f (Green)
- **Background**: Dark/Light theme support
- **Text**: High contrast for accessibility

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Responsive**: Scales appropriately on all devices
- **Hierarchy**: Clear heading and text hierarchy

### Animations
- **Duration**: 0.3s - 2s depending on complexity
- **Easing**: Power3.out for smooth feel
- **Performance**: Optimized with GSAP and requestAnimationFrame

##  Getting Started

1. **Clone or Download** the project files
2. **Configure Contact Form** (see `FORMSPREE_SETUP.md` for detailed instructions):
   - Sign up for Formspree at [formspree.io](https://formspree.io)
   - Create a new form and get your endpoint URL
   - Replace `YOUR_FORM_ID` in `index.html` with your actual form endpoint
3. **Open** `index.html` in a modern web browser
4. **Explore** the interactive features:
   - Click the theme toggle button (top right)
   - Scroll to see animations
   - Click on project cards for details
   - Test the contact form (now fully functional!)
   - Test mobile responsiveness
   - Check browser console for performance metrics

##  Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px
- **Small Mobile**: < 320px

##  Customization

### Adding New Projects
1. Add project data to the `projectData` object in `script.js`
2. Create corresponding HTML structure in `index.html`
3. Add project image to `Assets/` folder
4. Update project categories and filters

### Modifying Colors
1. Update CSS variables in `:root` selector
2. Add light theme variables in `[data-theme="light"]`
3. Ensure proper contrast ratios for accessibility

### Adding New Sections
1. Create HTML structure
2. Add corresponding CSS styles
3. Include GSAP animations if needed
4. Update navigation if required

##  Performance Optimizations

- **Lazy Loading**: Images load as needed
- **Debounced Events**: Scroll and resize events optimized
- **CSS Animations**: Hardware-accelerated where possible
- **Minified Libraries**: CDN versions for faster loading
- **Efficient Selectors**: Optimized CSS and JavaScript queries

##  Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+

##  SEO Features

- **Meta Tags**: Open Graph and Twitter Card support
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: Descriptive image alt attributes
- **Structured Data**: Ready for schema markup
- **Performance**: Fast loading times

##  Future Enhancements

- **Blog CMS Integration** - Dynamic blog content
- **Contact Form Backend** - Email functionality
- **Analytics Integration** - User behavior tracking
- **PWA Features** - Offline support and app-like experience
- **3D Elements** - Three.js integration for 3D graphics
- **Multi-language Support** - Internationalization
- **Accessibility Improvements** - WCAG 2.1 compliance

##  Contact

For questions or collaboration opportunities:
- **Email**: md.aliyawar.khan@gmail.com
- **LinkedIn**: [Mohammad Aliyawar Khan](https://linkedin.com/in/md-aliyawar-khan)
- **GitHub**: [md-aliyawar-khan](https://github.com/md-aliyawar-khan)

##  License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by Mohammad Aliyawar Khan** 