import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertOctagon size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The requested route does not exist or has been relocated in the Brightloop workspace.
        </p>
        <Link to="/app/dashboard">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2">
            <Home size={15} />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

