// Reading List Filtering Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeReadingList();
});

function initializeReadingList() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const readingItems = document.querySelectorAll('.reading-item');
    
    if (!categoryButtons.length || !readingItems.length) return;
    
    // Category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update button states
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter reading items
            filterReadings(category, readingItems);
            
            // Announce change for screen readers
            announceFilterChange(category);
        });
    });
    
    // Footer category links
    const footerCategoryLinks = document.querySelectorAll('a[data-category]');
    footerCategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            
            // Update category button
            categoryButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                }
            });
            
            // Filter readings
            filterReadings(category, readingItems);
            
            // Scroll to top of readings
            document.querySelector('.readings-grid').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
    
    // Initialize with all readings visible
    filterReadings('all', readingItems);
}

function filterReadings(category, readingItems) {
    let visibleCount = 0;
    
    readingItems.forEach(item => {
        const itemCategories = item.dataset.category ? item.dataset.category.split(' ') : [];
        const shouldShow = category === 'all' || itemCategories.includes(category);
        
        if (shouldShow) {
            item.classList.remove('hidden');
            item.style.display = 'block';
            visibleCount++;
            
            // Add staggered animation
            setTimeout(() => {
                item.classList.add('fade-in');
            }, visibleCount * 50);
        } else {
            item.classList.add('hidden');
            item.style.display = 'none';
            item.classList.remove('fade-in');
        }
    });
    
    // Update visible count display
    updateReadingCount(visibleCount, category);
}

function updateReadingCount(count, category) {
    // Remove existing count display
    const existingCount = document.querySelector('.reading-count');
    if (existingCount) {
        existingCount.remove();
    }
    
    // Add new count display
    const readingsGrid = document.querySelector('.readings-grid');
    const countDiv = document.createElement('div');
    countDiv.className = 'reading-count';
    countDiv.innerHTML = `
        <p>Showing ${count} reading${count !== 1 ? 's' : ''} 
        ${category !== 'all' ? `in "${formatCategoryName(category)}"` : ''}</p>
    `;
    
    readingsGrid.parentNode.insertBefore(countDiv, readingsGrid);
}

function formatCategoryName(category) {
    const categoryNames = {
        'archival-theory': 'Archival Theory',
        'digital-humanities': 'Digital Humanities',
        'health-narrative': 'Health & Narrative',
        'community-archives': 'Community Archives',
        'public-projects': 'Public Projects'
    };
    
    return categoryNames[category] || category;
}

function announceFilterChange(category) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Filtered to show ${formatCategoryName(category)} readings`;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Smooth scroll for anchor links within reading items
function initializeSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Keyboard navigation for reading items
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const readingItems = Array.from(document.querySelectorAll('.reading-item:not(.hidden)'));
            const focused = document.activeElement;
            
            // Find current reading item
            let currentIndex = -1;
            for (let i = 0; i < readingItems.length; i++) {
                if (readingItems[i].contains(focused)) {
                    currentIndex = i;
                    break;
                }
            }
            
            if (currentIndex !== -1) {
                e.preventDefault();
                const nextIndex = e.key === 'ArrowDown' 
                    ? Math.min(currentIndex + 1, readingItems.length - 1)
                    : Math.max(currentIndex - 1, 0);
                
                const nextItem = readingItems[nextIndex];
                const firstFocusable = nextItem.querySelector('h3, a, button');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }
        }
    });
}

// Reading progress tracking
function initializeReadingProgress() {
    const readingItems = document.querySelectorAll('.reading-item');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Optional: Track reading engagement
                if (window.gtag) {
                    const title = entry.target.querySelector('h3').textContent;
                    gtag('event', 'reading_item_viewed', {
                        'item_title': title,
                        'category': entry.target.dataset.category
                    });
                }
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    });
    
    readingItems.forEach(item => {
        observer.observe(item);
    });
}

// Expand/collapse reading details
function initializeReadingExpansion() {
    const readingItems = document.querySelectorAll('.reading-item');
    
    readingItems.forEach(item => {
        const header = item.querySelector('.reading-header');
        const content = item.querySelector('.reading-content');
        
        if (header && content) {
            // Add expand/collapse button
            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn';
            expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            expandBtn.setAttribute('aria-label', 'Expand reading details');
            header.appendChild(expandBtn);
            
            // Initially collapse content on mobile
            if (window.innerWidth < 768) {
                content.style.display = 'none';
                expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }
            
            expandBtn.addEventListener('click', function() {
                const isExpanded = content.style.display !== 'none';
                
                if (isExpanded) {
                    content.style.display = 'none';
                    expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    expandBtn.setAttribute('aria-label', 'Expand reading details');
                } else {
                    content.style.display = 'block';
                    expandBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                    expandBtn.setAttribute('aria-label', 'Collapse reading details');
                }
            });
        }
    });
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeReadingList();
    initializeSmoothScroll();
    initializeKeyboardNavigation();
    initializeReadingProgress();
    
    // Only initialize expansion on mobile
    if (window.innerWidth < 768) {
        initializeReadingExpansion();
    }
});

// Export functions for external use
window.ReadingList = {
    filterReadings,
    formatCategoryName,
    announceFilterChange
};

// Add custom styles for reading list functionality
const readingListStyles = `
<style>
.reading-count {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #e9f4ff;
    border-radius: 10px;
    color: #4a90c4;
    font-weight: 600;
}

.reading-item.in-view {
    border-left: 4px solid #4a90c4;
    transition: border-left 0.3s ease;
}

.expand-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    padding: 8px 12px;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.3s;
    margin-left: auto;
}

.expand-btn:hover {
    background: rgba(255,255,255,0.3);
}

.expand-btn i {
    font-size: 1rem;
}

.reading-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.reading-header h3 {
    flex: 1;
    margin-right: 1rem;
}

@media (max-width: 767px) {
    .reading-content {
        transition: all 0.3s ease;
    }
    
    .expand-btn {
        display: block;
    }
}

@media (min-width: 768px) {
    .expand-btn {
        display: none;
    }
}

/* Animation for filtering */
.reading-item {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.reading-item.filtering {
    opacity: 0.5;
    transform: translateY(10px);
}

/* Focus styles for accessibility */
.reading-item:focus-within {
    outline: 2px solid #4a90c4;
    outline-offset: 4px;
}

.category-btn:focus {
    outline: 2px solid #4a90c4;
    outline-offset: 2px;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', readingListStyles);
