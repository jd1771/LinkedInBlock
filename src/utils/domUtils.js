/**
 * Blocks the company currently shown in the job details pane.
 * @function
 * @async
 * @returns {Promise<void>}
 */
async function blockCurrentCompany() {
    try {
        const companyElement = findDetailsCompanyElement();
        const companyLink    = companyElement?.href
            || companyElement?.querySelector("a")?.href
            || "";
        const companyName    = normalizeName(companyElement?.textContent);

        if (!companyName) return;

        await storeBlockedCompany(companyName, companyLink);
        blockedCompanies.set(companyName, companyLink);
        removeBlockedListings();
    } catch (error) {
        console.error("Failed to block company:", error);
    }
}

/**
 * Creates a company list item element
 * @function
 * @param {string} companyName - Name of the company
 * @param {string} companyLink - URL to company's LinkedIn page
 * @param {Function} onUnblock - Callback function when company is unblocked
 * @returns {HTMLElement} List item element for the company
 */
function createCompanyListItem(companyName, companyLink, onUnblock) {
    const listItem = document.createElement("li");
    listItem.className = "company-item";

    // Name and link come from page content, so set them as text/attributes, not HTML
    const link = document.createElement("a");
    link.className = "company-link";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = companyName;
    if (/^https?:\/\//i.test(companyLink)) link.href = companyLink;

    listItem.innerHTML = `
        <button class="unblock-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="restore-icon">
                <polyline points="9 1 4 6 9 11"></polyline>
                <path d="M20 17.58A9 9 0 0 0 6.36 6.36L4 8"></path>
            </svg>
        </button>
    `;

    const unblockButton = listItem.querySelector(".unblock-btn");
    unblockButton.setAttribute("aria-label", `Restore ${companyName}`);
    listItem.prepend(link);
    unblockButton.addEventListener("click", onUnblock);
    
    return listItem;
}