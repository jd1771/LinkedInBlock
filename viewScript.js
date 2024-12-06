/**
 * Populates the blocked companies list with the companies stored in the Chrome storage.
 * 
 * Inputs: None
 * Outputs: None (directly manipulates the DOM and updates storage)
 */
function populateBlockedListings() {
    // Show spinner and hide empty state immediately
    const spinner = document.querySelector(".spinner");
    const emptyState = document.querySelector(".empty-state");
    
    spinner.style.display = "block";
    emptyState.style.display = "none";  // Hide empty state while loading
    
    chrome.storage.sync.get(null, (items) => {
        const blockedCompanies = Object.entries(items);
        const companyList = document.querySelector(".company-list");

        // Hide spinner once data is loaded
        spinner.style.display = "none";
        
        // Clear existing list
        companyList.innerHTML = "";

        // Show empty state only if there are no items
        if (blockedCompanies.length === 0) {
            emptyState.style.display = "block";
        }
        
        blockedCompanies.forEach(([companyName, [companyLink, dateBlocked]]) => {
            const listItem = document.createElement("li");
            listItem.className = "company-item";

            listItem.innerHTML = `
                <a href="${companyLink}" class="company-link" target="_blank" rel="noopener noreferrer">
                    ${companyName}
                </a>
                
                <button class="unblock-btn" aria-label="Restore ${companyName}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="restore-icon">
                        <polyline points="9 1 4 6 9 11"></polyline>
                        <path d="M20 17.58A9 9 0 0 0 6.36 6.36L4 8"></path>
                    </svg>
                </button>
            `;

            // Add event listener to the unblock button
            const unblockButton =listItem.querySelector(".unblock-btn");

            unblockButton.addEventListener("click", () => {
                chrome.storage.sync.remove(companyName, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error unblocking company:", chrome.runtime.lastError);
                    } else {
                        console.log(`${companyName} successfully unblocked.`);
                        
                        listItem.remove(); // Remove the item from the UI

                        // Check if there are no remaining items
                        if (!companyList.children.length) {
                            emptyState.style.display = "block";
                        }
                    }
                });
            });
            
            companyList.appendChild(listItem);
        });
    });
}

// Wait for DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', () => {
    // Populate the list on page load
    populateBlockedListings();
});
