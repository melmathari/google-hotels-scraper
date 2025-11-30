export const GOOGLE_CONSENT_DIALOG_URL = 'https://consent.google.com';
export const CONTENT_LANGUAGE_CODE = 'en';
export const DEFAULT_MAX_REQUESTS_PER_CRAWL = 100;
export const DEFAULT_NUM_OF_ADULTS = 2;
export const DEFAULT_NUM_OF_CHILDREN = 0;
export const DEFAULT_NUM_OF_ROOMS = 1;
export const MAX_NUM_OF_PEOPLE = 6;
export const MAX_NUM_OF_ROOMS = 10;

// Sort options mapping to Google's internal values
export const SORT_OPTIONS = {
    relevance: 0,
    lowest_price: 3,
    highest_rating: 1,
    most_reviewed: 2,
} as const;

// Hotel class (star rating) mapping
export const HOTEL_CLASS_OPTIONS = {
    2: 'hotel_class_2',
    3: 'hotel_class_3',
    4: 'hotel_class_4',
    5: 'hotel_class_5',
} as const;
