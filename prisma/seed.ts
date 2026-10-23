import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Khali Khai platform across all of Bangladesh...");

  // If database already contains restaurants, preserve data and skip
  const existingCount = await prisma.restaurant.count().catch(() => 0);
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} restaurants. Preserving live data and skipping seed.`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("KhaliKhai@2026", salt);

  // Clean existing data for clean seed
  await prisma.auditLog.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.riderAssignment.deleteMany({});
  await prisma.deliveryStop.deleteMany({});
  await prisma.deliveryPlan.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.restaurantSubOrder.deleteMany({});
  await prisma.parentOrder.deleteMany({});
  await prisma.loyaltyProgress.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.menuCategory.deleteMany({});
  await prisma.restaurantOperatingHour.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.riderProfile.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.platformSetting.deleteMany({});

  // 1. Create Demo Users
  const customerUser = await prisma.user.create({
    data: {
      email: "demo.customer@example.com",
      phone: "01711000001",
      name: "তানভীর আহমেদ (Tanveer Ahmed)",
      passwordHash: defaultPasswordHash,
      role: "CUSTOMER",
    },
  });

  const restaurantManagerUser = await prisma.user.create({
    data: {
      email: "demo.restaurant@example.com",
      phone: "01711000002",
      name: "রফিকুল ইসলাম (Rafiqul Islam)",
      passwordHash: defaultPasswordHash,
      role: "RESTAURANT_MANAGER",
    },
  });

  const riderUser = await prisma.user.create({
    data: {
      email: "demo.rider@example.com",
      phone: "01711000003",
      name: "সুমন হোসেন (Sumon Hossain)",
      passwordHash: defaultPasswordHash,
      role: "RIDER",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "demo.admin@example.com",
      phone: "01405080369",
      name: "অ্যাডমিন নabil (Admin Nabil)",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
    },
  });

  // Customer Profile & Saved Addresses in Dhaka & Chittagong
  const customerProfile = await prisma.customerProfile.create({
    data: {
      userId: customerUser.id,
    },
  });

  const homeAddress = await prisma.address.create({
    data: {
      customerId: customerProfile.id,
      label: "বাসা (Radio Colony, Savar)",
      fullAddress: "হাউজ ৪২, লেন ৩, রেডিও কলোনি, সাভার, ঢাকা",
      area: "Radio Colony",
      city: "Dhaka",
      latitude: 23.8480,
      longitude: 90.2600,
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      customerId: customerProfile.id,
      label: "অফিস (Dhanmondi, Dhaka)",
      fullAddress: "হাউজ ১২, রোড ৫, ধানমণ্ডি, ঢাকা-১২০৫",
      area: "Dhanmondi",
      city: "Dhaka",
      latitude: 23.7430,
      longitude: 90.3800,
      isDefault: false,
    },
  });

  await prisma.customerProfile.update({
    where: { id: customerProfile.id },
    data: { defaultAddressId: homeAddress.id },
  });

  // Rider Profile located in Savar
  await prisma.riderProfile.create({
    data: {
      userId: riderUser.id,
      vehicleType: "MOTORCYCLE",
      licenseNumber: "DHAKA-METRO-HA-123456",
      isOnline: true,
      currentLat: 23.8480,
      currentLng: 90.2600,
      totalDeliveries: 142,
      rating: 4.95,
    },
  });

  // ==========================================
  // RESTAURANTS ACROSS BANGLADESH
  // ==========================================

  // --- 0. SAVAR, DHAKA: Radio Colony Cluster (Near User!) ---
  const savar1 = await prisma.restaurant.create({
    data: {
      nameBn: "সাভার কাচ্চি মহল ও বিরিয়ানি",
      nameEn: "Savar Kacchi Mahal & Biryani",
      slug: "savar-kacchi-mahal-biryani",
      descriptionBn: "রেডিও কলোনির খাঁটি বাসমতি কাচ্চি, খাসির লেগ রোস্ট ও স্পেশাল মোরগ পোলাও",
      descriptionEn: "Authentic tender basmati mutton kacchi & chicken polao in Radio Colony, Savar",
      phone: "01711778899",
      email: "savarkacchi@gmail.com",
      address: "রেডিও কলোনি মোড়, ঢাকা-আরিচা মহাসড়ক, সাভার",
      area: "Radio Colony",
      city: "Dhaka",
      latitude: 23.8480,
      longitude: 90.2600,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.92,
      reviewCount: 420,
      minOrderAmount: 120,
      avgPrepTimeMinutes: 15,
      managerUserId: restaurantManagerUser.id,
    },
  });

  const catSavar1 = await prisma.menuCategory.create({
    data: { restaurantId: savar1.id, nameBn: "কাচ্চি ও পোলাও", nameEn: "Kacchi & Polao", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: savar1.id,
        categoryId: catSavar1.id,
        nameBn: "শাহী মাটন কাচ্চি বিরিয়ানি (সাভার স্পেশাল)",
        nameEn: "Shahi Mutton Kacchi Biryani (Savar Special)",
        descriptionBn: "ঘিয়ে ভাজা আলু, বাসমতি চাল ও নরম খাসির মাংস সাথে ডিম",
        descriptionEn: "Fragrant basmati rice slow cooked with tender mutton in desi ghee",
        price: 340,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 15,
      },
      {
        restaurantId: savar1.id,
        categoryId: catSavar1.id,
        nameBn: "স্পেশাল মোরগ পোলাও (১ পিস রোস্ট)",
        nameEn: "Special Morog Polao (1 Pc Roast)",
        descriptionBn: "সুগন্ধি চিনিগুঁড়া চালের পোলাও সাথে দেশি মুরগির রোস্ট",
        descriptionEn: "Aromatic fine polao rice served with rich chicken roast",
        price: 260,
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 12,
      },
      {
        restaurantId: savar1.id,
        categoryId: catSavar1.id,
        nameBn: "টক-মিষ্টি স্পেশাল বোরহানি",
        nameEn: "Sweet & Tangy Special Borhani",
        descriptionBn: "টক দই ও পুদিনা পাতার ঐতিহ্যবাহী হজমকারক পানীয়",
        descriptionEn: "Traditional yogurt mint digestive cooler",
        price: 50,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 5,
      },
    ],
  });

  // Savar: Spicy Craft Burger & Pizza (~220m from Savar Biryani)
  const savar2 = await prisma.restaurant.create({
    data: {
      nameBn: "স্পাইসি ক্রাফট বার্গার অ্যান্ড পিজ্জা",
      nameEn: "Spicy Craft Burger & Pizza Savar",
      slug: "spicy-craft-burger-savar",
      descriptionBn: "সাভারের সেরা জুসি স্ম্যাশড বিফ বার্গার, চিজি পিজ্জা ও লোডেড ফ্রাইস",
      descriptionEn: "Artisanal smashed beef burgers, cheesy pizza & crispy fries in Radio Colony",
      phone: "01711889911",
      address: "থানা রোড, রেডিও কলোনি বাজার সংলগ্ন, সাভার",
      area: "Radio Colony",
      city: "Dhaka",
      latitude: 23.8495,
      longitude: 90.2615,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.88,
      reviewCount: 380,
      minOrderAmount: 100,
      avgPrepTimeMinutes: 12,
    },
  });

  const catSavar2 = await prisma.menuCategory.create({
    data: { restaurantId: savar2.id, nameBn: "বার্গার ও সাইডস", nameEn: "Burgers & Sides", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: savar2.id,
        categoryId: catSavar2.id,
        nameBn: "ডাবল চিজ বিফ স্ম্যাশ বার্গার",
        nameEn: "Double Cheese Beef Smash Burger",
        descriptionBn: "২টি জুসি বিফ প্যাটি, মেল্টেড চিডার চিজ ও স্পাইসি মায়ো",
        descriptionEn: "Double smashed beef patty with melted cheddar and house sauce",
        price: 280,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 12,
      },
      {
        restaurantId: savar2.id,
        categoryId: catSavar2.id,
        nameBn: "চিজি লোডেড ফ্রাইস (সাভার স্পেশাল)",
        nameEn: "Cheesy Loaded Fries (Savar Special)",
        descriptionBn: "মুচমুচে ফ্রাইস এর ওপর গলানো চিজ সস ও বিফ কিমা",
        descriptionEn: "Golden crispy fries smothered in melted cheddar cheese sauce",
        price: 150,
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 8,
      },
    ],
  });

  // Savar: Mezbani & Kebab House (~190m away in Radio Colony)
  const savar3 = await prisma.restaurant.create({
    data: {
      nameBn: "সাভার মেজবানি অ্যান্ড কাবাব হাউস",
      nameEn: "Savar Mezbani & Kebab House",
      slug: "savar-mezbani-kebab-house",
      descriptionBn: "সাভারে আসল কালা ভুনা, চাটগাঁর মেজবানি মাংস ও শিক কাবাব পরোটা",
      descriptionEn: "Authentic spicy Kala Bhuna, tender beef seekh kebab & paratha in Savar",
      phone: "01711990022",
      address: "ঢাকা-আরিচা রোড, রেডিও কলোনি বাসস্ট্যান্ড মোড়, সাভার",
      area: "Radio Colony",
      city: "Dhaka",
      latitude: 23.8472,
      longitude: 90.2588,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.85,
      reviewCount: 310,
      minOrderAmount: 120,
      avgPrepTimeMinutes: 18,
    },
  });

  const catSavar3 = await prisma.menuCategory.create({
    data: { restaurantId: savar3.id, nameBn: "কালা ভুনা ও কাবাব", nameEn: "Kala Bhuna & Kebab", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: savar3.id,
        categoryId: catSavar3.id,
        nameBn: "সাভার স্পেশাল বিফ কালা ভুনা",
        nameEn: "Savar Special Beef Kala Bhuna",
        descriptionBn: "ধীরে ধীরে কষানো ঘন মসলাদার কালো গরুর মাংস",
        descriptionEn: "Slow cooked caramelized dark dry beef bhuna full of fragrant spices",
        price: 330,
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 18,
      },
      {
        restaurantId: savar3.id,
        categoryId: catSavar3.id,
        nameBn: "বিফ শিক কাবাব ও বাটার পরোটা (২ পিস)",
        nameEn: "Beef Seekh Kebab with Butter Paratha (2 Pcs)",
        descriptionBn: "কয়লায় পোড়ানো শিক কাবাব ও ক্রিস্পি বাটার পরোটা",
        descriptionEn: "Charcoal grilled beef seekh kebab served with 2 crispy flaky parathas",
        price: 220,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 15,
      },
    ],
  });

  // Savar: Radio Colony Chayer Adda (~120m away)
  const savar4 = await prisma.restaurant.create({
    data: {
      nameBn: "রেডিও কলোনি চায়ের আড্ডা ও স্ন্যাকস",
      nameEn: "Radio Colony Chayer Adda & Snacks",
      slug: "radio-colony-chayer-adda",
      descriptionBn: "মাটির ভাঁড়ের স্পেশাল মালাই চা, গরম কলিজা সিঙ্গাড়া ও ফালুদা",
      descriptionEn: "Traditional clay pot malai tea, hot liver singara & falooda in Radio Colony",
      phone: "01711223388",
      address: "রেডিও কলোনি কাঁচাবাজার সংলগ্ন, সাভার",
      area: "Radio Colony",
      city: "Dhaka",
      latitude: 23.8485,
      longitude: 90.2605,
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.9,
      reviewCount: 460,
      minOrderAmount: 70,
      avgPrepTimeMinutes: 8,
    },
  });

  const catSavar4 = await prisma.menuCategory.create({
    data: { restaurantId: savar4.id, nameBn: "চা ও জলখাবার", nameEn: "Tea & Snacks", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: savar4.id,
        categoryId: catSavar4.id,
        nameBn: "মাটির ভাঁড়ের স্পেশাল মালাই চা (২ কাপ)",
        nameEn: "Special Matka Malai Tea (2 Cups)",
        descriptionBn: "ঘন দুধ ও এলাচের সুগন্ধে মাটির কাপে পরিবেশিত খাঁটি চা",
        descriptionEn: "Rich slow boiled creamy cardamom tea in authentic clay cups",
        price: 80,
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 7,
      },
      {
        restaurantId: savar4.id,
        categoryId: catSavar4.id,
        nameBn: "গরম কলিজা সিঙ্গাড়া (৪ পিস)",
        nameEn: "Hot Beef Liver Singara (4 Pcs)",
        descriptionBn: "মুচমুচে গরম সিঙ্গাড়া সাথে তেঁতুলের চাটনি",
        descriptionEn: "Crispy savory pastries stuffed with spiced liver and potatoes",
        price: 70,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 8,
      },
    ],
  });
  const rest1 = await prisma.restaurant.create({
    data: {
      nameBn: "ধানমণ্ডি বিরিয়ানি হাউস",
      nameEn: "Dhanmondi Biryani House",
      slug: "dhanmondi-biryani-house",
      descriptionBn: "ঐতিহ্যবাহী ঢাকাই কাচ্চি ও সুস্বাদু মোরগ পোলাও",
      descriptionEn: "Authentic Old Dhaka style Kacchi Biryani and Shahi Morog Polao",
      phone: "01711223344",
      email: "biryani@dhanmondi.com",
      address: "রোড ৪/এ, সাত মসজিদ রোড সংলগ্ন, ধানমণ্ডি",
      area: "Dhanmondi",
      city: "Dhaka",
      latitude: 23.7461,
      longitude: 90.3752,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.9,
      reviewCount: 340,
      minOrderAmount: 150,
      avgPrepTimeMinutes: 15,
      managerUserId: null,
    },
  });

  const cat1 = await prisma.menuCategory.create({
    data: { restaurantId: rest1.id, nameBn: "বিরিয়ানি", nameEn: "Biryani", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: rest1.id,
        categoryId: cat1.id,
        nameBn: "শাহী মাটন কাচ্চি বিরিয়ানি",
        nameEn: "Shahi Mutton Kacchi Biryani",
        descriptionBn: "সুগন্ধি বাসমতি চাল, ঘি ও নরম খাসির মাংস",
        descriptionEn: "Aromatic basmati rice with tender mutton in desi ghee",
        price: 360,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 15,
      },
      {
        restaurantId: rest1.id,
        categoryId: cat1.id,
        nameBn: "স্পেশাল মোরগ পোলাও",
        nameEn: "Special Morog Polao",
        descriptionBn: "ঘিয়ে ভাজা দেশি মুরগি ও ডিমসহ পোলাও",
        descriptionEn: "Classic chicken polao served with egg",
        price: 280,
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 15,
      },
    ],
  });

  // Dhaka Dhanmondi: Chittagong Mezban & Kebab (~180m from Biryani)
  const rest2 = await prisma.restaurant.create({
    data: {
      nameBn: "চিটাগং মেজবান অ্যান্ড কাবাব",
      nameEn: "Chittagong Mezban & Kebab",
      slug: "chittagong-mezban-kebab",
      descriptionBn: "আসল চাটগাঁইয়া মেজবানি মাংস, কালা ভুনা ও শিক কাবাব",
      descriptionEn: "Authentic Chittagong style spicy Mezban beef & Kala Bhuna",
      phone: "01711334455",
      address: "রোড ৫, ধানমণ্ডি, ঢাকা",
      area: "Dhanmondi",
      city: "Dhaka",
      latitude: 23.7472,
      longitude: 90.3765,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.85,
      reviewCount: 290,
      minOrderAmount: 120,
      avgPrepTimeMinutes: 20,
    },
  });

  const cat2 = await prisma.menuCategory.create({
    data: { restaurantId: rest2.id, nameBn: "মেজবানি ও ভুনা", nameEn: "Mezbani & Bhuna", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: rest2.id,
        categoryId: cat2.id,
        nameBn: "চাটগাঁর স্পেশাল কালা ভুনা",
        nameEn: "Chittagong Special Kala Bhuna",
        descriptionBn: "ধীরে ধীরে কষিয়ে ঘন কালো রঙের মসলাদার গরুর মাংস",
        descriptionEn: "Slow cooked caramelized dark spiced beef",
        price: 350,
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 20,
      },
      {
        restaurantId: rest2.id,
        categoryId: cat2.id,
        nameBn: "ঐতিহ্যবাহী মেজবানি মাংস",
        nameEn: "Traditional Mezban Beef Curry",
        descriptionBn: "চাটগাঁর খাঁটি গরম মসলা ও সাদা সরিষা দিয়ে রান্না",
        descriptionEn: "Authentic spicy mustard beef curry",
        price: 320,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 18,
      },
    ],
  });

  // Dhaka Dhanmondi: Crunch Burger & Fries (~210m from Biryani)
  const rest3 = await prisma.restaurant.create({
    data: {
      nameBn: "ক্রাঞ্চ বার্গার অ্যান্ড ফ্রাইস",
      nameEn: "Crunch Burger & Fries",
      slug: "crunch-burger-fries",
      descriptionBn: "জুসি স্মোকি বিফ ও ক্রিস্পি চিকেন বার্গার সাথে লোডেড ফ্রাইস",
      descriptionEn: "Gourmet smashed beef burgers & loaded fries",
      phone: "01711445566",
      address: "রোড ৪, ধানমণ্ডি লেক সংলগ্ন, ঢাকা",
      area: "Dhanmondi",
      city: "Dhaka",
      latitude: 23.7455,
      longitude: 90.3745,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.8,
      reviewCount: 410,
      minOrderAmount: 100,
      avgPrepTimeMinutes: 12,
    },
  });

  const cat3 = await prisma.menuCategory.create({
    data: { restaurantId: rest3.id, nameBn: "বার্গার ও ফ্রাইস", nameEn: "Burgers & Fries", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: rest3.id,
        categoryId: cat3.id,
        nameBn: "ডাবল চিজ স্ম্যাশ বিফ বার্গার",
        nameEn: "Double Cheese Smash Beef Burger",
        descriptionBn: "২টি স্ম্যাশড বিফ প্যাটি ও মেল্টেড শেডার চিজ",
        descriptionEn: "Double smashed beef patty with melted cheddar",
        price: 290,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 12,
      },
      {
        restaurantId: rest3.id,
        categoryId: cat3.id,
        nameBn: "চিজি লোডেড ফ্রাইস",
        nameEn: "Cheesy Loaded Fries",
        descriptionBn: "মুচমুচে ফ্রাইস এর ওপর গলানো চিজ ও কিমা",
        descriptionEn: "Loaded crispy french fries with warm cheese sauce",
        price: 160,
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 8,
      },
    ],
  });

  // --- 2. CHITTAGONG (চট্টগ্রাম) ---
  const ctg1 = await prisma.restaurant.create({
    data: {
      nameBn: "মেহমান মেজবান বাড়ি (জিইসি)",
      nameEn: "Mehman Mezban Bari (GEC)",
      slug: "mehman-mezban-bari-gec",
      descriptionBn: "চট্টগ্রামের আসল ঐতিহ্যবাহী মেজবানি খানা, নলা ভুনা ও চনার ডাল",
      descriptionEn: "Authentic Chittagong Mezban feast and bone marrow curry in GEC",
      phone: "01811223344",
      address: "জিইসি মোড়, সিডিএ এভিনিউ, চট্টগ্রাম",
      area: "GEC Circle",
      city: "Chittagong",
      latitude: 22.3590,
      longitude: 91.8215,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.95,
      reviewCount: 680,
      minOrderAmount: 150,
      avgPrepTimeMinutes: 15,
    },
  });

  const catCtg1 = await prisma.menuCategory.create({
    data: { restaurantId: ctg1.id, nameBn: "মেজবানি খানা", nameEn: "Mezbani Feast", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: ctg1.id,
        categoryId: catCtg1.id,
        nameBn: "অরিজিনাল চাটগাঁইয়া মেজবানি গোশত",
        nameEn: "Original Chittagong Mezban Gosht",
        descriptionBn: "সাদা সরিষা ও জাইফল-জয়ত্রী বাটা দিয়ে রান্না গরম মেজবানি মাংস",
        descriptionEn: "Authentic Chittagong wedding feast spicy beef curry",
        price: 330,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 15,
      },
      {
        restaurantId: ctg1.id,
        categoryId: catCtg1.id,
        nameBn: "মেজবানি চনার ডাল ও গরুর হাড্ডি",
        nameEn: "Mezbani Chana Dal with Beef Bone",
        descriptionBn: "গরুর চর্বি ও হাড় দিয়ে রান্না ঘন ছোলার ডাল",
        descriptionEn: "Yellow split peas slow cooked with rich beef broth",
        price: 140,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 10,
      },
    ],
  });

  // Chittagong: Handi Bistro (~300m away in Dampara/GEC)
  const ctg2 = await prisma.restaurant.create({
    data: {
      nameBn: "হান্ডি ইন্ডিয়ান অ্যান্ড বারবিকিউ",
      nameEn: "Handi Indian & BBQ (Dampara)",
      slug: "handi-indian-bbq-chittagong",
      descriptionBn: "মাটির হান্ডি দম বিরিয়ানি, রেশমি বাটার চিকেন ও তন্দুরি নান",
      descriptionEn: "Earthen pot Dum Biryani & succulent Butter Chicken in Chittagong",
      phone: "01811556677",
      address: "দামপাড়া, এমএম আলী রোড, জিইসি সংলগ্ন, চট্টগ্রাম",
      area: "GEC Circle",
      city: "Chittagong",
      latitude: 22.3615,
      longitude: 91.8230,
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.88,
      reviewCount: 520,
      minOrderAmount: 200,
      avgPrepTimeMinutes: 20,
    },
  });

  const catCtg2 = await prisma.menuCategory.create({
    data: { restaurantId: ctg2.id, nameBn: "হান্ডি স্পেশাল", nameEn: "Handi Special", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: ctg2.id,
        categoryId: catCtg2.id,
        nameBn: "মাটির হান্ডি মাটন দম বিরিয়ানি",
        nameEn: "Clay Handi Mutton Dum Biryani",
        descriptionBn: "মাটির পাত্রে আটার সিল দেওয়া রাজকীয় দম বিরিয়ানি",
        descriptionEn: "Slow cooked dum mutton biryani sealed in clay pot",
        price: 390,
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 20,
      },
    ],
  });

  // --- 3. SYLHET (সিলেট) ---
  const sylhet1 = await prisma.restaurant.create({
    data: {
      nameBn: "পাঁচ ভাই রেস্তোরাঁ (জিন্দাবাজার)",
      nameEn: "Panch Bhai Restaurant (Zindabazar)",
      slug: "panch-bhai-sylhet",
      descriptionBn: "সিলেটের বিখ্যাত ৪০ পদের ভর্তা, হাঁসের মাংস ও সাতকড়ার সালুন",
      descriptionEn: "Sylhet's legendary duck curry, beef with satkara & 40 varieties of bhorta",
      phone: "01711889900",
      address: "জিন্দাবাজার মোড়, সিলেট",
      area: "Zindabazar",
      city: "Sylhet",
      latitude: 24.8949,
      longitude: 91.8687,
      image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.9,
      reviewCount: 890,
      minOrderAmount: 100,
      avgPrepTimeMinutes: 10,
    },
  });

  const catSyl1 = await prisma.menuCategory.create({
    data: { restaurantId: sylhet1.id, nameBn: "সিলেটি স্পেশাল", nameEn: "Sylheti Special", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: sylhet1.id,
        categoryId: catSyl1.id,
        nameBn: "সিলেটের খাঁটি সাতকড়া দিয়ে গরুর মাংস",
        nameEn: "Sylheti Beef with Wild Citrus (Satkara)",
        descriptionBn: "সিলেটের পাহাড়ি সুবাসিত সাতকড়া ও কচি গরুর মাংসের ঘন ঝোল",
        descriptionEn: "Signature tender beef simmered with aromatic wild citrus (Satkara)",
        price: 260,
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 12,
      },
      {
        restaurantId: sylhet1.id,
        categoryId: catSyl1.id,
        nameBn: "দেশি হাঁসের ভুনা (কালিজিরা চালের ভাতসহ)",
        nameEn: "Duck Bhuna with Kalijira Rice",
        descriptionBn: "ঝাল মসলায় কষানো দেশি হাঁসের মাংস ও সুগন্ধি চালের গরম ভাত",
        descriptionEn: "Spicy country duck roast served with aromatic fine rice",
        price: 290,
        image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 15,
      },
    ],
  });

  // --- 4. COX'S BAZAR (কক্সবাজার) ---
  const cox1 = await prisma.restaurant.create({
    data: {
      nameBn: "ঝাউবন রূপচান্দা ফ্রাই অ্যান্ড সি-ফুড",
      nameEn: "Jhaubon Rupchanda Fry & Seafood",
      slug: "jhaubon-seafood-coxsbazar",
      descriptionBn: "সরাসরি বঙ্গোপসাগরের তাজা রূপচান্দা ফ্রাই, গলদা চিংড়ি ও লইট্টা ফ্রাই",
      descriptionEn: "Fresh Bay of Bengal silver pomfret, jumbo prawns and crispy loitta fry",
      phone: "01811998877",
      address: "কলাতলী বিচ রোড, কক্সবাজার",
      area: "Kolatoli",
      city: "Cox's Bazar",
      latitude: 21.4272,
      longitude: 91.9806,
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.92,
      reviewCount: 740,
      minOrderAmount: 200,
      avgPrepTimeMinutes: 15,
    },
  });

  const catCox1 = await prisma.menuCategory.create({
    data: { restaurantId: cox1.id, nameBn: "সি-ফুড ফ্রাই", nameEn: "Seafood Fry", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: cox1.id,
        categoryId: catCox1.id,
        nameBn: "মুচমুচে রূপচান্দা মাছ ফ্রাই (আস্ত)",
        nameEn: "Crispy Whole Rupchanda (Pomfret) Fry",
        descriptionBn: "স্পেশাল মসলায় মেরিনেট করে লালচে ভাজা তাজা রূপচান্দা সাথে সালাদ",
        descriptionEn: "Fresh Bay of Bengal whole silver pomfret deep fried with house spices",
        price: 450,
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 15,
      },
      {
        restaurantId: cox1.id,
        categoryId: catCox1.id,
        nameBn: "ক্রিস্পি লইট্টা ফ্রাই (প্লেট)",
        nameEn: "Crispy Loitta (Bombay Duck) Fry",
        descriptionBn: "মুচমুচে ব্যাটারে ভাজা সুস্বাদু লইট্টা ফ্রাই সাথে পুদিনা সস",
        descriptionEn: "Golden battered crispy Bombay duck fish fillets with mint dip",
        price: 220,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 10,
      },
    ],
  });

  // --- 5. RAJSHAHI (রাজশাহী) ---
  const raj1 = await prisma.restaurant.create({
    data: {
      nameBn: "পদ্মা ভিউ কালাই রুটি ও হাঁস ভুনা",
      nameEn: "Padma View Kalai Ruti & Duck (Rajshahi)",
      slug: "padma-view-kalai-ruti-rajshahi",
      descriptionBn: "রাজশাহীর ঐতিহ্যবাহী কড়াই-ভাঙ্গা কালাই রুটি, বেগুন ভর্তা ও ঝাল হাঁসের মাংস",
      descriptionEn: "Traditional Rajshahi mashkalai bread with spicy duck bhuna by Padma river",
      phone: "01711667788",
      address: "টি-বাঁধ রোড, সাহেব বাজার সংলগ্ন, রাজশাহী",
      area: "Shaheb Bazar",
      city: "Rajshahi",
      latitude: 24.3636,
      longitude: 88.6241,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60",
      isOpen: true,
      acceptsOrders: true,
      rating: 4.87,
      reviewCount: 460,
      minOrderAmount: 100,
      avgPrepTimeMinutes: 12,
    },
  });

  const catRaj1 = await prisma.menuCategory.create({
    data: { restaurantId: raj1.id, nameBn: "রাজশাহীর ঐতিহ্য", nameEn: "Rajshahi Special", sortOrder: 1 },
  });
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: raj1.id,
        categoryId: catRaj1.id,
        nameBn: "স্পেশাল কালাই রুটি (২ পিস) ও বেগুন ভর্তা",
        nameEn: "Special Kalai Ruti (2 Pcs) & Baingan Bhorta",
        descriptionBn: "খাঁটি মাশকলাই ডাল ও আতপ চালের মোটা রুটি সাথে সরিষার তেলের বেগুন ভর্তা",
        descriptionEn: "Authentic Rajshahi black gram flatbread served with roasted eggplant mash",
        price: 110,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 10,
      },
      {
        restaurantId: raj1.id,
        categoryId: catRaj1.id,
        nameBn: "পদ্মার পাড়ের হাঁস ভুনা (বাটি)",
        nameEn: "Padma Duck Roast (Bowl)",
        descriptionBn: "ঝাল শুকনা মরিচে কষানো রাজশাহীর বিখ্যাত হাঁস ভুনা",
        descriptionEn: "Spicy roasted duck slow cooked in village style mustard oil",
        price: 260,
        image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=60",
        preparationTimeMinutes: 15,
      },
    ],
  });

  // Operating hours for all restaurants
  const allRestaurants = [savar1, savar2, savar3, savar4, rest1, rest2, rest3, ctg1, ctg2, sylhet1, cox1, raj1];
  for (const r of allRestaurants) {
    for (let day = 0; day <= 6; day++) {
      await prisma.restaurantOperatingHour.create({
        data: {
          restaurantId: r.id,
          dayOfWeek: day,
          openTime: "08:00",
          closeTime: "23:59",
          isClosed: false,
        },
      });
    }
  }

  // Customer Loyalty Progress: Baseline 0 completed, 15 to go within 30 days
  await prisma.loyaltyProgress.create({
    data: {
      customerId: customerProfile.id,
      monthYear: "2026-10",
      qualifyingCompletedOrdersCount: 0,
      thresholdMet: false,
      discountPercentageEarned: 0,
      expiresAt: new Date("2026-11-30T23:59:59.999Z"),
    },
  });

  // Platform Settings
  await prisma.platformSetting.createMany({
    data: [
      { key: "max_cluster_distance_meters", value: "600", description: "Maximum distance between restaurants for shared pickup" },
      { key: "first_order_discount_amount", value: "50", description: "Discount in BDT on first order delivery" },
      { key: "loyalty_threshold_orders", value: "15", description: "Number of completed qualifying orders needed in month (>15)" },
      { key: "loyalty_discount_percent", value: "25", description: "Next month delivery discount percentage" },
      { key: "base_delivery_fee", value: "50", description: "Base delivery fee for single restaurant" },
      { key: "additional_restaurant_fee", value: "25", description: "Extra fee for each additional pickup stop" },
      { key: "per_km_fee", value: "12", description: "Fee per km of route" },
    ],
  });

  console.log("Seeding nationwide platform database completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
