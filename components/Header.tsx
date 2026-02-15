
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-emerald-700 text-white p-4 shadow-md flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <div className="bg-white p-2 rounded-full shadow-inner">
          <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold">CA Final IDT Expert AI</h1>
          <p className="text-xs text-emerald-100 uppercase tracking-widest font-medium">Finance Act 2025 • Sep '25 Amendments</p>
        </div>
      </div>
      <div className="hidden md:flex items-center space-x-4">
        <span className="bg-emerald-600 px-3 py-1 rounded text-xs font-semibold">Bilingual (Simple Lang)</span>
        <span className="bg-emerald-600 px-3 py-1 rounded text-xs font-semibold">Practical Case Studies</span>
      </div>
    </header>
  );
};

export default Header;
