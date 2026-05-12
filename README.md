# 🌿 Sanctuary Wellness

Welcome to **Sanctuary**, a premium mental health and wellness platform designed to bridge the gap between students seeking emotional support and professional counsellors ready to help.

🌐 **Live Demo:** [sanctuary-wellness-seven.vercel.app](https://sanctuary-wellness-seven.vercel.app)

---

## ✨ Features

### For Students
*   **🧠 Sanctuary AI Companion:** An empathetic AI chatbot available 24/7 to listen and provide immediate support (powered by HuggingFace).
*   **📊 Interactive Mood Tracker:** Log your daily moods, add journal notes, and visualize your emotional rhythm over 30-day analytics charts.
*   **🌬️ Guided Breathing:** Integrated 4-7-8 breathing exercises to help manage acute stress and anxiety.
*   **👨‍⚕️ Counsellor Matching:** Browse verified professionals, view their specializations, and request calls seamlessly.
*   **📚 Resource Library:** Explore a curated collection of mental health articles and YouTube video resources tailored to topics like Stress, Anxiety, and Motivation.

### For Counsellors
*   **📥 Request Inbox:** Efficiently manage incoming support requests from students.
*   **📅 Schedule Management:** Set and easily modify your availability slots.
*   **🤝 Session Tracking:** Keep track of accepted, pending, and completed student sessions.
*   **📖 Resource Curation:** Upload and share helpful articles and videos directly to the student portal.

### 🎨 UX & Design Philosophy
Sanctuary prioritizes a calming, premium user experience.
*   **Modern Aesthetics:** Utilizes a soothing Sage, Olive, and Lavender color palette with a glassmorphism design system.
*   **Fluid Animations:** Highly optimized CSS staggered entrance animations and smooth transitions.
*   **Skeleton Loading:** Native skeleton placeholders prevent layout shifts during data fetching for a frictionless experience.
*   **Mobile-First:** Fully responsive design with intuitive bottom-tab navigation for mobile users.

---

## 🛠️ Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Modern CSS Modules / Variables (No Tailwind reliance)
*   **AI Integration:** HuggingFace Inference API (`deepseek-ai` / `Ling-2.6-1T`)
*   **Database / Auth:** PostgreSQL (Supabase / Neon)
*   **Hosting:** Vercel

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/sanctuary-wellness.git
   cd sanctuary-wellness
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add the necessary API keys:
   ```env
   # Example
   HUGGINGFACE_API_KEY=your_huggingface_token
   # Add your database/auth URIs here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

---

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests for bug fixes, new features, or design improvements.

## 📄 License
This project is licensed under the MIT License.
