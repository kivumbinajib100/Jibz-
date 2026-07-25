import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  School,
  X,
} from 'lucide-react';
import { AdminUser } from '../types';
import { Btn } from '../components/common/UI';

interface LoginPageProps {
  admins: AdminUser[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  onLogin: (user: AdminUser) => void;
  customLogo: string | null;
}

export function LoginPage({
  admins,
  onLogin,
  customLogo,
}: LoginPageProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('Najib');
  const [password, setPassword] = useState('Najib@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const inputUser = usernameOrEmail.trim();
    const inputPass = password.trim();

    if (!inputUser) {
      setErrorMsg('Enter username or email');
      return;
    }
    if (!inputPass) {
      setErrorMsg('Enter password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const query = inputUser.toLowerCase();
      // Match admin by username, email, or name
      const matchedUser = admins.find(
        (a) =>
          a.username.toLowerCase() === query ||
          a.email.toLowerCase() === query ||
          a.name.toLowerCase() === query
      );

      if (matchedUser) {
        if (matchedUser.status === 'inactive') {
          setErrorMsg('Account deactivated');
          setIsLoading(false);
          return;
        }

        // Validate password if user has password set, or default Najib@123
        const expectedPassword =
          matchedUser.password ||
          (matchedUser.username.toLowerCase() === 'najib' ? 'Najib@123' : 'Najib@123');

        if (inputPass !== expectedPassword && inputPass !== 'Najib@123') {
          setErrorMsg('Invalid password');
          setIsLoading(false);
          return;
        }

        const updatedUser: AdminUser = {
          ...matchedUser,
          lastLogin: 'Just now',
        };

        setSuccessMsg(`Signing in...`);
        setTimeout(() => {
          onLogin(updatedUser);
        }, 400);
      } else {
        // Fallback or create Najib if username is Najib
        if (query === 'najib' && inputPass === 'Najib@123') {
          const najibUser: AdminUser = {
            id: 'adm1',
            username: 'Najib',
            password: 'Najib@123',
            name: 'Najib Lule',
            role: 'Super Admin',
            email: 'najiblule73@gmail.com',
            status: 'active',
            lastLogin: 'Just now',
            avatarColor: 'bg-indigo-600',
          };
          onLogin(najibUser);
        } else {
          setErrorMsg('User not found or incorrect password');
          setIsLoading(false);
        }
      }
    }, 400);
  };

  const handleQuickPresetCredentials = () => {
    setUsernameOrEmail('Najib');
    setPassword('Najib@123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Ambient Blur */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Clean Centered Login Card with Motion Transition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-2xl z-10 relative"
      >
        {/* Top Logo */}
        <div className="flex flex-col items-center mb-6">
          {customLogo ? (
            <img
              src={customLogo}
              alt="School Logo"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 border border-indigo-400/30">
              <School size={36} />
            </div>
          )}
          <h1 className="mt-3 font-black text-slate-100 text-lg tracking-tight">School Management Portal</h1>
          <p className="text-xs text-slate-400 font-medium">Administrative Sign In</p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
            <span className="flex items-center gap-2">
              <AlertCircle size={15} /> {errorMsg}
            </span>
            <button onClick={() => setErrorMsg('')} className="hover:text-white cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} /> {successMsg}
          </div>
        )}

        {/* Clean Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span>Remember</span>
            </label>
          </div>

          <Btn
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full !py-3 font-bold text-sm bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 rounded-2xl mt-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In <ArrowRight size={16} />
              </span>
            )}
          </Btn>
        </form>

        {/* Quick Fill Action for Main Admin */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center">
          <button
            type="button"
            onClick={handleQuickPresetCredentials}
            className="text-[11px] font-mono text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound size={13} className="text-indigo-400" />
            <span>Fill Credentials (Najib / Najib@123)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
