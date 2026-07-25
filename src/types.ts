export type Role = 'Super Admin' | 'Accountant' | 'Registrar' | 'Teacher' | string;

export interface Student {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  cls: string;
  status: 'active' | 'inactive';
  dob: string;
  guardian: string;
  phone: string;
  email?: string;
  address?: string;
  admissionDate: string;
}

export interface Teacher {
  id: string;
  name: string;
  spec: string;
  qual: string;
  subjects: string;
  status: 'active' | 'on leave' | 'inactive';
  phone: string;
  email: string;
}

export interface ClassItem {
  id: string;
  name: string;
  grade: string;
  teacher: string;
  count: number;
  capacity: number;
  room: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  credits: number;
  teachers: number;
  department: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  cls: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface GradeScaleItem {
  g: string;
  min: number;
  max: number;
  remark: string;
  tone: 'green' | 'blue' | 'yellow' | 'red';
}

export interface GradeRecord {
  id: string;
  studentId: string;
  student: string;
  cls: string;
  subject: string;
  exam: string;
  marks: number;
  grade: string;
  date: string;
  remarks?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  student: string;
  cls: string;
  type: string; // 'Tuition' | 'Boarding' | 'Library' | 'Transport' | 'Uniform' | custom categories
  term: string;
  due: number;
  paid: number;
  status: 'paid' | 'partial' | 'pending';
  dueDate: string;
  lastPaymentDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'normal' | 'low';
  audience: 'all' | 'teachers' | 'students' | 'parents';
  by: string;
  time: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string;
  subject: string;
  teacher: string;
  room: string;
  cls: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start: string;
  end: string;
  current: boolean;
  terms: number;
  currentTerm: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  email: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  phone?: string;
  department?: string;
  bio?: string;
  avatarColor?: string;
  avatarUrl?: string;
  createdBy?: string;
}

export interface ActivityLog {
  id: string;
  who: string;
  action: string;
  time: string;
}
