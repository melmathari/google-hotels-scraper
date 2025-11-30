export type SortBy = 'relevance' | 'lowest_price' | 'highest_rating' | 'most_reviewed';

export interface GoogleHotelsOptions {
    searchQuery?: string;
    directUrls?: { url: string }[];
    checkInDate: string;
    checkOutDate: string;
    numberOfAdults: number;
    numberOfChildren: number;
    numberOfRooms: number;
    currencyCode: string;
    sortBy?: SortBy;
    hotelClass?: number[];
    maxResults?: number;
}
