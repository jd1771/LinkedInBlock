/**
 * Populates the list of blocked companies in the popup UI.
 * Retrieves blocked companies from Chrome storage and creates list items for each one.
 * Handles loading states, empty states, and unblock functionality.
 * @function
 * @async
 * @returns {Promise<void>}
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
        const listItem = createCompanyListItem(companyName, companyLink, async () => {
            try {
                await removeBlockedCompany(companyName);
                listItem.remove();
                if (!companyList.children.length) {
                    emptyState.style.display = "block";
                }
            } catch (error) {
                console.error("Error unblocking company:", error);
            }
        });
        
        companyList.appendChild(listItem);
    });
}

// Event listener callback that runs when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Populate the list on page load
    populateBlockedListings();
});
