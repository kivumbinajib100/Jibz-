import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  Plus,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  LogOut,
  ChevronDown,
  User,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { AcademicYear, Announcement, AdminUser } from '../types';
import { Badge, Btn, Modal } from './common/UI';

interface HeaderProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  academicYears: AcademicYear[];
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  announcements: Announcement[];
  onQuickAction: (actionType: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  currentUser: AdminUser | null;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
}

export function Header({
  mobileOpen,
  setMobileOpen,
  academicYears,
  selectedYear,
  setSelectedYear,
  announcements,
  onQuickAction,
  globalSearch,
  setGlobalSearch,
  currentUser,
  setCurrentTab,
  onLogout,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const initials = currentUser
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'ED';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full max-w-md">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, teachers, classes, records..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200/90 rounded-2xl text-xs sm:text-sm bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Academic Year Selector */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700">
          <Calendar size={14} className="text-indigo-600" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent font-bold focus:outline-none cursor-pointer"
          >
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.name}>
                {ay.name} ({ay.currentTerm})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Create Button & Dropdown */}
        <div className="relative">
          <Btn
            variant="primary"
            className="!px-3 !py-1.5 text-xs font-bold"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
          >
            <Plus size={16} />
            <span className="hidden md:inline">Quick Action</span>
          </Btn>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in duration-150">
              <button
                onClick={() => {
                  onQuickAction('student');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                + Add Student
              </button>
              <button
                onClick={() => {
                  onQuickAction('teacher');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                + Add Teacher
              </button>
              <button
                onClick={() => {
                  onQuickAction('attendance');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                + Mark Attendance
              </button>
              <button
                onClick={() => {
                  onQuickAction('fee');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                + Record Fee Payment
              </button>
              <button
                onClick={() => {
                  onQuickAction('announcement');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                + Post Announcement
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
          >
            <Bell size={19} />
            {announcements.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Bell size={16} className="text-indigo-600" />
                  System Notifications
                </h4>
                <Badge tone="blue">{announcements.length} Active</Badge>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{a.title}</span>
                      <span className="text-[10px] text-slate-400">{a.time}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover border border-indigo-200 shadow-xs"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-xl ${
                  currentUser?.avatarColor || 'bg-indigo-600'
                } text-white font-black text-xs flex items-center justify-center shadow-xs`}
              >
                {initials}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-bold text-slate-800">
              {currentUser?.name || 'User Profile'}
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 z-50 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-2.5 mb-1.5 px-2">
                <p className="font-bold text-sm text-slate-900">{currentUser?.name || 'Staff User'}</p>
                <p className="text-xs text-indigo-600 font-semibold">{currentUser?.role || 'Staff'}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{currentUser?.email}</p>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setCurrentTab('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User size={15} className="text-indigo-600" /> My Profile & Security
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download size={15} className="text-emerald-600" /> Backup System State (JSON)
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('admins');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={15} className="text-indigo-600" /> Admin Accounts
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
