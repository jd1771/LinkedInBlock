/**
 * Populates the blocked companies list with the companies stored in the Chrome storage.
 * 
 * Inputs: None
 * Outputs: None (directly manipulates the DOM and updates storage)
 */
async function populateBlockedListings() {
    
    // Show spinner and hide empty state immediately
    const spinner = document.querySelector(".spinner");
    const emptyState = document.querySelector(".empty-state");
    
    spinner.style.display = "block";
    emptyState.style.display = "none";  // Hide empty state while loading
    
    const blockedCompanies = await loadBlockedCompanies();
    const companyList = document.querySelector(".company-list");

    // Hide spinner once data is loaded
    spinner.style.display = "none";
    
    // Clear existing list
    companyList.innerHTML = "";

    // Show empty state only if there are no items
    if (blockedCompanies.size === 0) {
        emptyState.style.display = "block";
        return;
    }
    
    blockedCompanies.forEach((companyLink, companyName) => {
        const listItem = createCompanyListItem(companyName, companyLink, () => {
            chrome.storage.sync.remove(companyName, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error unblocking company:", chrome.runtime.lastError);
                } else {
                    listItem.remove();
                    if (!companyList.children.length) {
                        emptyState.style.display = "block";
                    }
                }
            });
        });
        
        companyList.appendChild(listItem);
    });
}

// Wait for DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', () => {
    // Populate the list on page load
    populateBlockedListings();
});
