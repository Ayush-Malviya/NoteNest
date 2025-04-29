import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotes } from '../contexts/NotesContext';
import NoteCard from '../components/NoteCard';
import { ArrowRight, StickyNote as StickNote, LayoutList, MessageCircle, Users, Shield } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { publicNotes, loading } = useNotes();
  const [recentNotes, setRecentNotes] = useState<typeof publicNotes>([]);

  useEffect(() => {
    // Set a limited number of public notes to display
    setRecentNotes(publicNotes.slice(0, 3));
  }, [publicNotes]);

  const features = [
    {
      icon: <LayoutList className="w-6 h-6 text-primary-600" />,
      title: 'Organize Your Notes',
      description: 'Create, edit, and categorize your notes all in one place. Use tags to organize and find them quickly.',
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-primary-600" />,
      title: 'Collaborate & Comment',
      description: 'Share notes with others and have discussions through comments. Get feedback and collaborate in real-time.',
    },
    {
      icon: <Users className="w-6 h-6 text-primary-600" />,
      title: 'Sharing Controls',
      description: 'Choose exactly who can see your notes with flexible privacy controls. Share publicly or with specific users.',
    },
    {
      icon: <Shield className="w-6 h-6 text-primary-600" />,
      title: 'Secure & Private',
      description: 'Your notes are secured with modern encryption. Set notes as private by default, with options to share later.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 md:py-20 -mt-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Create, Share & Collaborate on Notes
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                NoteNest helps you capture your ideas, organize your thoughts, and collaborate with others in one beautiful, secure space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/dashboard" className="btn-primary text-center px-8 py-3">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary text-center px-8 py-3">
                      Get Started
                    </Link>
                    <Link to="/login" className="btn-secondary text-center px-8 py-3">
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl transform rotate-2"></div>
                <div className="relative bg-white rounded-xl shadow-xl p-6 z-10 transform -rotate-1 transition-transform hover:rotate-0 duration-300">
                  <div className="border-b pb-4 mb-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Project Meeting Notes</h3>
                  <div className="text-gray-700 mb-3">
                    <p className="mb-2">Team discussed:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>New feature implementation timeline</li>
                      <li>Budget allocation for Q3</li>
                      <li>Customer feedback integration</li>
                    </ul>
                    <p>Next meeting scheduled for Friday @ 10am</p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 text-sm">
                    <span className="text-gray-500">Updated 2 hours ago</span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full">Work</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features You'll Love</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to capture, organize, and share your notes effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start">
                  <div className="rounded-lg bg-primary-50 p-3 mr-4">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Recent Notes Section */}
      {recentNotes.length > 0 && !loading && (
        <section className="py-12">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Recently Shared Notes</h2>
              <Link to="/shared" className="text-primary-600 hover:text-primary-800 flex items-center font-medium">
                View all <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentNotes.map(note => (
                <NoteCard key={note.id} note={note} isOwner={false} />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <StickNote size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Start capturing your ideas today</h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of users who trust NoteNest to organize their thoughts and collaborate with their teams.
            </p>
            {user ? (
              <Link to="/notes/new" className="bg-white text-primary-700 hover:bg-gray-100 transition-colors duration-200 py-3 px-8 rounded-lg font-medium text-lg inline-block">
                Create a Note
              </Link>
            ) : (
              <Link to="/register" className="bg-white text-primary-700 hover:bg-gray-100 transition-colors duration-200 py-3 px-8 rounded-lg font-medium text-lg inline-block">
                Sign Up for Free
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;