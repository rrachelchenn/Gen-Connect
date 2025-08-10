// Browse Archive Specific Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeBrowseFeatures();
});

function initializeBrowseFeatures() {
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tags = document.querySelectorAll('.tag-cloud .tag');
    const archiveItems = document.querySelectorAll('.archive-item');
    
    let currentFilter = 'all';
    let currentTags = new Set();
    let searchTerm = '';
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchTerm = e.target.value.toLowerCase();
            filterItems();
        });
    }
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            filterItems();
        });
    });
    
    // Tag filtering
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagValue = this.dataset.tag;
            
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                currentTags.delete(tagValue);
            } else {
                this.classList.add('active');
                currentTags.add(tagValue);
            }
            
            filterItems();
        });
    });
    
    function filterItems() {
        let visibleCount = 0;
        
        archiveItems.forEach(item => {
            let isVisible = true;
            
            // Check content type filter
            if (currentFilter !== 'all') {
                const itemTypes = item.dataset.type.split(' ');
                if (!itemTypes.includes(currentFilter)) {
                    isVisible = false;
                }
            }
            
            // Check tag filters
            if (currentTags.size > 0) {
                const itemTags = item.dataset.tags.split(' ');
                const hasMatchingTag = Array.from(currentTags).some(tag => 
                    itemTags.some(itemTag => itemTag.includes(tag) || tag.includes(itemTag))
                );
                if (!hasMatchingTag) {
                    isVisible = false;
                }
            }
            
            // Check search term
            if (searchTerm) {
                const title = item.querySelector('h3').textContent.toLowerCase();
                const content = item.querySelector('p').textContent.toLowerCase();
                const tags = item.dataset.tags.toLowerCase();
                const location = item.querySelector('.location')?.textContent.toLowerCase() || '';
                
                if (!title.includes(searchTerm) && 
                    !content.includes(searchTerm) && 
                    !tags.includes(searchTerm) && 
                    !location.includes(searchTerm)) {
                    isVisible = false;
                }
            }
            
            // Show/hide item
            if (isVisible) {
                item.style.display = 'block';
                item.classList.remove('hidden');
                visibleCount++;
                
                // Add fade-in animation
                setTimeout(() => {
                    item.classList.add('fade-in');
                }, 50);
            } else {
                item.style.display = 'none';
                item.classList.add('hidden');
                item.classList.remove('fade-in');
            }
        });
        
        // Show "no results" message if needed
        updateResultsMessage(visibleCount);
    }
    
    function updateResultsMessage(count) {
        // Remove existing no-results message
        const existingMessage = document.querySelector('.no-results');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (count === 0) {
            const archiveGrid = document.querySelector('.archive-grid');
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No items found</h3>
                <p>Try adjusting your search terms or filters to find relevant archive items.</p>
                <button onclick="clearAllFilters()" class="btn btn-primary">Clear All Filters</button>
            `;
            archiveGrid.appendChild(noResultsDiv);
        }
    }
    
    // Make clearAllFilters available globally
    window.clearAllFilters = function() {
        // Clear search
        if (searchInput) {
            searchInput.value = '';
            searchTerm = '';
        }
        
        // Clear content type filters
        filterButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');
        currentFilter = 'all';
        
        // Clear tag filters
        tags.forEach(tag => tag.classList.remove('active'));
        currentTags.clear();
        
        // Refresh items
        filterItems();
    };
    
    // Initialize audio players
    initializeAudioPlayers();
    
    // Initialize video players
    initializeVideoPlayers();
    
    // Initialize intersection observer for animations
    initializeScrollAnimations();
}

function initializeAudioPlayers() {
    const audioButtons = document.querySelectorAll('.audio-play-btn');
    
    audioButtons.forEach(button => {
        button.addEventListener('click', function() {
            const audioId = this.dataset.audio;
            const audio = document.getElementById(audioId);
            
            if (audio) {
                if (audio.paused) {
                    // Pause all other audio elements
                    document.querySelectorAll('audio').forEach(a => {
                        if (a !== audio && !a.paused) {
                            a.pause();
                            const otherButton = document.querySelector(`[data-audio="${a.id}"]`);
                            if (otherButton) {
                                otherButton.textContent = '▶ Play Audio';
                            }
                        }
                    });
                    
                    audio.play().then(() => {
                        this.textContent = '⏸ Pause';
                    }).catch(error => {
                        console.log('Audio play failed:', error);
                        // Fallback: show a message or load a sample
                        this.textContent = '🔊 Audio Sample';
                        setTimeout(() => {
                            this.textContent = '▶ Play Audio';
                        }, 2000);
                    });
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
        
        // Handle audio errors gracefully
        audio.addEventListener('error', function() {
            const button = document.querySelector(`[data-audio="${audio.id}"]`);
            if (button) {
                button.textContent = '🔊 Audio Sample';
                button.disabled = true;
                button.style.opacity = '0.6';
            }
        });
    });
}

function initializeVideoPlayers() {
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // In a real implementation, this would open a video player
            // For demo purposes, we'll show an alert
            const title = this.closest('.archive-item').querySelector('h3').textContent;
            
            // Create a modal or navigate to video page
            showVideoModal(title);
        });
    });
}

function showVideoModal(title) {
    // Create a simple modal for video demo
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>Video player would appear here in the full implementation.</p>
                <p>This demonstrates the interactive video functionality for the archive items.</p>
                <div class="video-placeholder">
                    <i class="fas fa-play-circle" style="font-size: 4rem; color: #666;"></i>
                    <p>Video Player Placeholder</p>
                </div>
            </div>
        </div>
        <div class="modal-backdrop"></div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    const backdrop = modal.querySelector('.modal-backdrop');
    
    function closeModal() {
        modal.remove();
    }
    
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Stagger animation for grid items
                if (entry.target.classList.contains('archive-item')) {
                    const items = Array.from(document.querySelectorAll('.archive-item'));
                    const index = items.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);
    
    // Observe archive items
    document.querySelectorAll('.archive-item').forEach(item => {
        observer.observe(item);
    });
    
    // Observe other elements
    document.querySelectorAll('.page-header, .search-controls, .archive-stats').forEach(element => {
        observer.observe(element);
    });
}

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // Navigate through archive items with arrow keys
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const items = Array.from(document.querySelectorAll('.archive-item:not(.hidden)'));
        const focused = document.activeElement;
        const currentIndex = items.findIndex(item => item.contains(focused));
        
        if (currentIndex !== -1) {
            e.preventDefault();
            const nextIndex = e.key === 'ArrowDown' 
                ? Math.min(currentIndex + 1, items.length - 1)
                : Math.max(currentIndex - 1, 0);
            
            const nextItem = items[nextIndex];
            const firstLink = nextItem.querySelector('a, button');
            if (firstLink) {
                firstLink.focus();
            }
        }
    }
});

// Export functions for external use
window.BrowseArchive = {
    clearAllFilters: window.clearAllFilters,
    initializeBrowseFeatures,
    showVideoModal
};

// Add styles for modal
const modalStyles = `
<style>
.video-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
}

.modal-content {
    background: white;
    border-radius: 15px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    z-index: 1;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.close-modal {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #666;
    line-height: 1;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-modal:hover {
    color: #333;
}

.modal-body {
    padding: 1.5rem;
}

.video-placeholder {
    text-align: center;
    padding: 3rem;
    background: #f8f9fa;
    border-radius: 10px;
    margin-top: 1rem;
}

.video-placeholder p {
    margin-top: 1rem;
    color: #666;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);
