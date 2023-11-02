import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCategory, extractCurrency, extractDescription, extractPrice, formatProductReviewTitle } from '../utils';

type Review = {
    title: string;
    rating: string;
    text: string;
};

export async function scrapeAmazonProduct(url: string) {
    if (!url) return

    const username = String(process.env.BRIGHT_DATA_USERNAME)
    const password = String(process.env.BRIGHT_DATA_PASSWORD)
    const port = 22225
    const sessionId = (1000000 * Math.random()) | 0
    const options = {
        auth: {
            username: `${username}-session-${sessionId}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false
    }
    
    try {
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data)

        const title = $('#productTitle').text().trim()

        const category = extractCategory($('#productDetails_detailBullets_sections1'))

        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base')
        );

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images =
            $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}'

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'))
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

        // const description = extractDescription($)

        const reviews: Review[] = [];

        $('.a-section.review').each((_index, element) => {
            let title = $(element).find('.a-text-bold span').text()
            let rating = $(element).find('.a-icon-alt').text();
            let text = $(element).find('.review-text-content span').text();
            const review: Review = { title, rating, text };
            reviews.push(review);
        });

        const reviewsCount = $('.averageStarRatingNumerical').text().trim()
        const reviewsStars = $('.a-icon-alt:contains("out of 5 stars")').text().trim().substring(0, 3)

        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category,
            reviewsCount: parseFloat(reviewsCount.replace(/,/g, '')),
            stars: reviewsStars,
            isOutOfStock: outOfStock,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
            reviews
        }
        return data

    } catch (error: any) {
        throw new Error(`Failed to scape product: ${error.message}`)
    }
}