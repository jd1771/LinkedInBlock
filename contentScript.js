const LINKEDIN_JOBS_URL_PATTERN = /linkedin\.com\/jobs\//;

function isJobListingPage() {
    return LINKEDIN_JOBS_URL_PATTERN.test(window.location.href);
}

console.log("LinkedIn Jobs Blocker: Content script loaded");

async function init() {
    if (!isJobListingPage()) return;
    console.log("LinkedIn Jobs page detected");
}
