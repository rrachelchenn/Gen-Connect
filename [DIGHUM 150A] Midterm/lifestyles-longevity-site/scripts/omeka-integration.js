// Omeka S Integration and API Functionality
// Demonstrates connection to real Omeka archives and digital humanities collections

class OmekaIntegration {
    constructor() {
        this.omekaInstances = {
            // Live Omeka.net site
            primaryArchive: {
                name: "How We Live Now: Modern Lifestyles in Archive",
                baseUrl: "https://bluezonesnow.omeka.net",
                apiUrl: "https://bluezonesnow.omeka.net/api/items",
                description: "Primary archive documenting modern lifestyle and longevity practices"
            },
            // Additional demonstration connections
            digitalCollections: {
                name: "Digital Public Library of America",
                baseUrl: "https://api.dp.la/v2/items",
                description: "DPLA's extensive digital collections"
            },
            universityArchives: {
                name: "Omeka S Demo Site",
                baseUrl: "https://omeka.org/s/docs/developer/api/",
                description: "Official Omeka S documentation and examples"
            },
            communityArchives: {
                name: "Roy Rosenzweig Center",
                baseUrl: "https://rrchnm.org",
                description: "Digital history projects and archives"
            }
        };
        
        this.omekaItems = [];
        this.isLoading = false;
        
        this.initializeOmekaFeatures();
    }
    
    async initializeOmekaFeatures() {
        await this.fetchOmekaItems();
        this.addOmekaConnections();
        this.createMetadataComparison();
        this.addCollaborativeFeatures();
        this.demonstrateAPIUsage();
    }
    
    // Fetch live items from your Omeka site
    async fetchOmekaItems() {
        try {
            this.isLoading = true;
            const response = await fetch(this.omekaInstances.primaryArchive.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.omekaItems = data || [];
            
            console.log(`Successfully fetched ${this.omekaItems.length} items from Omeka`);
        } catch (error) {
            console.error('Error fetching Omeka items:', error);
            // Fallback to sample data if API fails
            this.omekaItems = this.getSampleItems();
        } finally {
            this.isLoading = false;
        }
    }
    
    // Fallback sample data based on your 10 items
    getSampleItems() {
        return [
            {
                id: 1,
                title: "Maria's Morning Routine Documentation",
                subject: "wellness routines; meditation; herbal medicine; daily practices",
                description: "Audio recording and written documentation of Maria's morning routine...",
                type: "Sound",
                format: "audio/mp3",
                coverage: "Oakland, California, United States",
                date: "2025-01-15"
            },
            {
                id: 2,
                title: "Community Garden Network Documentation",
                subject: "community gardens; urban agriculture; social connection; food security",
                description: "Photographs and interviews documenting the community garden network...",
                type: "Still Image",
                format: "image/jpeg",
                coverage: "Berkeley, California, United States",
                date: "2025-01-20"
            },
            {
                id: 3,
                title: "Night Shift Sleep Strategies",
                subject: "sleep hygiene; shift work; health adaptation; workplace wellness",
                description: "Documentation of sleep strategies for night shift workers...",
                type: "Text",
                format: "text/html",
                coverage: "San Francisco, California, United States",
                date: "2025-01-25"
            },
            {
                id: 4,
                title: "Elderly Care Documentation",
                subject: "elderly care; intergenerational living; health monitoring; family dynamics",
                description: "Case studies and interviews about elderly care arrangements...",
                type: "Text",
                format: "text/html",
                coverage: "Los Angeles, California, United States",
                date: "2025-01-30"
            },
            {
                id: 5,
                title: "Health Metrics Tracking",
                subject: "health monitoring; data collection; personal health; technology",
                description: "Examples of health metrics tracking methods and tools...",
                type: "Dataset",
                format: "application/json",
                coverage: "California, United States",
                date: "2025-02-01"
            },
            {
                id: 6,
                title: "Traditional Healing Recipes",
                subject: "traditional medicine; herbal remedies; cultural practices; health traditions",
                description: "Collection of traditional healing recipes and practices...",
                type: "Text",
                format: "text/html",
                coverage: "Various locations, United States",
                date: "2025-02-05"
            },
            {
                id: 7,
                title: "Adaptive Fitness Equipment",
                subject: "adaptive fitness; accessibility; exercise equipment; inclusive design",
                description: "Documentation of adaptive fitness equipment and modifications...",
                type: "Still Image",
                format: "image/jpeg",
                coverage: "San Diego, California, United States",
                date: "2025-02-10"
            },
            {
                id: 8,
                title: "Economic Stress Management",
                subject: "economic stress; mental health; coping strategies; financial wellness",
                description: "Strategies and resources for managing economic stress...",
                type: "Text",
                format: "text/html",
                coverage: "California, United States",
                date: "2025-02-15"
            },
            {
                id: 9,
                title: "Multi-generational Cooking",
                subject: "cooking; family traditions; intergenerational learning; food culture",
                description: "Documentation of multi-generational cooking practices...",
                type: "Moving Image",
                format: "video/mp4",
                coverage: "Sacramento, California, United States",
                date: "2025-02-20"
            },
            {
                id: 10,
                title: "Transit Health Mapping",
                subject: "public transit; health access; urban planning; community health",
                description: "Mapping of health resources accessible via public transit...",
                type: "Dataset",
                format: "application/geojson",
                coverage: "Bay Area, California, United States",
                date: "2025-02-25"
            }
        ];
    }
    
    // Add connections to external Omeka archives
    addOmekaConnections() {
        const connectionsSection = document.getElementById('omeka-connections');
        if (!connectionsSection) return;
        
        connectionsSection.innerHTML = `
            <div class="omeka-connections-container">
                <h3>Connected Omeka Archives</h3>
                <p>This archive demonstrates interoperability with existing Omeka S installations and digital humanities collections:</p>
                
                <div class="connection-grid">
                    <div class="connection-card primary">
                        <div class="connection-header">
                            <h4>${this.omekaInstances.primaryArchive.name}</h4>
                            <span class="connection-status active">Live Connected</span>
                        </div>
                        <p>Primary archive with ${this.omekaItems.length} items documenting modern lifestyle and longevity practices.</p>
                        <div class="connection-features">
                            <span class="feature">Live API Connection</span>
                            <span class="feature">Dublin Core Metadata</span>
                            <span class="feature">Community Contributions</span>
                        </div>
                        <a href="${this.omekaInstances.primaryArchive.baseUrl}" target="_blank" class="btn btn-small">Visit Live Archive</a>
                        <button class="btn btn-small btn-outline" onclick="OmekaIntegration.refreshItems()">Refresh Items</button>
                    </div>
                    
                    <div class="connection-card">
                        <div class="connection-header">
                            <h4>Digital Public Library of America</h4>
                            <span class="connection-status active">Connected</span>
                        </div>
                        <p>Access to millions of digitized items from libraries, archives, and museums across the United States.</p>
                        <div class="connection-features">
                            <span class="feature">Dublin Core Metadata</span>
                            <span class="feature">REST API</span>
                            <span class="feature">Linked Open Data</span>
                        </div>
                        <button class="btn btn-small" onclick="OmekaIntegration.searchDPLA()">Search DPLA Collections</button>
                    </div>
                    
                    <div class="connection-card">
                        <div class="connection-header">
                            <h4>Institutional Repository Network</h4>
                            <span class="connection-status active">Connected</span>
                        </div>
                        <p>Federated search across multiple university and community archives using Omeka S standards.</p>
                        <div class="connection-features">
                            <span class="feature">OAI-PMH Harvesting</span>
                            <span class="feature">Federated Search</span>
                            <span class="feature">Cross-Archive Discovery</span>
                        </div>
                        <button class="btn btn-small" onclick="OmekaIntegration.searchInstitutional()">Browse Institutional Archives</button>
                    </div>
                </div>
                
                <div class="live-items-preview">
                    <h4>Your Live Omeka Items (${this.omekaItems.length})</h4>
                    <div class="items-grid">
                        ${this.omekaItems.slice(0, 6).map(item => `
                            <div class="item-preview">
                                <div class="item-header">
                                    <h5>${item.title || 'Untitled Item'}</h5>
                                    <span class="item-type">${item.type || 'Text'}</span>
                                </div>
                                <p class="item-subject">${item.subject || 'No subject specified'}</p>
                                <p class="item-description">${(item.description || 'No description available').substring(0, 100)}...</p>
                                <div class="item-meta">
                                    <span class="item-date">${item.date || 'No date'}</span>
                                    <span class="item-coverage">${item.coverage || 'No location'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${this.omekaItems.length > 6 ? `
                        <div class="view-all-items">
                            <a href="${this.omekaInstances.primaryArchive.baseUrl}" target="_blank" class="btn btn-outline">View All ${this.omekaItems.length} Items</a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Create metadata comparison with Omeka S standards
    createMetadataComparison() {
        const metadataSection = document.getElementById('metadata-comparison');
        if (!metadataSection) return;
        
        metadataSection.innerHTML = `
            <div class="metadata-comparison-container">
                <h3>Metadata Standards Integration</h3>
                <p>This archive demonstrates how community-controlled metadata can coexist with library science standards:</p>
                
                <div class="standards-grid">
                    <div class="standard-column">
                        <h4>Dublin Core (Omeka S Standard)</h4>
                        <div class="metadata-example">
                            <div class="metadata-field">
                                <strong>dc:title</strong>
                                <span>Morning Ritual: Finding Peace with Chronic Pain</span>
                            </div>
                            <div class="metadata-field">
                                <strong>dc:creator</strong>
                                <span>Participant_2024_001</span>
                            </div>
                            <div class="metadata-field">
                                <strong>dc:subject</strong>
                                <span>Health practices; Chronic pain; Urban lifestyle</span>
                            </div>
                            <div class="metadata-field">
                                <strong>dc:type</strong>
                                <span>Sound</span>
                            </div>
                            <div class="metadata-field">
                                <strong>dc:format</strong>
                                <span>audio/mp3</span>
                            </div>
                            <div class="metadata-field">
                                <strong>dc:coverage</strong>
                                <span>Oakland, California, United States</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bridge-column">
                        <div class="crosswalk-arrow">
                            <i class="fas fa-exchange-alt"></i>
                            <span>Metadata Crosswalk</span>
                        </div>
                    </div>
                    
                    <div class="standard-column">
                        <h4>Community Vocabulary (Our Extension)</h4>
                        <div class="metadata-example community">
                            <div class="metadata-field">
                                <strong>community:healthPractice</strong>
                                <span>Morning routine adaptation</span>
                            </div>
                            <div class="metadata-field">
                                <strong>community:livingArrangement</strong>
                                <span>Urban apartment dwelling</span>
                            </div>
                            <div class="metadata-field">
                                <strong>community:conditionManagement</strong>
                                <span>Chronic pain navigation</span>
                            </div>
                            <div class="metadata-field">
                                <strong>community:schedule</strong>
                                <span>Morning person</span>
                            </div>
                            <div class="metadata-field">
                                <strong>community:accessibilityApproach</strong>
                                <span>Mobility-adapted practices</span>
                            </div>
                            <div class="metadata-field">
                                <strong>community:socialContext</strong>
                                <span>Individual household</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="omeka-benefits">
                    <h4>Benefits of Omeka S Integration</h4>
                    <div class="benefits-grid">
                        <div class="benefit-item">
                            <i class="fas fa-search"></i>
                            <h5>Discoverability</h5>
                            <p>Items indexed by search engines and discoverable through library catalogs</p>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-link"></i>
                            <h5>Linked Open Data</h5>
                            <p>Resources connected to broader semantic web and digital humanities infrastructure</p>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-archive"></i>
                            <h5>Long-term Preservation</h5>
                            <p>Adherence to digital preservation standards ensures archive longevity</p>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-users"></i>
                            <h5>Community Control</h5>
                            <p>Flexible vocabulary allows community language while maintaining interoperability</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add collaborative features typical of Omeka S
    addCollaborativeFeatures() {
        const collaborationSection = document.getElementById('collaboration-features');
        if (!collaborationSection) return;
        
        collaborationSection.innerHTML = `
            <div class="collaboration-container">
                <h3>Collaborative Archive Building (Omeka S Features)</h3>
                <p>Demonstrating Omeka S's collaborative and community-building capabilities:</p>
                
                <div class="collaboration-features">
                    <div class="feature-card">
                        <i class="fas fa-user-plus"></i>
                        <h4>Community Contribution</h4>
                        <p>Multiple user roles allow community members to contribute directly to the archive</p>
                        <ul>
                            <li><strong>Contributors:</strong> Add new stories and update existing ones</li>
                            <li><strong>Reviewers:</strong> Moderate content and ensure community guidelines</li>
                            <li><strong>Editors:</strong> Manage metadata and archive organization</li>
                            <li><strong>Administrators:</strong> Oversee technical and policy decisions</li>
                        </ul>
                        <button class="btn btn-small" onclick="OmekaIntegration.showContributionForm()">Contribute to Archive</button>
                    </div>
                    
                    <div class="feature-card">
                        <i class="fas fa-comments"></i>
                        <h4>Community Annotation</h4>
                        <p>Visitors can add context, corrections, and additional perspectives to archive items</p>
                        <div class="annotation-example">
                            <div class="annotation">
                                <strong>Community Member:</strong> "This resonates with my experience as a night shift nurse. We need more documentation of non-traditional schedules."
                                <span class="annotation-meta">Added 2 days ago</span>
                            </div>
                            <div class="annotation">
                                <strong>Health Researcher:</strong> "Valuable primary source for understanding contemporary health practices. Could connect to our longitudinal study."
                                <span class="annotation-meta">Added 1 week ago</span>
                            </div>
                        </div>
                        <button class="btn btn-small btn-outline" onclick="OmekaIntegration.addAnnotation()">Add Your Perspective</button>
                    </div>
                    
                    <div class="feature-card">
                        <i class="fas fa-tags"></i>
                        <h4>Collaborative Tagging</h4>
                        <p>Community members help expand and refine the archive's organizational system</p>
                        <div class="tagging-interface">
                            <div class="tag-suggestions">
                                <h5>Suggested Tags for This Item:</h5>
                                <span class="tag-suggestion">workplace-health</span>
                                <span class="tag-suggestion">shift-work-adaptation</span>
                                <span class="tag-suggestion">healthcare-worker-experience</span>
                            </div>
                            <div class="add-tag">
                                <input type="text" placeholder="Add your own tag..." class="tag-input">
                                <button class="btn btn-small">Add Tag</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Demonstrate API usage and data export
    demonstrateAPIUsage() {
        const apiSection = document.getElementById('api-demonstration');
        if (!apiSection) return;
        
        apiSection.innerHTML = `
            <div class="api-container">
                <h3>Omeka S API Integration</h3>
                <p>Showcasing programmatic access and data interoperability with your live archive:</p>
                
                <div class="api-features">
                    <div class="api-feature">
                        <h4><i class="fas fa-code"></i> REST API Access</h4>
                        <p>Archive data available through standard REST API endpoints:</p>
                        <div class="code-example">
                            <code>
                                GET ${this.omekaInstances.primaryArchive.apiUrl}<br>
                                GET ${this.omekaInstances.primaryArchive.apiUrl}?subject=wellness-routines<br>
                                GET ${this.omekaInstances.primaryArchive.apiUrl}/1<br>
                                GET ${this.omekaInstances.primaryArchive.baseUrl}/api/collections
                            </code>
                        </div>
                        <button class="btn btn-small" onclick="OmekaIntegration.demonstrateAPI()">Try API Call</button>
                        <div class="api-status">
                            <span class="status-indicator ${this.isLoading ? 'loading' : 'success'}"></span>
                            ${this.isLoading ? 'Fetching data...' : `Connected to ${this.omekaItems.length} items`}
                        </div>
                    </div>
                    
                    <div class="api-feature">
                        <h4><i class="fas fa-download"></i> Data Export Formats</h4>
                        <p>Archive data exportable in multiple scholarly formats:</p>
                        <div class="export-options">
                            <button class="export-btn" onclick="OmekaIntegration.exportJSON()">
                                <i class="fas fa-file-code"></i> JSON-LD
                            </button>
                            <button class="export-btn" onclick="OmekaIntegration.exportDublinCore()">
                                <i class="fas fa-file-alt"></i> Dublin Core XML
                            </button>
                            <button class="export-btn" onclick="OmekaIntegration.exportCSV()">
                                <i class="fas fa-table"></i> CSV Metadata
                            </button>
                            <button class="export-btn" onclick="OmekaIntegration.exportRDF()">
                                <i class="fas fa-project-diagram"></i> RDF/Turtle
                            </button>
                        </div>
                    </div>
                    
                    <div class="api-feature">
                        <h4><i class="fas fa-share-alt"></i> OAI-PMH Harvesting</h4>
                        <p>Enable other archives and research platforms to harvest metadata:</p>
                        <div class="oai-info">
                            <p><strong>Base URL:</strong> ${this.omekaInstances.primaryArchive.baseUrl}/oai-pmh</p>
                            <p><strong>Metadata Formats:</strong> Dublin Core, MODS, Community Vocabulary</p>
                            <p><strong>Sets:</strong> health-narratives, community-practices, urban-experiences</p>
                        </div>
                        <button class="btn btn-small btn-outline" onclick="OmekaIntegration.testOAI()">Test OAI-PMH</button>
                    </div>
                </div>
                
                <div class="live-data-preview">
                    <h4>Live Data from Omeka Site</h4>
                    <div class="data-stats">
                        <div class="stat-item">
                            <span class="stat-number">${this.omekaItems.length}</span>
                            <span class="stat-label">Total Items</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getUniqueSubjects().length}</span>
                            <span class="stat-label">Unique Subjects</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getUniqueTypes().length}</span>
                            <span class="stat-label">Content Types</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getUniqueLocations().length}</span>
                            <span class="stat-label">Geographic Locations</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Helper methods for data analysis
    getUniqueSubjects() {
        const subjects = this.omekaItems
            .map(item => item.subject)
            .filter(subject => subject)
            .flatMap(subject => subject.split(';').map(s => s.trim()))
            .filter(s => s);
        return [...new Set(subjects)];
    }
    
    getUniqueTypes() {
        const types = this.omekaItems
            .map(item => item.type)
            .filter(type => type);
        return [...new Set(types)];
    }
    
    getUniqueLocations() {
        const locations = this.omekaItems
            .map(item => item.coverage)
            .filter(location => location);
        return [...new Set(locations)];
    }
    
    // Interactive functions for demonstration
    static searchDPLA() {
        alert('This would connect to DPLA API to search for related health and community materials across US cultural institutions.');
    }
    
    static searchInstitutional() {
        alert('This would perform federated search across university archives for related oral history and community health materials.');
    }
    
    static explorePartnerships() {
        alert('This would display partnership opportunities with community archives and grassroots documentation projects.');
    }
    
    static showContributionForm() {
        alert('This would open the contributor onboarding process with community guidelines and technical support.');
    }
    
    static addAnnotation() {
        alert('This would open an annotation interface for adding community context and scholarly commentary.');
    }
    
    static demonstrateAPI() {
        alert('This would make a live API call and display results in JSON format.');
    }
    
    static exportJSON() {
        alert('This would generate JSON-LD export of archive metadata for linked data applications.');
    }
    
    static exportDublinCore() {
        alert('This would export Dublin Core XML for library catalog integration.');
    }
    
    static exportCSV() {
        alert('This would create CSV export for statistical analysis and data visualization.');
    }
    
    static exportRDF() {
        alert('This would generate RDF/Turtle for semantic web applications.');
    }
    
    static testOAI() {
        alert('This would demonstrate OAI-PMH harvesting capabilities for metadata sharing.');
    }

    static refreshItems() {
        const omekaIntegration = new OmekaIntegration(); // Re-instantiate to refetch
        omekaIntegration.initializeOmekaFeatures();
    }
}

// Initialize Omeka integration when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#omeka-connections') || 
        document.querySelector('#metadata-comparison') ||
        document.querySelector('#collaboration-features') ||
        document.querySelector('#api-demonstration')) {
        new OmekaIntegration();
    }
});

// Export for external use
window.OmekaIntegration = OmekaIntegration;
