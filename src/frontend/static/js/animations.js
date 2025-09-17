// Animation controller using Anime.js
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.isAnimating = false;
        this.animationQueue = [];
        
        this.init();
    }
    
    init() {
        this.setupGlobalAnimations();
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupClickAnimations();
    }
    
    setupGlobalAnimations() {
        // Page load animation
        this.animatePageLoad();
        
        // Globe rotation
        this.setupGlobeRotation();
        
        // ARGO float animations
        this.setupFloatAnimations();
    }
    
    animatePageLoad() {
        const elements = [
            '.top-nav',
            '.sidebar',
            '.filters-panel',
            '.globe',
            '.chatbot-container'
        ];
        
        elements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                anime({
                    targets: element,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 800,
                    delay: index * 100,
                    easing: 'easeOutExpo'
                });
            }
        });
    }
    
    setupGlobeRotation() {
        const globe = document.querySelector('.globe');
        if (!globe) return;
        
        this.animations.set('globeRotation', anime({
            targets: globe,
            rotate: '360deg',
            duration: 20000,
            easing: 'linear',
            loop: true,
            autoplay: true
        }));
    }
    
    setupFloatAnimations() {
        // Animate ARGO float dots
        document.querySelectorAll('.argo-dot').forEach((dot, index) => {
            // Initial appearance
            anime({
                targets: dot,
                scale: [0, 1],
                opacity: [0, 1],
                duration: 600,
                delay: index * 50,
                easing: 'easeOutBack'
            });
            
            // Continuous pulse animation
            anime({
                targets: dot,
                scale: [1, 1.2, 1],
                duration: 2000,
                loop: true,
                delay: index * 100,
                easing: 'easeInOutSine'
            });
        });
    }
    
    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateOnScroll(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // Observe elements that should animate on scroll
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }
    
    animateOnScroll(element) {
        const animationType = element.dataset.animation || 'fadeInUp';
        
        switch(animationType) {
            case 'fadeInUp':
                this.fadeInUp(element);
                break;
            case 'fadeInLeft':
                this.fadeInLeft(element);
                break;
            case 'fadeInRight':
                this.fadeInRight(element);
                break;
            case 'scaleIn':
                this.scaleIn(element);
                break;
            case 'slideInLeft':
                this.slideInLeft(element);
                break;
            case 'slideInRight':
                this.slideInRight(element);
                break;
        }
    }
    
    fadeInUp(element) {
        anime({
            targets: element,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }
    
    fadeInLeft(element) {
        anime({
            targets: element,
            opacity: [0, 1],
            translateX: [-30, 0],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }
    
    fadeInRight(element) {
        anime({
            targets: element,
            opacity: [0, 1],
            translateX: [30, 0],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }
    
    scaleIn(element) {
        anime({
            targets: element,
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 600,
            easing: 'easeOutBack'
        });
    }
    
    slideInLeft(element) {
        anime({
            targets: element,
            translateX: [-100, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }
    
    slideInRight(element) {
        anime({
            targets: element,
            translateX: [100, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }
    
    setupHoverAnimations() {
        // Button hover animations
        document.querySelectorAll('.tab-btn, .btn-login, .btn-signup, .send-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.animateHover(btn, 'scale');
            });
            
            btn.addEventListener('mouseleave', () => {
                this.animateHoverOut(btn, 'scale');
            });
        });
        
        // ARGO dot hover animations
        document.querySelectorAll('.argo-dot').forEach(dot => {
            dot.addEventListener('mouseenter', () => {
                this.animateFloatHover(dot);
            });
            
            dot.addEventListener('mouseleave', () => {
                this.animateFloatHoverOut(dot);
            });
        });
        
        // Prompt card hover animations
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateCardHover(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.animateCardHoverOut(card);
            });
        });
    }
    
    animateHover(element, type) {
        switch(type) {
            case 'scale':
                anime({
                    targets: element,
                    scale: 1.05,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
                break;
            case 'lift':
                anime({
                    targets: element,
                    translateY: -5,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
                break;
        }
    }
    
    animateHoverOut(element, type) {
        switch(type) {
            case 'scale':
                anime({
                    targets: element,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
                break;
            case 'lift':
                anime({
                    targets: element,
                    translateY: 0,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
                break;
        }
    }
    
    animateFloatHover(dot) {
        anime({
            targets: dot,
            scale: 1.5,
            duration: 300,
            easing: 'easeOutBack'
        });
        
        // Add glow effect
        dot.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
    }
    
    animateFloatHoverOut(dot) {
        anime({
            targets: dot,
            scale: 1,
            duration: 300,
            easing: 'easeOutQuad'
        });
        
        // Remove glow effect
        dot.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
    }
    
    animateCardHover(card) {
        anime({
            targets: card,
            translateY: -5,
            scale: 1.02,
            duration: 300,
            easing: 'easeOutQuad'
        });
    }
    
    animateCardHoverOut(card) {
        anime({
            targets: card,
            translateY: 0,
            scale: 1,
            duration: 300,
            easing: 'easeOutQuad'
        });
    }
    
    setupClickAnimations() {
        // Tab switching animations
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.animateTabSwitch(btn);
            });
        });
        
        // Message sending animation
        document.getElementById('sendBtn')?.addEventListener('click', () => {
            this.animateMessageSend();
        });
        
        // Float selection animation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('argo-dot')) {
                this.animateFloatSelection(e.target);
            }
        });
    }
    
    animateTabSwitch(activeBtn) {
        // Animate active button
        anime({
            targets: activeBtn,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutQuad'
        });
        
        // Animate tab content transition
        const tabContent = document.querySelector('.tab-content.active');
        if (tabContent) {
            anime({
                targets: tabContent,
                opacity: [1, 0],
                translateX: [0, 50],
                duration: 200,
                easing: 'easeInQuad',
                complete: () => {
                    anime({
                        targets: tabContent,
                        opacity: [0, 1],
                        translateX: [50, 0],
                        duration: 300,
                        easing: 'easeOutQuad'
                    });
                }
            });
        }
    }
    
    animateMessageSend() {
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            anime({
                targets: sendBtn,
                scale: [1, 0.8, 1],
                duration: 200,
                easing: 'easeOutQuad'
            });
        }
    }
    
    animateFloatSelection(dot) {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'float-ripple';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 215, 0, 0.3);
            transform: scale(0);
            pointer-events: none;
            z-index: 10;
        `;
        
        const rect = dot.getBoundingClientRect();
        const globe = document.querySelector('.globe');
        const globeRect = globe.getBoundingClientRect();
        
        ripple.style.left = `${rect.left - globeRect.left}px`;
        ripple.style.top = `${rect.top - globeRect.top}px`;
        ripple.style.width = ripple.style.height = `${rect.width}px`;
        
        globe.appendChild(ripple);
        
        anime({
            targets: ripple,
            scale: [0, 3],
            opacity: [0.5, 0],
            duration: 600,
            easing: 'easeOutQuad',
            complete: () => ripple.remove()
        });
    }
    
    // Message animations
    animateMessageAppearance(messageElement) {
        anime({
            targets: messageElement,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 400,
            easing: 'easeOutExpo'
        });
    }
    
    animateTypingIndicator(typingElement) {
        const dots = typingElement.querySelectorAll('.typing-dot');
        dots.forEach((dot, index) => {
            anime({
                targets: dot,
                scale: [1, 1.2, 1],
                duration: 600,
                loop: true,
                delay: index * 200,
                easing: 'easeInOutSine'
            });
        });
    }
    
    // Mode transition animations
    animateModeTransition(previousMode, newMode) {
        const container = document.querySelector('.app-container');
        
        // Fade out
        anime({
            targets: container,
            opacity: [1, 0.7],
            scale: [1, 0.98],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                // Fade in with new mode
                anime({
                    targets: container,
                    opacity: [0.7, 1],
                    scale: [0.98, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });
    }
    
    // Globe-specific animations
    animateGlobeInteraction(type, element) {
        switch(type) {
            case 'floatSelect':
                this.animateFloatSelection(element);
                break;
            case 'connectionCreate':
                this.animateConnectionCreation(element);
                break;
            case 'globePause':
                this.pauseGlobeRotation();
                break;
            case 'globeResume':
                this.resumeGlobeRotation();
                break;
        }
    }
    
    animateConnectionCreation(connectionElement) {
        anime({
            targets: connectionElement,
            scaleX: [0, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutExpo'
        });
    }
    
    pauseGlobeRotation() {
        const rotation = this.animations.get('globeRotation');
        if (rotation) {
            rotation.pause();
        }
    }
    
    resumeGlobeRotation() {
        const rotation = this.animations.get('globeRotation');
        if (rotation) {
            rotation.play();
        }
    }
    
    // Notification animations
    animateNotification(notificationElement) {
        anime({
            targets: notificationElement,
            translateX: [100, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutExpo'
        });
        
        // Auto-remove after delay
        setTimeout(() => {
            anime({
                targets: notificationElement,
                translateX: [0, 100],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInExpo',
                complete: () => notificationElement.remove()
            });
        }, 3000);
    }
    
    // Loading animations
    animateLoading(element) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';
        
        element.appendChild(spinner);
        
        anime({
            targets: spinner.querySelector('.spinner'),
            rotate: '360deg',
            duration: 1000,
            loop: true,
            easing: 'linear'
        });
    }
    
    stopLoading(element) {
        const spinner = element.querySelector('.loading-spinner');
        if (spinner) {
            anime.remove(spinner);
            spinner.remove();
        }
    }
    
    // Stagger animations for multiple elements
    animateStagger(elements, animationType = 'fadeInUp', delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.animateOnScroll(element);
            }, index * delay);
        });
    }
    
    // Queue system for complex animations
    queueAnimation(animationFunction, delay = 0) {
        this.animationQueue.push({ func: animationFunction, delay });
        this.processQueue();
    }
    
    processQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) return;
        
        this.isAnimating = true;
        const { func, delay } = this.animationQueue.shift();
        
        setTimeout(() => {
            func();
            this.isAnimating = false;
            this.processQueue();
        }, delay);
    }
    
    // Utility methods
    stopAllAnimations() {
        anime.remove('*');
        this.animations.clear();
    }
    
    pauseAllAnimations() {
        this.animations.forEach(animation => {
            animation.pause();
        });
    }
    
    resumeAllAnimations() {
        this.animations.forEach(animation => {
            animation.play();
        });
    }
}

// Initialize animation manager
let animationManager;
document.addEventListener('DOMContentLoaded', () => {
    animationManager = new AnimationManager();
});
