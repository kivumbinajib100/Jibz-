import React from 'react';
import { AlertCircle, X, LucideIcon } from 'lucide-react';

export function Card({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  key?: React.Key;
}) {
  return (
    <div
      id={id}
      className={`bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 md:p-6 transition-all duration-200 hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'gray',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray' | 'emerald' | 'amber';
  className?: string;
}) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    red: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    blue: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/60',
    gray: 'bg-slate-100 text-slate-600 border border-slate-200/60',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
}) {
  const styles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 active:scale-[0.98]',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-indigo-50 text-indigo-600 border border-indigo-200 active:scale-[0.98]',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 active:scale-[0.98]',
  };
  return (
    <button
      {...props}
      className={`px-3.5 py-2 rounded-xl font-medium transition-all duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-slate-400 transition-all ${
        props.className || ''
      }`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all text-slate-800 ${
        props.className || ''
      }`}
    >
      {props.children}
    </select>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full ${widths[size]} max-h-[90vh] flex flex-col overflow-hidden z-10 my-auto`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 z-10">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-rose-600">
            <AlertCircle size={22} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <Btn variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn variant="danger" className="flex-1" onClick={onConfirm}>
            Delete
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {sub && <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{sub}</p>}
      </div>
      {children && <div className="flex items-center gap-2.5 flex-wrap">{children}</div>}
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200/80">
      {children}
    </th>
  );
}

export function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3.5 border-b border-slate-100 text-sm text-slate-700 ${className}`}>
      {children}
    </td>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'bg-indigo-600',
  iconColor = 'text-white',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
  iconColor?: string;
}) {
  return (
    <Card className="hover:border-slate-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-2xl font-black text-slate-900">{value}</h3>
          {trend && <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${color}`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </Card>
  );
}
