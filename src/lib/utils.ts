import { PriceHistoryItem, Product } from "@/types";

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

export function isValidAmazonProductURL(url: string){
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
};

export function cleanAmazonURL(url: string): string {
  const encodingIndex = url.indexOf("/?_encoding");
  if (encodingIndex !== -1) {
    return url.slice(0, encodingIndex);
  }
  return url;
}

export function generateAmazonReviewsURL(
  productURL: string,
  page: number = 1
): string {
  if (productURL.includes("/dp/")) {
    const reviewsURL = productURL.replace("/dp/", "/product-reviews/");
    return `${reviewsURL}?pageNumber=${page}`;
  } else {
    return productURL;
  }
}

export function extractPrice(...elements: any) {
  for (const element of elements) {
    const priceText = element.text().trim();

    if(priceText) {
      const cleanPrice = priceText.replace(/[^\d.]/g, '');

      let firstPrice; 

      if (cleanPrice) {
        firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
      } 

      return firstPrice || cleanPrice;
    }
  }

  return '';
}

export function extractCurrency(element: any) {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

export function extractCategory(element: any) {
  
  // const table = $('#productDetails_detailBullets_sections1');
  // const tableElements = table.find('tr').eq(2).find('td').find('span').eq(1).text();
  // const categoryName = tableElements.split('(')[0].trim().replace(')', '').split(' in ')[1];

  // const table = $('#productDetails_detailBullets_sections1');

  const thirdRow = element.find('tr').eq(2);
  const tdElement = thirdRow.find('td');
  const spans = tdElement.find('span').eq(1).text();

  const parts = spans.split('(');
  const categoryValue = parts[0].trim().replace(')', '');
  const parts2 = categoryValue.split(' in ');
  const categoryName = categoryValue.split(' in ')[1];

  return categoryName
}

export function formatProductReviewTitle(element: any) {
  const reviewTitle = element.text().trim().slice(18, element.text().length);
  return reviewTitle ? reviewTitle : "";
}

export function extractAndConvertToInteger(inputString: string) {
  const extractedValue = inputString.match(/\d+(\.\d+)?/);
  if (extractedValue) {
    const floatValue = parseFloat(extractedValue[0]);
    return floatValue;
  } else {
    return null;
  }
}

export function extractDescription($: any) {
  const selectors = [
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => $(element).text().trim())
        .get()
        .join("\n");
      return textContent;
    }
  }
  return "";
}

export function getHighestPrice(priceList: PriceHistoryItem[]) {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getEmailNotifType = (
  scrapedProduct: any,
  currentProduct: Product
) => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

export const formatNumber = (num: number = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};