// CSS Classes
const BUTTON_CLASSES = [
    "company-block-btn",
    "artdeco-button",
    "artdeco-button--3",
    "artdeco-button--tertiary",
    "artdeco-button--circle",
    "artdeco-button--muted",
].join(" ");

const CONTAINER_CLASS = `
    artdeco-dropdown 
    artdeco-dropdown--placement-bottom 
    artdeco-dropdown--justification-right
`.trim();

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

/**
 * Creates a block button element with associated click handler
 * @returns {HTMLElement} Container div with block button
 */
function createBlockButton() {

    // Create block button
    // Create block button container
    const blockContainer     = document.createElement("div");
    const blockButton        = document.createElement("button");
    blockContainer.className = CONTAINER_CLASS;
    blockButton.className    = BUTTON_CLASSES;
    blockButton.innerHTML    = BLOCK_BUTTON_SVG;
    
    blockButton.setAttribute("aria-label", "Block Company");
    blockButton.setAttribute("type", "button");
    blockButton.setAttribute("tabindex", "0");

    blockButton.addEventListener("click", async () => {
        try {
            const currentCompanyElement = document.querySelector(".job-details-jobs-unified-top-card__company-name");
            const currentCompanyLink    = currentCompanyElement?.querySelector("a")?.href;
            const currentCompanyName    = currentCompanyElement?.textContent?.trim();

            if (currentCompanyName && currentCompanyLink) {
                try {
                    await storeBlockedCompany(currentCompanyName, currentCompanyLink);
                    blockedCompanies.set(currentCompanyName, currentCompanyLink);
                    removeBlockedListings();
                    blockButton.blur();
                } catch (storageError) {
                    console.error("Failed to store blocked company:", storageError);
                }
            }
        } catch (clickError) {
            console.error("Error in block button click handler:", clickError);
        }
    });

    // Add button to its container
    blockContainer.appendChild(blockButton);

    return blockContainer;
}

/**
 * Creates a company list item element
 * @param {string} companyName - Name of the company
 * @param {string} companyLink - URL to company's LinkedIn page
 * @param {Function} onUnblock - Callback function when company is unblocked
 * @returns {HTMLElement} List item element for the company
 */
function createCompanyListItem(companyName, companyLink, onUnblock) {
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

    const unblockButton = listItem.querySelector(".unblock-btn");
    unblockButton.addEventListener("click", onUnblock);
    
    return listItem;
}