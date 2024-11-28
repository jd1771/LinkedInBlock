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

function addBlockButtons() {
    // Find the job details container
    const container = document.querySelector(
        ".job-details-jobs-unified-top-card__container--two-pane"
    );
    if (!container || container.querySelector(".company-block-btn")) return;

    // Find the share button's parent div to position our block button
    const shareContainer = container.querySelector(".artdeco-dropdown");
    if (!shareContainer) return;

    // Get company info
    const companyElement = container.querySelector(
        ".job-details-jobs-unified-top-card__company-name"
    );
    if (!companyElement) return;

    const companyLink = companyElement.querySelector("a")?.href;
    const companyName = companyElement.textContent?.trim();

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
        const currentCompanyElement = document.querySelector(
            ".job-details-jobs-unified-top-card__company-name"
        );
        const currentCompanyLink =
            currentCompanyElement?.querySelector("a")?.href;
        const currentCompanyName = currentCompanyElement?.textContent?.trim();

        console.log(`Blocking company: ${currentCompanyName}`);
        console.log(`Company URL: ${currentCompanyLink}`);

        // Add company to blocked list in storage
        if (currentCompanyName && currentCompanyLink) {
            chrome.storage.sync.get(["blockedCompanies"], (result) => {
                const blockedCompanies = result.blockedCompanies || [];
                const newBlockedCompany = {
                    name: currentCompanyName,
                    url: currentCompanyLink,
                    dateBlocked: new Date().toISOString(),
                };

                // Only add if not already blocked
                const alreadyExists = blockedCompanies.some(
                    (company) => company.url === currentCompanyLink
                );
                if (!alreadyExists) {
                    blockedCompanies.push(newBlockedCompany);
                    chrome.storage.sync.set({ blockedCompanies }, () => {
                        console.log("Company blocked successfully");
                        blockButton.disabled = true;
                    });
                }
            });
        }
    });

    // Add button to its container
    blockContainer.appendChild(blockButton);

    // Insert after the share button container
    shareContainer.parentNode.insertBefore(
        blockContainer,
        shareContainer.nextSibling
    );
}

// Watch for URL changes and content updates since LinkedIn is a SPA
let lastUrl = location.href;
const observer = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        // Remove existing block button if present
        const existingButton = document.querySelector(".company-block-btn");
        if (existingButton) {
            existingButton.closest(".artdeco-dropdown")?.remove();
        }
        // Add new block button
        setTimeout(addBlockButtons, 500);
    } else {
        // Check if button needs to be added even without URL change
        const container = document.querySelector(
            ".job-details-jobs-unified-top-card__container--two-pane"
        );
        const existingButton = document.querySelector(".company-block-btn");
        if (container && !existingButton) {
            setTimeout(addBlockButtons, 500);
        }
    }
});

// Observe both DOM changes and subtree
observer.observe(document, {
    subtree: true,
    childList: true,
    characterData: true,
});

// Initial run
setTimeout(addBlockButtons, 1000); // Increased initial delay
