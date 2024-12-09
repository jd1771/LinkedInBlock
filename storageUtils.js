/**
 * Storage utility functions for managing blocked companies
 */

/**
 * Loads all blocked companies from chrome storage
 * @returns {Promise<Set>} Set of blocked company names
 */
export async function loadBlockedCompanies() {
    return new Promise((resolve) => {
        const blockedCompanies = new Set();
        
        chrome.storage.sync.get(null, (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error loading data from storage:", chrome.runtime.lastError);
                resolve(blockedCompanies);
                return;
            }
            
            Object.keys(result).forEach((companyName) => {
                blockedCompanies.add(companyName);
            });
            resolve(blockedCompanies);
        });
    });
}

/**
 * Stores a company in chrome storage
 * @param {string} companyName - Name of company to block
 * @param {string} companyLink - LinkedIn URL of the company
 * @returns {Promise<void>}
 */
export async function storeBlockedCompany(companyName, companyLink) {
    return new Promise((resolve, reject) => {
        const dataToStore = {
            [companyName]: [
                companyLink,
                new Date().toISOString(),
            ],
        };

        chrome.storage.sync.set(dataToStore, () => {
            if (chrome.runtime.lastError) {
                console.error("Error storing data:", chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
            }
            resolve();
        });
    });
}
