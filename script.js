// User data management
let userData = {
    name: localStorage.getItem('userName') || 'Isticmaale',
    totalEarned: parseFloat(localStorage.getItem('totalEarned')) || 0,
    completedSurveys: parseInt(localStorage.getItem('completedSurveys')) || 0,
    joinDate: localStorage.getItem('joinDate') || new Date().toLocaleDateString('so-SO')
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    updateUserStats();
    addScrollAnimations();
    addButtonEffects();
    addParallaxEffect();
    addMouseTracker();
    enhanceFormValidation();
    startEarningsAnimation();
});

function initializePage() {
    // Update user name display
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = userData.name;
    }

    // Update stats
    updateUserStats();

    // Add countdown timer
    setInterval(updateCountdown, 1000);
}

function updateUserStats() {
    const elements = {
        'total-earned': `$${userData.totalEarned.toFixed(2)}`,
        'completed-surveys': userData.completedSurveys,
        'available-surveys': Math.max(0, 6 - userData.completedSurveys),
        'join-date': userData.joinDate
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Survey management
function startSurvey(surveyType, reward) {
    if (userData.completedSurveys >= 6) {
        showNotification('❌ Waxaad dhammeysay dhammaan surveys-ka maanta!', 'error');
        return;
    }

    showNotification('⏳ Survey-ga ayaa la billaabayaa...', 'info');

    // Simulate survey completion
    setTimeout(() => {
        completeSurvey(surveyType, reward);
    }, 3000);
}

function completeSurvey(surveyType, reward) {
    userData.totalEarned += reward;
    userData.completedSurveys += 1;

    // Save to localStorage
    localStorage.setItem('totalEarned', userData.totalEarned.toString());
    localStorage.setItem('completedSurveys', userData.completedSurveys.toString());

    updateUserStats();
    showNotification(`🎉 Guuleysta! $${reward} ayaa lagu daray xisaabkaaga!`, 'success');

    // Send to backend
    fetch('/start-survey', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `survey_type=${surveyType}&reward=${reward}`
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function getNotificationColor(type) {
    const colors = {
        'success': 'linear-gradient(135deg, #28a745, #20c997)',
        'error': 'linear-gradient(135deg, #dc3545, #fd7e14)',
        'info': 'linear-gradient(135deg, #667eea, #764ba2)',
        'warning': 'linear-gradient(135deg, #ffc107, #fd7e14)'
    };
    return colors[type] || colors.info;
}

// Countdown timer
function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeLeft = tomorrow.getTime() - now.getTime();

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Animation functions
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = counter.textContent.replace(/\d+/, target);
                clearInterval(timer);
            } else {
                counter.textContent = counter.textContent.replace(/\d+/, Math.floor(current));
            }
        }, 40);
    });
}

function startEarningsAnimation() {
    const earningsElement = document.getElementById('total-earned');
    if (earningsElement) {
        setInterval(() => {
            earningsElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                earningsElement.style.transform = 'scale(1)';
            }, 200);
        }, 5000);
    }
}

// Authentication functions
function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
    document.querySelector('.tab-button.active').classList.remove('active');
    document.querySelector('[onclick="showLogin()"]').classList.add('active');
}

function showRegister() {
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
    document.querySelector('.tab-button.active').classList.remove('active');
    document.querySelector('[onclick="showRegister()"]').classList.add('active');
}

function registerUser() {
    const form = document.getElementById('register-form');
    const formData = new FormData(form);

    showLoading(document.querySelector('#register-form button[type="submit"]'));

    fetch('/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            localStorage.setItem('userName', formData.get('username'));
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        } else {
            showNotification(data.message, 'error');
        }
    });
}

function loginUser() {
    const form = document.getElementById('login-form');
    const formData = new FormData(form);

    showLoading(document.querySelector('#login-form button[type="submit"]'));

    fetch('/authenticate', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            localStorage.setItem('userName', formData.get('username'));
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        } else {
            showNotification(data.message, 'error');
        }
    });
}

function logout() {
    localStorage.clear();
    showNotification('✅ Si nabad ah ayaad uga baxday!', 'success');
    setTimeout(() => {
        window.location.href = '/';
    }, 1500);
}

// Loading state
function showLoading(button) {
    const originalText = button.textContent;
    button.textContent = '⏳ Sugaya...';
    button.disabled = true;

    return () => {
        button.textContent = originalText;
        button.disabled = false;
    };
}

// Enhanced visual effects
function addButtonEffects() {
    document.querySelectorAll('.cta-button, .start-survey-btn, .auth-button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function addParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('header');
        const parallaxElements = document.querySelectorAll('.stat, .benefit-card');

        if (header) {
            header.style.transform = `translateY(${scrolled * 0.3}px)`;
        }

        parallaxElements.forEach((el, index) => {
            const speed = 0.1 + (index * 0.05);
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

function addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.card, .stat, .benefit-card, .work-item, .testimonial').forEach(el => {
        observer.observe(el);
    });
}

function addMouseTracker() {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.card, .benefit-card, .work-item');

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            }
        });
    });
}

function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const isValid = value.length > 0;

    if (isValid) {
        field.classList.remove('error');
        field.classList.add('valid');
    } else {
        field.classList.remove('valid');
        field.classList.add('error');
    }

    return isValid;
}

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}



// Countdown Timer with enhanced features
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    if (!countdownElement) return;

    // Get current time
    let hours = parseInt(hoursElement.textContent);
    let minutes = parseInt(minutesElement.textContent);
    let seconds = parseInt(secondsElement.textContent);

    // Decrease by 1 second
    seconds--;

    if (seconds < 0) {
        seconds = 59;
        minutes--;

        if (minutes < 0) {
            minutes = 59;
            hours--;

            if (hours < 0) {
                hours = 23;
            }
        }
    }

    // Update display with animation
    hoursElement.style.transform = 'scale(1.1)';
    minutesElement.style.transform = 'scale(1.1)';
    secondsElement.style.transform = 'scale(1.1)';

    setTimeout(() => {
        hoursElement.style.transform = 'scale(1)';
        minutesElement.style.transform = 'scale(1)';
        secondsElement.style.transform = 'scale(1)';
    }, 200);

    hoursElement.textContent = hours.toString().padStart(2, '0');
    minutesElement.textContent = minutes.toString().padStart(2, '0');
    secondsElement.textContent = seconds.toString().padStart(2, '0');
}

// Enhanced scroll animations
function addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all cards and sections
    document.querySelectorAll('.card, .stat, .benefit-card, .work-item, .testimonial').forEach(el => {
        observer.observe(el);
    });
}

// Typing effect for hero text
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Enhanced button click effects
function addButtonEffects() {
    document.querySelectorAll('.cta-button, .start-survey-btn, .auth-button').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Parallax effect for header
function addParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('header');
        const parallaxElements = document.querySelectorAll('.stat, .benefit-card');

        if (header) {
            header.style.transform = `translateY(${scrolled * 0.3}px)`;
        }

        parallaxElements.forEach((el, index) => {
            const speed = 0.1 + (index * 0.05);
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Enhanced statistics counter
function animateCounters() {
    const counters = document.querySelectorAll('.stat h3');

    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            const suffix = counter.textContent.includes('+') ? '+' : 
                          counter.textContent.includes('%') ? '%' : 
                          counter.textContent.includes('$') ? '' : '';
            const prefix = counter.textContent.includes('$') ? '$' : '';

            counter.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }, 16);
    });
}

// Mouse tracking effect
function addMouseTracker() {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.card, .benefit-card, .work-item');

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            }
        });
    });
}

// Form validation enhancement
function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;

    field.classList.remove('error', 'success');

    if (value === '') {
        field.classList.add('error');
        return false;
    }

    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add('error');
            return false;
        }
    }

    if (type === 'password' && value.length < 6) {
        field.classList.add('error');
        return false;
    }

    field.classList.add('success');
    return true;
}

// Loading state management
function showLoading(element) {
    const originalText = element.textContent;
    element.textContent = '';
    element.innerHTML = '<div class="spinner"></div>';
    element.disabled = true;

    return function hideLoading() {
        element.innerHTML = originalText;
        element.disabled = false;
    };
}

// Enhanced notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add ripple effect CSS
const rippleCSS = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.error {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.success {
    border-color: #28a745 !important;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Enhanced page initialization
document.addEventListener('DOMContentLoaded', function() {
    // Update countdown every second
    setInterval(updateCountdown, 1000);

    // Initialize all enhancements
    addScrollAnimations();
    addButtonEffects();
    addParallaxEffect();
    addMouseTracker();
    enhanceFormValidation();

    // Animate counters when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.disconnect();
            }
        });
    });

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Add typing effect to main heading
    const mainHeading = document.querySelector('header h1');
    if (mainHeading) {
        const originalText = mainHeading.textContent;
        typeWriter(mainHeading, originalText, 80);
    }

    // Enhanced click tracking for buttons
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            showNotification('🎉 Fursad wanaagsan! Dashboard-ka ayaad u wareegi doontaa...', 'success');
            console.log('CTA button clicked');
        });
    });

    // Smooth scrolling for any internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Add highlight effect
                target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                setTimeout(() => {
                    target.style.backgroundColor = '';
                }, 2000);
            }
        });
    });

    // Add loading states to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                const hideLoading = showLoading(submitButton);

                // Simulate processing time
                setTimeout(() => {
                    hideLoading();
                }, 2000);
            }
        });
    });

    // Add entrance animations
    setTimeout(() => {
        document.querySelectorAll('.card, .stats .stat').forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('slide-up');
            }, index * 100);
        });
    }, 500);
});

// Enhanced scroll effects
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('header');

    // Header parallax
    if (header) {
        header.style.transform = `translateY(${scrolled * 0.3}px)`;
    }

    // Show/hide scroll to top button
    const scrollTop = document.getElementById('scroll-top');
    if (scrollTop) {
        if (scrolled > 500) {
            scrollTop.style.display = 'block';
        } else {
            scrollTop.style.display = 'none';
        }
    }

    // Progress bar
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled_percentage = (winScroll / height) * 100;

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = scrolled_percentage + '%';
    }
});

// Add scroll to top functionality
function addScrollToTop() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scroll-top';
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
    `;

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    document.body.appendChild(scrollTopBtn);
}

// Add progress bar
function addProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(102, 126, 234, 0.1);
        z-index: 1000;
    `;

    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.style.cssText = `
        height: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        width: 0%;
        transition: width 0.3s ease;
    `;

    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
}

// Initialize additional features
setTimeout(() => {
    addScrollToTop();
    addProgressBar();
}, 1000);