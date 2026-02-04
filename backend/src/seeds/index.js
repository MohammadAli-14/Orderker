import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const products = [
  // ==========================================
  // SABZI (VEGETABLES)
  // ==========================================
  {
    name: "Tamatar (Tomatoes)",
    description: "Fresh red tomatoes from local farms. Perfect for salans, salads, and cooking. Essential for every Pakistani kitchen.",
    price: 120,
    stock: 100,
    category: "Sabzi",
    images: [
      "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 89,
  },
  {
    name: "Aloo (Potatoes)",
    description: "Fresh potatoes ideal for aloo gosht, paratha, and fries. Sourced from Punjab farms.",
    price: 70,
    stock: 150,
    category: "Sabzi",
    images: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba57a?w=500",
    ],
    averageRating: 4.3,
    totalReviews: 156,
  },
  {
    name: "Pyaz (Onions)",
    description: "Red onions essential for every Pakistani dish. Fresh and full of flavor.",
    price: 90,
    stock: 120,
    category: "Sabzi",
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 134,
  },
  {
    name: "Bhindi (Okra)",
    description: "Fresh lady fingers perfect for bhindi gosht and bhindi masala. Tender and crisp.",
    price: 180,
    stock: 60,
    category: "Sabzi",
    images: [
      "https://images.unsplash.com/photo-1604467711779-40e5a6dc4c5b?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 78,
  },
  {
    name: "Adrak (Ginger)",
    description: "Fresh ginger root essential for chai and cooking. Aromatic and flavorful.",
    price: 450,
    stock: 80,
    category: "Sabzi",
    images: [
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500",
    ],
    averageRating: 4.7,
    totalReviews: 92,
  },
  {
    name: "Lehsan (Garlic)",
    description: "Fresh garlic bulbs for authentic Pakistani flavors. Strong aroma and taste.",
    price: 380,
    stock: 70,
    category: "Sabzi",
    images: [
      "https://images.unsplash.com/photo-1540148426945-6cf22a6b2f3a?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 67,
  },
  {
    name: "Hari Mirch (Green Chillies)",
    description: "Fresh green chillies for that perfect spicy kick. Locally grown.",
    price: 200,
    stock: 90,
    category: "Sabzi",
    images: [
      "https://images.unsplash.com/photo-1526346698789-22fd84314424?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 56,
  },
  {
    name: "Gobhi (Cauliflower)",
    description: "Fresh white cauliflower perfect for aloo gobhi and gobhi gosht.",
    price: 100,
    stock: 50,
    category: "Sabzi",
    images: [
      "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500",
    ],
    averageRating: 4.3,
    totalReviews: 45,
  },

  // ==========================================
  // PHAL (FRUITS)
  // ==========================================
  {
    name: "Kela (Bananas)",
    description: "Sweet ripe bananas, rich in potassium. Perfect healthy snack for the whole family.",
    price: 140,
    stock: 80,
    category: "Phal",
    images: [
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 203,
  },
  {
    name: "Aam (Mangoes)",
    description: "Premium Sindhri mangoes - the king of fruits. Sweet and aromatic seasonal delight.",
    price: 350,
    stock: 40,
    category: "Phal",
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500",
    ],
    averageRating: 4.9,
    totalReviews: 312,
  },
  {
    name: "Amrood (Guava)",
    description: "Fresh Pakistani guavas, sweet and crunchy. Rich in Vitamin C.",
    price: 160,
    stock: 60,
    category: "Phal",
    images: [
      "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 145,
  },
  {
    name: "Kinnow",
    description: "Sweet and juicy Kinnow oranges from Punjab. Seasonal favorite rich in Vitamin C.",
    price: 220,
    stock: 70,
    category: "Phal",
    images: [
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500",
    ],
    averageRating: 4.7,
    totalReviews: 178,
  },
  {
    name: "Seb (Apples)",
    description: "Imported premium apples, crisp and juicy. Great for health and snacking.",
    price: 380,
    stock: 50,
    category: "Phal",
    images: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 134,
  },
  {
    name: "Papita (Papaya)",
    description: "Ripe sweet papaya, excellent for digestion. Fresh from local farms.",
    price: 180,
    stock: 45,
    category: "Phal",
    images: [
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 89,
  },

  // ==========================================
  // STAPLES
  // ==========================================
  {
    name: "Basmati Chawal (Rice)",
    description: "Premium long-grain Basmati rice. Perfect for biryani and pulao. 1kg pack.",
    price: 280,
    stock: 100,
    category: "Staples",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
    ],
    averageRating: 4.8,
    totalReviews: 256,
  },
  {
    name: "Atta (Wheat Flour)",
    description: "Fresh chakki ground wheat flour for soft rotis and chapatis. 1kg pack.",
    price: 170,
    stock: 150,
    category: "Staples",
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 198,
  },
  {
    name: "Cheeni (Sugar)",
    description: "Refined white sugar for everyday use. 1kg pack.",
    price: 160,
    stock: 200,
    category: "Staples",
    images: [
      "https://images.unsplash.com/photo-1550411294-875e5b7e0f45?w=500",
    ],
    averageRating: 4.3,
    totalReviews: 145,
  },
  {
    name: "Daal Masoor",
    description: "Premium red lentils for delicious daal. High in protein. 1kg pack.",
    price: 320,
    stock: 80,
    category: "Staples",
    images: [
      "https://images.unsplash.com/photo-1585996048043-a99d9b5d7a65?w=500",
    ],
    averageRating: 4.7,
    totalReviews: 167,
  },
  {
    name: "Daal Chana",
    description: "Split chickpeas for chana daal and halwa. Nutritious and delicious. 1kg pack.",
    price: 290,
    stock: 75,
    category: "Staples",
    images: [
      "https://images.unsplash.com/photo-1515543904760-808cb9dc87c8?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 123,
  },
  {
    name: "Cooking Oil",
    description: "Pure vegetable cooking oil. 1 liter bottle. Ideal for everyday cooking.",
    price: 450,
    stock: 90,
    category: "Staples",
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 189,
  },
  {
    name: "Ghee (Desi)",
    description: "Pure desi ghee for authentic taste. 500g pack. Perfect for parathas.",
    price: 850,
    stock: 40,
    category: "Staples",
    images: [
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500",
    ],
    averageRating: 4.8,
    totalReviews: 234,
  },

  // ==========================================
  // DAIRY & EGGS
  // ==========================================
  {
    name: "Doodh (Fresh Milk)",
    description: "Fresh full cream milk. 1 liter pack. Perfect for chai and lassi.",
    price: 220,
    stock: 100,
    category: "Dairy & Eggs",
    images: [
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500",
    ],
    averageRating: 4.7,
    totalReviews: 312,
  },
  {
    name: "Dahi (Yogurt)",
    description: "Fresh creamy yogurt. 1kg pack. Great for raita and lassi.",
    price: 260,
    stock: 80,
    category: "Dairy & Eggs",
    images: [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 178,
  },
  {
    name: "Anday (Eggs)",
    description: "Farm fresh eggs. 1 dozen. High in protein and nutrients.",
    price: 420,
    stock: 120,
    category: "Dairy & Eggs",
    images: [
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 256,
  },
  {
    name: "Makhan (Butter)",
    description: "Fresh cream butter. 200g pack. Perfect for parathas and toast.",
    price: 380,
    stock: 60,
    category: "Dairy & Eggs",
    images: [
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 134,
  },
  {
    name: "Cheese Slice",
    description: "Processed cheese slices. 10 slice pack. Great for sandwiches and burgers.",
    price: 320,
    stock: 70,
    category: "Dairy & Eggs",
    images: [
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 98,
  },

  // ==========================================
  // MASALAY (SPICES)
  // ==========================================
  {
    name: "Laal Mirch (Red Chilli Powder)",
    description: "Premium Kashmiri red chilli powder. 200g pack. Adds color and heat.",
    price: 180,
    stock: 90,
    category: "Masalay",
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500",
    ],
    averageRating: 4.7,
    totalReviews: 189,
  },
  {
    name: "Haldi (Turmeric Powder)",
    description: "Pure turmeric powder. 200g pack. Essential for curries and health.",
    price: 140,
    stock: 100,
    category: "Masalay",
    images: [
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 156,
  },
  {
    name: "Dhania Powder (Coriander)",
    description: "Ground coriander powder. 200g pack. Aromatic spice for curries.",
    price: 120,
    stock: 85,
    category: "Masalay",
    images: [
      "https://images.unsplash.com/photo-1596547609652-9cf5d8c76921?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 134,
  },
  {
    name: "Zeera (Cumin Seeds)",
    description: "Whole cumin seeds. 100g pack. Essential for tarka and rice dishes.",
    price: 160,
    stock: 75,
    category: "Masalay",
    images: [
      "https://images.unsplash.com/photo-1599909533667-2c7c4028de65?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 112,
  },
  {
    name: "Garam Masala",
    description: "Authentic blend of aromatic spices. 100g pack. For perfect curries.",
    price: 200,
    stock: 80,
    category: "Masalay",
    images: [
      "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=500",
    ],
    averageRating: 4.8,
    totalReviews: 198,
  },
  {
    name: "Namak (Salt)",
    description: "Refined iodized salt. 800g pack. Essential for every kitchen.",
    price: 60,
    stock: 200,
    category: "Masalay",
    images: [
      "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=500",
    ],
    averageRating: 4.3,
    totalReviews: 89,
  },

  // ==========================================
  // SNACKS
  // ==========================================
  {
    name: "Nimko Mix",
    description: "Crunchy savory snack mix. 200g pack. Perfect with chai.",
    price: 200,
    stock: 100,
    category: "Snacks",
    images: [
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 167,
  },
  {
    name: "Biscuits (Digestive)",
    description: "Whole wheat digestive biscuits. Tea-time favorite. 1 pack.",
    price: 80,
    stock: 150,
    category: "Snacks",
    images: [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 234,
  },
  {
    name: "Chips (Masala)",
    description: "Crispy masala flavored potato chips. 65g pack.",
    price: 60,
    stock: 200,
    category: "Snacks",
    images: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500",
    ],
    averageRating: 4.3,
    totalReviews: 289,
  },
  {
    name: "Mathri",
    description: "Traditional crispy snack. 250g pack. Made with ajwain.",
    price: 150,
    stock: 70,
    category: "Snacks",
    images: [
      "https://images.unsplash.com/photo-1613919517754-5d5f8c1db7fa?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 123,
  },
  {
    name: "Samosa (Frozen)",
    description: "Ready to fry frozen samosas. Pack of 6. Aloo filling.",
    price: 280,
    stock: 50,
    category: "Snacks",
    images: [
      "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=500",
    ],
    averageRating: 4.7,
    totalReviews: 156,
  },

  // ==========================================
  // BEVERAGES
  // ==========================================
  {
    name: "Chai Patti (Tea)",
    description: "Premium loose leaf tea. 500g pack. For perfect doodh patti.",
    price: 1200,
    stock: 80,
    category: "Beverages",
    images: [
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500",
    ],
    averageRating: 4.8,
    totalReviews: 345,
  },
  {
    name: "Rooh Afza",
    description: "Traditional rose syrup drink. 800ml bottle. Summer essential.",
    price: 450,
    stock: 60,
    category: "Beverages",
    images: [
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500",
    ],
    averageRating: 4.7,
    totalReviews: 267,
  },
  {
    name: "Mineral Water",
    description: "Pure mineral water. 1.5 liter bottle. Safe drinking water.",
    price: 80,
    stock: 200,
    category: "Beverages",
    images: [
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 178,
  },
  {
    name: "Lassi (Sweet)",
    description: "Ready to drink sweet lassi. 250ml bottle. Refreshing dairy drink.",
    price: 120,
    stock: 90,
    category: "Beverages",
    images: [
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 134,
  },
  {
    name: "Tang Orange",
    description: "Instant orange drink powder. 375g pack. Just add water.",
    price: 380,
    stock: 70,
    category: "Beverages",
    images: [
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500",
    ],
    averageRating: 4.3,
    totalReviews: 156,
  },

  // ==========================================
  // HOUSEHOLD
  // ==========================================
  {
    name: "Surf (Detergent)",
    description: "Washing powder detergent. 1kg pack. For clean bright clothes.",
    price: 450,
    stock: 80,
    category: "Household",
    images: [
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 189,
  },
  {
    name: "Dish Soap",
    description: "Liquid dish washing soap. 500ml bottle. Cuts through grease.",
    price: 220,
    stock: 100,
    category: "Household",
    images: [
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 145,
  },
  {
    name: "Toilet Cleaner",
    description: "Powerful toilet cleaning liquid. 500ml bottle. Kills germs.",
    price: 280,
    stock: 70,
    category: "Household",
    images: [
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500",
    ],
    averageRating: 4.3,
    totalReviews: 98,
  },
  {
    name: "Floor Cleaner",
    description: "Fragrant floor cleaning liquid. 1 liter bottle. Pine fresh scent.",
    price: 320,
    stock: 60,
    category: "Household",
    images: [
      "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 112,
  },
  {
    name: "Tissue Box",
    description: "Soft facial tissues. 200 sheets per box. 2-ply quality.",
    price: 180,
    stock: 120,
    category: "Household",
    images: [
      "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=500",
    ],
    averageRating: 4.2,
    totalReviews: 78,
  },

  // ==========================================
  // PERSONAL CARE
  // ==========================================
  {
    name: "Shampoo",
    description: "Anti-dandruff shampoo. 200ml bottle. For healthy scalp.",
    price: 320,
    stock: 80,
    category: "Personal Care",
    images: [
      "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 167,
  },
  {
    name: "Sabun (Soap Bar)",
    description: "Antibacterial bath soap. Pack of 3 bars. Fresh fragrance.",
    price: 240,
    stock: 150,
    category: "Personal Care",
    images: [
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 234,
  },
  {
    name: "Toothpaste",
    description: "Fluoride toothpaste. 150g tube. For strong teeth and fresh breath.",
    price: 180,
    stock: 100,
    category: "Personal Care",
    images: [
      "https://images.unsplash.com/photo-1628359355624-855c22c7db61?w=500",
    ],
    averageRating: 4.6,
    totalReviews: 189,
  },
  {
    name: "Hand Wash",
    description: "Antibacterial hand wash. 250ml bottle. Kills 99.9% germs.",
    price: 200,
    stock: 90,
    category: "Personal Care",
    images: [
      "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=500",
    ],
    averageRating: 4.5,
    totalReviews: 145,
  },
  {
    name: "Body Lotion",
    description: "Moisturizing body lotion. 200ml bottle. For soft smooth skin.",
    price: 350,
    stock: 60,
    category: "Personal Care",
    images: [
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500",
    ],
    averageRating: 4.4,
    totalReviews: 112,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Insert seed products
    await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${products.length} products`);

    // Display summary
    const categories = [...new Set(products.map((p) => p.category))];
    console.log("\n📊 Seeded Products Summary:");
    console.log(`Total Products: ${products.length}`);
    console.log(`Categories: ${categories.join(", ")}`);

    // Close connection
    await mongoose.connection.close();
    console.log("\n✅ Database seeding completed and connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
