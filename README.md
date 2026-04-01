# Flow - Modern Real-time Kanban Board

**Flow** is a high-performance, real-time Kanban application designed for seamless team collaboration. Built with Next.js 15 and Supabase, it offers a smooth, desktop-like experience for managing projects and tracking progress.

🚀 [Live Demo (Placeholder)](https://flow-kanban.vercel.app/)

## ✨ Key Features

- **Real-time Synchronization**: Boards and cards sync instantly across all connected clients using Supabase Realtime.
- **Customizable Workspace**: Personalize your boards with a curated selection of beautiful gradients and solid color backgrounds.
- **Advanced Collaboration**:
  - Invite members via email or shareable links.
  - Role-Based Access Control (RBAC): Owner, Editor, and Viewer roles.
  - Real-time collaborator presence indicators.
- **Dark Mode Support**: A global dark theme that intelligently preserves board-specific branding and colors.
- **Activity Feed**: A complete audit trail of board modifications, card moves, and member updates.
- **Responsive Design**: Optimized for both desktop and mobile productivity.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Real-time**: Supabase Realtime (WebSockets)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase Project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/omshrihari/flow.git
   cd flow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is private and for demonstration purposes.
