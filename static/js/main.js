

document.addEventListener('DOMContentLoaded', function() {
    
    initSmoothScrolling();
    initNavbarEffects();
    initAnimations();
    initDemoInteractions();
});


function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}


function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    });
}


function initAnimations() {
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    
    const animatedElements = document.querySelectorAll(
        '.step-card, .tech-card, .feature-card, .team-card, .metric-card'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    
    initCounterAnimations();
}


function initCounterAnimations() {
    const counters = document.querySelectorAll('.metric-value');
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const text = element.textContent;
    const isNumber = /^[\d,\.]+/.test(text);
    
    if (!isNumber) return;
    
    const numericValue = parseFloat(text.replace(/[^\d\.]/g, ''));
    const suffix = text.replace(/^[\d,\.]+/, '');
    
    let current = 0;
    const increment = numericValue / 100;
    const duration = 2000;
    const stepTime = duration / 100;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        let displayValue = current;
        if (numericValue >= 1000) {
            displayValue = (current / 1000).toFixed(1) + 'K';
        } else {
            displayValue = Math.floor(current).toLocaleString();
        }
        
        element.textContent = displayValue + suffix.replace('K', '');
    }, stepTime);
}


function initDemoInteractions() {
    
    const platformIcons = document.querySelectorAll('.platform-icons i');
    
    platformIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            platformIcons.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            
            const platformClass = Array.from(this.classList).find(cls => cls.includes('fa-'));
            updateSocialPreview(platformClass);
        });
    });
    
    
    const themeInput = document.querySelector('.demo-input input[type="text"]');
    if (themeInput) {
        themeInput.removeAttribute('readonly');
        themeInput.addEventListener('input', function() {
            updateDemoContent(this.value);
        });
    }
    
    
    simulateAIProcessing();
    
    addCardHoverEffects();
    
    initCTAButtons();
   
    initDatabaseFeatures();
}


function updateDemoContent(theme) {
    const caption = document.querySelector('.post-caption');
    const processingText = document.querySelector('.processing-indicator p');
    
    if (processingText) {
        processingText.textContent = `Analyzing "${theme}" theme...`;
    }
    
 
    const themeMapping = {
        'tech innovation': '🚀 The future of technology is here! Embracing innovation and pushing boundaries in the digital age. #TechInnovation #AI #Future #DigitalTransformation',
        'sustainability': '🌱 Building a greener tomorrow through sustainable innovation. Join us in creating positive environmental impact. #Sustainability #GreenTech #EcoFriendly #ClimateAction',
        'fitness': '💪 Transform your fitness journey with dedication and smart training. Every workout counts towards your goals! #Fitness #Motivation #Health #Wellness',
        'food': '🍽️ Discover amazing flavors and culinary adventures. Food brings people together and creates lasting memories. #Foodie #Culinary #Delicious #FoodLove'
    };
    
    const lowercaseTheme = theme.toLowerCase();
    const newCaption = themeMapping[lowercaseTheme] || `✨ Exploring the world of ${theme}! Discover new possibilities and share your passion. #${theme.replace(/\s+/g, '')} #Innovation #Passion #Discovery`;
    
    if (caption) {
        const username = caption.querySelector('strong').textContent;
        caption.innerHTML = `<strong>${username}</strong> ${newCaption}`;
    }
}


function initCTAButtons() {
    const demoButton = document.querySelector('a[href="#demo"]');
    const githubButton = document.querySelector('a[href*="github"]');
    
    if (demoButton) {
        demoButton.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
            
            // Highlight the demo section briefly
            const demoSection = document.getElementById('demo');
            demoSection.style.transform = 'scale(1.02)';
            demoSection.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                demoSection.style.transform = 'scale(1)';
            }, 300);
        });
    }
}


function initDatabaseFeatures() {
    
    addGenerateButton();
    
   
    loadAnalytics();
    
    
    setupAutoSave();
}

function addGenerateButton() {
    const demoStep = document.querySelector('.demo-step .demo-input');
    if (demoStep) {
        const generateButton = document.createElement('button');
        generateButton.className = 'btn btn-primary btn-sm mt-3 w-100';
        generateButton.innerHTML = '<i class="fas fa-magic me-2"></i>Generate & Save Post';
        generateButton.addEventListener('click', generateAndSavePost);
        demoStep.appendChild(generateButton);
    }
}

async function generateAndSavePost() {
    const themeInput = document.querySelector('.demo-input input[type="text"]');
    const toneSelect = document.querySelector('.demo-input select');
    const activePlatform = document.querySelector('.platform-icons i.active');
    
    const theme = themeInput?.value || 'General';
    const tone = toneSelect?.value || 'Professional';
    const platform = activePlatform?.classList.contains('fa-instagram') ? 'instagram' :
                    activePlatform?.classList.contains('fa-facebook') ? 'facebook' : 'linkedin';
    
    try {
        const response = await fetch('/api/generate-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                theme: theme,
                tone: tone,
                platform: platform
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            
            const caption = document.querySelector('.post-caption');
            if (caption) {
                const username = caption.querySelector('strong')?.textContent || 'ai_auto_publisher';
                caption.innerHTML = `<strong>${username}</strong> ${data.caption} ${data.hashtags}`;
            }
            
            
            showNotification('Post generated and saved to database!', 'success');
            
            
            loadAnalytics();
        } else {
            showNotification('Failed to generate post', 'error');
        }
    } catch (error) {
        console.error('Error generating post:', error);
        showNotification('Error connecting to database', 'error');
    }
}

async function loadAnalytics() {
    try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        
        
        updateMetricCard('Total Posts', data.total_posts);
        updateMetricCard('Published Posts', data.published_posts);
        updateMetricCard('Total Reach', data.reach);
        updateMetricCard('New Followers', data.new_followers);
        
        
        if (data.platform_stats) {
            updatePlatformStats(data.platform_stats);
        }
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function updateMetricCard(label, value) {
    const cards = document.querySelectorAll('.metric-card');
    cards.forEach(card => {
        const cardLabel = card.querySelector('.metric-label');
        if (cardLabel && cardLabel.textContent.includes(label.split(' ')[0])) {
            const valueElement = card.querySelector('.metric-value');
            if (valueElement) {
                valueElement.textContent = formatNumber(value);
            }
        }
    });
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function updatePlatformStats(stats) {
    
    console.log('Platform stats:', stats);
}

function setupAutoSave() {
    const themeInput = document.querySelector('.demo-input input[type="text"]');
    if (themeInput) {
        let saveTimeout;
        themeInput.addEventListener('input', function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                
                localStorage.setItem('lastTheme', this.value);
            }, 1000);
        });
        
        
        const savedTheme = localStorage.getItem('lastTheme');
        if (savedTheme) {
            themeInput.value = savedTheme;
        }
    }
}

function showNotification(message, type = 'info') {
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function updateSocialPreview(platform) {
    const preview = document.querySelector('.social-preview');
    
    
    preview.classList.remove('instagram-preview', 'facebook-preview', 'linkedin-preview');
    
    
    if (platform.includes('instagram')) {
        preview.classList.add('instagram-preview');
    } else if (platform.includes('facebook')) {
        preview.classList.add('facebook-preview');
    } else if (platform.includes('linkedin')) {
        preview.classList.add('linkedin-preview');
    }
    
    
    updatePreviewContent(platform);
}

function updatePreviewContent(platform) {
    const caption = document.querySelector('.post-caption');
    const username = document.querySelector('.username');
    
    const content = {
        'fa-instagram': {
            username: 'ai_auto_publisher',
            caption: '<strong>ai_auto_publisher</strong> 🚀 The future of technology is here! Embracing innovation and pushing boundaries in the digital age. #TechInnovation #AI #Future #DigitalTransformation'
        },
        'fa-facebook': {
            username: 'AI Auto Publisher',
            caption: '<strong>AI Auto Publisher</strong><br>🚀 The future of technology is here! We\'re embracing innovation and pushing boundaries in the digital age. What are your thoughts on the latest tech trends?<br><br>#TechInnovation #AI #Future #DigitalTransformation'
        },
        'fa-linkedin': {
            username: 'AI Auto Publisher',
            caption: '<strong>AI Auto Publisher</strong><br>The future of technology is here! 🚀<br><br>As we embrace innovation and push boundaries in the digital age, it\'s exciting to see how AI is transforming the way we work and create.<br><br>#TechInnovation #AI #Future #DigitalTransformation #TechLeadership'
        }
    };
    
    if (content[platform]) {
        username.textContent = content[platform].username;
        caption.innerHTML = content[platform].caption;
    }
}

function simulateAIProcessing() {
    const processingSteps = document.querySelectorAll('.model-item');
    
    function animateProcessing() {
        processingSteps.forEach((step, index) => {
            setTimeout(() => {
                const checkIcon = step.querySelector('.fa-check-circle');
                checkIcon.style.opacity = '0';
                
                setTimeout(() => {
                    checkIcon.style.opacity = '1';
                    checkIcon.style.transform = 'scale(1.2)';
                    
                    setTimeout(() => {
                        checkIcon.style.transform = 'scale(1)';
                    }, 200);
                }, 500);
            }, index * 1000);
        });
        
        
        setTimeout(animateProcessing, 6000);
    }
    
    
    setTimeout(animateProcessing, 2000);
}

function addCardHoverEffects() {
    const cards = document.querySelectorAll('.step-card, .feature-card, .tech-card, .team-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}


function addAnimatedClass(element, className, delay = 0) {
    setTimeout(() => {
        element.classList.add(className);
    }, delay);
}


function initParallaxEffect() {
    const heroSection = document.querySelector('.hero-section');
    const heroBackground = document.querySelector('.hero-bg');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
    });
}


function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    const text = heroTitle.textContent;
    
    heroTitle.textContent = '';
    heroTitle.style.borderRight = '2px solid #6366f1';
    
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        } else {
            heroTitle.style.borderRight = 'none';
        }
    }
    
    
    setTimeout(typeWriter, 1000);
}


function initEnhancedAnimations() {
    const elements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationType = entry.target.dataset.animate;
                entry.target.classList.add(`animate-${animationType}`);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => observer.observe(el));
}


function showPageLoadAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <i class="fas fa-robot loader-icon"></i>
            <div class="loader-text">Initializing AI Auto-Publisher...</div>
            <div class="loader-bar">
                <div class="loader-progress"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    
    let progress = 0;
    const progressBar = loader.querySelector('.loader-progress');
    
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(loader);
                }, 500);
            }, 500);
        }
        progressBar.style.width = progress + '%';
    }, 200);
}


window.addEventListener('load', function() {
    
    const existingLoader = document.querySelector('.page-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
    
    initParallaxEffect();
    initEnhancedAnimations();
    
    
    addCustomAnimationStyles();
});

function addCustomAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        }
        
        .loader-content {
            text-align: center;
            color: white;
        }
        
        .loader-icon {
            font-size: 4rem;
            color: #6366f1;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
        }
        
        .loader-text {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.8;
        }
        
        .loader-bar {
            width: 300px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
        }
        
        .loader-progress {
            height: 100%;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            border-radius: 2px;
            transition: width 0.3s ease;
            width: 0%;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .animate-slide-up {
            animation: slideInUp 0.8s ease-out;
        }
        
        .animate-slide-left {
            animation: slideInLeft 0.8s ease-out;
        }
        
        .animate-slide-right {
            animation: slideInRight 0.8s ease-out;
        }
    `;
    
    document.head.appendChild(style);
}
