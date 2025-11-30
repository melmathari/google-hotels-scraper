import { Page } from 'playwright';
import { LoadedRequest, Request } from 'crawlee';

/**
 * This function get rid of the Google consent dialog and redirects back to desired page.
 * @param request
 * @param page
 */
export const skipGoogleConsent = async (request: LoadedRequest<Request>, page: Page) => {
    // If the loaded URL is the Google consent dialog, reject all cookies
    if (request.loadedUrl.startsWith('https://consent.google.com')) {
        // Try multiple selectors for the "Reject all" button as Google may use different versions
        const rejectButtonSelectors = [
            'button[aria-label="Reject all"]',
            'button:has-text("Reject all")',
            'form:has(button) button:first-of-type', // Usually the first button is "Reject all"
        ];

        for (const selector of rejectButtonSelectors) {
            try {
                const button = await page.waitForSelector(selector, { timeout: 5000 });
                if (button) {
                    await button.click();
                    // Wait for navigation back to the original page
                    await page.waitForURL(/google\.com\/travel/, { timeout: 10000 });
                    break;
                }
            } catch {
                // Try next selector
            }
        }
    }
};

/**
 * This function waits for the Google loading spinner to disappear.
 * @param page
 */
export const waitWhileGoogleLoading = async (page: Page) => {
    await page.waitForFunction(async () => {
        const loader = document.querySelector('div[aria-label="Loading results"]');
        return !(loader?.checkVisibility() ?? false);
    });
};
