// Monitor for job listing page
const LINKEDIN_JOBS_URL_PATTERN = /linkedin\.com\/jobs\//;

function isJobListingPage() {
    return LINKEDIN_JOBS_URL_PATTERN.test(window.location.href);
}


async function init() {
    try {
        if (!isJobListingPage()) return;

        console.log("LinkedIn Jobs page detected");
    }
}

