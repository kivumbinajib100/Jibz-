import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Smartphone,
  Globe,
  Bell,
  Save,
  Check,
  Upload,
  School,
  Edit,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Download,
  Database,
  HardDrive,
  FileJson,
  UploadCloud,
} from 'lucide-react';
import { AdminUser, ActivityLog, Role } from '../types';
import { Card, Badge, Btn, Input, Label, PageHeader, ConfirmDialog } from '../components/common/UI';
import {
  downloadFullSystemBackup,
  getLocalStorageBackupSummary,
  restoreSystemBackup,
} from '../utils/backupRestore';

interface ProfilePageProps {
  currentUser: AdminUser;
  setCurrentUser: (user: AdminUser) => void;
  admins: AdminUser[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  activityLogs: ActivityLog[];
  onAddActivity: (action: string) => void;
  onLogout: () => void;
  customLogo?: string | null;
  setCustomLogo?: (logo: string | null) => void;
  appName?: string;
  setAppName?: (name: string) => void;
  onSystemReset?: () => void;
}

export function ProfilePage({
  currentUser,
  setCurrentUser,
  admins,
  setAdmins,
  activityLogs,
  onAddActivity,
  onLogout,
  customLogo,
  setCustomLogo,
  appName = 'EduManage Portal',
  setAppName,
  onSystemReset,
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'security' | 'preferences' | 'backup' | 'reset'>('overview');

  const isUserNajib = currentUser.username.toLowerCase() === 'najib';

  // System backup and restore states
  const [backupNotice, setBackupNotice] = useState('');
  const [restoreFileText, setRestoreFileText] = useState('');
  const [restoreFileName, setRestoreFileName] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const handleDownloadBackup = () => {
    const res = downloadFullSystemBackup(
      appName,
      currentUser.name,
      currentUser.username,
      currentUser.role
    );
    if (res.success) {
      onAddActivity(`Downloaded full application state JSON backup (${res.fileName}, ${res.sizeKB} KB)`);
      setBackupNotice(`Backup exported: "${res.fileName}" (${res.sizeKB} KB, ${res.keyCount} storage records)`);
      setTimeout(() => setBackupNotice(''), 7000);
    }
  };

  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestoreFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) {
          setRestoreFileText(text);
          setShowRestoreConfirm(true);
        }
      };
      reader.readAsText(file);
    }
    // reset input value so re-uploading same file works
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!restoreFileText) return;
    const res = restoreSystemBackup(restoreFileText);
    setShowRestoreConfirm(false);
    if (res.success) {
      onAddActivity(`Restored full application state from JSON backup file (${restoreFileName})`);
      setBackupNotice(res.message + ' Reloading system application...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      alert(`Restore failed: ${res.message}`);
    }
  };

  // System reset confirmation states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Edit profile form state
  const [editForm, setEditForm] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '+256 700 123456',
    department: currentUser.department || 'Administrative Office',
    bio: currentUser.bio || 'School administrative staff member.',
    avatarColor: currentUser.avatarColor || 'bg-indigo-600',
    avatarUrl: currentUser.avatarUrl || '',
  });

  const [customAppName, setCustomAppName] = useState(appName);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Security password change form state
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Preferences state
  const [notifications, setNotifications] = useState({
    emailGrades: true,
    emailFees: true,
    emailAnnouncements: true,
    browserAlerts: true,
  });

  // Logout confirm modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Avatar Initials
  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Update app name if user is Najib
    if (isUserNajib && setAppName && customAppName.trim()) {
      setAppName(customAppName.trim());
      onAddActivity(`Updated school application name to '${customAppName.trim()}'`);
    }

    const updated: AdminUser = {
      ...currentUser,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      department: editForm.department,
      bio: editForm.bio,
      avatarColor: editForm.avatarColor,
      avatarUrl: editForm.avatarUrl,
    };

    setCurrentUser(updated);

    // Also update in admins list if present
    setAdmins((prev) =>
      prev.map((a) => (a.id === updated.id || a.username === updated.username ? updated : a))
    );

    onAddActivity(`Updated personal profile details (${updated.name})`);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (!passForm.currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setPassSuccess(true);
    setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    onAddActivity(`Updated account password for ${currentUser.name}`);
    setTimeout(() => setPassSuccess(false), 4000);
  };

  // Helper for role permissions based on currentUser.role
  const getRolePermissions = (role: Role | string) => {
    const allPermissions = [
      { key: 'students', label: 'Manage Student Profiles & Enrollments', roles: ['Super Admin', 'Registrar'] },
      { key: 'teachers', label: 'Manage Teaching Staff & Assignments', roles: ['Super Admin'] },
      { key: 'attendance', label: 'Mark & Audit Student Attendance', roles: ['Super Admin', 'Registrar', 'Teacher'] },
      { key: 'grades', label: 'Enter & Edit Exam Marks & Grades', roles: ['Super Admin', 'Registrar', 'Teacher'] },
      { key: 'fees', label: 'Record Fee Payments & Audit Ledgers', roles: ['Super Admin', 'Accountant'] },
      { key: 'announcements', label: 'Post System Announcements', roles: ['Super Admin', 'Registrar', 'Accountant', 'Teacher'] },
      { key: 'admins', label: 'Create & Modify Admin Accounts', roles: ['Super Admin'] },
      { key: 'reports', label: 'Generate System Analytics & Transcripts', roles: ['Super Admin', 'Accountant', 'Registrar'] },
    ];

    return allPermissions.map((p) => ({
      ...p,
      allowed: isUserNajib || p.roles.includes(role),
    }));
  };

  // Activity logs filter
  const userLogs = activityLogs.filter((l) => {
    if (isUserNajib) {
      return l.who.toLowerCase().includes(currentUser.name.toLowerCase()) || l.who.toLowerCase().includes('najib');
    }
    // Non-Najib users see logs that do not involve Najib
    return !l.who.toLowerCase().includes('najib') && !l.action.toLowerCase().includes('najib');
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile & System Settings"
        sub="Manage personal account details, app identity, credentials, state backups, and security preferences."
      >
        <div className="flex items-center gap-2">
          <Btn
            variant="secondary"
            className="!bg-emerald-50 !text-emerald-700 !border-emerald-200 hover:!bg-emerald-100"
            onClick={handleDownloadBackup}
          >
            <Download size={16} className="text-emerald-600" /> Download JSON Backup
          </Btn>
          <Btn
            variant="secondary"
            className="!border-red-200 !text-red-600 hover:!bg-red-50"
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw size={16} /> System Reset
          </Btn>
          <Btn variant="danger" onClick={() => setShowLogoutConfirm(true)}>
            <LogOut size={16} /> Sign Out
          </Btn>
        </div>
      </PageHeader>

      {backupNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>{backupNotice}</span>
          </div>
          <button
            onClick={() => setBackupNotice('')}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer font-extrabold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Header Profile Card */}
      <Card className="!p-0 overflow-hidden border-slate-200 shadow-sm">
        {/* Cover Graphic Banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 relative p-6 flex items-end">
          <div className="absolute inset-0 bg-[radial-gradient(#circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="relative z-10 flex items-center justify-between w-full">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/30 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-300" /> Authorized Staff Session
            </span>
          </div>
        </div>

        {/* Profile Identity Row */}
        <div className="p-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl flex-shrink-0"
              />
            ) : (
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ${
                  currentUser.avatarColor || 'bg-indigo-600'
                } text-white font-black text-2xl sm:text-3xl flex items-center justify-center border-4 border-white shadow-xl flex-shrink-0`}
              >
                {initials}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900">{currentUser.name}</h2>
                <Badge tone="blue">{currentUser.role}</Badge>
                <Badge tone={currentUser.status === 'active' ? 'green' : 'red'}>
                  {currentUser.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs font-mono font-bold text-indigo-600">@{currentUser.username}</p>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Mail size={13} className="text-slate-400" /> {currentUser.email} •{' '}
                <Phone size={13} className="text-slate-400" /> {currentUser.phone || '+256 700 123456'}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 self-stretch sm:self-auto">
            <p className="font-medium text-slate-700">Department: <strong className="text-slate-900">{currentUser.department || 'Executive'}</strong></p>
            <p className="flex items-center justify-start sm:justify-end gap-1.5 text-slate-500 text-[11px]">
              <Clock size={12} /> Last active: {currentUser.lastLogin}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-t border-slate-100 bg-slate-50/70 px-6 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Account Overview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'edit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Security & Passwords
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-emerald-700'
            }`}
          >
            <Download size={14} className="text-emerald-600" /> Backup & Restore
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reset'
                ? 'border-red-600 text-red-600 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-red-600'
            }`}
          >
            <RotateCcw size={14} className="text-red-500" /> System Reset
          </button>
        </div>
      </Card>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User size={18} className="text-indigo-600" /> Account Details
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Full Name</span>
                  <span className="font-bold text-slate-800 text-sm">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">System Role</span>
                  <span className="font-bold text-slate-800">{currentUser.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Username</span>
                  <span className="font-mono text-indigo-600 font-semibold">@{currentUser.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Email Address</span>
                  <span className="text-slate-800 font-medium">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Phone Number</span>
                  <span className="text-slate-800 font-medium">{currentUser.phone || '+256 700 123456'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Department</span>
                  <span className="text-slate-800 font-medium">{currentUser.department || 'Administration'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Bio / Summary</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{currentUser.bio || 'No bio provided.'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Role Permissions & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Granted System Permissions Matrix */}
            <Card>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" /> System Permissions Matrix
                </h3>
                <Badge tone="purple">{currentUser.role}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getRolePermissions(currentUser.role).map((perm) => (
                  <div
                    key={perm.key}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                      perm.allowed
                        ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
                        : 'bg-slate-50 border-slate-200/60 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold">{perm.label}</span>
                    {perm.allowed ? (
                      <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700 flex items-center gap-1 font-bold text-[10px]">
                        <Check size={12} /> Granted
                      </span>
                    ) : (
                      <span className="p-1 rounded-lg bg-slate-200 text-slate-500 font-medium text-[10px]">
                        Restricted
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Activity History */}
            <Card>
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Clock size={18} className="text-indigo-600" /> Recent Activity Log
              </h3>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {userLogs.length > 0 ? (
                  userLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800">{log.action}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">By {log.who}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        {log.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-4">No recent activity recorded.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Edit Profile */}
      {activeTab === 'edit' && (
        <Card className="max-w-3xl">
          <h3 className="font-bold text-slate-900 text-lg mb-2">Edit Personal Information</h3>
          <p className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-3">
            Update your public display name, work contact details, and custom app configurations.
          </p>

          {profileSaveSuccess && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" /> Profile & settings saved successfully!
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            {/* Requirement: "edit app name under profile by only user Najib" */}
            {isUserNajib && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 mb-4">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1.5">
                  <Edit size={15} className="text-indigo-600" /> App / School System Name (Only editable by Najib)
                </div>
                <Input
                  value={customAppName}
                  onChange={(e) => setCustomAppName(e.target.value)}
                  placeholder="e.g. St. Jude Academy Portal"
                  className="mt-1"
                />
                <p className="text-[11px] text-indigo-700 mt-1">
                  This custom title appears on the top navigation bar and reports across the entire system.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Work Email Address *</Label>
                <Input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Department / Division</Label>
                <Input
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Profile Picture Customization</Label>
              <div className="flex items-center gap-4 mt-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                {editForm.avatarUrl ? (
                  <img
                    src={editForm.avatarUrl}
                    alt="Avatar Preview"
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-2xl ${
                      editForm.avatarColor || 'bg-indigo-600'
                    } text-white font-black flex items-center justify-center text-sm shadow-xs`}
                  >
                    {initials}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                    <Upload size={14} /> Upload Custom Profile Picture
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setEditForm({ ...editForm, avatarUrl: ev.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {editForm.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, avatarUrl: '' })}
                      className="block text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                    >
                      Remove Custom Profile Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label>Avatar Color Theme (Fallback)</Label>
              <div className="flex gap-3 pt-1">
                {[
                  { name: 'Indigo', class: 'bg-indigo-600' },
                  { name: 'Emerald', class: 'bg-emerald-600' },
                  { name: 'Amber', class: 'bg-amber-600' },
                  { name: 'Purple', class: 'bg-purple-600' },
                  { name: 'Rose', class: 'bg-rose-600' },
                ].map((color) => (
                  <button
                    key={color.class}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, avatarColor: color.class })}
                    className={`w-9 h-9 rounded-xl ${color.class} flex items-center justify-center text-white cursor-pointer transition-transform ${
                      editForm.avatarColor === color.class ? 'ring-4 ring-indigo-200 scale-110' : 'opacity-80'
                    }`}
                  >
                    {editForm.avatarColor === color.class && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Biography / Notes</Label>
              <textarea
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-slate-400 transition-all"
              />
            </div>

            {setCustomLogo && isUserNajib && (
              <div className="pt-4 border-t border-slate-100">
                <Label>School Logo Customization (Main Admin)</Label>
                <div className="flex items-center gap-4 mt-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  {customLogo ? (
                    <img src={customLogo} alt="Logo" className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <School size={24} />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      {customLogo ? 'Custom School Logo Active' : 'Default System Icon Active'}
                    </p>
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                      <Upload size={14} /> Upload Custom Logo Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setCustomLogo(ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {customLogo && (
                      <button
                        type="button"
                        onClick={() => setCustomLogo(null)}
                        className="block text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                      >
                        Reset to Default Icon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Btn type="submit" variant="primary" className="!px-6">
                <Save size={16} /> Save Settings
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 3: Security */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
          {/* Change Password Card */}
          <Card>
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <KeyRound size={18} className="text-indigo-600" /> Change Password
            </h3>
            <p className="text-xs text-slate-500 mb-4 border-b border-slate-100 pb-2">
              Ensure your account uses a strong password to protect administrative data.
            </p>

            {passError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} /> {passError}
              </div>
            )}

            {passSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" /> Password updated successfully!
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label>Current Password *</Label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                />
              </div>

              <div>
                <Label>New Password *</Label>
                <Input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                />
              </div>

              <div>
                <Label>Confirm New Password *</Label>
                <Input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                />
              </div>

              <Btn type="submit" variant="primary" className="w-full mt-2">
                Update Account Password
              </Btn>
            </form>
          </Card>

          {/* 2FA & Active Sessions */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                <Smartphone size={18} className="text-indigo-600" /> Two-Factor Authentication (2FA)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Add an extra layer of security to your staff account.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {twoFactorEnabled ? '2FA Protection Enabled' : '2FA Protection Disabled'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {twoFactorEnabled ? 'Authenticator App or SMS OTP' : 'Recommended for Super Admins'}
                    </p>
                  </div>
                </div>

                <Btn
                  variant={twoFactorEnabled ? 'secondary' : 'primary'}
                  className="!py-1.5 !px-3 !text-xs"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                >
                  {twoFactorEnabled ? 'Disable' : 'Enable 2FA'}
                </Btn>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                <Globe size={18} className="text-indigo-600" /> Active Browser Sessions
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Current active logins across browsers and devices.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Chrome on Linux (Cloud Run)</p>
                    <p className="text-[10px] text-slate-500">IP: 192.168.1.100 • Current Device</p>
                  </div>
                  <Badge tone="green">ACTIVE NOW</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 4: Preferences */}
      {activeTab === 'preferences' && (
        <Card className="max-w-2xl">
          <h3 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
            <Bell size={20} className="text-indigo-600" /> System Preferences & Notifications
          </h3>
          <p className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-3">
            Customize which alerts and reports are automatically dispatched to your email address.
          </p>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Student Grade Submissions</p>
                <p className="text-[11px] text-slate-500">Receive instant email when teachers post mid-term or end-term marks.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailGrades}
                onChange={(e) => setNotifications({ ...notifications, emailGrades: e.target.checked })}
                className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Fee Payment Receipts</p>
                <p className="text-[11px] text-slate-500">Get notified when bursar receipts are issued or tuition is cleared.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailFees}
                onChange={(e) => setNotifications({ ...notifications, emailFees: e.target.checked })}
                className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Urgent System Announcements</p>
                <p className="text-[11px] text-slate-500">High priority administrative notices posted by Head Master.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAnnouncements}
                onChange={(e) => setNotifications({ ...notifications, emailAnnouncements: e.target.checked })}
                className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-red-900 flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-red-600" /> Danger Zone: Factory Reset
                  </p>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    Clear all modified student lists, fee ledgers, exam grades, and restore initial factory defaults.
                  </p>
                </div>
                <Btn
                  variant="danger"
                  className="!py-1.5 !px-3 !text-xs whitespace-nowrap flex-shrink-0"
                  onClick={() => setShowResetConfirm(true)}
                >
                  <RotateCcw size={14} /> Reset System
                </Btn>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: System Backup & State Download */}
      {activeTab === 'backup' && (
        <div className="space-y-6 max-w-4xl">
          {/* Main Download Card */}
          <Card className="!border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    Full System Application State Backup (JSON)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    Download a complete, offline JSON snapshot of all application data stored in browser localStorage — including student records, teacher profiles, class allocations, fee payment ledgers, exam grades, timetable, announcements, and activity audit logs.
                  </p>
                </div>
              </div>

              <Btn
                variant="primary"
                className="!bg-emerald-600 hover:!bg-emerald-700 !py-3 !px-5 text-sm font-bold shadow-md shadow-emerald-600/20 whitespace-nowrap flex-shrink-0"
                onClick={handleDownloadBackup}
              >
                <Download size={18} /> Download Entire JSON State
              </Btn>
            </div>

            {/* Storage Stats Grid */}
            {(() => {
              const summary = getLocalStorageBackupSummary();
              return (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-xs font-semibold">Total Storage Keys</span>
                        <HardDrive size={16} className="text-indigo-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{summary.totalKeys} Keys</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Active browser localStorage entries</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-xs font-semibold">Estimated Payload Size</span>
                        <FileJson size={16} className="text-emerald-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{summary.estimatedSizeKB} KB</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Formatted UTF-8 JSON data</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-xs font-semibold">Backup Format</span>
                        <ShieldCheck size={16} className="text-blue-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">Standard JSON</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Schema version 1.0.0 compliant</p>
                    </div>
                  </div>

                  {/* Entities Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Database size={14} className="text-emerald-600" /> Included Data Collections:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                      {summary.edumanageKeys.map((item) => (
                        <div key={item.key} className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                          <span className="font-semibold text-slate-800 truncate">{item.label}</span>
                          {item.count !== undefined && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold text-[11px] flex-shrink-0">
                              {item.count} items
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Restore Backup Card */}
          <Card className="border-slate-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                <UploadCloud size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Restore System State from JSON Backup</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a previously saved `.json` backup file to restore application state.
                </p>
              </div>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl bg-slate-50/50 hover:bg-indigo-50/30 transition-all text-center">
              <UploadCloud size={32} className="mx-auto text-indigo-500 mb-2" />
              <p className="text-xs font-bold text-slate-800">Select or drop system backup JSON file</p>
              <p className="text-[11px] text-slate-400 mt-1 mb-4">Supports .json application snapshot files</p>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all">
                <Upload size={14} /> Browse Backup File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: System Reset */}
      {activeTab === 'reset' && (
        <div className="space-y-6 max-w-3xl">
          {resetSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs font-bold shadow-xs">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>System records have been reset to default initial state successfully!</span>
            </div>
          )}

          <Card className="border-red-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  System Data Reset & Factory Restore
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clear all user modifications across the portal and restore original default data.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 space-y-3">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-amber-500" /> Information cleared during system reset:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Student Enrollment & Profiles
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Teacher & Staff Assignments
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Attendance Audit Logs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Student Examination Marks & Grades
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Tuition Fee Ledger Receipts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> School Announcements & Timetable
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Custom Admin User Accounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Custom School Branding & Logo
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                This operation clears local browser storage for this portal.
              </p>
              <Btn variant="danger" onClick={() => setShowResetConfirm(true)}>
                <RotateCcw size={16} /> Perform Complete System Reset
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        open={showRestoreConfirm}
        title={`Confirm Restore from Backup (${restoreFileName})`}
        message="Are you sure you want to restore application state from this JSON backup file? Existing localStorage entries will be updated with the records in the backup file."
        onConfirm={handleConfirmRestore}
        onCancel={() => {
          setShowRestoreConfirm(false);
          setRestoreFileText('');
        }}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign Out of Portal"
        message="Are you sure you want to end your current staff session? You can sign back in anytime."
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* System Reset Confirmation Dialog */}
      <ConfirmDialog
        open={showResetConfirm}
        title="Confirm Complete System Reset"
        message="Are you sure you want to clear all information under your profile and reset the system back to factory defaults? All modified student profiles, fees, grades, announcements, and admin account updates will be restored to default values."
        onConfirm={() => {
          setShowResetConfirm(false);
          if (onSystemReset) {
            onSystemReset();
          }
          setResetSuccess(true);
          setTimeout(() => setResetSuccess(false), 5000);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
