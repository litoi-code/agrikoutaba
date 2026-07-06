
# AgriKoutaba: Agricultural Management Platform

AgriKoutaba is a specialized farm management system designed to empower small-scale farmers in Cameroon with professional-grade tools for inventory, finance, and operations.

## Purpose
The primary purpose of AgriKoutaba is to digitize the "paper and pencil" records common in Cameroonian agriculture. By centralizing operations into a mobile-friendly dashboard, it provides farmers with real-time insights into their business health, moving them from subsistence farming to data-driven agribusiness.

## Administrative Setup
To access all features (including Team Management and Data Editing), you must be an **Admin**.
1. **Security Policy**: By default, all new accounts are registered with a "Worker" role (view-only) for security.
2. **First Admin**: The designated owner email (`mbongmebiang@gmail.com`) is automatically granted **Admin** privileges upon registration.
3. **Managing the Team**: Once signed in as an Admin, you can upgrade other users' roles (to Manager or Admin) under **Settings > Team Management**.
4. **Login**: Go to the **Sign Up** page to create your account or **Log In** if you already have one.

## How it helps a small farm in Cameroon
1.  **Production Tracking**: Map your land into plots and launch specific crop cycles. Calculate your actual cost of production versus your sales income to see your true profit per crop.
2.  **Labor Management**: Assign workers to specific crop cycles and record their wages in FCFA. The system automatically logs these as expenses against the production cycle, ensuring accurate profit calculation.
3.  **Financial Control (FCFA)**: Manage all transactions in the local currency. Track income from harvests versus expenses on seeds and fertilizers.
4.  **Inventory Optimization**: Log farm inputs (planning phase) and produce (harvest phase). Avoid "stock-outs" of critical fertilizers or over-ordering seeds.
5.  **Worker Coordination**: Assign tasks to field workers and track completion. This is vital during high-intensity periods like clearing, planting, or harvesting.
6.  **Investor Readiness**: Track micro-investments and equity. Having a digital record of growth and finances makes a farm much more likely to secure loans or investments.

## Tech Stack
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Frontend**: [React](https://react.dev/) & [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/) (Radix UI)
-   **Backend/Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
-   **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
-   **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) (English/French)

## How to Publish Online for Free

### 1. Vercel (Recommended for Next.js)
1.  Push your code to a GitHub repository.
2.  Connect your GitHub to [Vercel.com](https://vercel.com).
3.  Add your Firebase configuration as environment variables.
4.  Click **Deploy**.

### 2. Firebase Hosting
1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Run `firebase login` and `firebase init hosting`.
3.  Build the app: `npm run build`.
4.  Deploy: `firebase deploy`.
