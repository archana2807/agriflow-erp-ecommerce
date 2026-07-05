import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/user.model.js";
import Customer from "./models/customer.model.js";
import Category from "./models/category.model.js";
import Brand from "./models/brand.model.js";
import Product from "./models/product.model.js";
import Banner from "./models/banner.model.js";
import Coupon from "./models/coupon.model.js";
import Order from "./models/order.model.js";
import Invoice from "./models/invoice.model.js";
import Payment from "./models/payment.model.js";
import Address from "./models/address.model.js";
import Review from "./models/review.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const TENANT_ID = new mongoose.Types.ObjectId("6a2da032a1988ba7bb7e9820");

function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const categories = [
  { name: "Tractors", slug: "tractors", description: "Farm tractors from 15HP to 75HP" },
  { name: "Tillers", slug: "tillers", description: "Power tillers and rotavators for soil preparation" },
  { name: "Irrigation", slug: "irrigation", description: "Pumps, pipes and drip irrigation systems" },
  { name: "Harvesters", slug: "harvesters", description: "Combine harvesters and reapers" },
  { name: "Sprayers", slug: "sprayers", description: "Manual, battery and motorized sprayers" },
  { name: "Seeders", slug: "seeders", description: "Seed drills and planters" },
  { name: "Grinders", slug: "grinders", description: "Chaff cutters and grinders" },
  { name: "Accessories", slug: "accessories", description: "Spare parts, tyres and farm accessories" },
];

const brands = [
  { name: "Mahindra", description: "India's leading tractor brand" },
  { name: "Sonalika", description: "International brand of tractors and farm machinery" },
  { name: "TAFE", description: "Tractors and Farm Equipment Limited" },
  { name: "John Deere", description: "World leader in agricultural equipment" },
  { name: "Kubota", description: "Japanese precision farm machinery" },
  { name: "VST", description: "VST Tillers Tractors Ltd" },
  { name: "Bosch", description: "Sprayers and irrigation solutions" },
  { name: "Kirloskar", description: "Pumps and irrigation systems" },
  { name: "Atlas Copco", description: "Industrial compressors and equipment" },
  { name: "Shaktiman", description: "Farm implements and rotavators" },
];

const products = [
  { name: "Mahindra Arjun Novo 605 DI", sku: "TRC-MAN-605", price: 785000, gstPercent: 12, stock: 5, category: "tractors", brand: "Mahindra", slug: "mahindra-arjun-novo-605-di", shortDescription: "57HP 4-cylinder diesel tractor", description: "Mahindra Arjun Novo 605 DI is a 57HP tractor with 4-cylinder engine. Suitable for heavy-duty farming operations.", unit: "piece", weight: 2100, sellingPrice: 765000, discount: 20000, featured: true, bestSeller: true },
  { name: "Sonalika DI 750 III", sku: "TRC-SON-750", price: 695000, gstPercent: 12, stock: 3, category: "tractors", brand: "Sonalika", slug: "sonalika-di-750-iii", shortDescription: "50HP 3-cylinder tractor", description: "Sonalika DI 750 III is a 50HP tractor known for fuel efficiency and durability.", unit: "piece", weight: 1950, sellingPrice: 680000, discount: 15000, featured: true },
  { name: "TAFE 5900 4WD", sku: "TRC-TAF-590", price: 825000, gstPercent: 12, stock: 2, category: "tractors", brand: "TAFE", slug: "tafe-5900-4wd", shortDescription: "52HP 4-wheel drive tractor", description: "TAFE 5900 4WD with 52HP engine and four-wheel drive.", unit: "piece", weight: 2300, sellingPrice: 810000, discount: 15000, newArrival: true },
  { name: "John Deere 5310 4WD", sku: "TRC-JD-531", price: 945000, gstPercent: 12, stock: 1, category: "tractors", brand: "John Deere", slug: "john-deere-5310-4wd", shortDescription: "55HP 4WD with power steering", description: "John Deere 5310 is a premium 55HP tractor with power steering, dual clutch.", unit: "piece", weight: 2250, sellingPrice: 930000, discount: 15000, featured: true, bestSeller: true },
  { name: "Kubota MU5501 4WD", sku: "TRC-KUB-550", price: 1025000, gstPercent: 12, stock: 2, category: "tractors", brand: "Kubota", slug: "kubota-mu5501-4wd", shortDescription: "55HP Japanese technology 4WD", description: "Kubota MU5501 combines Japanese engineering with Indian farming needs.", unit: "piece", weight: 2180, sellingPrice: 999000, discount: 26000, featured: true, newArrival: true },

  { name: "Mahindra Rotavator 185", sku: "TLR-MAH-185", price: 68000, gstPercent: 12, stock: 8, category: "tillers", brand: "Mahindra", slug: "mahindra-rotavator-185", shortDescription: "5 feet heavy-duty rotavator", description: "Mahindra 185 rotavator with 5 feet working width. Suitable for 35-50HP tractors.", unit: "piece", weight: 320, sellingPrice: 65000, discount: 3000, bestSeller: true },
  { name: "Shaktiman Standard 135", sku: "TLR-SHA-135", price: 52000, gstPercent: 12, stock: 10, category: "tillers", brand: "Shaktiman", slug: "shaktiman-standard-135", shortDescription: "4 feet rotavator for 25-35HP tractors", description: "Shaktiman Standard 135 is a compact 4 feet rotavator.", unit: "piece", weight: 245, sellingPrice: 50000, discount: 2000 },
  { name: "VST Shakti 135 DI Power Tiller", sku: "TLR-VST-135", price: 145000, gstPercent: 12, stock: 4, category: "tillers", brand: "VST", slug: "vst-shakti-135-di-power-tiller", shortDescription: "13HP diesel power tiller", description: "VST Shakti 135 DI is a 13HP diesel power tiller.", unit: "piece", weight: 480, sellingPrice: 140000, discount: 5000, featured: true },

  { name: "Kirloskar Chhotu 1HP Monoblock Pump", sku: "IRR-KIR-1HP", price: 8500, gstPercent: 18, stock: 25, category: "irrigation", brand: "Kirloskar", slug: "kirloskar-chhotu-1hp-pump", shortDescription: "1HP monoblock water pump", description: "Kirloskar Chhotu 1HP single-phase monoblock pump.", unit: "piece", weight: 18, sellingPrice: 8200, discount: 300, bestSeller: true },
  { name: "Kirloskar KDS 5HP Submersible Pump", sku: "IRR-KIR-5HP", price: 32000, gstPercent: 18, stock: 12, category: "irrigation", brand: "Kirloskar", slug: "kirloskar-kds-5hp-submersible", shortDescription: "5HP 4-inch submersible pump", description: "Kirloskar KDS 5HP submersible pump for deep borewells.", unit: "piece", weight: 35, sellingPrice: 31000, discount: 1000, featured: true },
  { name: "Bosch Knapsack Power Sprayer", sku: "IRR-BOS-KPS", price: 4200, gstPercent: 18, stock: 30, category: "irrigation", brand: "Bosch", slug: "bosch-knapsack-power-sprayer", shortDescription: "Battery-powered 16L sprayer", description: "Bosch battery-operated knapsack sprayer with 16 litre tank.", unit: "piece", weight: 5.5, sellingPrice: 4000, discount: 200, bestSeller: true },
  { name: "Drip Irrigation Kit (1 Acre)", sku: "IRR-DRP-1AC", price: 18500, gstPercent: 18, stock: 15, category: "irrigation", brand: "Bosch", slug: "drip-irrigation-kit-1-acre", shortDescription: "Complete drip system for 1 acre", description: "Complete drip irrigation kit covering 1 acre.", unit: "set", weight: 25, sellingPrice: 17500, discount: 1000, newArrival: true },

  { name: "Bosch AutoShot 20L Battery Sprayer", sku: "SPR-BOS-20L", price: 5800, gstPercent: 18, stock: 20, category: "sprayers", brand: "Bosch", slug: "bosch-autoshot-20l-sprayer", shortDescription: "20L automatic battery sprayer", description: "Bosch AutoShot 20L with automatic pressure control.", unit: "piece", weight: 7, sellingPrice: 5500, discount: 300, bestSeller: true },
  { name: "Manual Knapsack Sprayer 15L", sku: "SPR-MAN-15L", price: 1200, gstPercent: 18, stock: 50, category: "sprayers", brand: "Bosch", slug: "manual-knapsack-sprayer-15l", shortDescription: "15L manual pump sprayer", description: "Standard 15 litre manual knapsack sprayer.", unit: "piece", weight: 4, sellingPrice: 1100, discount: 100 },
  { name: "Motorized Mist Blower 25L", sku: "SPR-MOT-25L", price: 12500, gstPercent: 18, stock: 6, category: "sprayers", brand: "Atlas Copco", slug: "motorized-mist-blower-25l", shortDescription: "25L petrol engine mist blower", description: "Motorized mist blower with 2-stroke petrol engine.", unit: "piece", weight: 12, sellingPrice: 12000, discount: 500, featured: true, newArrival: true },

  { name: "Seed Drill 9 Tyne", sku: "SDR-MAN-9TY", price: 28000, gstPercent: 12, stock: 7, category: "seeders", brand: "Mahindra", slug: "seed-drill-9-tyne", shortDescription: "9-tyne seed drill for wheat/pulses", description: "9-tyne seed drill with seed and fertilizer boxes.", unit: "piece", weight: 180, sellingPrice: 27000, discount: 1000 },
  { name: "Precision Planter (4 Row)", sku: "SDR-PRC-4RW", price: 45000, gstPercent: 12, stock: 3, category: "seeders", brand: "Kubota", slug: "precision-planter-4-row", shortDescription: "4-row precision planter", description: "4-row precision planter for maize, soybean, and groundnut.", unit: "piece", weight: 260, sellingPrice: 43500, discount: 1500, newArrival: true },

  { name: "Chaff Cutter 5 HP", sku: "GRT-CHF-5HP", price: 22000, gstPercent: 12, stock: 9, category: "grinders", brand: "Mahindra", slug: "chaff-cutter-5hp", shortDescription: "5HP electric chaff cutter", description: "5HP single-phase chaff cutter. Cuts 200-300 kg/hr.", unit: "piece", weight: 95, sellingPrice: 21000, discount: 1000, bestSeller: true },
  { name: "Pulverizer 10 HP", sku: "GRT-PUL-10H", price: 38000, gstPercent: 12, stock: 4, category: "grinders", brand: "VST", slug: "pulverizer-10hp", shortDescription: "10HP multi-purpose pulverizer", description: "10HP pulverizer for grinding turmeric, chili, grains.", unit: "piece", weight: 150, sellingPrice: 36500, discount: 1500 },

  { name: "Tractor Front Tyre 13.6/75-16", sku: "ACC-TYR-136", price: 12000, gstPercent: 28, stock: 14, category: "accessories", brand: "Mahindra", slug: "tractor-front-tyre-136", shortDescription: "13.6/75-16 front tractor tyre", description: "Original 13.6/75-16 tractor front tyre.", unit: "piece", weight: 28, sellingPrice: 11500, discount: 500 },
  { name: "Tractor Rear Tyre 16.9/30-12", sku: "ACC-TYR-169", price: 28000, gstPercent: 28, stock: 8, category: "accessories", brand: "Mahindra", slug: "tractor-rear-tyre-169", shortDescription: "16.9/30-12 rear tractor tyre", description: "Heavy-duty 16.9/30-12 rear tractor tyre.", unit: "piece", weight: 55, sellingPrice: 27000, discount: 1000 },
  { name: "Top Link Category II", sku: "ACC-TPL-CAT", price: 2800, gstPercent: 18, stock: 20, category: "accessories", brand: "Shaktiman", slug: "top-link-category-ii", shortDescription: "Adjustable top link category II", description: "Heavy-duty adjustable top link for category II hitch.", unit: "piece", weight: 3.5, sellingPrice: 2600, discount: 200 },
  { name: "PTO Shaft Cardan 1.37\"-21T", sku: "ACC-PTO-137", price: 4500, gstPercent: 18, stock: 18, category: "accessories", brand: "Atlas Copco", slug: "pto-shaft-cardan-137", shortDescription: "1.37\"-21T PTO shaft with guards", description: "Cardan-type PTO shaft with safety guards.", unit: "piece", weight: 5, sellingPrice: 4300, discount: 200 },
];

const bannerData = [
  { title: "Monsoon Tractor Sale", subtitle: "Up to Rs.25,000 off on Mahindra & Sonalika tractors", image: "/uploads/banner-1.jpg", buttonText: "Shop Now", buttonLink: "/shop?category=tractors", displayOrder: 1 },
  { title: "Irrigation Solutions", subtitle: "Complete drip kits starting from Rs.18,500", image: "/uploads/banner-2.jpg", buttonText: "View Products", buttonLink: "/shop?category=irrigation", displayOrder: 2 },
  { title: "New Arrivals", subtitle: "Latest farm equipment now in stock", image: "/uploads/banner-3.jpg", buttonText: "Explore", buttonLink: "/shop?sort=newest", displayOrder: 3 },
];

const couponData = [
  { code: "MONSOON10", discountType: "PERCENTAGE", discountValue: 10, minimumOrder: 50000, maximumDiscount: 15000, expiryDate: new Date("2026-09-30"), usageLimit: 100 },
  { code: "FLAT2000", discountType: "FLAT", discountValue: 2000, minimumOrder: 25000, maximumDiscount: 2000, expiryDate: new Date("2026-08-15"), usageLimit: 50 },
  { code: "WELCOME5", discountType: "PERCENTAGE", discountValue: 5, minimumOrder: 5000, maximumDiscount: 5000, expiryDate: new Date("2026-12-31"), usageLimit: 500 },
  { code: "FARMER15", discountType: "PERCENTAGE", discountValue: 15, minimumOrder: 100000, maximumDiscount: 25000, expiryDate: new Date("2026-10-31"), usageLimit: 30 },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.\n");

    console.log("Dropping existing collections...");
    const colls = await mongoose.connection.db.listCollections().toArray();
    for (const coll of colls) {
      await mongoose.connection.db.dropCollection(coll.name).catch(() => {});
    }
    console.log("All collections dropped.\n");

    // --- Users ---
    console.log("Seeding users...");
    const admin = await User.create({ name: "Admin", email: "admin@test.com", password: "123456", role: "ADMIN", tenantId: TENANT_ID });
    const sales = await User.create({ name: "Suresh Patil", email: "sales@test.com", password: "123456", role: "SALES", tenantId: TENANT_ID });
    console.log(`  Admin: admin@test.com / 123456`);
    console.log(`  Sales: sales@test.com / 123456`);

    // --- Categories ---
    console.log("Seeding categories...");
    const categoryMap = {};
    for (const cat of categories) {
      const doc = await Category.create({ ...cat, tenantId: TENANT_ID });
      categoryMap[cat.slug] = doc._id;
    }
    console.log(`  Created ${categories.length} categories`);

    // --- Brands ---
    console.log("Seeding brands...");
    const brandMap = {};
    for (const brand of brands) {
      const doc = await Brand.create({ ...brand, slug: slugify(brand.name), tenantId: TENANT_ID });
      brandMap[brand.name] = doc._id;
    }
    console.log(`  Created ${brands.length} brands`);

    // --- Products ---
    console.log("Seeding products...");
    const productDocs = [];
    for (const p of products) {
      const doc = await Product.create({
        name: p.name, sku: p.sku, price: p.price, gstPercent: p.gstPercent,
        stock: p.stock, tenantId: TENANT_ID,
        categoryId: categoryMap[p.category] || null,
        brandId: brandMap[p.brand] || null,
        slug: p.slug, shortDescription: p.shortDescription,
        description: p.description, images: [], unit: p.unit,
        weight: p.weight, mrp: p.price, sellingPrice: p.sellingPrice,
        discount: p.discount || 0, featured: p.featured || false,
        bestSeller: p.bestSeller || false, newArrival: p.newArrival || false,
      });
      productDocs.push(doc);
    }
    console.log(`  Created ${products.length} products`);

    // --- Customers ---
    console.log("Seeding customers...");
    const customerInputs = [
      { name: "Archana", email: "Archana@test.com", phone: "9876543210", password: "123456", isWalkIn: false },
      { name: "Sunita Devi", email: "sunita@email.com", phone: "9876543211", password: "123456", isWalkIn: false },
      { name: "Amit Sharma", phone: "9876543212", isWalkIn: true },
      { name: "Priya Singh", email: "priya@email.com", phone: "9876543213", password: "123456", isWalkIn: false },
      { name: "Vikram Rathore", phone: "9876543214", isWalkIn: true },
      { name: "Anita Jadhav", email: "anita@email.com", phone: "9876543215", password: "123456", isWalkIn: false },
      { name: "Deepak Thakur", phone: "9876543216", isWalkIn: true },
      { name: "Meena Kumari", email: "meena@email.com", phone: "9876543217", password: "123456", isWalkIn: false },
    ];
    const customerDocs = [];
    for (const c of customerInputs) {
      const data = { name: c.name, phone: c.phone, tenantId: TENANT_ID, isWalkIn: c.isWalkIn, createdBy: admin._id };
      if (c.email) data.email = c.email;
      if (c.password) data.password = c.password;
      const doc = await Customer.create(data);
      customerDocs.push(doc);
    }
    console.log(`  Created ${customerInputs.length} customers`);

    // --- Addresses ---
    console.log("Seeding addresses...");
    const onlineCustomers = customerDocs.filter((c) => !c.isWalkIn);
    const addressInputs = [
      { fullName: "Archana", addressLine1: "Near Bus Stand, Ward 12", city: "Barnagar", state: "Madhya Pradesh", pincode: "465110", landmark: "Opposite SBI Bank" },
      { fullName: "Sunita Devi", addressLine1: "Gram Panchayat Road, Khandwa", city: "Khandwa", state: "Madhya Pradesh", pincode: "450001", landmark: "Near Primary School" },
      { fullName: "Priya Singh", addressLine1: "15, Nehru Nagar", city: "Indore", state: "Madhya Pradesh", pincode: "452001", landmark: "Behind Palasia Mall" },
      { fullName: "Anita Jadhav", addressLine1: "Plot No. 23, MG Road", city: "Ujjain", state: "Madhya Pradesh", pincode: "456001", landmark: "Near Mahakaleshwar Temple" },
      { fullName: "Meena Kumari", addressLine1: "78, Station Road", city: "Dewas", state: "Madhya Pradesh", pincode: "455001", landmark: "Next to Railway Station" },
    ];
    const addressDocs = [];
    for (let i = 0; i < onlineCustomers.length && i < addressInputs.length; i++) {
      const doc = await Address.create({
        ...addressInputs[i], phone: onlineCustomers[i].phone,
        customerId: onlineCustomers[i]._id, tenantId: TENANT_ID,
        country: "India", isDefault: true,
      });
      addressDocs.push(doc);
    }
    console.log(`  Created ${addressDocs.length} addresses`);

    // --- Banners ---
    console.log("Seeding banners...");
    for (const b of bannerData) {
      await Banner.create({ ...b, tenantId: TENANT_ID });
    }
    console.log(`  Created ${bannerData.length} banners`);

    // --- Coupons ---
    console.log("Seeding coupons...");
    for (const c of couponData) {
      await Coupon.create({ ...c, tenantId: TENANT_ID });
    }
    console.log(`  Created ${couponData.length} coupons`);

    // --- Sample Orders, Invoices, Payments ---
    console.log("Seeding sample orders...");
    const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
    const payMethods = ["CASH", "CARD", "UPI"];

    for (let i = 0; i < 12; i++) {
      const cust = onlineCustomers[i % onlineCustomers.length];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const picked = pickRandom(productDocs, numItems);
      const orderItems = picked.map((p) => ({
        productId: p._id, name: p.name,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: p.price, gstPercent: p.gstPercent,
      }));
      const totalAmount = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);
      const status = statuses[i % statuses.length];
      const daysAgo = Math.floor(Math.random() * 60);
      const orderDate = new Date(Date.now() - daysAgo * 86400000);
      const orderNo = `ORD-${String(2026000 + i + 1).padStart(7, "0")}`;

      const order = await Order.create({
        tenantId: TENANT_ID, orderNo, customerId: cust._id,
        addressId: addressDocs[i % addressDocs.length]?._id || null,
        items: orderItems, totalAmount, status,
        orderType: cust.isWalkIn ? "WALKIN" : "ONLINE",
        paymentMethod: payMethods[i % payMethods.length],
        paymentStatus: status === "DELIVERED" ? "PAID" : "PARTIAL",
        createdBy: sales._id,
      });

      const gstAmount = totalAmount * 0.12;
      const invoice = await Invoice.create({
        tenantId: TENANT_ID,
        invoiceNo: `INV-${String(2026000 + i + 1).padStart(7, "0")}`,
        orderId: order._id, customerId: cust._id,
        items: orderItems, subtotal: totalAmount, 
        gstAmount, totalAmount: totalAmount + gstAmount,
        status: status === "DELIVERED" ? "PAID" : "PARTIAL",
        createdBy: sales._id,
      });

      if (status !== "PENDING") {
        const amountPaid = status === "DELIVERED" ? totalAmount : totalAmount * 0.5;
        await Payment.create({
          tenantId: TENANT_ID, invoiceId: invoice._id,
          customerId: cust._id, amountPaid,
          paymentMethod: payMethods[i % payMethods.length],
          remainingAmount: Math.max(0, totalAmount - amountPaid),
          status: amountPaid >= totalAmount ? "FULL" : "PARTIAL",
          createdBy: sales._id,
        });
      }
    }
    console.log(`  Created 12 orders + invoices + payments`);

    // --- Reviews ---
    console.log("Seeding reviews...");
    const reviewTexts = [
      "Excellent product! Very durable and efficient on my 5-acre farm.",
      "Good value for money. Works well on my farm.",
      "Highly recommend this for small farmers.",
      "After 3 months of use, still working perfectly.",
      "Great after-sales support from the dealer.",
      "Fuel efficient and easy to maintain.",
      "Best investment for my farm this year.",
      "Good quality, delivers as promised.",
    ];
    let reviewCount = 0;
    for (let i = 0; i < productDocs.length && reviewCount < reviewTexts.length; i += 3) {
      const cust = onlineCustomers[reviewCount % onlineCustomers.length];
      if (!cust.isWalkIn) {
        await Review.create({
          tenantId: TENANT_ID, customerId: cust._id,
          productId: productDocs[i]._id,
          rating: Math.floor(Math.random() * 2) + 4,
          review: reviewTexts[reviewCount],
          isApproved: true,
        });
        reviewCount++;
      }
    }
    console.log(`  Created ${reviewCount} reviews`);

    console.log("\n========================================");
    console.log("  SEEDING COMPLETE");
    console.log("========================================");
    console.log("\nLogin credentials:");
    console.log("  Admin:  admin@test.com / 123456");
    console.log("  Sales:  sales@test.com / 123456");
    console.log("  Customer: Archana@test.com / 123456");
    console.log("  Walk-in:  phone 9876543212 (no password)");
    console.log("\nData seeded:");
    console.log(`  ${categories.length} categories`);
    console.log(`  ${brands.length} brands`);
    console.log(`  ${products.length} products`);
    console.log(`  ${customerInputs.length} customers`);
    console.log(`  ${addressDocs.length} addresses`);
    console.log(`  ${bannerData.length} banners`);
    console.log(`  ${couponData.length} coupons`);
    console.log(`  12 orders with invoices & payments`);
    console.log(`  ${reviewCount} reviews`);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
    process.exit(0);
  }
}

seed();
