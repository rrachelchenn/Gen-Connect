// Mini-Exhibit Interactive Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeExhibitFeatures();
});

function initializeExhibitFeatures() {
    initializeInteractiveMap();
    initializeCategoryDemo();
    initializeReflectionCarousel();
    initializeTimeline();
    initializeWordCloud();
    initializeScrollAnimations();
}

// Interactive Map Functionality
function initializeInteractiveMap() {
    const mapPoints = document.querySelectorAll('.map-point');
    const infoPanel = document.getElementById('map-info');
    
    if (!mapPoints.length || !infoPanel) return;
    
    const locationData = {
        'Oakland': {
            participants: 3,
            highlights: [
                'Morning ritual with chronic pain management',
                'Urban foraging and traditional plant knowledge',
                'Night shift healthcare worker health strategies'
            ],
            demographics: 'Ages 28-45, diverse backgrounds'
        },
        'San Francisco': {
            participants: 2,
            highlights: [
                'Community garden participation and social health',
                'Urban food access and community building'
            ],
            demographics: 'Ages 30-55, community organizers'
        },
        'Berkeley': {
            participants: 1,
            highlights: [
                'Night shift worker sleep and nutrition strategies'
            ],
            demographics: 'Age 34, healthcare worker'
        },
        'San Jose': {
            participants: 1,
            highlights: [
                'Quantified self and fitness tracking analysis'
            ],
            demographics: 'Age 29, tech worker'
        },
        'Richmond': {
            participants: 1,
            highlights: [
                'Multigenerational family health conversations'
            ],
            demographics: 'Multi-generational household'
        },
        'Hayward': {
            participants: 1,
            highlights: [
                'Autoimmune disease management journey'
            ],
            demographics: 'Age 32, chronic condition advocate'
        },
        'Fremont': {
            participants: 1,
            highlights: [
                'Mental health practices and therapy integration'
            ],
            demographics: 'Age 24, young adult'
        }
    };
    
    mapPoints.forEach(point => {
        point.addEventListener('click', function() {
            const location = this.dataset.location;
            const data = locationData[location];
            
            if (data) {
                showLocationInfo(location, data, infoPanel);
                
                // Update visual state
                mapPoints.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
            }
        });
        
        // Keyboard navigation
        point.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

function showLocationInfo(location, data, panel) {
    panel.innerHTML = `
        <h4>${location}</h4>
        <div class="location-stats">
            <p><strong>${data.participants} participant${data.participants > 1 ? 's' : ''}</strong></p>
            <p><em>${data.demographics}</em></p>
        </div>
        <div class="location-highlights">
            <h5>Key Health Practices:</h5>
            <ul>
                ${data.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
            </ul>
        </div>
        <div class="location-insight">
            <p>Click <a href="browse-archive.html">Browse Archive</a> to explore full stories from ${location}</p>
        </div>
    `;
}

// Category Demonstration
function initializeCategoryDemo() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const categoryViews = document.querySelectorAll('.category-view');
    
    if (!categoryButtons.length || !categoryViews.length) return;
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update button states
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update view states
            categoryViews.forEach(view => {
                view.classList.remove('active');
                if (view.dataset.view === category) {
                    view.classList.add('active');
                }
            });
            
            // Announce change for screen readers
            announceChange(`Now viewing ${category} categorization system`);
        });
    });
}

// Reflection Carousel
function initializeReflectionCarousel() {
    const reflectionItems = document.querySelectorAll('.reflection-item');
    const carouselButtons = document.querySelectorAll('.carousel-btn');
    
    if (!reflectionItems.length || !carouselButtons.length) return;
    
    let currentIndex = 0;
    const totalItems = reflectionItems.length;
    
    function showReflection(index) {
        reflectionItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }
    
    function nextReflection() {
        currentIndex = (currentIndex + 1) % totalItems;
        showReflection(currentIndex);
    }
    
    function prevReflection() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        showReflection(currentIndex);
    }
    
    carouselButtons.forEach(button => {
        button.addEventListener('click', function() {
            const direction = this.dataset.direction;
            if (direction === 'next') {
                nextReflection();
            } else if (direction === 'prev') {
                prevReflection();
            }
        });
    });
    
    // Auto-advance carousel
    let autoAdvance = setInterval(nextReflection, 5000);
    
    // Pause auto-advance on hover
    const carousel = document.querySelector('.reflection-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => clearInterval(autoAdvance));
        carousel.addEventListener('mouseleave', () => {
            autoAdvance = setInterval(nextReflection, 5000);
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.target.closest('.reflection-carousel')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevReflection();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextReflection();
            }
        }
    });
}

// Timeline Initialization
function initializeTimeline() {
    const timelineContainer = document.getElementById('timeline-embed');
    if (!timelineContainer) return;
    
    // Timeline data structure for KnightLab Timeline
    const timelineData = {
        "title": {
            "media": {
                "url": "",
                "caption": "Health Journey Documentation",
                "credit": "Lifestyles for Longevity Archive"
            },
            "text": {
                "headline": "Participant Health Journeys",
                "text": "How archive documentation influenced participants' health practices over 6 months"
            }
        },
        "events": [
            {
                "media": {
                    "url": "../assets/images/timeline-start.jpg",
                    "caption": "Archive project begins",
                    "credit": "Participant documentation"
                },
                "start_date": {
                    "month": "1",
                    "day": "1",
                    "year": "2025"
                },
                "text": {
                    "headline": "Archive Documentation Begins",
                    "text": "Participants start documenting daily health practices, many for the first time recognizing patterns in their routines."
                }
            },
            {
                "media": {
                    "url": "../assets/images/timeline-awareness.jpg",
                    "caption": "Increased health awareness",
                    "credit": "Participant reflection"
                },
                "start_date": {
                    "month": "2",
                    "day": "15",
                    "year": "2025"
                },
                "text": {
                    "headline": "Growing Self-Awareness",
                    "text": "\"I never realized how much my night owl schedule actually works for me until I started documenting it.\" - Multiple participants report increased awareness of their effective practices."
                }
            },
            {
                "media": {
                    "url": "../assets/images/timeline-community.jpg",
                    "caption": "Community connections form",
                    "credit": "Archive project"
                },
                "start_date": {
                    "month": "3",
                    "day": "30",
                    "year": "2025"
                },
                "text": {
                    "headline": "Community Connections",
                    "text": "Participants discover shared experiences through archive browsing, leading to new social connections and mutual support networks."
                }
            },
            {
                "media": {
                    "url": "../assets/images/timeline-adaptation.jpg",
                    "caption": "Practice adaptations",
                    "credit": "Participant updates"
                },
                "start_date": {
                    "month": "4",
                    "day": "20",
                    "year": "2025"
                },
                "text": {
                    "headline": "Informed Adaptations",
                    "text": "Seeing diverse health approaches in the archive, participants adapt practices to better fit their own circumstances rather than following external ideals."
                }
            },
            {
                "media": {
                    "url": "../assets/images/timeline-advocacy.jpg",
                    "caption": "Health advocacy",
                    "credit": "Participant stories"
                },
                "start_date": {
                    "month": "5",
                    "day": "10",
                    "year": "2025"
                },
                "text": {
                    "headline": "Becoming Health Advocates",
                    "text": "Participants report feeling more confident advocating for their health needs with medical providers, using language developed through archive participation."
                }
            },
            {
                "media": {
                    "url": "../assets/images/timeline-future.jpg",
                    "caption": "Archive impact",
                    "credit": "Final reflections"
                },
                "start_date": {
                    "month": "6",
                    "day": "30",
                    "year": "2025"
                },
                "text": {
                    "headline": "Looking Forward",
                    "text": "\"This archive made me realize my story matters for future research. I'm not just optimizing my health - I'm documenting it for others.\" Archive as empowerment tool."
                }
            }
        ]
    };
    
    try {
        // Initialize KnightLab Timeline
        new TL.Timeline('timeline-embed', timelineData, {
            hash_bookmark: true,
            height: 600,
            initial_zoom: 2,
            timenav_height: 150
        });
    } catch (error) {
        // Fallback if Timeline library doesn't load
        timelineContainer.innerHTML = `
            <div class="timeline-fallback">
                <h4>Health Journey Timeline</h4>
                <p>Interactive timeline showing how archive participation influenced health practices over 6 months.</p>
                                    <div class="timeline-points">
                        <div class="timeline-item">
                            <h5>January 2025: Documentation Begins</h5>
                            <p>Participants start recording daily health practices</p>
                        </div>
                        <div class="timeline-item">
                            <h5>February 2025: Growing Awareness</h5>
                            <p>Increased recognition of effective personal practices</p>
                        </div>
                        <div class="timeline-item">
                            <h5>March 2025: Community Connections</h5>
                            <p>Participants find shared experiences through archive browsing</p>
                        </div>
                        <div class="timeline-item">
                            <h5>April 2025: Practice Adaptations</h5>
                            <p>Health approaches adapted based on diverse archive examples</p>
                        </div>
                        <div class="timeline-item">
                            <h5>May 2025: Health Advocacy</h5>
                            <p>Increased confidence in medical self-advocacy</p>
                        </div>
                        <div class="timeline-item">
                            <h5>June 2025: Future Focus</h5>
                            <p>Archive participation as empowerment and documentation for future research</p>
                        </div>
                    </div>
            </div>
        `;
    }
}

// Word Cloud Interactivity
function initializeWordCloud() {
    const words = document.querySelectorAll('.word');
    if (!words.length) return;
    
    const wordDefinitions = {
        'community': 'Participants emphasized social connections and shared support over individual optimization',
        'adaptation': 'Health practices that flex with changing circumstances rather than rigid routines',
        'resilience': 'Bouncing back from health challenges using available resources and support',
        'connection': 'Relationships with people, places, and practices that nourish wellbeing',
        'balance': 'Finding sustainable rhythms rather than perfect equilibrium',
        'flexibility': 'Adapting health practices to real life constraints and opportunities',
        'joy': 'Pleasure and satisfaction as important components of sustainable health',
        'support': 'Mutual aid and care networks that create conditions for health',
        'acceptance': 'Working with rather than against personal limitations and circumstances',
        'growth': 'Learning and development as ongoing health practices',
        'care': 'Attention to self and others as fundamental health practice',
        'mindfulness': 'Present-moment awareness in daily activities',
        'healing': 'Recovery and restoration as ongoing processes',
        'sustainability': 'Health practices that can be maintained long-term',
        'authenticity': 'Health approaches aligned with personal values and circumstances'
    };
    
    words.forEach(word => {
        word.addEventListener('click', function() {
            const wordText = this.textContent;
            const definition = wordDefinitions[wordText];
            
            if (definition) {
                showWordDefinition(wordText, definition);
            }
        });
        
        // Add keyboard support
        word.setAttribute('tabindex', '0');
        word.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

function showWordDefinition(word, definition) {
    // Remove existing definition
    const existingDef = document.querySelector('.word-definition');
    if (existingDef) {
        existingDef.remove();
    }
    
    // Create new definition
    const definitionEl = document.createElement('div');
    definitionEl.className = 'word-definition';
    definitionEl.innerHTML = `
        <div class="definition-content">
            <h4>"${word}"</h4>
            <p>${definition}</p>
            <button class="close-definition" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.querySelector('.word-cloud-container').appendChild(definitionEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (definitionEl.parentElement) {
            definitionEl.remove();
        }
    }, 5000);
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Special animations for specific elements
                if (entry.target.classList.contains('comparison-exhibit')) {
                    animateComparison(entry.target);
                } else if (entry.target.classList.contains('word-cloud')) {
                    animateWordCloud(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('.exhibit-section, .comparison-exhibit, .word-cloud, .story-card, .projection-card').forEach(element => {
        observer.observe(element);
    });
}

function animateComparison(element) {
    const idealItems = element.querySelectorAll('.ideal-item');
    const realityItems = element.querySelectorAll('.reality-item');
    
    idealItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = 'slideIn 0.6s ease-out forwards';
        }, index * 200);
    });
    
    realityItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = 'slideIn 0.6s ease-out forwards';
        }, (index * 200) + 1000);
    });
}

function animateWordCloud(element) {
    const words = element.querySelectorAll('.word');
    words.forEach((word, index) => {
        setTimeout(() => {
            word.style.animation = 'fadeIn 0.8s ease-out forwards';
            word.style.transform = 'scale(1.05)';
            setTimeout(() => {
                word.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

// Accessibility functions
function announceChange(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Export functions for external use
window.ExhibitFeatures = {
    initializeExhibitFeatures,
    showLocationInfo,
    showWordDefinition,
    announceChange
};

// Add custom styles for dynamic elements
const dynamicStyles = `
<style>
.word-definition {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 2px solid #4a90c4;
    border-radius: 10px;
    padding: 1rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 100;
    max-width: 300px;
    animation: fadeIn 0.3s ease-out;
}

.definition-content {
    position: relative;
}

.definition-content h4 {
    color: #4a90c4;
    margin-bottom: 0.5rem;
}

.close-definition {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: #4a90c4;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
}

.location-stats {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.location-highlights {
    margin: 1rem 0;
}

.location-highlights ul {
    list-style: none;
    padding: 0;
}

.location-highlights li {
    margin-bottom: 0.5rem;
    padding-left: 1rem;
    position: relative;
}

.location-highlights li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #4a90c4;
    font-weight: bold;
}

.location-insight {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
}

.map-point.active {
    fill: #2c5282;
    stroke: #4a90c4;
    stroke-width: 3;
}

.timeline-fallback {
    padding: 2rem;
    text-align: center;
}

.timeline-item {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #4a90c4;
}

.timeline-item h5 {
    color: #4a90c4;
    margin-bottom: 0.5rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', dynamicStyles);
