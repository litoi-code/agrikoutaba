# AgriKoutaba: Agricultural Management Platform

AgriKoutaba is a specialized farm management system designed to empower small-scale farmers in Cameroon with professional-grade tools for inventory, finance, and operations.

## Purpose
The primary purpose of AgriKoutaba is to digitize the "paper and pencil" records common in Cameroonian agriculture. By centralizing operations into a mobile-friendly dashboard, it provides farmers with real-time insights into their business health, moving them from subsistence farming to data-driven agribusiness.

## How it helps a small farm in Cameroon
1.  **Financial Control (FCFA)**: Manage all transactions in the local currency. Track income from harvests versus expenses on seeds and fertilizers to understand actual profit.
2.  **Inventory Optimization**: Log farm inputs (planning phase) and produce (harvest phase). Avoid "stock-outs" of critical fertilizers or over-ordering seeds.
3.  **Worker Coordination**: Assign tasks to field workers and track completion. This is vital during high-intensity periods like clearing, planting, or harvesting.
4.  **Investor Readiness**: Track micro-investments and equity. Having a digital record of growth and finances makes a farm much more likely to secure loans or investments from regional banks or cooperatives.
5.  **Offline-Ready**: Built with Firebase's local cache capabilities, allowing farmers to view data even in areas with spotty internet connectivity.

## Tech Stack
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Frontend**: [React](https://react.dev/) & [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/) (Radix UI)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Backend/Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (Real-time NoSQL)
-   **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
-   **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) (English/French support)

## How to Publish Online for Free

### 1. Firebase Hosting (Recommended)
Since the app already uses Firebase, you can use the **Firebase Spark Plan** (Free):
1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Run `firebase login` and `firebase init`.
3.  Build the app: `npm run build`.
4.  Deploy: `firebase deploy`.

### 2. Vercel (Easiest for Next.js)
Vercel is the creator of Next.js and offers an excellent free tier for personal projects:
1.  Push your code to a GitHub repository.
2.  Go to [Vercel.com](https://vercel.com) and click "Add New Project".
3.  Import your GitHub repo.
4.  Add your Firebase Environment Variables (from `src/firebase/config.ts`) in the Vercel dashboard.
5.  Click **Deploy**.

### 3. Netlify
Similar to Vercel:
1.  Connect your GitHub repo to Netlify.
2.  Configure the build command as `next build`.
3.  The app will be published on a `.netlify.app` subdomain for free.
