import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Megaphone,
  DollarSign,
  Activity,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Student,
  Teacher,
  ClassItem,
  SubjectItem,
  Announcement,
  ActivityLog,
  FeeRecord,
  AdminUser,
} from '../types';
import { Card, Badge, StatCard, PageHeader } from '../components/common/UI';
import { ATTENDANCE_TREND, GENDER_DISTRIBUTION, GRADE_ENROLLMENT } from '../data/initialData';

const PIE_COLORS = ['#6366f1', '#f97316'];

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  announcements: Announcement[];
  activityLogs: ActivityLog[];
  fees: FeeRecord[];
  setCurrentTab: (tab: string) => void;
  currentUser?: AdminUser | null;
}

export function DashboardPage({
  students,
  teachers,
  classes,
  subjects,
  announcements,
  activityLogs,
  fees,
  setCurrentTab,
  currentUser,
}: DashboardProps) {
  // Calculated Metrics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  const totalFeesDue = fees.reduce((acc, f) => acc + f.due, 0);
  const totalFeesPaid = fees.reduce((acc, f) => acc + f.paid, 0);
  const feeCollectionPct = totalFeesDue > 0 ? Math.round((totalFeesPaid / totalFeesDue) * 100) : 0;

  const priorityCfg = {
    high: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle },
    normal: { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: Info },
    low: { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: Info },
  };

  const isNajib = currentUser?.username.toLowerCase() === 'najib';

  // Requirement: "Actions and information of any admin should be seen by anyone except user Najib through activity logs"
  // If user is NOT Najib, filter out any activity log originating from or mentioning user Najib.
  const visibleLogs = isNajib
    ? activityLogs
    : activityLogs.filter(
        (log) =>
          !log.who.toLowerCase().includes('najib') &&
          !log.action.toLowerCase().includes('najib')
      );

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Dashboard"
        sub={`Welcome back, ${currentUser?.name || 'Admin User'}! Operational metrics and administrative portal.`}
      />

      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Announcements
              </h2>
              <Badge tone="blue">{announcements.length}</Badge>
            </div>
            <button
              onClick={() => setCurrentTab('announcements')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {announcements.slice(0, 2).map((a) => {
              const cfg = priorityCfg[a.priority] || priorityCfg.normal;
              const Icon = cfg.icon;
              return (
                <div
                  key={a.id}
                  className={`p-4 rounded-2xl border ${cfg.bg} ${cfg.border} flex items-start gap-3 transition-all`}
                >
                  <Icon size={18} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-bold text-sm truncate ${cfg.color}`}>{a.title}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{a.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {a.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          trend="+12 enrolled this term"
          color="bg-indigo-600"
        />
        <StatCard
          icon={GraduationCap}
          label="Teaching Staff"
          value={totalTeachers}
          trend="6 Departments"
          color="bg-emerald-600"
        />
        <StatCard
          icon={BookOpen}
          label="Active Classes"
          value={totalClasses}
          trend="7 Grades"
          color="bg-amber-500"
        />
        <StatCard
          icon={DollarSign}
          label="Fee Collection"
          value={`${feeCollectionPct}%`}
          trend={`UGX ${(totalFeesPaid / 1000000).toFixed(1)}M Collected`}
          color="bg-purple-600"
        />
      </div>

      {/* Recharts Data Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Attendance Trend</h3>
              <p className="text-xs text-slate-500">Daily student present vs absent status</p>
            </div>
            <Badge tone="green">96% Average Present Rate</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Present"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPresent)"
                />
                <Area
                  type="monotone"
                  dataKey="Absent"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAbsent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gender Distribution Chart */}
        <Card>
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">Gender Distribution</h3>
            <p className="text-xs text-slate-500">Student population gender split</p>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={GENDER_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {GENDER_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Male</p>
              <p className="font-black text-slate-800 text-sm">172 (52%)</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Female</p>
              <p className="font-black text-slate-800 text-sm">158 (48%)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enrollment by Grade & Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Enrollment Bar Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Enrollment by Grade Level</h3>
              <p className="text-xs text-slate-500">Number of active students per class stream</p>
            </div>
            <Badge tone="purple">P1 - P7 Streams</Badge>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GRADE_ENROLLMENT} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity Log */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" />
              Activity Log
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Real-time</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {visibleLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-2.5 last:border-0">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{log.action}</p>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-slate-500 text-[10px] font-medium">{log.who}</span>
                    <span className="text-slate-400 text-[10px]">{log.time}</span>
                  </div>
                </div>
              </div>
            ))}
            {visibleLogs.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">No activity logs recorded.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
