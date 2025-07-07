// Global Variables
let currentSlide = 0;
let currentTestimonial = 0;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDates = [];

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePreloader();
    initializeNavigation();
    initializeHeroSlider();
    initializeTypewriter();
    initializeDarkMode();
    initializeProgressBar();
    initializeStickyBooking();
    initializeScrollAnimations();
    initializeCalendar();
    initializeTestimonials();
    initializeLiveChat();
    // Removed initializeParallax() to fix the sticky features issue
});

// Preloader
function initializePreloader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            preloader.classList.add('hidden');
            document.body.classList.add('loaded');
        }, 1500);
    });
}

// Navigation
function initializeNavigation() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
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

// Hero Slider
function initializeHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // Auto-slide
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    currentSlide += direction;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    const dots = document.querySelectorAll('.dot');
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentSlide);
    });
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function currentSlideSet(index) {
    currentSlide = index - 1;
    changeSlide(0);
}

// Typewriter Effect
function initializeTypewriter() {
    const text = "Modern Apartment for Rent in Downtown";
    const typewriterElement = document.getElementById('typewriter-text');
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            typewriterElement.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }

    setTimeout(typeWriter, 1000);
}

// Dark Mode
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Progress Bar
function initializeProgressBar() {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('progress-bar').style.width = scrolled + '%';
    });
}

// Sticky Booking Panel
function initializeStickyBooking() {
    const stickyBooking = document.getElementById('sticky-booking');
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', () => {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        if (window.pageYOffset > heroBottom) {
            stickyBooking.classList.add('visible');
        } else {
            stickyBooking.classList.remove('visible');
        }
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Calendar Functions
function initializeCalendar() {
    generateCalendar(currentMonth, currentYear);
}

function generateCalendar(month, year) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    document.getElementById('calendar-month').textContent = `${monthNames[month]} ${year}`;
    
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day header';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Randomly assign availability (in real app, this would come from backend)
        const isAvailable = Math.random() > 0.3;
        if (isAvailable) {
            dayElement.classList.add('available');
            dayElement.addEventListener('click', () => selectDate(dayElement, day, month, year));
        } else {
            dayElement.classList.add('occupied');
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function selectDate(element, day, month, year) {
    const dateString = `${year}-${month + 1}-${day}`;
    
    if (selectedDates.includes(dateString)) {
        selectedDates = selectedDates.filter(date => date !== dateString);
        element.classList.remove('selected');
    } else {
        selectedDates.push(dateString);
        element.classList.add('selected');
    }
}

function changeMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    generateCalendar(currentMonth, currentYear);
}

// Floor Plan Functions
function showRoomInfo(roomType) {
    const roomInfo = document.getElementById('room-info');
    const roomData = {
        living: {
            title: "Living Room",
            description: "Spacious 25m² living area with modern furniture, 55\" smart TV, comfortable seating for 6 people, and large windows with city views."
        },
        kitchen: {
            title: "Kitchen",
            description: "Fully equipped modern kitchen with stainless steel appliances, dishwasher, microwave, coffee machine, and dining space for 4."
        },
        bedroom1: {
            title: "Master Bedroom",
            description: "Large 18m² bedroom with king-size bed, built-in wardrobe, work desk, and en-suite bathroom access."
        },
        bedroom2: {
            title: "Second Bedroom",
            description: "Comfortable 15m² bedroom with queen-size bed, wardrobe, and study area. Perfect for guests or home office."
        },
        bathroom1: {
            title: "Master Bathroom",
            description: "Luxurious bathroom with rainfall shower, bathtub, double vanity, and premium fixtures."
        },
        bathroom2: {
            title: "Guest Bathroom",
            description: "Modern guest bathroom with shower, vanity, and contemporary design."
        },
        balcony: {
            title: "Balcony",
            description: "Private 8m² balcony with outdoor furniture, perfect for morning coffee or evening relaxation with city views."
        }
    };
    
    const room = roomData[roomType];
    if (room) {
        roomInfo.innerHTML = `
            <h3>${room.title}</h3>
            <p>${room.description}</p>
        `;
    }
}

// Gallery Functions
function openModal(imageSrc) {
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-image');
    modal.style.display = 'block';
    modalImg.src = imageSrc;
}

function closeModal() {
    const modal = document.getElementById('gallery-modal');
    modal.style.display = 'none';
}

// Close modal when clicking outside the image
window.addEventListener('click', (event) => {
    const modal = document.getElementById('gallery-modal');
    if (event.target === modal) {
        closeModal();
    }
});

// FAQ Functions
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const faqAnswer = faqItem.querySelector('.faq-answer');
    
    faqItem.classList.toggle('active');
    
    if (faqItem.classList.contains('active')) {
        faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
    } else {
        faqAnswer.style.maxHeight = '0';
    }
}

// Testimonials Functions
function initializeTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length > 0) {
        showTestimonial(0);
        
        // Auto-rotate testimonials
        setInterval(() => {
            changeTestimonial(1);
        }, 7000);
    }
}

function showTestimonial(index) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle('active', i === index);
    });
}

function changeTestimonial(direction) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    currentTestimonial += direction;
    
    if (currentTestimonial >= testimonials.length) {
        currentTestimonial = 0;
    } else if (currentTestimonial < 0) {
        currentTestimonial = testimonials.length - 1;
    }
    
    showTestimonial(currentTestimonial);
}

// Live Chat Functions
function initializeLiveChat() {
    // Live chat functionality removed - using external service instead
}

function toggleChat() {
    const chatBody = document.getElementById('chat-body');
    const chatToggle = document.getElementById('chat-toggle');
    
    chatBody.classList.toggle('open');
    chatToggle.textContent = chatBody.classList.contains('open') ? '−' : '+';
}

function sendChatMessage() {
    // Chat functionality handled by external service
}

function addChatMessage(message, sender) {
    // Chat functionality handled by external service
}

function handleChatEnter(event) {
    // Chat functionality handled by external service
}

// Contact Form Functions
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const inquiryType = document.getElementById('inquiry-type').value;
    const message = document.getElementById('message').value;
    
    // Basic validation
    if (!name || !email || !inquiryType || !message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Show success message
    const successDiv = document.getElementById('form-success');
    successDiv.classList.add('show');
    
    // Reset form
    this.reset();
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 5000);
});

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function downloadBrochure() {
    // In a real application, this would download an actual PDF
    alert('Brochure download will be available soon! Please contact us directly for detailed information.');
}

// Smooth scrolling for all internal links
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

// Lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

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

// Apply debouncing to scroll-heavy functions
const debouncedScrollHandler = debounce(() => {
    // Handle scroll-based animations here if needed
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);