// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
});

// Smooth scrolling for anchor links
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

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe sections for fade-in animation
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section, .hero');
    sections.forEach(section => {
        observer.observe(section);
    });
});

// Search functionality (for browse page)
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const archiveItems = document.querySelectorAll('.archive-item');
    
    if (!searchInput || !archiveItems.length) return;
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterItems(searchTerm);
    });
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterType = this.dataset.filter;
            filterByType(filterType);
        });
    });
    
    function filterItems(searchTerm) {
        archiveItems.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const tags = item.dataset.tags ? item.dataset.tags.toLowerCase() : '';
            const content = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || tags.includes(searchTerm) || content.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    function filterByType(filterType) {
        archiveItems.forEach(item => {
            if (filterType === 'all') {
                item.style.display = 'block';
            } else {
                const itemType = item.dataset.type;
                if (itemType && itemType.includes(filterType)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    }
}

// Audio player controls
function initializeAudioPlayers() {
    const audioButtons = document.querySelectorAll('.audio-play-btn');
    
    audioButtons.forEach(button => {
        button.addEventListener('click', function() {
            const audioId = this.dataset.audio;
            const audio = document.getElementById(audioId);
            
            if (audio) {
                if (audio.paused) {
                    // Pause all other audio
                    document.querySelectorAll('audio').forEach(a => {
                        if (a !== audio) a.pause();
                    });
                    // Update all button texts
                    audioButtons.forEach(btn => {
                        btn.textContent = '▶ Play Audio';
                    });
                    
                    audio.play();
                    this.textContent = '⏸ Pause';
                } else {
                    audio.pause();
                    this.textContent = '▶ Play Audio';
                }
            }
        });
    });
    
    // Update button text when audio ends
    document.querySelectorAll('audio').forEach(audio => {
        audio.addEventListener('ended', function() {
            const button = document.querySelector(`[data-audio="${audio.id}"]`);
            if (button) {
                button.textContent = '▶ Play Audio';
            }
        });
    });
}

// Timeline visualization (for mini-exhibit)
function initializeTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.5 });
    
    timelineItems.forEach(item => {
        timelineObserver.observe(item);
    });
}

// Interactive map functionality (placeholder for future enhancement)
function initializeMap() {
    const mapContainer = document.getElementById('interactive-map');
    if (!mapContainer) return;
    
    // This would integrate with a mapping library like Leaflet or Mapbox
    // For now, we'll add click handlers to the static map elements
    const mapPoints = mapContainer.querySelectorAll('.map-point');
    
    mapPoints.forEach(point => {
        point.addEventListener('click', function() {
            const location = this.dataset.location;
            const participants = this.dataset.participants;
            
            // Show info panel
            showMapInfo(location, participants);
        });
    });
}

function showMapInfo(location, participants) {
    const infoPanel = document.getElementById('map-info');
    if (infoPanel) {
        infoPanel.innerHTML = `
            <h4>${location}</h4>
            <p>Participants: ${participants}</p>
            <button onclick="closeMapInfo()">Close</button>
        `;
        infoPanel.style.display = 'block';
    }
}

function closeMapInfo() {
    const infoPanel = document.getElementById('map-info');
    if (infoPanel) {
        infoPanel.style.display = 'none';
    }
}

// Data visualization helpers
function createSimpleChart(containerId, data, type = 'bar') {
    const container = document.getElementById(containerId);
    if (!container || !data) return;
    
    // Simple chart creation without external libraries
    // This is a basic implementation - in production would use Chart.js or D3
    const maxValue = Math.max(...data.values);
    
    container.innerHTML = data.labels.map((label, index) => {
        const value = data.values[index];
        const percentage = (value / maxValue) * 100;
        
        return `
            <div class="chart-item">
                <div class="chart-bar" style="height: ${percentage}%"></div>
                <span class="chart-label">${label}</span>
                <span class="chart-value">${value}</span>
            </div>
        `;
    }).join('');
}

// Accessibility enhancements
function enhanceAccessibility() {
    // Add skip links
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only';
    skipLink.addEventListener('focus', () => skipLink.classList.remove('sr-only'));
    skipLink.addEventListener('blur', () => skipLink.classList.add('sr-only'));
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add aria-labels to interactive elements
    document.querySelectorAll('.btn').forEach(btn => {
        if (!btn.getAttribute('aria-label') && btn.textContent) {
            btn.setAttribute('aria-label', btn.textContent.trim());
        }
    });
    
    // Enhance form accessibility
    document.querySelectorAll('input, textarea, select').forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (!label && input.placeholder) {
            input.setAttribute('aria-label', input.placeholder);
        }
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    initializeAudioPlayers();
    initializeTimeline();
    initializeMap();
    enhanceAccessibility();
    
    // Add loading animation removal
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// Export functions for use in other pages
window.LifestylesArchive = {
    initializeSearch,
    initializeAudioPlayers,
    initializeTimeline,
    initializeMap,
    createSimpleChart,
    showMapInfo,
    closeMapInfo
};
