# Advanced Hotel Information Extractor

This powerful automation tool efficiently gathers comprehensive hotel data directly from Google Travel search results. It specializes in collecting detailed pricing information across multiple booking platforms, making it ideal for travel market research and price comparison analysis.

## Key Capabilities

- **Multi-Platform Price Aggregation**: Collects pricing data from various booking services like Booking.com, Expedia, and direct hotel websites
- **Complete Hotel Profiles**: Extracts property names, ratings, review counts, contact details, and photo galleries
- **Flexible Search Options**: Supports both location-based searches and direct hotel URL processing
- **Currency Customization**: Handles multiple currencies for international pricing analysis
- **Advanced Filtering**: Apply star ratings, sorting preferences, and guest configuration options

## Configuration Parameters

The tool accepts several key parameters to customize your data extraction:

- **Location Query**: Specify destination (city, region, or specific landmark)
- **Travel Dates**: Set check-in and check-out dates in YYYY-MM-DD format
- **Guest Details**: Configure number of adults, children, and rooms
- **Currency Selection**: Choose your preferred currency for pricing display
- **Result Limits**: Control the number of hotels to process

### Example Setup

```json
{
  "searchQuery": "Barcelona",
  "checkInDate": "2024-11-15",
  "checkOutDate": "2024-11-18",
  "numberOfAdults": 2,
  "numberOfChildren": 1,
  "currencyCode": "EUR",
  "maxResults": 50,
  "sortBy": "lowest_price",
  "hotelClass": [4, 5]
}
```

## Generated Data Structure

Each processed hotel yields a comprehensive data package containing:

### Core Property Information

- **Property Name**: Official hotel designation
- **Location Details**: Complete address and geographic coordinates
- **Contact Information**: Phone numbers and official website URLs
- **Visual Assets**: Collection of property images and thumbnail

### Reputation Metrics

- **Guest Rating**: Average score from visitor feedback (0-5 scale)
- **Review Volume**: Total number of customer reviews
- **Quality Indicators**: Star rating classification

### Pricing Intelligence

- **Provider Breakdown**: Individual rates from different booking platforms
- **Price Spectrum**: Minimum and maximum rates across all providers
- **Booking Links**: Direct URLs for reservation through each service

### Sample Output

```json
{
  "title": "Hotel Arts Barcelona",
  "url": "https://www.google.com/travel/hotels/entity/...",
  "address": "Carrer de la Marina, 19-21, 08005 Barcelona, Spain",
  "phone": "+34 932 21 10 00",
  "website": "https://www.hotelartsbarcelona.com",
  "rating": 4.6,
  "reviews": 12453,
  "thumbnail": "https://lh3.googleusercontent.com/...",
  "photos": [
    "https://lh3.googleusercontent.com/photo1.jpg",
    "https://lh3.googleusercontent.com/photo2.jpg"
  ],
  "priceRange": "285 - 450",
  "prices": [
    {
      "provider": "HotelArtsBarcelona.com",
      "price": 320,
      "link": "https://www.google.com/travel/booking/..."
    },
    {
      "provider": "Booking.com",
      "price": 285,
      "link": "https://www.google.com/travel/booking/..."
    },
    {
      "provider": "Expedia",
      "price": 450,
      "link": "https://www.google.com/travel/booking/..."
    }
  ]
}
```

## Advanced Features

- **Intelligent Navigation**: Automatically handles Google consent dialogs and loading states
- **Robust Error Handling**: Gracefully manages missing data and connection issues
- **Performance Optimized**: Efficiently processes multiple properties in parallel
- **Data Validation**: Ensures accuracy and completeness of extracted information
