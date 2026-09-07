import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  Star,
  Archive,
} from 'lucide-react';

interface MobileNavProps {
  onOpenQuickCapture: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenQuickCapture }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1522]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <LayoutDashboard size={20} />
        <span className="mt-0.5">Home</span>
      </NavLink>

      <NavLink
        to="/projects"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FolderKanban size={20} />
        <span className="mt-0.5">Projects</span>
      </NavLink>

      {/* Central Quick Add Action */}
      <button
        onClick={onOpenQuickCapture}
        className="flex items-center justify-center w-11 h-11 -mt-4 rounded-full bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30 active:scale-95 transition-all cursor-pointer border-2 border-[#0B0F17]"
        aria-label="Quick Add"
      >
        <Plus size={22} className="stroke-[2.5]" />
      </button>

      <NavLink
        to="/focus"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            isActive ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'
          }`
        }
      >
        <Star size={20} />
        <span className="mt-0.5">Focus</span>
      </NavLink>

      <NavLink
        to="/archive"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Archive size={20} />
        <span className="mt-0.5">Archive</span>
      </NavLink>
    </nav>
  );
};
