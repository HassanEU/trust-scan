function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededValue(seed, min, max) {
  const range = max - min;
  return min + (seed % (range + 1));
}

function seededFloat(seed, min, max) {
  return min + ((seed % 1000) / 1000) * (max - min);
}

function generateProductProfile(productUrl, marketplace) {
  const seed = hashString(`${marketplace}:${productUrl}`);
  const scenario = seed % 5;

  const brands = ['Sony', 'Samsung', 'Apple', 'Nike', 'Adidas', 'Bose', 'Canon', 'Dell'];
  const products = [
    'Wireless Noise Cancelling Headphones',
    'Smart Watch Series Pro',
    'Ultra HD Action Camera',
    'Running Shoes Elite Edition',
    'Bluetooth Speaker Portable',
    'Gaming Laptop 16GB RAM',
    'Mirrorless Digital Camera',
    'Fitness Tracker Band',
  ];

  const brand = brands[seed % brands.length];
  const productName = `${brand} ${products[(seed >> 3) % products.length]}`;
  const basePrice = seededValue(seed, 50, 500);
  const discountFactor = scenario === 0 ? 0.35 : scenario === 1 ? 0.75 : 1.0;
  const price = Math.round(basePrice * discountFactor);
  const originalPrice = Math.round(basePrice * 1.2);

  const sellerRating = scenario === 0 ? seededFloat(seed, 2.5, 3.5) : seededFloat(seed, 3.8, 5.0);
  const accountAgeDays = scenario === 0 ? seededValue(seed, 10, 60) : seededValue(seed, 200, 2000);
  const isVerified = scenario !== 0 && seed % 3 !== 0;
  const isSuspicious = scenario === 0 || (seed % 7 === 0);

  return {
    seed,
    scenario,
    productName,
    brand,
    basePrice,
    price,
    originalPrice,
    sellerRating: Math.round(sellerRating * 10) / 10,
    accountAgeDays,
    isVerified,
    isSuspicious,
    reviewCount: seededValue(seed, 5, 500),
    productRating: Math.round(seededFloat(seed, 3.0, 5.0) * 10) / 10,
  };
}

function generateReviews(profile, marketplace) {
  const positiveTemplates = [
    'Excellent product, exactly as described. Fast delivery and great packaging.',
    'Very satisfied with the quality. Would definitely recommend to others.',
    'Works perfectly. Genuine product with all original accessories included.',
    'Great value for money. Seller was responsive and helpful throughout.',
    'Authentic brand product. No issues after weeks of daily use.',
  ];

  const suspiciousTemplates = [
    'Amazing product!!! Best ever!!! Buy now!!! Five stars!!!',
    'Great product great product great product highly recommend',
    'Perfect perfect perfect love it love it love it',
    'Best purchase ever!!! A++++ seller!!!',
    'Wow amazing incredible fantastic wonderful superb',
  ];

  const neutralTemplates = [
    'Product is okay. Does the job but nothing extraordinary.',
    'Average experience. Delivery was on time.',
    'Decent quality for the price point.',
    'Mixed feelings — good features but build could be better.',
    'Works as expected. Standard packaging.',
  ];

  const reviews = [];
  const count = Math.min(profile.reviewCount, 20);

  for (let i = 0; i < count; i += 1) {
    const reviewSeed = hashString(`${profile.seed}:review:${i}`);
    let text;
    let rating;

    if (profile.scenario === 0 && i < 8) {
      text = suspiciousTemplates[i % suspiciousTemplates.length];
      rating = 5;
    } else if (reviewSeed % 5 === 0) {
      text = neutralTemplates[i % neutralTemplates.length];
      rating = 3;
    } else {
      text = positiveTemplates[i % positiveTemplates.length];
      rating = reviewSeed % 10 === 0 ? 4 : 5;
    }

    reviews.push({
      id: `${marketplace}-review-${i}`,
      author: `User${reviewSeed % 10000}`,
      rating,
      text,
      date: new Date(Date.now() - reviewSeed % 31536000000).toISOString(),
      verified: reviewSeed % 4 !== 0,
    });
  }

  if (profile.scenario === 0) {
    const spikeDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    for (let i = 0; i < 5; i += 1) {
      reviews.push({
        id: `${marketplace}-spike-${i}`,
        author: `Buyer${1000 + i}`,
        rating: 5,
        text: suspiciousTemplates[0],
        date: spikeDate,
        verified: false,
      });
    }
  }

  return reviews;
}

module.exports = { hashString, generateProductProfile, generateReviews };
