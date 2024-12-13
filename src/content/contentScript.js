// Blocked companies data structure
let blockedCompanies = new Map();

/**
 * Removes blocked company listings from the view.
 * 
 * Inputs: None
 * Outputs: None (directly manipulates the DOM and updates storage)
 */
function removeBlockedListings() {
    try {
        // Only run on jobs pages
        if (!window.location.href.includes('/jobs/')) return;

        // Grab all job listings
        const jobListings = document.querySelectorAll("[data-occludable-job-id]");

        jobListings.forEach((listing) => {
            try {
                // Get the child div artdeco-entity-lockup__subtitle
                const companyElement = listing.querySelector(
                    ".artdeco-entity-lockup__subtitle"
                );

                if (companyElement) {
                    // Get the inner text (company name)
                    const companyName = companyElement.textContent?.trim();

                    if (companyName && blockedCompanies.has(companyName)) {
                        listing.style.display = "none";
                    }
                }
            } catch (listingError) {
                console.error("Error processing individual listing:", listingError);
            }
        });
    } catch (error) {
        console.error("Error in removeBlockedListings:", error);
    }
}

/**
 * Creates and adds block buttons to the DOM.
 * 
 * Inputs: None
 * Outputs: None (directly manipulates the DOM and updates storage)
 */
function addBlockButtons() {
    try {
        // Only run on jobs pages
        if (!window.location.href.includes('/jobs/')) return;

        // Find the job details container
        const container = document.querySelector(".job-details-jobs-unified-top-card__container--two-pane");

        // If no container or button already exists, return
        if (!container || container.querySelector(".company-block-btn")) return;

        // Find the share button's parent div to position our block button
        const shareContainer = container.querySelector(".artdeco-dropdown");
        
        if (!shareContainer) return;

        // Get company info
        const companyElement = container.querySelector(".job-details-jobs-unified-top-card__company-name");

        if (!companyElement) return;

        // Create block button container
        const blockContainer = createBlockButton();

        // Insert after the share button container
        shareContainer.parentNode.insertBefore(blockContainer, shareContainer.nextSibling);
    } catch (error) {
        console.error("Error in addBlockButtons:", error);
    }
}

// Retrieve blocked companies from storage.
async function initialize() {
    try {
        blockedCompanies = await loadBlockedCompanies();
    } catch (error) {
        console.error("Error loading blocked companies:", error);
    }
}

// Update the initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initialize().then(initObserver);
    });
} else {
    initialize().then(initObserver);
}

// Wait for the DOM to be ready before setting up the observer
function initObserver() {
    let previousLocation = window.location.href;

    // Create the MutationObserver
    const observer = new MutationObserver((mutations) => {
        // Check if the location has changed
        const currentLocation = window.location.href;
        if (currentLocation !== previousLocation) {
            previousLocation = currentLocation;
            
            // Reset processed status
            const processedListings = document.querySelectorAll('.processed');
            processedListings.forEach(listing => listing.classList.remove('processed'));
        }

        // Only process if on jobs page
        if (!window.location.href.includes('/jobs/')) return;

        // Select all job listings with the data attribute
        const jobListings = document.querySelectorAll('[data-occludable-job-id]');
        
        jobListings.forEach(jobListing => {
            // Check if you've already processed this listing
            if (!jobListing.classList.contains('processed')) {
                
                removeBlockedListings();
                addBlockButtons();
                
                // Mark as processed to avoid repeated processing
                jobListing.classList.add('processed');
            }
        });
    });

    // Observe the entire body for dynamically loaded content
    const targetNode = document.body;
    
    // Only observe if we have a valid node
    if (targetNode) {
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
    }

    // Initial run
    if (window.location.href.includes('/jobs/')) {
        const initialJobListings = document.querySelectorAll('[data-occludable-job-id]');
        initialJobListings.forEach(jobListing => {
            if (!jobListing.classList.contains('processed')) {
                removeBlockedListings();
                addBlockButtons();
                jobListing.classList.add('processed');
            }
        });
    }

    // Disconnect the observer when the page unloads
    window.addEventListener('beforeunload', () => observer.disconnect());
}

// Check document readiness and initialize accordingly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
} else {
    initObserver();
}
