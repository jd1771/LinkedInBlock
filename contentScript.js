console.log("LinkedIn Jobs Blocker: Content script loaded");

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
    blockContainer.className =
        "artdeco-dropdown artdeco-dropdown--placement-bottom artdeco-dropdown--justification-right";

    // Create block button
    const blockButton = document.createElement("button");
    blockButton.className =
        "company-block-btn artdeco-button artdeco-button--3 artdeco-button--tertiary artdeco-button--circle artdeco-button--muted";
    blockButton.setAttribute("aria-label", "Block Company");
    blockButton.setAttribute("type", "button");
    blockButton.setAttribute("tabindex", "0");

    blockButton.innerHTML = `
        <svg role="none" aria-hidden="true" class="artdeco-button__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/>
            <path d="M3 8h10v1H3z"/>
        </svg>
        <span class="artdeco-button__text">Block</span>
    `;

    blockButton.addEventListener("click", () => {
        console.log(`Blocking company: ${companyName}`);
        console.log(`Company URL: ${companyLink}`);
        // TODO: Add storage logic for blocked company
    });

    // Add button to its container
    blockContainer.appendChild(blockButton);

    // Insert after the share button container
    shareContainer.parentNode.insertBefore(
        blockContainer,
        shareContainer.nextSibling
    );
}

// Initial run
addBlockButtons();
