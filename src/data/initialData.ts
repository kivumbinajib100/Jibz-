import {
  Student,
  Teacher,
  ClassItem,
  SubjectItem,
  GradeScaleItem,
  GradeRecord,
  FeeRecord,
  Announcement,
  TimetableSlot,
  AcademicYear,
  AdminUser,
  ActivityLog,
} from '../types';

export const INITIAL_CLASSES: ClassItem[] = [
  { id: 'c1', name: 'P1 East', grade: 'P1', teacher: 'Mrs. Auma', count: 28, capacity: 35, room: 'Rm 101' },
  { id: 'c2', name: 'P2 North', grade: 'P2', teacher: 'Mr. Kato', count: 31, capacity: 35, room: 'Rm 102' },
  { id: 'c3', name: 'P3 West', grade: 'P3', teacher: 'Ms. Nabirye', count: 26, capacity: 35, room: 'Rm 103' },
  { id: 'c4', name: 'P4 West', grade: 'P4', teacher: 'Mr. Okello', count: 34, capacity: 35, room: 'Rm 104' },
  { id: 'c5', name: 'P5 South', grade: 'P5', teacher: 'Mrs. Namutebi', count: 29, capacity: 35, room: 'Rm 105' },
  { id: 'c6', name: 'P6 East', grade: 'P6', teacher: 'Mr. Ssentongo', count: 33, capacity: 35, room: 'Rm 106' },
  { id: 'c7', name: 'P7 South', grade: 'P7', teacher: 'Mrs. Achieng', count: 21, capacity: 35, room: 'Rm 107' },
];

export const INITIAL_SUBJECTS: SubjectItem[] = [
  { id: 'sub1', name: 'Mathematics', code: 'MTC', credits: 4, teachers: 5, department: 'Sciences' },
  { id: 'sub2', name: 'English Language', code: 'ENG', credits: 4, teachers: 6, department: 'Languages' },
  { id: 'sub3', name: 'Integrated Science', code: 'SCI', credits: 3, teachers: 4, department: 'Sciences' },
  { id: 'sub4', name: 'Social Studies', code: 'SST', credits: 3, teachers: 3, department: 'Humanities' },
  { id: 'sub5', name: 'Religious Education', code: 'RE', credits: 2, teachers: 2, department: 'Humanities' },
  { id: 'sub6', name: 'Physical Education', code: 'PE', credits: 1, teachers: 2, department: 'Sports' },
  { id: 'sub7', name: 'ICT & Computer Skills', code: 'ICT', credits: 2, teachers: 2, department: 'Technology' },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 'STU-2026-0041', name: 'Grace Namutebi', gender: 'Female', cls: 'P6 East', status: 'active', dob: '2013-04-11', guardian: 'Peter Namutebi', phone: '+256-700-100041', email: 'grace.n@school.edu', address: 'Plot 14, Kampala Rd', admissionDate: '2021-02-10' },
  { id: 'STU-2026-0040', name: 'Daniel Okello', gender: 'Male', cls: 'P4 West', status: 'active', dob: '2015-09-02', guardian: 'Susan Okello', phone: '+256-700-100040', email: 'daniel.o@school.edu', address: 'Block B, Entebbe Ave', admissionDate: '2023-01-15' },
  { id: 'STU-2026-0039', name: 'Faith Nabirye', gender: 'Female', cls: 'P2 North', status: 'active', dob: '2017-01-20', guardian: 'James Nabirye', phone: '+256-700-100039', address: 'Kiswa Zone, Ntinda', admissionDate: '2025-02-01' },
  { id: 'STU-2026-0038', name: 'Isaac Kato', gender: 'Male', cls: 'P7 South', status: 'active', dob: '2012-11-30', guardian: 'Ruth Kato', phone: '+256-700-100038', email: 'isaac.k@school.edu', address: 'Naguru Drive', admissionDate: '2020-02-05' },
  { id: 'STU-2026-0037', name: 'Mary Achieng', gender: 'Female', cls: 'P5 South', status: 'inactive', dob: '2014-06-15', guardian: 'Tom Achieng', phone: '+256-700-100037', address: 'Bugolobi Estate', admissionDate: '2022-02-12' },
  { id: 'STU-2026-0036', name: 'Brian Mukasa', gender: 'Male', cls: 'P6 East', status: 'active', dob: '2013-08-22', guardian: 'Florence Mukasa', phone: '+256-700-100036', address: 'Kisaasi Road', admissionDate: '2021-02-10' },
  { id: 'STU-2026-0035', name: 'Sarah Akello', gender: 'Female', cls: 'P1 East', status: 'active', dob: '2018-03-14', guardian: 'John Akello', phone: '+256-700-100035', address: 'Bukoto Street', admissionDate: '2026-01-20' },
  { id: 'STU-2026-0034', name: 'David Ssemwanga', gender: 'Male', cls: 'P3 West', status: 'active', dob: '2016-12-05', guardian: 'Harriet Ssemwanga', phone: '+256-700-100034', address: 'Muyenga Hill', admissionDate: '2024-02-02' }
];

export const INITIAL_TEACHERS: Teacher[] = [
  { id: 'EMP-0012', name: 'Mrs. Auma', spec: 'Mathematics', qual: 'B.Ed Mathematics', subjects: 'Mathematics, Science', status: 'active', phone: '+256-772-112233', email: 'auma@school.edu' },
  { id: 'EMP-0011', name: 'Mr. Kato', spec: 'English', qual: 'B.A Education', subjects: 'English Language', status: 'active', phone: '+256-772-223344', email: 'kato@school.edu' },
  { id: 'EMP-0010', name: 'Ms. Nabirye', spec: 'Science', qual: 'B.Sc Education', subjects: 'Science, SST', status: 'active', phone: '+256-772-334455', email: 'nabirye@school.edu' },
  { id: 'EMP-0009', name: 'Mr. Ssentongo', spec: 'Social Studies', qual: 'Grade V Cert.', subjects: 'Social Studies', status: 'on leave', phone: '+256-772-445566', email: 'ssentongo@school.edu' },
  { id: 'EMP-0008', name: 'Mrs. Namutebi', spec: 'Religious Ed.', qual: 'Dip. Primary Ed.', subjects: 'Religious Education', status: 'active', phone: '+256-772-556677', email: 'namutebi@school.edu' },
  { id: 'EMP-0007', name: 'Mr. Okello', spec: 'Physical Education', qual: 'B.PE Sports Science', subjects: 'Physical Education', status: 'active', phone: '+256-772-667788', email: 'okello@school.edu' }
];

export const INITIAL_GRADE_SCALE: GradeScaleItem[] = [
  { g: 'D1', min: 90, max: 100, remark: 'Distinction 1', tone: 'green' },
  { g: 'D2', min: 80, max: 89, remark: 'Distinction 2', tone: 'green' },
  { g: 'C3', min: 70, max: 79, remark: 'Credit 3', tone: 'blue' },
  { g: 'C4', min: 65, max: 69, remark: 'Credit 4', tone: 'blue' },
  { g: 'C5', min: 60, max: 64, remark: 'Credit 5', tone: 'blue' },
  { g: 'C6', min: 55, max: 59, remark: 'Credit 6', tone: 'blue' },
  { g: 'P7', min: 45, max: 54, remark: 'Pass 7', tone: 'yellow' },
  { g: 'P8', min: 35, max: 44, remark: 'Pass 8', tone: 'yellow' },
  { g: 'F9', min: 0, max: 34, remark: 'Fail 9', tone: 'red' },
];

export const INITIAL_GRADES: GradeRecord[] = [
  { id: 'g1', studentId: 'STU-2026-0041', student: 'Grace Namutebi', cls: 'P6 East', subject: 'Mathematics', exam: 'Mid-Term', marks: 88, grade: 'D2', date: '2026-07-20', remarks: 'Excellent logical reasoning' },
  { id: 'g2', studentId: 'STU-2026-0040', student: 'Daniel Okello', cls: 'P4 West', subject: 'English', exam: 'Mid-Term', marks: 71, grade: 'C3', date: '2026-07-20', remarks: 'Good comprehension skills' },
  { id: 'g3', studentId: 'STU-2026-0038', student: 'Isaac Kato', cls: 'P7 South', subject: 'Science', exam: 'Mid-Term', marks: 52, grade: 'P7', date: '2026-07-21', remarks: 'Needs revision in physics concepts' },
  { id: 'g4', studentId: 'STU-2026-0036', student: 'Brian Mukasa', cls: 'P6 East', subject: 'Social Studies', exam: 'Mid-Term', marks: 92, grade: 'D1', date: '2026-07-22', remarks: 'Outstanding performance' },
  { id: 'g5', studentId: 'STU-2026-0039', student: 'Faith Nabirye', cls: 'P2 North', subject: 'Mathematics', exam: 'Mid-Term', marks: 84, grade: 'D2', date: '2026-07-23', remarks: 'Strong arithmetic foundation' }
];

export const INITIAL_FEES: FeeRecord[] = [
  { id: 'f1', studentId: 'STU-2026-0041', student: 'Grace Namutebi', cls: 'P6 East', type: 'Tuition', term: 'Term 2', due: 450000, paid: 450000, status: 'paid', dueDate: '2026-07-15', lastPaymentDate: '2026-07-10' },
  { id: 'f2', studentId: 'STU-2026-0040', student: 'Daniel Okello', cls: 'P4 West', type: 'Tuition', term: 'Term 2', due: 450000, paid: 200000, status: 'partial', dueDate: '2026-07-15', lastPaymentDate: '2026-07-12' },
  { id: 'f3', studentId: 'STU-2026-0039', student: 'Faith Nabirye', cls: 'P2 North', type: 'Boarding', term: 'Term 2', due: 600000, paid: 0, status: 'pending', dueDate: '2026-08-01' },
  { id: 'f4', studentId: 'STU-2026-0038', student: 'Isaac Kato', cls: 'P7 South', type: 'Tuition', term: 'Term 2', due: 500000, paid: 500000, status: 'paid', dueDate: '2026-07-15', lastPaymentDate: '2026-07-01' },
  { id: 'f5', studentId: 'STU-2026-0036', student: 'Brian Mukasa', cls: 'P6 East', type: 'Transport', term: 'Term 2', due: 150000, paid: 150000, status: 'paid', dueDate: '2026-07-15', lastPaymentDate: '2026-07-08' }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Term 2 fees payment deadline extended', content: 'The final payment deadline for Term 2 tuition has been extended to August 5th for all classes. Please clear remaining balances at the bursar office.', priority: 'high', audience: 'all', by: 'NAJIB (Head Master)', time: 'Jul 25, 08:10' },
  { id: 'a2', title: 'Staff meeting this Friday', content: 'All teaching staff are required to attend the Term 2 curriculum review meeting in the main hall at 4:00 PM.', priority: 'normal', audience: 'teachers', by: 'NAJIB (Head Master)', time: 'Jul 24, 16:40' },
  { id: 'a3', title: 'Inter-House Sports Day preparations', content: 'Inter-house athletic tryouts begin next Tuesday on the main sports ground. All physical education teachers please prepare lists.', priority: 'low', audience: 'students', by: 'Mr. Okello', time: 'Jul 22, 09:00' }
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  { id: 't1', day: 'Monday', time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mrs. Auma', room: 'Rm 101', cls: 'P6 East' },
  { id: 't2', day: 'Monday', time: '09:00 - 10:00', subject: 'English Language', teacher: 'Mr. Kato', room: 'Rm 101', cls: 'P6 East' },
  { id: 't3', day: 'Tuesday', time: '08:00 - 09:00', subject: 'Integrated Science', teacher: 'Ms. Nabirye', room: 'Rm 101', cls: 'P6 East' },
  { id: 't4', day: 'Wednesday', time: '08:00 - 09:00', subject: 'Social Studies', teacher: 'Mr. Ssentongo', room: 'Rm 101', cls: 'P6 East' },
  { id: 't5', day: 'Thursday', time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mrs. Auma', room: 'Rm 101', cls: 'P6 East' },
  { id: 't6', day: 'Friday', time: '08:00 - 09:00', subject: 'Religious Education', teacher: 'Mrs. Namutebi', room: 'Rm 101', cls: 'P6 East' },
];

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay2026', name: '2026 Academic Year', start: 'Feb 2026', end: 'Dec 2026', current: true, terms: 3, currentTerm: 'Term 2' },
  { id: 'ay2025', name: '2025 Academic Year', start: 'Feb 2025', end: 'Dec 2025', current: false, terms: 3, currentTerm: 'Term 3' },
];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'adm1',
    username: 'Najib',
    password: 'Najib@123',
    name: 'Najib Lule',
    role: 'Super Admin',
    email: 'najiblule73@gmail.com',
    status: 'active',
    lastLogin: 'Just now',
    phone: '+256 700 123456',
    department: 'Executive Management',
    bio: 'Head Master and Chief Systems Administrator for EduManage High School.',
    avatarColor: 'bg-indigo-600',
    createdBy: 'system',
  },
  {
    id: 'adm2',
    username: 'bursar_sarah',
    password: 'Sarah@123',
    name: 'Sarah Namuka',
    role: 'Accountant',
    email: 'accounts@school.edu',
    status: 'active',
    lastLogin: '2 hours ago',
    phone: '+256 700 987654',
    department: 'Finance & Bursar Office',
    bio: 'Senior Accountant managing student tuition fees, ledger reports, and payroll.',
    avatarColor: 'bg-emerald-600',
    createdBy: 'najib',
  },
  {
    id: 'adm3',
    username: 'registrar_john',
    name: 'John Mukasa',
    role: 'Registrar',
    email: 'admissions@school.edu',
    status: 'active',
    lastLogin: '1 day ago',
    phone: '+256 700 555123',
    department: 'Academic Admissions',
    bio: 'Academic Registrar handling student enrollments, transfers, and transcripts.',
    avatarColor: 'bg-amber-600',
    createdBy: 'najib',
  },
  {
    id: 'adm4',
    username: 'mrs_auma',
    name: 'Mrs. Auma',
    role: 'Teacher',
    email: 'auma@school.edu',
    status: 'active',
    lastLogin: '3 hours ago',
    phone: '+256 772 112233',
    department: 'Mathematics & Science Dept',
    bio: 'Senior Mathematics & Science Instructor and P1 East Class Teacher.',
    avatarColor: 'bg-purple-600',
    createdBy: 'najib',
  },
];

export const INITIAL_ACTIVITY_LOG: ActivityLog[] = [
  { id: 'l1', who: 'Najib Lule', action: 'Created new student profile for Grace Namutebi', time: '2 mins ago' },
  { id: 'l2', who: 'Mrs. Auma', action: 'Entered Mid-Term grades for P6 East Mathematics', time: '1 hour ago' },
  { id: 'l3', who: 'Sarah Namuka', action: 'Recorded fee receipt UGX 450,000 for Grace Namutebi', time: '3 hours ago' },
  { id: 'l4', who: 'Najib Lule', action: 'Posted urgent announcement regarding fee extension', time: '5 hours ago' }
];

export const ATTENDANCE_TREND = [
  { date: 'Jul 19', Present: 312, Absent: 18, Late: 5 },
  { date: 'Jul 20', Present: 305, Absent: 25, Late: 8 },
  { date: 'Jul 21', Present: 320, Absent: 10, Late: 3 },
  { date: 'Jul 22', Present: 298, Absent: 32, Late: 11 },
  { date: 'Jul 23', Present: 315, Absent: 15, Late: 4 },
  { date: 'Jul 24', Present: 322, Absent: 8, Late: 2 },
  { date: 'Jul 25', Present: 318, Absent: 12, Late: 6 },
];

export const GENDER_DISTRIBUTION = [
  { name: 'Male', value: 172 },
  { name: 'Female', value: 158 },
];

export const GRADE_ENROLLMENT = [
  { name: 'P1', students: 28 },
  { name: 'P2', students: 31 },
  { name: 'P3', students: 26 },
  { name: 'P4', students: 34 },
  { name: 'P5', students: 29 },
  { name: 'P6', students: 33 },
  { name: 'P7', students: 21 },
];
