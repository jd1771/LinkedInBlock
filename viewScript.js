/**
 * Populates the blocked companies list with the companies stored in the Chrome storage.
 */
function populateBlockedListings() {
    chrome.storage.sync.get(null, (items) => {
        const blockedCompanies = Object.entries(items); // Converts the stored object to an array of [key, value] pairs
        const companyList = document.querySelector(".company-list");
        const emptyState = document.querySelector(".empty-state");

        // Clear existing list
        companyList.innerHTML = "";

        if (blockedCompanies.length === 0) {
            emptyState.style.display = "block";
        } else {
            emptyState.style.display = "none";
            blockedCompanies.forEach(
                ([companyName, [companyLink, dateBlocked]]) => {
                    const listItem = document.createElement("li");
                    listItem.className = "company-item";

                    listItem.innerHTML = `
                    <a href="${companyLink}" class="company-link" target="_blank" rel="noopener noreferrer">
                        ${companyName}
                    </a>
                    <button class="unblock-btn" aria-label="Unblock ${companyName}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="x-icon">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                `;

                    companyList.appendChild(listItem);
                }
            );
        }
    });
}

populateBlockedListings();
