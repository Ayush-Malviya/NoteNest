import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-50 text-red-600 p-3 rounded-full mb-4">
        <AlertTriangle size={36} />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/" className="btn-primary inline-flex items-center justify-center">
          <ArrowLeft size={18} className="mr-2" />
          Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="btn-secondary inline-flex items-center justify-center"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;