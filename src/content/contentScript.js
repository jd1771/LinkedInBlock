/**
 * Map storing company names that should be blocked from job listings
 * @type {Map<string, string>}
 */
let blockedCompanies = new Map();

// LinkedIn changes its markup often, so every lookup tries several selectors
// in order and uses the first that matches.
const JOB_CARD_SELECTOR = [
    "[role='button'][componentkey^='job-card-component-ref-']",
    "[data-occludable-job-id]",
    ".job-card-container",
    "div[data-job-id]",
].join(", ");

const DETAILS_CONTAINER_SELECTORS = [
    ".job-details-jobs-unified-top-card__container--two-pane",
    ".job-details-jobs-unified-top-card__container",
    ".jobs-unified-top-card",
    ".job-details-jobs-unified-top-card",
    ".jobs-search__job-details--container",
    ".jobs-details",
];

const DETAILS_COMPANY_SELECTORS = [
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name",
    ".job-details-jobs-unified-top-card__primary-description-container a[href*='/company/']",
    "a[href*='/company/']",
];

/**
 * Returns the first element matching any selector, searching inside root.
 * @param {ParentNode} root
 * @param {string[]} selectors
 * @returns {Element|null}
 */
function queryFirst(root, selectors) {
    for (const selector of selectors) {
        const element = root.querySelector(selector);
        if (element) return element;
    }
    return null;
}

/**
 * Collapses whitespace so names compare consistently.
 * @param {string|null|undefined} text
 * @returns {string}
 */
function normalizeName(text) {
    return (text || "").replace(/\s+/g, " ").trim();
}

function isJobsPage() {
    return window.location.pathname.startsWith("/jobs");
}

function isCompanyPage() {
    return /^\/company\/(?!setup)/.test(window.location.pathname);
}

/**
 * Text directly inside an element, ignoring child elements (e.g. a button
 * that holds an icon and a text node).
 * @param {Element} el
 * @returns {string}
 */
function ownText(el) {
    return normalizeName(
        Array.from(el.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.nodeValue)
            .join(" ")
    );
}

/**
 * Closes whichever "..." menu is open.
 */
function closeOpenMenu() {
    const trigger = document.querySelector(
        "button[aria-label='More options'][aria-expanded='true'], .org-overflow-menu__dropdown-trigger[aria-expanded='true']"
    );
    if (trigger) {
        trigger.click();
        return;
    }
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true }));
    document.body.click();
}

/**
 * Walks up from a job card to the outermost wrapper that holds only that card,
 * so hiding it removes the whole row (border, padding) and not just the inside.
 * @param {Element} card
 * @returns {Element}
 */
function getHideTarget(card) {
    let target = card;
    // Capped so a page with a single result can't make us hide the whole page
    for (let i = 0; i < 4 && target.parentElement && target.parentElement.childElementCount === 1; i++) {
        target = target.parentElement;
    }
    return target;
}

function setHidden(element, hidden) {
    if (hidden) {
        element.style.display = "none";
        element.dataset.linkedinBlockHidden = "true";
    } else {
        element.style.display = "";
        delete element.dataset.linkedinBlockHidden;
    }
}

/**
 * Shows or hides every job listing depending on the blocked company list.
 * Listings are re-evaluated each pass, so unblocking restores them.
 *
 * LinkedIn's class names are obfuscated, so instead of a class for the company
 * line this looks for any text-only element inside the card whose text is a
 * blocked company name.
 * @function
 * @returns {void}
 */
function removeBlockedListings() {
    try {
        if (!isJobsPage()) return;

        const shouldHide = new Set();

        document.querySelectorAll(JOB_CARD_SELECTOR).forEach((card) => {
            const isBlocked = Array.from(card.querySelectorAll("p, span, div, a")).some((el) => {
                if (el.childElementCount > 0) return false;
                const text = normalizeName(el.textContent);
                return text.length > 0 && text.length <= 100 && blockedCompanies.has(text);
            });
            if (isBlocked) shouldHide.add(getHideTarget(card));
        });

        // Restore anything we hid earlier that is no longer blocked
        document.querySelectorAll("[data-linkedin-block-hidden]").forEach((el) => {
            if (!shouldHide.has(el) && !el.matches("hr")) setHidden(el, false);
        });

        shouldHide.forEach((el) => setHidden(el, true));

        // Hide the divider line that follows each hidden row (restore when none are hidden)
        document.querySelectorAll("hr[data-linkedin-block-hidden]").forEach((hr) => setHidden(hr, false));
        shouldHide.forEach((el) => {
            const next = el.nextElementSibling;
            if (next && next.tagName === "HR") setHidden(next, true);
        });
    } catch (error) {
        console.error("Error in removeBlockedListings:", error);
    }
}

/**
 * Finds the company name element in the job details pane (right side).
 * Tries known class names first, then falls back to the first company link on
 * the page that is not inside a job card in the left-hand list.
 * @returns {Element|null}
 */
function findDetailsCompanyElement() {
    const isInList = (el) => el.closest(JOB_CARD_SELECTOR);

    for (const selector of DETAILS_COMPANY_SELECTORS) {
        for (const el of document.querySelectorAll(selector)) {
            if (!isInList(el)) return el;
        }
    }
    return null;
}

/**
 * Adds a "Block company" entry to the job details "..." menu.
 * The menu is rendered only while open, so this is called on DOM changes and
 * clones the existing "Report this job" row so it matches LinkedIn's styling.
 * @function
 * @returns {void}
 */
function addBlockMenuItem() {
    try {
        if (!isJobsPage() && !isCompanyPage()) return;

        // "Report this job" on job pages, "Report abuse" on company pages
        const reportLabels = ["Report this job", "Report abuse"];
        const reportEl = Array.from(document.querySelectorAll("p, span, div, a, button"))
            .find((el) => reportLabels.includes(ownText(el)));
        if (!reportEl) return;
        const reportLabel = ownText(reportEl);

        const row = reportEl.closest("li, [role='menuitem'], [role='button'], button, a") || reportEl.parentElement;
        if (!row || !row.parentNode) return;
        if (row.parentNode.querySelector(".company-block-menu-item")) return;

        const item = row.cloneNode(true);
        item.classList.add("company-block-menu-item");
        ["componentkey", "href", "id", "data-testid", "target"].forEach((attr) => {
            item.removeAttribute(attr);
            item.querySelectorAll(`[${attr}]`).forEach((el) => el.removeAttribute(attr));
        });

        // Swap the label (it may be a bare text node next to an icon)
        const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            if (normalizeName(walker.currentNode.nodeValue) === reportLabel) {
                walker.currentNode.nodeValue = "Block company";
                break;
            }
        }

        // Swap the icon for a "blocked" circle, keeping the original size
        const oldIcon = item.querySelector("svg");
        if (oldIcon) {
            const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            icon.setAttribute("viewBox", "0 0 24 24");
            icon.setAttribute("fill", "currentColor");
            icon.setAttribute("aria-hidden", "true");
            icon.setAttribute("width", oldIcon.getAttribute("width") || "24");
            icon.setAttribute("height", oldIcon.getAttribute("height") || "24");
            icon.setAttribute("class", oldIcon.getAttribute("class") || "");
            icon.innerHTML = '<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 016.32 12.9L7.1 5.68A7.96 7.96 0 0112 4zm0 16a8 8 0 01-6.32-12.9L16.9 18.32A7.96 7.96 0 0112 20z"/>';
            oldIcon.replaceWith(icon);
        }

        item.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await blockCurrentCompany();
            closeOpenMenu();
        }, true);

        row.parentNode.insertBefore(item, row.nextSibling);
    } catch (error) {
        console.error("Error in addBlockMenuItem:", error);
    }
}

/**
 * Loads blocked companies from storage.
 * @async
 * @returns {Promise<void>}
 */
async function initialize() {
    try {
        blockedCompanies = await loadBlockedCompanies();
    } catch (error) {
        console.error("Error loading blocked companies:", error);
    }
}

function processPage() {
    removeBlockedListings();
    addBlockMenuItem();
}

/**
 * Loads data, then watches the DOM so listings and the button are handled
 * as LinkedIn loads content dynamically (it is a single-page app).
 * @async
 * @returns {Promise<void>}
 */
async function initObserver() {
    await initialize();

    let timeoutId;
    const observer = new MutationObserver(() => {
        // The menu appears only while open, so add our entry right away
        requestAnimationFrame(addBlockMenuItem);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(processPage, 250);
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Keep in sync when the popup unblocks a company (or another tab blocks one)
    chrome.storage.onChanged.addListener(async (changes, area) => {
        if (area !== "sync") return;
        await initialize();
        removeBlockedListings();
    });

    processPage();

    window.addEventListener("beforeunload", () => observer.disconnect());
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initObserver);
} else {
    initObserver();
}
