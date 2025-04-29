import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotesProvider } from './contexts/NotesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NoteEditor from './pages/NoteEditor';
import NoteView from './pages/NoteView';
import SharedNotes from './pages/SharedNotes';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotesProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="notes/new" element={
                <ProtectedRoute>
                  <NoteEditor />
                </ProtectedRoute>
              } />
              
              <Route path="notes/:id" element={<NoteView />} />
              
              <Route path="notes/:id/edit" element={
                <ProtectedRoute>
                  <NoteEditor />
                </ProtectedRoute>
              } />
              
              <Route path="shared" element={
                <ProtectedRoute>
                  <SharedNotes />
                </ProtectedRoute>
              } />
              
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              } />
              
              <Route path="404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </NotesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;