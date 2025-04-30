# NoteNest - Notes Sharing Application

**NoteNest** is a modern, responsive web application that allows users to create, store, and share notes in a seamless and secure way. Built using React for the frontend and Supabase for the backend, NoteNest aims to provide a minimal and efficient user experience for organizing and accessing personal or shared notes.

## 🚀 Features

- **Create and Manage Notes**: Easily add, edit, and delete notes.
- **User Authentication**: Secure sign-up and login using Supabase Auth.
- **Real-time Synchronization**: Notes update instantly across devices.
- **Responsive Design**: Optimized for desktops, tablets, and mobile devices.
- **Categorization and Tagging**: Organize notes with categories and tags.
- **Search Functionality**: Quickly find notes using keywords.

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
cd NoteNest
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

## 📷 Screenshots

![image](https://github.com/user-attachments/assets/cf0d3fde-33e4-4903-874f-aad40e44f34b)
![image](https://github.com/user-attachments/assets/2f11ea02-07ae-4c3f-87e6-9290daee94bb)
![image](https://github.com/user-attachments/assets/c4ebee87-0399-4be0-aba4-e653ead773eb)
![image](https://github.com/user-attachments/assets/bf803b81-6d9e-4bf4-a7df-0a6319d07bbc)
![image](https://github.com/user-attachments/assets/45ba627b-e534-41f5-8484-d53ba2a7cd93)
![image](https://github.com/user-attachments/assets/1119a02a-c2a0-402e-bf18-630862c60960)
![image](https://github.com/user-attachments/assets/19eab9c6-219b-4ca5-bc08-2727c1bdfbb0)
![image](https://github.com/user-attachments/assets/2f54397d-b34e-4514-92c2-304576273216)
![image](https://github.com/user-attachments/assets/c60ff7b2-a1a4-420c-bd9e-479d9e03be57)


## 📁 Folder Structure

```
NoteNest/
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

For any inquiries or feedback, please contact [ayushmalviya81@gmail.com](mailto:ayushmalviya81@gmail.com).
