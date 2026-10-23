<div align="center">

# 🍲 খালি খাই (Khali Khai)
### AI-Powered Multi-Restaurant Food Delivery & Smart Shared Logistics Platform for Bangladesh

[![Live Demo](https://img.shields.io/badge/Live%20Demo-khali--khai.vercel.app-FF5A36?style=for-the-badge&logo=vercel&logoColor=white)](https://khali-khai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js%2016-Turbopack-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Vitest-14%20Passed-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Market](https://img.shields.io/badge/Market-Bangladesh%20%F0%9F%87%A7%F0%9F%87%A9-006A4E?style=for-the-badge)](https://khali-khai.vercel.app)

<br />

> **"Different restaurants. One smart cart. One transparent delivery plan."**  
> *ভিন্ন ভিন্ন রেস্টুরেন্ট। এক স্মার্ট কার্ট। এক স্বচ্ছ ও সাশ্রয়ী ডেলিভারি প্ল্যান।*

**[🌐 Visit Live Website](https://khali-khai.vercel.app)** • **[🚀 Quick Start](#-quick-start)** • **[🔑 Demo Logins](#-demo-accounts)** • **[⚙️ Core Algorithms](#-core-algorithms--pricing)** • **[📞 Support & Contact](#-contact--support)**

</div>

---

## 📌 Executive Summary

**খালি খাই (Khali Khai)** solves one of the biggest pain points in Bangladesh's on-demand food delivery landscape. 

Traditional platforms force customers to choose items from **only a single restaurant** per checkout. If a family or office wants biryani from one specialty restaurant and kebabs or dessert from another, they are forced to place separate orders, pay multiple independent delivery fees, and coordinate with multiple separate riders arriving at conflicting times.

**খালি খাই** revolutionizes this with an intelligent multi-restaurant cart and shared logistics engine:
- Customers add dishes from multiple nearby restaurants into **one unified cart**.
- The system calculates an optimized **shared delivery fee** (saving customers up to ৳80–৳150 per order).
- Deliveries are batched into **one synchronized single-rider route**, optimizing kitchen preparation holding times.
- Transparent fee comparison: displays what traditional separate orders would cost vs. the Khali Khai combined plan.

---

## ✨ Key Features & Innovation

### 🛒 1. Unified Multi-Restaurant Cart
- Add items from multiple nearby restaurants (clustered within 500–600m).
- Real-time cart calculation revalidates prices directly against database records to prevent client-side tampering.
- Instant item grouping by restaurant with individual kitchen preparation countdowns.

### 🚴 2. Shared Logistics & Route Optimization (`src/lib/logistics.ts`)
- **Proximity Clustering**: Automatically determines if restaurants can be combined into a shared delivery.
- **Kitchen Ready-Time Synchronization**: Synchronizes pickup sequence based on kitchen preparation times so food never sits cold.
- **Fair Rider Compensation**: Sustainable payout model (`Base ৳45 + ৳22 per extra stop + ৳10/km`), ensuring riders earn higher aggregate income per trip.

### 🎁 3. Dynamic Promotions & ৳50 First-Order Discount
- **First-Order Benefit**: Strictly checks user order history and grants up to ৳50 off delivery for brand-new customers. Subsequent orders automatically adjust to standard rates.
- **Atomic Race-Condition Protection**: Transaction-level checks ensure the first-order discount cannot be claimed twice.

### 🏆 4. Monthly Loyalty Engine (`src/lib/loyalty.ts`)
- **Asia/Dhaka Calendar Alignment**: Tracks order frequency strictly within a 30-day / calendar month window.
- **15-Order Milestone**: Completing 15 qualifying parent orders unlocks a **flat 25% discount** on all delivery fees for the entire subsequent month!
- **Automatic Monthly Reset**: Automatically resets count back to 0 completed / 15 to go at the start of each new month.

### 📍 5. Smart Geolocation & 6–8 km Radius Filtering
- HTML5 Geolocation asks for user coordinates and calculates real-time Haversine distance matrices.
- Strict 6–8 km radius filter guarantees users only discover realistically deliverable restaurants (e.g. users in Radio Colony, Savar see local Savar hubs rather than distant Dhanmondi outlets).
- 1-tap division selectors across Bangladesh: Dhaka, Chittagong, Sylhet, Cox's Bazar, Rajshahi, Khulna, Barisal, Rangpur.

### 🎨 6. Brand Identity & Kinetic Typography
- **Animated Brand Title**: Custom letter-by-letter left-to-right kinetic animation ("খালি খাই" / "Khali Khai") where letters materialize out of nowhere into a continuous ambient wave.
- **Color Palette**: Sunset Coral (`#FF5A36`), Soft Peach (`#FFE2CF`), Amber Gold (`#FFB300`), Deep Teal (`#0D8275`), and Charcoal (`#222222`).
- **Bilingual Interface**: Seamless instant switching between Bengali (`বাংলা`) and English (`EN`).

---

## 🔑 Demo Accounts

The platform comes pre-seeded with four dedicated role-based demo accounts for live testing:

| Role | Email | Password | Pre-configured Scenarios |
|---|---|---|---|
| 👤 **Customer** | `demo.customer@example.com` | `KhaliKhai@2026` | 0 completed orders (15 to go for 25% reward), Savar Radio Colony & Dhanmondi addresses, multi-cart checkout |
| 🍳 **Restaurant Manager** | `demo.restaurant@example.com` | `KhaliKhai@2026` | Manages **সাভার কাচ্চি মহল**, kitchen prep time updates, order acceptance, ready-for-pickup actions |
| 🏍️ **Delivery Rider** | `demo.rider@example.com` | `KhaliKhai@2026` | Online/Offline toggle, multi-stop pickup sequences, route progress updates, delivery confirmations |
| 🛡️ **Platform Admin** | `demo.admin@example.com` | `KhaliKhai@2026` | System KPIs, cluster radius configuration, delivery fee rates, live platform audit log |

---

## ⚙️ Core Algorithms & Pricing

### Delivery Pricing Formula
$$\text{Separate Total} = \sum_{i=1}^{N} \text{StandardDeliveryFee}(R_i \to C)$$

$$\text{Combined Shared Fee} = \text{BaseFee}(৳50) + (N - 1) \times \text{StopFee}(৳25) + \max(0, D - 2.0) \times \text{RatePerKm}(৳12)$$

$$\text{Delivery Savings} = \max(0, \text{Separate Total} - \text{FinalDeliveryFee})$$

### Rider Earnings Guarantee
$$\text{Rider Payout} = ৳45 + (N - 1) \times ৳22 + D_{\text{total}} \times ৳10$$

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons, Glassmorphism |
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech) / [Prisma ORM 6](https://www.prisma.io/) |
| **Authentication** | Encrypted HTTP-only JWT sessions with [jose](https://github.com/panva/jose) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Testing** | [Vitest](https://vitest.dev/) (14 unit & integration tests) |
| **Hosting** | [Vercel](https://vercel.com) (Continuous Deployment with automated database migrations) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm i -g pnpm`)

### 1. Clone & Install
```bash
git clone https://github.com/ishruq1317/khali-khai.git
cd khali-khai
pnpm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your database URL and secret:
```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
SESSION_SECRET="your-32-character-secret-key-goes-here-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration & Seed
```bash
pnpm db:push
pnpm db:seed
```

### 4. Run Automated Tests
```bash
pnpm test
```

### 5. Start Development Server
```bash
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Test Coverage

Run the test suite with `pnpm test`:
```
 ✓ tests/pricing.test.ts (5 tests)
 ✓ tests/logistics.test.ts (4 tests)
 ✓ tests/loyalty.test.ts (5 tests)

 Test Files  3 passed (3)
      Tests  14 passed (14)
   Duration  958ms
```

---

## 📞 Contact & Support

- **Live URL**: [https://khali-khai.vercel.app](https://khali-khai.vercel.app)
- **Phone / WhatsApp**: [01405080369](tel:01405080369) • [Chat on WhatsApp](https://wa.me/8801405080369)
- **Email**: [nabil12e4@gmail.com](mailto:nabil12e4@gmail.com)
- **Facebook**: [https://www.facebook.com/share/19grsqhXYj/](https://www.facebook.com/share/19grsqhXYj/)

---

<div align="center">
Made with ❤️ for Bangladesh 🇧🇩 • Powered by <b>খালি খাই</b> Engineering
</div>
