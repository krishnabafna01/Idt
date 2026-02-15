
import React from 'react';

interface SidebarProps {
  chapters: string[];
  onSelectChapter: (chapter: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chapters, onSelectChapter }) => {
  return (
    <aside className="w-64 bg-slate-900 h-full flex flex-col text-slate-300 hidden lg:flex flex-shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-emerald-400 font-bold text-lg uppercase tracking-wider">Digest Chapters</h2>
        <p className="text-[10px] text-slate-500 mt-1 italic">Click to jump-start concepts</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {chapters.map((chapter, idx) => (
          <button
            key={idx}
            onClick={() => onSelectChapter(chapter)}
            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center group"
          >
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2 opacity-50 group-hover:opacity-100"></span>
            {chapter}
          </button>
        ))}
      </nav>
      <div className="p-4 bg-slate-800/50 mt-auto text-[10px] text-center text-slate-400 border-t border-slate-700">
        <p>© RG Learning Hub • Nikita Tinker (AIR 20)</p>
        <p className="mt-1 font-semibold text-emerald-500">Fully Amended for 2025/26</p>
      </div>
    </aside>
  );
};

export default Sidebar;
