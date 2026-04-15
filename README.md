# 🌿 MindEase – Frontend

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://mindease2110.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**MindEase** is a compassionate mental health companion that helps users manage depression, track daily emotions, practice gratitude, set affirmations, and build healthy routines. This repository contains the **React frontend** – a responsive, modern web app that communicates with the MindEase backend API.

🔗 **Live Demo:** [https://mindease2110.netlify.app](https://mindease2110.netlify.app)

---

## ✨ Features

- 🔐 **Secure Authentication** – Register, login, and OTP email verification (via Brevo/SendGrid).
- 😊 **Hourly Emotion Tracker** – Log mood every 2 hours, create custom time blocks.
- 📅 **Calendar Overview** – See daily emotional summaries (positive/neutral/negative).
- ✅ **Daily Self‑Care Rituals** – Predefined routine checklist with progress.
- 📝 **Task Manager** – Create, prioritise, and track tasks.
- 💬 **Affirmations** – Add positive statements, repeat them daily, track monthly goals.
- 🙏 **Gratitude Journal** – Write about people, things, and situations you’re grateful for.
- 🧘 **Therapy Exercises** – Hot potato, forgiveness, self‑talk, receiving & responding.
- ✍️ **Letters to Myself** – Write letters to your future self, mark them as read.
- 🎯 **Ikigai Discovery** – Explore the intersection of love, skill, world need, and earning.
- 🧠 **React vs Response** – Log angry moments and choose mindful response over impulsive reaction.
- 📱 **Fully Responsive** – Works seamlessly on mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

- **React 18** – UI library
- **React Router v6** – Client‑side routing
- **Axios** – HTTP requests
- **Tailwind CSS** – Styling (with custom glassmorphic components)
- **Formik + Yup** – Form handling & validation
- **Context API** – Global authentication state

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mindease-frontend.git
cd mindease-frontend

# Install dependencies
npm install

# Create .env file (see below)
cp .env.example .env

# Start development server
npm start
