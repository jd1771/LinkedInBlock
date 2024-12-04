console.log("LinkedIn Jobs Blocker: Content script loaded");

// CSS Classes
const BUTTON_CLASSES = [
    "company-block-btn",
    "artdeco-button",
    "artdeco-button--3",
    "artdeco-button--tertiary",
    "artdeco-button--circle",
    "artdeco-button--muted",
].join(" ");

const CONTAINER_CLASS =
    "artdeco-dropdown artdeco-dropdown--placement-bottom artdeco-dropdown--justification-right";

// HTML Template
const BLOCK_BUTTON_SVG = `
    <svg role="none" 
         aria-hidden="true" 
         class="artdeco-button__icon" 
         xmlns="http://www.w3.org/2000/svg" 
         width="18" 
         height="18" 
         viewBox="0 0 16 16" 
         fill="currentColor">
        <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/>
        <path d="M3 8h10v1H3z"/>
    </svg>
    <span class="artdeco-button__text">Block</span>
`;

// Blocked companies data structure
let blockedCompanies = new Set();

/**
 * Removes blocked company listings from the view.
 * 
 * Inputs: None
 * Outputs: None (directly manipulates the DOM and updates storage)
 */
function removeBlockedListings() {

    // Grab all job listings
    const jobListings = document.querySelectorAll("[data-occludable-job-id]");

    jobListings.forEach((listing) => {
        
        // Get the child div artdeco-entity-lockup__subtitle
        const companyElement = listing.querySelector(
            ".artdeco-entity-lockup__subtitle"
        );

        if (companyElement) {

            // Get the inner text (company name)
            const companyName = companyElement.textContent?.trim();

            if (blockedCompanies.has(companyName)) {
                console.log(`Blocking job from: ${companyName}`);
                listing.style.display = "none";
            }
        }
    });
}

/**
 * Creates and adds block buttons to the DOM.
 * 
 * Inputs: None
 * Outputs: None (directly manipulates the DOM and updates storage)
 */
function addBlockButtons() {
    
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
    const blockContainer = document.createElement("div");
    blockContainer.className = CONTAINER_CLASS;

    // Create block button
    const blockButton = document.createElement("button");
    blockButton.className = BUTTON_CLASSES;
    blockButton.setAttribute("aria-label", "Block Company");
    blockButton.setAttribute("type", "button");
    blockButton.setAttribute("tabindex", "0");
    blockButton.innerHTML = BLOCK_BUTTON_SVG;

    blockButton.addEventListener("click", () => {

        // Get fresh company info at time of click
        const currentCompanyElement = document.querySelector(".job-details-jobs-unified-top-card__company-name");
        const currentCompanyLink    = currentCompanyElement?.querySelector("a")?.href;
        const currentCompanyName    = currentCompanyElement?.textContent?.trim();


        console.log(`Blocking company: ${currentCompanyName}`);
        console.log(`Company URL: ${currentCompanyLink}`);

        if (currentCompanyName && currentCompanyLink) {
            const dataToStore = {
                [currentCompanyName]: [
                    currentCompanyLink,
                    new Date().toISOString(),
                ],
            };

            chrome.storage.sync.set(dataToStore, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error storing data:", chrome.runtime.lastError);
                } else {
                    blockedCompanies.add(currentCompanyName);
                    removeBlockedListings();
                    console.log("Data successfully saved.");
                }
            });
        }
    });

    // Add button to its container
    blockContainer.appendChild(blockButton);

    // Insert after the share button container
    shareContainer.parentNode.insertBefore(blockContainer, shareContainer.nextSibling);
}

// Load blocked companies from storage
chrome.storage.sync.get(null, (result) => {
    if (chrome.runtime.lastError) {
        console.error("Error loading data from storage:", chrome.runtime.lastError);
    } else {
        Object.keys(result).forEach((companyName) => {
            blockedCompanies.add(companyName);
        });
        
        console.log("Blocked companies loaded from storage:", blockedCompanies);
    }
});

// Wait for the DOM to be ready before setting up the observer
function initObserver() {
    // Create the MutationObserver
    const observer = new MutationObserver((mutations) => {
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
    const initialJobListings = document.querySelectorAll('[data-occludable-job-id]');
    initialJobListings.forEach(jobListing => {
        if (!jobListing.classList.contains('processed')) {
            removeBlockedListings();
            addBlockButtons();
            jobListing.classList.add('processed');
        }
    });
}

// Use DOMContentLoaded to ensure the DOM is ready
document.addEventListener('DOMContentLoaded', initObserver);

// Fallback for cases where DOMContentLoaded might not fire
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
} else {
    initObserver();
}
