# খালি খাই (Khali Khai)
### AI-Powered Multi-Restaurant Food Delivery & Smart Shared Logistics Platform for Bangladesh

> **Product Vision**: "Different restaurants. One smart cart. One transparent delivery plan."  
> (*ভিন্ন রেস্টুরেন্ট। এক স্মার্ট কার্ট। এক স্বচ্ছ ডেলিভারি প্ল্যান।*)

---

## 1. Project Overview

**খালি খাই (Khali Khai)** is an end-to-end fullstack multi-restaurant food delivery and smart logistics optimization platform engineered specifically for the urban density of Bangladesh.

Unlike conventional food delivery platforms that restrict customers to a single restaurant per checkout or charge multiple independent delivery fees with separate riders, **খালি খাই** enables customers to combine their favorite dishes from multiple nearby restaurants into **one unified cart** and pay **one optimized shared delivery fee**, fulfilled by **one synchronized rider trip**.

---

## 2. Technology Stack & Architecture

- **Frontend & App Framework**: Next.js 16 (App Router, Turbopack, Dynamic Server Routes) with TypeScript.
- **Styling & UI**: Tailwind CSS v4, Lucide Icons, Glassmorphic Design System matching the brand palette (Warm Cream `#FFF9F0`, Soft Peach `#FFE2CF`, Sunset Coral `#FF5A36`, Amber Gold `#FFB300`, Teal `#0D8275`).
- **Kinetic Typography**: Staggered letter-by-letter left-to-right animated brand title ("খালি খাই" / "Khali Khai") appearing out of nowhere with a continuous ambient wave.
- **Database & Persistence**: Prisma ORM with SQLite for zero-configuration local execution and instant migration to PostgreSQL.
- **Security & Sessions**: Encrypted HTTP-only cookie sessions using `jose`, salted password hashing with `bcryptjs`, and strict server-side role-based authorization.
- **Geolocation & Routing**: HTML5 Geolocation API with Haversine distance matrix filtering within a strict 6–8 km radius of the user's location.
- **Test Automation**: Vitest automated test suite covering the Pricing Engine, Logistics Optimizer, and Monthly Loyalty Engine.
- **Internationalization (i18n)**: Default Bengali (`bn`) with immediate one-click English (`en`) switch.

---

## 3. Seeded Demo Accounts

All demo accounts are pre-seeded and available with one-click instant login on the `/login` portal:

| Role | Email | Password | Pre-configured Access & Scenarios |
|---|---|---|---|
| **Customer** | `demo.customer@example.com` | `KhaliKhai@2026` | 0 completed orders (15 to go for 25% reward), Radio Colony (Savar) & Dhanmondi addresses, multi-restaurant cart |
| **Restaurant Manager** | `demo.restaurant@example.com` | `KhaliKhai@2026` | Manages **সাভার কাচ্চি মহল**, real-time order acceptance, kitchen preparation time entry, ready-for-pickup actions |
| **Delivery Rider** | `demo.rider@example.com` | `KhaliKhai@2026` | Motorcycle rider, online/offline availability toggle, assigned multi-stop pickup sequence and delivery confirmations |
| **Platform Administrator** | `demo.admin@example.com` | `KhaliKhai@2026` | Platform KPIs, cluster radius configuration, loyalty thresholds, fee rates, live audit log |

---

## 4. Key Differentiators & Algorithmic Modules

### A. Separate vs. Combined Delivery Pricing Engine (`src/lib/pricing.ts`)
- **Separate Orders Model**: Computes what traditional platforms charge by summing independent delivery fees from each restaurant to the customer.
- **Combined Shared Delivery**: Applies the formula: `Base Fee (৳50) + Extra Stops (৳25 each) + Distance Fee (৳12/km)`.
- **First-Order Benefit**: ৳50 delivery discount applied exclusively to a customer's first order, automatically disabling for subsequent orders.
- **Transparent Customer Savings**: Real-time savings badge displayed throughout cart, checkout, and receipt.
- **Rider Compensation**: Guaranteed fair payout (`৳45 base + ৳22 per extra stop + ৳10/km`), ensuring sustainable operations without underpaying riders.

### B. Smart Logistics & Kitchen Preparation Synchronization (`src/lib/logistics.ts`)
- **Proximity Cluster Check**: Detects if selected restaurants are within the configurable 500–600m threshold.
- **Kitchen Ready-Time Synchronization**: Staggers rider dispatch so food from earlier restaurants does not sit cold in transit.
- **Holding Time Limit**: Prevents shared trips if the preparation gap exceeds 20 minutes.

### C. Monthly Loyalty Program (`src/lib/loyalty.ts`)
- **Asia/Dhaka Calendar Tracking**: Tracks completed qualifying parent orders strictly within a 30-day / calendar month window.
- **Qualification Rule**: Completing 15 qualifying parent orders unlocks a **flat 25% delivery discount** for the entire following calendar month.
- **Automatic 30-Day Reset**: Resets counter back to 0 completed and 15 to go when the new calendar month begins.

---

## 5. Local Setup Instructions

### Prerequisites
- Node.js 18+ (tested on Node.js v24.19.0)
- pnpm or npm

```bash
# Clone the repository
git clone https://github.com/<your-username>/khali-khai.git
cd khali-khai

# Install dependencies
pnpm install

# Push database schema & generate Prisma Client
pnpm db:push

# Seed demo users, clustered restaurants, and initial records
pnpm db:seed

# Run automated tests
pnpm test

# Start the development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. How to Push to Git / GitHub

```bash
# 1. Initialize git (if not already done)
git init
git branch -M main

# 2. Add all files and commit
git add .
git commit -m "Initial commit: Khali Khai - AI-Powered Multi-Restaurant Delivery Platform"

# 3. Link your remote GitHub repository
git remote add origin https://github.com/<your-username>/khali-khai.git

# 4. Push to GitHub
git push -u origin main
```

---

## 7. How to Deploy & Make It Live

### Option A: Vercel (Recommended for Next.js)
1. Push your code to GitHub (see Section 6).
2. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New..."** $\rightarrow$ **"Project"** and select `khali-khai`.
4. In **Environment Variables**, add:
   - `SESSION_SECRET`: `khali-khai-secret-jwt-key-minimum-32-chars-long-2026-bangladesh`
   - `NEXT_PUBLIC_APP_URL`: `https://your-project.vercel.app`
   - `DATABASE_URL`: Your PostgreSQL connection string (from [Neon](https://neon.tech) or [Supabase](https://supabase.com)).
5. Click **"Deploy"**. Vercel will build and deploy your application with a free `.vercel.app` domain and free automatic SSL/HTTPS!

### Option B: Railway / Render (Zero-Setup with SQLite or Postgres)
1. Go to [Railway.app](https://railway.app) or [Render.com](https://render.com).
2. Connect your GitHub repository.
3. Set the build command: `pnpm install && pnpm db:push && pnpm db:seed && pnpm build`
4. Set the start command: `pnpm start`
5. Railway / Render will provide a live URL instantly.

---

## 8. Automated Test Results

The automated test suite runs with `pnpm test`:
```
 ✓ tests/pricing.test.ts (5 tests)
 ✓ tests/logistics.test.ts (4 tests)
 ✓ tests/loyalty.test.ts (5 tests)

 Test Files  3 passed (3)
      Tests  14 passed (14)
```

---

## 9. Official Contact Details

- **Phone / WhatsApp**: [01405080369](tel:01405080369) | [WhatsApp Chat](https://wa.me/8801405080369)
- **Email**: [nabil12e4@gmail.com](mailto:nabil12e4@gmail.com)
- **Facebook**: [https://www.facebook.com/share/19grsqhXYj/](https://www.facebook.com/share/19grsqhXYj/)
