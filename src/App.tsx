import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Student,
  Teacher,
  ClassItem,
  SubjectItem,
  AttendanceRecord,
  GradeScaleItem,
  GradeRecord,
  FeeRecord,
  Announcement,
  TimetableSlot,
  AcademicYear,
  AdminUser,
  ActivityLog,
} from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_GRADE_SCALE,
  INITIAL_GRADES,
  INITIAL_FEES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_TIMETABLE,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_ADMINS,
  INITIAL_ACTIVITY_LOG,
} from './data/initialData';
import { Sidebar } from './components/Navigation';
import { Header } from './components/Header';
import { DashboardPage } from './pages/Dashboard';
import { StudentsPage } from './pages/Students';
import { TeachersPage } from './pages/Teachers';
import { ClassesPage } from './pages/Classes';
import { SubjectsPage } from './pages/Subjects';
import { AttendancePage } from './pages/Attendance';
import { GradesPage } from './pages/Grades';
import { FeesPage } from './pages/Fees';
import { AcademicYearsPage } from './pages/AcademicYears';
import { TimetablePage } from './pages/Timetable';
import { AnnouncementsPage } from './pages/Announcements';
import { ReportsPage } from './pages/Reports';
import { AdminsPage } from './pages/Admins';
import { GradingScalePage } from './pages/GradingScale';
import { LoginPage } from './pages/Login';
import { ProfilePage } from './pages/Profile';

function getStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`edumanage_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredData<T>(key: string, data: T) {
  try {
    localStorage.setItem(`edumanage_${key}`, JSON.stringify(data));
  } catch (err) {
    console.error('Failed saving to localStorage:', err);
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // App Name state (editable by user Najib)
  const [appName, setAppName] = useState<string>(() =>
    getStoredData('appName', 'St. Jude Academy')
  );

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() =>
    getStoredData('currentUser', INITIAL_ADMINS[0])
  );

  // Persistent States
  const [students, setStudents] = useState<Student[]>(() =>
    getStoredData('students', INITIAL_STUDENTS)
  );
  const [teachers, setTeachers] = useState<Teacher[]>(() =>
    getStoredData('teachers', INITIAL_TEACHERS)
  );
  const [classes, setClasses] = useState<ClassItem[]>(() =>
    getStoredData('classes', INITIAL_CLASSES)
  );
  const [subjects, setSubjects] = useState<SubjectItem[]>(() =>
    getStoredData('subjects', INITIAL_SUBJECTS)
  );
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    getStoredData('attendance', [])
  );
  const [gradeScale, setGradeScale] = useState<GradeScaleItem[]>(() =>
    getStoredData('gradeScale', INITIAL_GRADE_SCALE)
  );
  const [grades, setGrades] = useState<GradeRecord[]>(() =>
    getStoredData('grades', INITIAL_GRADES)
  );
  const [fees, setFees] = useState<FeeRecord[]>(() =>
    getStoredData('fees', INITIAL_FEES)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getStoredData('announcements', INITIAL_ANNOUNCEMENTS)
  );
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() =>
    getStoredData('timetable', INITIAL_TIMETABLE)
  );
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() =>
    getStoredData('academicYears', INITIAL_ACADEMIC_YEARS)
  );
  const [admins, setAdmins] = useState<AdminUser[]>(() =>
    getStoredData('admins', INITIAL_ADMINS)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    getStoredData('activityLogs', INITIAL_ACTIVITY_LOG)
  );

  const [selectedYear, setSelectedYear] = useState<string>('2026 Academic Year');

  const [customLogo, setCustomLogo] = useState<string | null>(() =>
    getStoredData('schoolLogo', null)
  );

  // Sync to local storage
  useEffect(() => setStoredData('appName', appName), [appName]);
  useEffect(() => setStoredData('currentUser', currentUser), [currentUser]);
  useEffect(() => setStoredData('schoolLogo', customLogo), [customLogo]);
  useEffect(() => setStoredData('students', students), [students]);
  useEffect(() => setStoredData('teachers', teachers), [teachers]);
  useEffect(() => setStoredData('classes', classes), [classes]);
  useEffect(() => setStoredData('subjects', subjects), [subjects]);
  useEffect(() => setStoredData('attendance', attendanceRecords), [attendanceRecords]);
  useEffect(() => setStoredData('gradeScale', gradeScale), [gradeScale]);
  useEffect(() => setStoredData('grades', grades), [grades]);
  useEffect(() => setStoredData('fees', fees), [fees]);
  useEffect(() => setStoredData('announcements', announcements), [announcements]);
  useEffect(() => setStoredData('timetable', timetable), [timetable]);
  useEffect(() => setStoredData('academicYears', academicYears), [academicYears]);
  useEffect(() => setStoredData('admins', admins), [admins]);
  useEffect(() => setStoredData('activityLogs', activityLogs), [activityLogs]);

  const handleAddActivity = (action: string) => {
    const newLog: ActivityLog = {
      id: `l_${Date.now()}`,
      who: currentUser?.name || 'Staff Member',
      action,
      time: 'Just now',
    };
    setActivityLogs([newLog, ...activityLogs]);
  };

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
    handleAddActivity(`Signed into system (${user.role})`);
  };

  const handleLogout = () => {
    if (currentUser) {
      handleAddActivity(`Signed out of active session`);
    }
    setCurrentUser(null);
    setCurrentTab('login');
  };

  const handleQuickAction = (actionType: string) => {
    if (actionType === 'student') setCurrentTab('students');
    else if (actionType === 'teacher') setCurrentTab('teachers');
    else if (actionType === 'attendance') setCurrentTab('attendance');
    else if (actionType === 'fee') setCurrentTab('fees');
    else if (actionType === 'announcement') setCurrentTab('announcements');
  };

  const handleSystemReset = () => {
    try {
      localStorage.clear();
      const initialLogs: ActivityLog[] = [
        {
          id: `l_${Date.now()}`,
          who: 'System Administrator',
          action: 'System Reset: Cleared local storage data and restored factory initial defaults',
          time: 'Just now',
        },
      ];
      localStorage.setItem('edumanage_activityLogs', JSON.stringify(initialLogs));
    } catch (err) {
      console.error('Failed to clear localStorage during reset:', err);
    }

    setAppName('St. Jude Academy');
    setCustomLogo(null);
    setStudents(INITIAL_STUDENTS);
    setTeachers(INITIAL_TEACHERS);
    setClasses(INITIAL_CLASSES);
    setSubjects(INITIAL_SUBJECTS);
    setAttendanceRecords([]);
    setGradeScale(INITIAL_GRADE_SCALE);
    setGrades(INITIAL_GRADES);
    setFees(INITIAL_FEES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setTimetable(INITIAL_TIMETABLE);
    setAcademicYears(INITIAL_ACADEMIC_YEARS);
    setAdmins(INITIAL_ADMINS);
    setCurrentUser(INITIAL_ADMINS[0]);

    // Force page reload so all memory states restart fresh from factory defaults
    window.location.reload();
  };

  // Render Login page if user logged out or explicitly on login screen
  if (!currentUser || currentTab === 'login') {
    return (
      <LoginPage
        admins={admins}
        setAdmins={setAdmins}
        onLogin={handleLogin}
        customLogo={customLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
        customLogo={customLogo}
        appName={appName}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Header */}
        <Header
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          academicYears={academicYears}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          announcements={announcements}
          onQuickAction={handleQuickAction}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          currentUser={currentUser}
          setCurrentTab={setCurrentTab}
          onLogout={handleLogout}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {currentTab === 'dashboard' && (
                <DashboardPage
                  students={students}
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  announcements={announcements}
                  activityLogs={activityLogs}
                  fees={fees}
                  setCurrentTab={setCurrentTab}
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'students' && (
                <StudentsPage
                  students={students}
                  setStudents={setStudents}
                  classes={classes}
                  fees={fees}
                  grades={grades}
                  globalSearch={globalSearch}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'teachers' && (
                <TeachersPage
                  teachers={teachers}
                  setTeachers={setTeachers}
                  subjects={subjects}
                  globalSearch={globalSearch}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'classes' && (
                <ClassesPage
                  classes={classes}
                  setClasses={setClasses}
                  teachers={teachers}
                  students={students}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'subjects' && (
                <SubjectsPage
                  subjects={subjects}
                  setSubjects={setSubjects}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'attendance' && (
                <AttendancePage
                  students={students}
                  classes={classes}
                  attendanceRecords={attendanceRecords}
                  setAttendanceRecords={setAttendanceRecords}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'grades' && (
                <GradesPage
                  students={students}
                  classes={classes}
                  subjects={subjects}
                  grades={grades}
                  setGrades={setGrades}
                  gradeScale={gradeScale}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'fees' && (
                <FeesPage
                  fees={fees}
                  setFees={setFees}
                  students={students}
                  classes={classes}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'academic-years' && (
                <AcademicYearsPage
                  academicYears={academicYears}
                  setAcademicYears={setAcademicYears}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'timetable' && (
                <TimetablePage
                  timetable={timetable}
                  setTimetable={setTimetable}
                  classes={classes}
                  subjects={subjects}
                  teachers={teachers}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'announcements' && (
                <AnnouncementsPage
                  announcements={announcements}
                  setAnnouncements={setAnnouncements}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsPage
                  students={students}
                  classes={classes}
                  fees={fees}
                  grades={grades}
                  attendance={attendanceRecords}
                />
              )}

              {currentTab === 'admins' && (
                <AdminsPage
                  admins={admins}
                  setAdmins={setAdmins}
                  onAddActivity={handleAddActivity}
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'grade-scale' && (
                <GradingScalePage
                  gradeScale={gradeScale}
                  setGradeScale={setGradeScale}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentTab === 'profile' && currentUser && (
                <ProfilePage
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  admins={admins}
                  setAdmins={setAdmins}
                  activityLogs={activityLogs}
                  onAddActivity={handleAddActivity}
                  onLogout={handleLogout}
                  customLogo={customLogo}
                  setCustomLogo={setCustomLogo}
                  appName={appName}
                  setAppName={setAppName}
                  onSystemReset={handleSystemReset}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
