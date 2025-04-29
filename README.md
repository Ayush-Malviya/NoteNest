# NoteNest - Notes Sharing Application

**NoteNest** is a modern, responsive web application that allows users to create, store, and share notes in a seamless and secure way. Built using React for the frontend and Supabase for the backend, NoteNest aims to provide a minimal and efficient user experience for organizing and accessing personal or shared notes.

## 🚀 Features

- Create and manage personal notes
- Secure authentication and user management via Supabase
- Real-time data sync and storage
- Responsive UI with Tailwind CSS and Lucide icons
- Date-stamped notes using `date-fns`
- Easy navigation with React Router

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, React Router
- **Backend**: Supabase (PostgreSQL, Auth, Realtime DB)
- **Other Libraries**:
  - `@supabase/supabase-js`
  - `date-fns`
  - `lucide-react`

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Ayush-Malviya/NoteNest.git
cd NoteNest/project
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root with your Supabase project credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. Run the application:

```bash
npm run dev
```

Your app will now be live at `http://localhost:5173`.

## 📁 Folder Structure

```
project/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
├── .env
├── index.html
├── package.json
└── tailwind.config.js
```

## 📄 License

This project is licensed under the MIT License.

---

## 📬 Contact

**Ayush Malviya**  
Email: ayushmalviya81@gmail.com  
Enrollment: 0103AL221059  