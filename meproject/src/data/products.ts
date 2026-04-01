export interface ProductSize {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  flowerType: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: string;
  shortDescription: string;
  description: string;
  sizes: ProductSize[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
  emoji: string;
}

const IMG = (seed: string) =>
  `https://images.unsplash.com/${seed}?w=600&h=600&fit=crop`;

export const categories: Category[] = [
  { id: "love", name: "Love & Romance", image: IMG("photo-1490750967868-88aa4f44baee"), productCount: 24, emoji: "❤️" },
  { id: "birthday", name: "Birthday", image: IMG("photo-1530103862676-de8c9debad1d"), productCount: 18, emoji: "🎂" },
  { id: "wedding", name: "Wedding", image: IMG("photo-1519741497674-611481863552"), productCount: 15, emoji: "💒" },
  { id: "sympathy", name: "Sympathy", image: IMG("photo-1490750967868-88aa4f44baee"), productCount: 12, emoji: "🕊️" },
  { id: "congratulations", name: "Congratulations", image: IMG("photo-1487530811176-3780de880c2d"), productCount: 10, emoji: "🎉" },
  { id: "everyday", name: "Everyday", image: IMG("photo-1508610048659-a06b669e3321"), productCount: 20, emoji: "🌸" },
];

export const flowerTypes = [
  "Roses",
  "Lilies",
  "Sunflowers",
  "Orchids",
  "Mixed Bouquet",
  "Tulips",
  "Carnations",
  "Hydrangeas",
];

export const products: Product[] = [
  {
    id: "1",
    name: "Red Rose Romance Bouquet",
    price: 35000,
    originalPrice: 45000,
    image: IMG("photo-1455659817273-f96807779a8a"),
    images: [IMG("photo-1455659817273-f96807779a8a"), IMG("photo-1490750967868-88aa4f44baee"), IMG("photo-1561181286-d3fee7d55364")],
    category: "love",
    flowerType: "Roses",
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    badge: "Best Seller",
    shortDescription: "24 premium long-stem red roses, hand-tied with satin ribbon.",
    description: "Express your deepest love with our signature bouquet of 24 premium long-stem red roses. Each rose is carefully selected from the finest Rwandan farms, hand-arranged and tied with luxurious satin ribbon. Comes with complimentary greenery and baby's breath.",
    sizes: [
      { label: "Small (12 roses)", price: 25000 },
      { label: "Medium (24 roses)", price: 35000 },
      { label: "Large (50 roses)", price: 65000 },
    ],
  },
  {
    id: "2",
    name: "Sunshine Sunflower Arrangement",
    price: 28000,
    image: IMG("photo-1551837876-4dc06e97cae4"),
    images: [IMG("photo-1551837876-4dc06e97cae4"), IMG("photo-1596438459194-f275f413d6ff")],
    category: "birthday",
    flowerType: "Sunflowers",
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
    badge: "Popular",
    shortDescription: "Bright sunflowers to light up any birthday celebration.",
    description: "A vibrant arrangement of fresh sunflowers paired with seasonal greenery and rustic accents. Perfect for birthdays and celebrations, this arrangement radiates warmth and joy.",
    sizes: [
      { label: "Small (5 stems)", price: 18000 },
      { label: "Medium (10 stems)", price: 28000 },
      { label: "Large (15 stems)", price: 42000 },
    ],
  },
  {
    id: "3",
    name: "Elegant White Lily Cascade",
    price: 48000,
    originalPrice: 58000,
    image: IMG("photo-1563241527-3004b7be0ffd"),
    images: [IMG("photo-1563241527-3004b7be0ffd"), IMG("photo-1508610048659-a06b669e3321")],
    category: "wedding",
    flowerType: "Lilies",
    rating: 4.8,
    reviewCount: 67,
    inStock: true,
    badge: "Premium",
    shortDescription: "Stunning white lilies for weddings and elegant occasions.",
    description: "An exquisite cascade of pure white Oriental lilies, accented with delicate eucalyptus and soft greenery. Ideal for weddings, anniversaries, or any occasion that calls for timeless elegance.",
    sizes: [
      { label: "Small", price: 35000 },
      { label: "Medium", price: 48000 },
      { label: "Large", price: 72000 },
    ],
  },
  {
    id: "4",
    name: "Peaceful Garden Tribute",
    price: 42000,
    image: IMG("photo-1487530811176-3780de880c2d"),
    images: [IMG("photo-1487530811176-3780de880c2d")],
    category: "sympathy",
    flowerType: "Mixed Bouquet",
    rating: 4.9,
    reviewCount: 43,
    inStock: true,
    shortDescription: "A gentle arrangement for moments of remembrance.",
    description: "A serene and thoughtful arrangement of white roses, lilies, and soft greenery. Designed to convey your heartfelt condolences with grace and beauty.",
    sizes: [
      { label: "Standard", price: 42000 },
      { label: "Deluxe", price: 65000 },
    ],
  },
  {
    id: "5",
    name: "Pink Paradise Mixed Bouquet",
    price: 32000,
    originalPrice: 40000,
    image: IMG("photo-1561181286-d3fee7d55364"),
    images: [IMG("photo-1561181286-d3fee7d55364"), IMG("photo-1490750967868-88aa4f44baee")],
    category: "birthday",
    flowerType: "Mixed Bouquet",
    rating: 4.6,
    reviewCount: 112,
    inStock: true,
    badge: "Sale",
    shortDescription: "A vibrant mix of pink roses, carnations, and seasonal blooms.",
    description: "Celebrate in style with this gorgeous mixed bouquet featuring pink roses, spray carnations, wax flowers, and lush greenery. A perfect gift for birthdays, thank-yous, or just because.",
    sizes: [
      { label: "Small", price: 22000 },
      { label: "Medium", price: 32000 },
      { label: "Large", price: 50000 },
    ],
  },
  {
    id: "6",
    name: "Purple Orchid Elegance",
    price: 55000,
    image: IMG("photo-1567696153798-9111f9cd3d0d"),
    images: [IMG("photo-1567696153798-9111f9cd3d0d")],
    category: "congratulations",
    flowerType: "Orchids",
    rating: 4.8,
    reviewCount: 54,
    inStock: true,
    badge: "Luxury",
    shortDescription: "Exotic purple orchids in a ceramic vase.",
    description: "A stunning display of exotic purple Phalaenopsis orchids presented in an elegant white ceramic vase. These long-lasting blooms make a perfect congratulatory or thank-you gift.",
    sizes: [
      { label: "Single Stem", price: 35000 },
      { label: "Double Stem", price: 55000 },
      { label: "Triple Stem", price: 80000 },
    ],
  },
  {
    id: "7",
    name: "Pastel Tulip Dream",
    price: 30000,
    image: IMG("photo-1490750967868-88aa4f44baee"),
    images: [IMG("photo-1490750967868-88aa4f44baee")],
    category: "everyday",
    flowerType: "Tulips",
    rating: 4.5,
    reviewCount: 78,
    inStock: true,
    shortDescription: "Soft pastel tulips wrapped in kraft paper.",
    description: "A charming bouquet of fresh pastel tulips in shades of pink, lavender, and white, wrapped in natural kraft paper. Simple, beautiful, and perfect for everyday joy.",
    sizes: [
      { label: "Small (10 tulips)", price: 20000 },
      { label: "Medium (20 tulips)", price: 30000 },
      { label: "Large (30 tulips)", price: 45000 },
    ],
  },
  {
    id: "8",
    name: "Romantic Rose & Lily Duo",
    price: 45000,
    originalPrice: 55000,
    image: IMG("photo-1508610048659-a06b669e3321"),
    images: [IMG("photo-1508610048659-a06b669e3321"), IMG("photo-1455659817273-f96807779a8a")],
    category: "love",
    flowerType: "Mixed Bouquet",
    rating: 4.7,
    reviewCount: 91,
    inStock: true,
    badge: "Sale",
    shortDescription: "Roses and lilies together in a romantic arrangement.",
    description: "The perfect combination of passion and purity — red roses and white lilies come together in this stunning arrangement, accented with baby's breath and eucalyptus.",
    sizes: [
      { label: "Standard", price: 45000 },
      { label: "Premium", price: 68000 },
    ],
  },
  {
    id: "9",
    name: "Bright Carnation Burst",
    price: 18000,
    image: IMG("photo-1530103862676-de8c9debad1d"),
    images: [IMG("photo-1530103862676-de8c9debad1d")],
    category: "everyday",
    flowerType: "Carnations",
    rating: 4.3,
    reviewCount: 65,
    inStock: true,
    shortDescription: "Colorful carnations for a cheerful vibe.",
    description: "A budget-friendly yet beautiful bunch of mixed carnations in cheerful colors. Long-lasting and fragrant, they're perfect for brightening up any space.",
    sizes: [
      { label: "Small", price: 12000 },
      { label: "Medium", price: 18000 },
      { label: "Large", price: 28000 },
    ],
  },
  {
    id: "10",
    name: "Grand Wedding Centerpiece",
    price: 85000,
    originalPrice: 100000,
    image: IMG("photo-1519741497674-611481863552"),
    images: [IMG("photo-1519741497674-611481863552")],
    category: "wedding",
    flowerType: "Mixed Bouquet",
    rating: 4.9,
    reviewCount: 34,
    inStock: true,
    badge: "Premium",
    shortDescription: "Luxurious centerpiece for your special day.",
    description: "A grand floral centerpiece featuring white roses, peonies, hydrangeas, and cascading greenery. Designed to be the stunning focal point of your wedding table.",
    sizes: [
      { label: "Standard", price: 85000 },
      { label: "Grand", price: 120000 },
    ],
  },
  {
    id: "11",
    name: "Blue Hydrangea Cloud",
    price: 38000,
    image: IMG("photo-1596438459194-f275f413d6ff"),
    images: [IMG("photo-1596438459194-f275f413d6ff")],
    category: "congratulations",
    flowerType: "Hydrangeas",
    rating: 4.6,
    reviewCount: 47,
    inStock: false,
    shortDescription: "Dreamy blue hydrangeas in a glass vase.",
    description: "A cloud-like arrangement of beautiful blue hydrangeas displayed in a clear glass vase. Their stunning color and full blooms make any room feel magical.",
    sizes: [
      { label: "Small", price: 28000 },
      { label: "Medium", price: 38000 },
      { label: "Large", price: 55000 },
    ],
  },
  {
    id: "12",
    name: "Classic Red Rose Box",
    price: 50000,
    image: IMG("photo-1494972308805-463bc619d34e"),
    images: [IMG("photo-1494972308805-463bc619d34e")],
    category: "love",
    flowerType: "Roses",
    rating: 4.8,
    reviewCount: 128,
    inStock: true,
    badge: "New",
    shortDescription: "Roses in a luxury hat box.",
    description: "Premium red roses elegantly arranged in a luxurious round hat box. The ultimate romantic gesture for Valentine's Day, anniversaries, or any day you want to say 'I love you'.",
    sizes: [
      { label: "Petite (12 roses)", price: 35000 },
      { label: "Classic (25 roses)", price: 50000 },
      { label: "Grand (50 roses)", price: 90000 },
    ],
  },
];

export const formatPrice = (price: number): string => {
  return `RWF ${price.toLocaleString("en-RW")}`;
};
