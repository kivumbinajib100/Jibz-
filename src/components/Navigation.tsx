import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Library,
  ClipboardList,
  Award,
  DollarSign,
  CalendarDays,
  Calendar,
  Megaphone,
  BarChart3,
  UserCog,
  SlidersHorizontal,
  School,
  ChevronLeft,
  ChevronRight,
  X,
  User,
} from 'lucide-react';
import { AdminUser } from '../types';

export interface NavItem {
  key: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'students', icon: Users, label: 'Students' },
  { key: 'teachers', icon: GraduationCap, label: 'Teachers' },
  { key: 'classes', icon: BookOpen, label: 'Classes' },
  { key: 'subjects', icon: Library, label: 'Subjects' },
  { key: 'attendance', icon: ClipboardList, label: 'Attendance' },
  { key: 'grades', icon: Award, label: 'Grades' },
  { key: 'fees', icon: DollarSign, label: 'Fees' },
  { key: 'academic-years', icon: CalendarDays, label: 'Academic Years' },
  { key: 'timetable', icon: Calendar, label: 'Timetable' },
  { key: 'announcements', icon: Megaphone, label: 'Announcements' },
  { key: 'reports', icon: BarChart3, label: 'Reports' },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { key: 'profile', icon: User, label: 'My Profile' },
  { key: 'admins', icon: UserCog, label: 'Admin Accounts' },
  { key: 'grade-scale', icon: SlidersHorizontal, label: 'Grading Scale' },
];

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  currentUser: AdminUser | null;
  onLogout: () => void;
  customLogo?: string | null;
  appName?: string;
}

export function Sidebar({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  currentUser,
  onLogout,
  customLogo,
  appName = 'EduManage Portal',
}: NavigationProps) {
  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-4">
      {!collapsed && (
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setCurrentTab(item.key);
                setMobileOpen(false);
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon size={18} className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {customLogo ? (
              <img
                src={customLogo}
                alt="School Logo"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-100">
                <School size={20} />
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="font-extrabold text-slate-900 text-sm leading-tight truncate">
                  {appName}
                </h2>
                <p className="text-[10px] font-semibold text-indigo-600 truncate">
                  School Admin Portal
                </p>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 items-center justify-center transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {renderNavGroup('Main Menu', NAV_ITEMS)}
          {renderNavGroup('Administration', ADMIN_NAV_ITEMS)}
        </div>

        {/* Footer Info Badge */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          {!collapsed ? (
            <button
              onClick={() => setCurrentTab('profile')}
              title="View Profile & Security"
              className="w-full text-left flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-indigo-200 flex-shrink-0 shadow-xs"
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded-lg ${
                      currentUser?.avatarColor || 'bg-indigo-600'
                    } text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0`}
                  >
                    {currentUser
                      ? currentUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                      : 'ED'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    {currentUser?.name || 'Staff User'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser?.role || 'Staff'}</p>
                </div>
              </div>
            </button>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentTab('profile')}
                title={`${currentUser?.name || 'User'} (${currentUser?.role})`}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover border border-indigo-200 shadow-xs"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-xl ${
                      currentUser?.avatarColor || 'bg-indigo-600'
                    } text-white flex items-center justify-center font-bold text-xs`}
                  >
                    {currentUser
                      ? currentUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                      : 'ED'}
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
