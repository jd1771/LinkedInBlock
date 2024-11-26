console.log("LinkedIn Jobs Blocker: Content script loaded");

function addBlockButtons() {
    // Find the job details container
    const container = document.querySelector(
        ".job-details-jobs-unified-top-card__container--two-pane"
    );
    if (!container || container.querySelector(".company-block-btn")) return;

    // Get company info
    const companyElement = container.querySelector(
        ".job-details-jobs-unified-top-card__company-name"
    );
    if (!companyElement) return;

    const companyLink = companyElement.querySelector("a")?.href;
    const companyName = companyElement.textContent?.trim();

    console.log(companyLink);
    console.log(companyName);
}

// Initial run
addBlockButtons();
