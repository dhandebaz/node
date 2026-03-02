# Nodebase

**Nodebase** is the intelligent workforce for Indian businesses. We provide AI Employees that automate complex business operations, from hospitality management to retail and healthcare.

## AI Employees

Our platform offers specialized AI agents:

-   **Host AI**: For Airbnb/Hotel hosts. Manages bookings, guest communication, and scheduling.
-   **Dukan AI**: For retail businesses. Handles inventory, orders, and customer queries.
-   **Nurse AI**: For healthcare. Manages patient appointments and follow-ups.
-   **Thrift AI**: For finance. Automates expense tracking and basic accounting.

## Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Database & Auth**: Supabase
-   **AI**: Google Gemini / OpenAI
-   **State Management**: Zustand

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-org/nodebase.git
    cd nodebase
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy `.env.example` to `.env.local` and fill in your Supabase and AI provider credentials.
    ```bash
    cp .env.example .env.local
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

-   `src/app/(public)`: Marketing and legal pages.
-   `src/app/(customer)`: Customer dashboard (protected).
-   `src/app/(admin)`: Admin dashboard (protected).
-   `src/components`: Reusable UI components.
-   `src/lib`: Core utilities, API clients, and service logic.
-   `src/store`: Global state management.

## Deployment

Deploy on **Vercel** for optimal performance with Next.js. Ensure all environment variables are configured in the Vercel dashboard.

## License

&copy; 2026 Nodebase. All rights reserved.
