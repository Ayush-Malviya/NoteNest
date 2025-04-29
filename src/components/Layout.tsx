import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { StickyNote as StickNote, LogOut, Menu, X, User, Bell, Home, Folder, Share2, Settings, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/supabase';

const Layout = () => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    } else {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={20} />, showAlways: true },
    { name: 'Dashboard', path: '/dashboard', icon: <Folder size={20} />, requireAuth: true },
    { name: 'Shared', path: '/shared', icon: <Share2 size={20} />, requireAuth: true },
    { name: 'Profile', path: '/profile', icon: <User size={20} />, requireAuth: true },
    { name: 'Admin', path: '/admin', icon: <Shield size={20} />, requireAdmin: true },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm z-10">
        <div className="container-custom">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center space-x-2 text-primary-600">
              <StickNote size={28} />
              <span className="text-xl font-bold">NoteNest</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex items-center space-x-6">
                {navLinks.map((link) => {
                  if (!link.showAlways && !user) return null;
                  if (link.requireAdmin && !isAdmin) return null;
                  if (link.requireAuth && !user) return null;
                  
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center space-x-1 py-2 text-sm font-medium transition-colors duration-200 ${
                        isActive(link.path)
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              {!loading && (
                <div className="flex items-center space-x-4">
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-1 text-gray-700 hover:text-primary-600"
                      aria-label="Sign out"
                    >
                      <LogOut size={20} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <Link
                        to="/login"
                        className="text-sm font-medium text-gray-700 hover:text-primary-600"
                      >
                        Log in
                      </Link>
                      <Link to="/register" className="btn-primary">
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg py-4 animate-slide-down">
            <div className="container-custom">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => {
                  if (!link.showAlways && !user) return null;
                  if (link.requireAdmin && !isAdmin) return null;
                  if (link.requireAuth && !user) return null;
                  
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center space-x-2 p-2 rounded-lg ${
                        isActive(link.path)
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
                
                {user ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    <Link
                      to="/login"
                      className="btn-secondary w-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary w-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-grow container-custom py-6">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <StickNote size={20} className="text-primary-600" />
              <span className="font-semibold">NoteNest</span>
            </div>
            <div className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} NoteNest. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;