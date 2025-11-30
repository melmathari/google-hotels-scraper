import { Page } from 'playwright';
import { LoadedRequest, PlaywrightCrawlingContext, Request, Log } from 'crawlee';
import { waitWhileGoogleLoading } from './utils.js';
import { GoogleHotelsOptions } from './options.js';
import {
    DEFAULT_NUM_OF_ADULTS,
    DEFAULT_NUM_OF_CHILDREN,
    DEFAULT_NUM_OF_ROOMS,
    MAX_NUM_OF_PEOPLE,
    MAX_NUM_OF_ROOMS,
} from '../constants.js';

// define type for callback function
type EnqueueDetails = (urls: string[]) => Promise<void>;

export const getDetailsUrls = async <Context extends PlaywrightCrawlingContext>(ctx: Omit<Context, 'request'> & {
    request: LoadedRequest<Request>;
}, options: GoogleHotelsOptions, enqueueDetails: EnqueueDetails) => {
    const { page, log } = ctx;
    // Wait for the input element to be present and the page to be loaded
    const element = await page.waitForSelector('input[aria-label="Search for places, hotels and more"]');
    log.info(await element.inputValue());

    await fillInputForm(page, options, log);
    await waitWhileGoogleLoading(page);
    await page.waitForTimeout(1000);

    // const nextPageButtonSelector = 'main > c-wiz > span > c-wiz > c-wiz:last-of-type > div > button:nth-of-type(2)';
    let hasNextPage = true;
    let pageNumber = 1;
    let totalItems = 0;
    do {
        const items = await page.$$('main > c-wiz > span > c-wiz > c-wiz > div > a');
        log.info(`Found ${items.length} items on the page ${pageNumber}`);
        const urls = await Promise.all(items.map(async (item) => (
            `https://www.google.com${await item.getAttribute('href')}`
        ))) as string[];

        if (options.maxResults === undefined) {
            await enqueueDetails(urls);
        } else {
            await enqueueDetails(urls.slice(0, options.maxResults - totalItems));
        }

        totalItems += items.length;
        const nextPageButton = page.getByRole('button').filter({ hasText: 'Next' }).first();
        // const nextPageButton = await page.$(nextPageButtonSelector);
        if (nextPageButton !== null && (options.maxResults === undefined || totalItems < options.maxResults!)) {
            await nextPageButton.click();
            await waitWhileGoogleLoading(page);
            await page.waitForTimeout(1000);
            pageNumber++;
        } else {
            hasNextPage = false;
        }
    } while (hasNextPage);
};

const fillInputForm = async (page: Page, options: GoogleHotelsOptions, log: Log) => {
    let checkInElement = await page.waitForSelector('input[aria-label="Check-in"]');

    await checkInElement.click();

    checkInElement = await page.waitForSelector(
        'div[role="dialog"] > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > div > input[aria-label="Check-in"]',
    );
    const checkOutElement = await page.waitForSelector(
        'div[role="dialog"] > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > div > input[aria-label="Check-out"]',
    );

    await checkInElement.fill(options.checkInDate);
    await checkOutElement.click();
    await page.waitForTimeout(1000);
    await checkOutElement.fill(options.checkOutDate);
    await checkOutElement.press('Enter');

    const submitButton = await page.waitForSelector('div[role="dialog"] > div:nth-of-type(4) > div > button:nth-of-type(2)');
    await submitButton.click();

    // Handle travelers (adults, children) and rooms
    const peopleButton = await page.waitForSelector('div[role="button"][aria-label^="Number of travelers"]');
    await peopleButton.click();
    await page.waitForTimeout(1000);

    let adults = DEFAULT_NUM_OF_ADULTS;
    let children = DEFAULT_NUM_OF_CHILDREN;
    let rooms = DEFAULT_NUM_OF_ROOMS;

    // Adjust adults
    while (adults > options.numberOfAdults && adults > 0) {
        const removeAdultButton = await page.waitForSelector('button[aria-label="Remove adult"]');
        await removeAdultButton.click();
        adults--;
    }
    while (adults < options.numberOfAdults && (adults + children) <= MAX_NUM_OF_PEOPLE) {
        const addAdultButton = await page.waitForSelector('button[aria-label="Add adult"]');
        await addAdultButton.click();
        adults++;
    }

    // Adjust children
    while (children > options.numberOfChildren && children >= 0) {
        const removeChildButton = await page.waitForSelector('button[aria-label="Remove child"]');
        await removeChildButton.click();
        children--;
    }
    while (children < options.numberOfChildren && (adults + children) <= MAX_NUM_OF_PEOPLE) {
        const addChildButton = await page.waitForSelector('button[aria-label="Add child"]');
        await addChildButton.click();
        children++;
    }

    // Adjust rooms
    const targetRooms = options.numberOfRooms ?? DEFAULT_NUM_OF_ROOMS;
    while (rooms > targetRooms && rooms > 1) {
        const removeRoomButton = await page.waitForSelector('button[aria-label="Remove room"]');
        await removeRoomButton.click();
        rooms--;
    }
    while (rooms < targetRooms && rooms < MAX_NUM_OF_ROOMS) {
        const addRoomButton = await page.waitForSelector('button[aria-label="Add room"]');
        await addRoomButton.click();
        rooms++;
    }

    const peopleDoneButton = await page.waitForSelector(
        'div[data-default-adult-num="2"] > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button',
    );
    await peopleDoneButton.click();

    // Handle sorting
    if (options.sortBy && options.sortBy !== 'relevance') {
        await applySorting(page, options.sortBy, log);
    }

    // Handle hotel class filter
    if (options.hotelClass && options.hotelClass.length > 0) {
        await applyHotelClassFilter(page, options.hotelClass, log);
    }

    // Handle currency
    const currencyButton = await page.waitForSelector('footer div c-wiz button');
    await currencyButton.click();
    await page.waitForTimeout(1000);
    const requiredCurrency = options.currencyCode;
    const currencyRadio = await page.waitForSelector(`div[role="radio"][data-value="${requiredCurrency.toUpperCase()}"]`);
    await currencyRadio.click();
    const currencyDoneButton = await page.waitForSelector('div[aria-label="Select currency"] > div:nth-of-type(3) > div:nth-of-type(2) > button');
    await currencyDoneButton.click();
};

const applySorting = async (page: Page, sortBy: string, log: Log) => {
    try {
        // Click on the sort dropdown button
        const sortButton = await page.waitForSelector('button[aria-label^="Sort by"]', { timeout: 5000 });
        await sortButton.click();
        await page.waitForTimeout(500);

        // Map sortBy value to the menu item text
        const sortTextMap: Record<string, string> = {
            lowest_price: 'Lowest price',
            highest_rating: 'Highest rating',
            most_reviewed: 'Most reviewed',
        };

        const sortText = sortTextMap[sortBy];
        if (sortText) {
            const sortOption = await page.waitForSelector(`div[role="menuitemradio"]:has-text("${sortText}")`, { timeout: 5000 });
            await sortOption.click();
            await waitWhileGoogleLoading(page);
            log.info(`Applied sorting: ${sortText}`);
        }
    } catch (error) {
        log.warning(`Failed to apply sorting: ${sortBy}`, { error: (error as Error).message });
    }
};

const applyHotelClassFilter = async (page: Page, hotelClasses: number[], log: Log) => {
    try {
        // Click on "All filters" button to open the filter panel
        const allFiltersButton = await page.waitForSelector('button:has-text("All filters")', { timeout: 5000 });
        await allFiltersButton.click();
        await page.waitForTimeout(1000);

        // For each hotel class, find and click the checkbox
        for (const starRating of hotelClasses) {
            try {
                const classCheckbox = await page.waitForSelector(
                    `div[role="checkbox"][aria-label*="${starRating}-star"]`,
                    { timeout: 3000 },
                );
                const isChecked = await classCheckbox.getAttribute('aria-checked');
                if (isChecked !== 'true') {
                    await classCheckbox.click();
                    await page.waitForTimeout(300);
                }
            } catch {
                log.warning(`Could not find ${starRating}-star filter checkbox`);
            }
        }

        // Close the filter panel by clicking the close/done button
        const closeButton = await page.waitForSelector('div[role="dialog"] button[aria-label="Close"]', { timeout: 3000 })
            .catch(() => page.waitForSelector('div[role="dialog"] button:has-text("Done")', { timeout: 3000 }));
        await closeButton.click();

        await waitWhileGoogleLoading(page);
        log.info(`Applied hotel class filter: ${hotelClasses.join(', ')}-star`);
    } catch (error) {
        log.warning(`Failed to apply hotel class filter`, { error: (error as Error).message });
    }
};
