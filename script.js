// Smooth Scrolling for Navigation Links
document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
  // Typing Animation for Hero Section
  const typingElement = document.querySelector('.typing');
  const text = "Mohammad Aliyawar Khan";
  let index = 0;
  
  function type() {
    if (index < text.length) {
      typingElement.textContent += text.charAt(index);
      index++;
      setTimeout(type, 100); // Adjust typing speed here
    }
  }
  
  type();
  
  // Scroll Animations for Sections
  const sections = document.querySelectorAll('section');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2 // Trigger animation when 20% of the section is visible
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, observerOptions);
  
  sections.forEach(section => {
    observer.observe(section);
  });
  
  // Back to Top Button
  const backToTopButton = document.createElement('button');
  backToTopButton.innerHTML = '↑';
  backToTopButton.classList.add('back-to-top');
  document.body.appendChild(backToTopButton);
  
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  });
  
  // Toggle Contact Form Visibility and Active Link Highlighting
  const navLinks = document.querySelectorAll('.nav-link');
  const contactLink = document.querySelector('a[href="#contact"]');
  const contactForm = document.getElementById('contact-form');
  
  // Function to highlight the active link
  function highlightActiveLink() {
    const scrollPosition = window.scrollY;
  
    navLinks.forEach(link => {
      const section = document.querySelector(link.getAttribute('href'));
      if (
        section.offsetTop <= scrollPosition + 100 &&
        section.offsetTop + section.offsetHeight > scrollPosition + 100
      ) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Smooth scroll to sections and toggle contact form
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
  
      // Remove active class from all links
      navLinks.forEach(link => link.classList.remove('active'));
  
      // Add active class to the clicked link
      this.classList.add('active');
  
      // Scroll to the target section
      const targetSection = document.querySelector(this.getAttribute('href'));
      targetSection.scrollIntoView({
        behavior: 'smooth'
      });
  
      // Toggle contact form visibility for the "Contact" link
      if (this === contactLink) {
        if (contactForm.style.display === 'none' || contactForm.style.display === '') {
          contactForm.style.display = 'block';
        } else {
          contactForm.style.display = 'none';
        }
      } else {
        contactForm.style.display = 'none'; // Hide form for other links
      }
    });
  });
  
  // Highlight active link on scroll
  window.addEventListener('scroll', highlightActiveLink);
  
  // Form Submission Handling
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
  
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
  
    // Simulate form submission (replace with actual backend integration)
    console.log('Form Data:', data);
  
    // Display success message
    alert('Thank you! Your message has been sent.');
  
    // Reset the form
    contactForm.reset();
  
    // Hide the form after submission
    contactForm.style.display = 'none';
  });

  // Initialize AOS
    AOS.init();