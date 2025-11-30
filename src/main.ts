import { Actor, log, ProxyConfigurationOptions } from 'apify';
import { PlaywrightCrawler, RequestOptions } from 'crawlee';
import { createGoogleHotelsRouter } from './routes.js';
import { GoogleHotelsOptions } from './scraper/options.js';
import { CONTENT_LANGUAGE_CODE, DEFAULT_MAX_REQUESTS_PER_CRAWL } from './constants.js';

interface Input extends GoogleHotelsOptions {
    proxyConfig: ProxyConfigurationOptions;
    maxRequestsPerCrawl: number;
}

// Initialize the Apify SDK
await Actor.init();

const input = await Actor.getInput<Input>() ?? {} as Input;

// Validate that either searchQuery or directUrls is provided
const hasSearchQuery = input.searchQuery && input.searchQuery.trim().length > 0;
const hasDirectUrls = input.directUrls && input.directUrls.length > 0;

if (!hasSearchQuery && !hasDirectUrls) {
    await Actor.exit('You must provide either a searchQuery or directUrls.', { exitCode: 1 });
}

// Validate inputs format
if (input.checkInDate.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
    await Actor.exit('Invalid check-in date format. Use YYYY-MM-DD.', { exitCode: 1 });
}
if (input.checkOutDate.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
    await Actor.exit('Invalid check-out date format. Use YYYY-MM-DD.', { exitCode: 1 });
}

const proxyConfiguration = await Actor.createProxyConfiguration(input.proxyConfig);
const {
    searchQuery,
    directUrls,
    maxRequestsPerCrawl = DEFAULT_MAX_REQUESTS_PER_CRAWL,
} = input;

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandler: createGoogleHotelsRouter(input),
});

// Build the list of requests to crawl
const requests: RequestOptions[] = [];

if (hasDirectUrls && directUrls) {
    // Add direct URLs with 'detail' label to skip the search and go straight to hotel pages
    for (const urlObj of directUrls) {
        requests.push({
            url: urlObj.url,
            label: 'detail',
        });
    }
    log.info(`Starting with ${requests.length} direct hotel URL(s)`);
}

if (hasSearchQuery && searchQuery) {
    // Add search URL as the starting point
    requests.push({
        url: `https://www.google.com/travel/search?q=${encodeURIComponent(searchQuery)}&hl=${CONTENT_LANGUAGE_CODE}`,
    });
    log.info(`Starting search for: ${searchQuery}`);
}

try {
    await crawler.run(requests);
} catch (error) {
    log.error('Crawler failed', { error: (error as Error).message });
    await Actor.exit({ exitCode: 1 });
}

// Exit successfully
await Actor.exit();
