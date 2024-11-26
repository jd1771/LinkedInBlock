console.log("LinkedIn Jobs Blocker: Content script loaded");

function addBlockButtons() {
    // Find all job cards using the data-view-name attribute
    const jobCards = document.querySelectorAll('[data-view-name="job-card"]');

    jobCards.forEach((card) => {
        // Check if we already added a block button to this card
        if (card.querySelector(".company-block-btn")) return;

        // Find the action container (where the X button is)
        const actionContainer = card.querySelector(".mlA > div");
        if (!actionContainer) return;

        // Create block button
        const blockButton = document.createElement("button");
        blockButton.className =
            "company-block-btn artdeco-button artdeco-button--muted artdeco-button--2 artdeco-button--tertiary";
        blockButton.setAttribute("aria-label", "Block company");
        blockButton.style.marginRight = "4px";

        // Match LinkedIn's button style
        blockButton.innerHTML = `
            <span class="artdeco-button__text">
                🚫
            </span>
        `;

        blockButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const companyName = card
                .querySelector(".artdeco-entity-lockup__subtitle span")
                ?.textContent.trim();
            if (companyName) {
                console.log(`Blocking company: ${companyName}`);
                // TODO: Add logic to store blocked company
                card.style.display = "none";
            }
        });

        // Insert before the existing X button
        actionContainer.insertBefore(blockButton, actionContainer.firstChild);
    });
}

// Initial run
addBlockButtons();

// Watch for new job cards being added (LinkedIn loads them dynamically)
const observer = new MutationObserver(() => {
    addBlockButtons();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
