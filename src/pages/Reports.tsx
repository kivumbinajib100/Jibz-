import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  FileText,
  DollarSign,
  Award,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  User,
  School,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Student, ClassItem, FeeRecord, GradeRecord, AttendanceRecord } from '../types';
import { Card, Badge, Btn, Select, Input, PageHeader, Th, Td } from '../components/common/UI';
import { exportToCSV } from '../utils/excelCsv';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ReportsPageProps {
  students: Student[];
  classes: ClassItem[];
  fees: FeeRecord[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  customLogo?: string | null;
}

export interface EditableSubjectRow {
  id: string;
  subject: string;
  exam: string;
  marks: number | string;
  grade: string;
  remarks: string;
}

export interface EditableReportCardData {
  schoolName: string;
  schoolMotto: string;
  schoolContact: string;
  termName: string;
  reportTitle: string;
  approvalStatus: string;
  studentName: string;
  studentId: string;
  classStream: string;
  genderDob: string;
  guardianName: string;
  emergencyContact: string;
  admissionDate: string;
  enrollmentStatus: string;
  classPosition: string;
  subjects: EditableSubjectRow[];
  averageScore: string;
  overallDivision: string;
  attendanceSummary: string;
  conductRating: string;
  nextTermBegins: string;
  nextTermFees: string;
  feeStanding: string;
  classTeacherRemarks: string;
  classTeacherName: string;
  headteacherRemarks: string;
  headteacherName: string;
  stampText: string;
}

export function ReportsPage({
  students,
  classes,
  fees,
  grades,
  attendance,
  customLogo,
}: ReportsPageProps) {
  const [reportType, setReportType] = useState<'individual' | 'financial' | 'academic'>('individual');

  // State for Individual Report Card Selection
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || 'P6 East');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 2 2026');

  // Filter students for chosen class
  const classStudents = students.filter((s) => s.cls === selectedClass);
  const currentStudent = students.find((s) => s.id === selectedStudentId) || classStudents[0] || students[0];

  // Financial summary data
  const feeDataByClass = classes.map((c) => {
    const classFees = fees.filter((f) => f.cls === c.name);
    const due = classFees.reduce((acc, f) => acc + f.due, 0);
    const paid = classFees.reduce((acc, f) => acc + f.paid, 0);
    return { name: c.name, Due: due / 1000, Paid: paid / 1000 };
  });

  // Calculate Student Academic Statistics
  const studentGrades = currentStudent
    ? grades.filter((g) => g.student.toLowerCase() === currentStudent.name.toLowerCase() || g.studentId === currentStudent.id)
    : [];

  const totalMarks = studentGrades.reduce((sum, g) => sum + g.marks, 0);
  const calculatedAvgMarks = studentGrades.length > 0 ? (totalMarks / studentGrades.length).toFixed(1) : '0.0';

  let calculatedDivision = 'Division 1 (Distinction)';
  const avgNum = parseFloat(calculatedAvgMarks);
  if (avgNum >= 80) calculatedDivision = 'Division 1 (Distinction)';
  else if (avgNum >= 65) calculatedDivision = 'Division 2 (Credit)';
  else if (avgNum >= 50) calculatedDivision = 'Division 3 (Pass)';
  else calculatedDivision = 'Division 4 (Sub-Pass)';

  // Attendance stats for student
  const studentAttendance = currentStudent
    ? attendance.filter((a) => a.studentId === currentStudent.id || a.studentName.toLowerCase() === currentStudent.name.toLowerCase())
    : [];
  const presentDays = studentAttendance.filter((a) => a.status === 'present').length || 58;
  const absentDays = studentAttendance.filter((a) => a.status === 'absent').length || 2;
  const lateDays = studentAttendance.filter((a) => a.status === 'late').length || 1;

  // Fee stats for student
  const studentFees = currentStudent
    ? fees.filter((f) => f.studentId === currentStudent.id || f.student.toLowerCase() === currentStudent.name.toLowerCase())
    : [];
  const feeDueSum = studentFees.reduce((acc, f) => acc + f.due, 0);
  const feePaidSum = studentFees.reduce((acc, f) => acc + f.paid, 0);
  const feeBalance = feeDueSum - feePaidSum;

  function buildDefaultReportCardData(): EditableReportCardData {
    if (!currentStudent) {
      return {
        schoolName: 'ST. JUDE ACADEMY SCHOOLS',
        schoolMotto: 'National Curriculum Primary & Secondary Standards',
        schoolContact: 'P.O. Box 1022, Kampala • Tel: +256-700-112233 • Email: info@stjude.edu',
        termName: selectedTerm,
        reportTitle: 'OFFICIAL TERMINAL ACADEMIC TRANSCRIPT',
        approvalStatus: 'APPROVED REPORT',
        studentName: 'Student Name',
        studentId: 'STU-1001',
        classStream: 'P6 East',
        genderDob: 'Female (2014-05-12)',
        guardianName: 'Guardian Name',
        emergencyContact: '+256-700-000000',
        admissionDate: '2024-02-01',
        enrollmentStatus: 'ACTIVE ENROLLED',
        classPosition: '3rd out of 42 Students',
        subjects: [],
        averageScore: '0.0%',
        overallDivision: 'Division 1 (Distinction)',
        attendanceSummary: 'Present: 58 Days | Absent: 2 Days | Late: 1 Day',
        conductRating: 'Exemplary Conduct & High Moral Discipline',
        nextTermBegins: '15th September 2026',
        nextTermFees: 'UGX 650,000',
        feeStanding: 'FEES CLEARED',
        classTeacherRemarks: 'Demonstrates consistent discipline and commendable academic perseverance. Recommended for promotion.',
        classTeacherName: 'Mrs. Auma Margaret (Class Teacher)',
        headteacherRemarks: 'Good academic standard. Keep maintaining high discipline and focus on science subjects.',
        headteacherName: 'Dr. Najib Lule (Headteacher)',
        stampText: 'OFFICIAL SCHOOL STAMP & SEAL',
      };
    }

    const defaultSubjects: EditableSubjectRow[] = studentGrades.length > 0
      ? studentGrades.map((g) => ({
          id: g.id,
          subject: g.subject,
          exam: g.exam,
          marks: g.marks,
          grade: g.grade,
          remarks: g.remarks || 'Satisfactory achievement',
        }))
      : [
          { id: 'subj_1', subject: 'Mathematics', exam: 'Mid-Term Exam', marks: 88, grade: 'D1', remarks: 'Exceptional problem solving' },
          { id: 'subj_2', subject: 'English Language', exam: 'Mid-Term Exam', marks: 82, grade: 'D1', remarks: 'Fluent expression and grammar' },
          { id: 'subj_3', subject: 'Integrated Science', exam: 'Mid-Term Exam', marks: 78, grade: 'D2', remarks: 'Very good conceptual knowledge' },
          { id: 'subj_4', subject: 'Social Studies', exam: 'Mid-Term Exam', marks: 74, grade: 'C3', remarks: 'Good grasp of syllabus topics' },
        ];

    return {
      schoolName: 'ST. JUDE ACADEMY SCHOOLS',
      schoolMotto: 'National Curriculum Primary & Secondary Standards',
      schoolContact: 'P.O. Box 1022, Kampala • Tel: +256-700-112233 • Email: info@stjude.edu',
      termName: selectedTerm,
      reportTitle: 'OFFICIAL TERMINAL ACADEMIC TRANSCRIPT',
      approvalStatus: 'APPROVED REPORT',
      studentName: currentStudent.name,
      studentId: currentStudent.id,
      classStream: currentStudent.cls,
      genderDob: `${currentStudent.gender} (${currentStudent.dob})`,
      guardianName: currentStudent.guardian,
      emergencyContact: currentStudent.phone,
      admissionDate: currentStudent.admissionDate || '2024-02-01',
      enrollmentStatus: currentStudent.status ? currentStudent.status.toUpperCase() : 'ACTIVE ENROLLED',
      classPosition: '3rd out of 42 Students in Stream',
      subjects: defaultSubjects,
      averageScore: `${calculatedAvgMarks}%`,
      overallDivision: calculatedDivision,
      attendanceSummary: `Present: ${presentDays} Days | Absent: ${absentDays} | Late: ${lateDays}`,
      conductRating: 'Exemplary Conduct & High Moral Discipline',
      nextTermBegins: '15th September 2026',
      nextTermFees: 'UGX 650,000',
      feeStanding: feeBalance <= 0 ? 'FEES CLEARED (UGX 0 Balance)' : `UGX ${feeBalance.toLocaleString()} DUE`,
      classTeacherRemarks: `"${currentStudent.name} demonstrates consistent discipline and commendable academic perseverance. Recommended for promotion."`,
      classTeacherName: 'Mrs. Auma Margaret (Class Teacher)',
      headteacherRemarks: '"Good academic standard. Keep maintaining high discipline and focus on science subjects."',
      headteacherName: 'Dr. Najib Lule (Headteacher)',
      stampText: 'OFFICIAL SCHOOL STAMP & SEAL',
    };
  }

  // State for fully editable report card fields
  const [editableCard, setEditableCard] = useState<EditableReportCardData>(() =>
    buildDefaultReportCardData()
  );

  // Re-sync when student, term, or class changes
  useEffect(() => {
    setEditableCard(buildDefaultReportCardData());
  }, [currentStudent?.id, selectedTerm, selectedClass]);

  const handleResetCardToDefaults = () => {
    setEditableCard(buildDefaultReportCardData());
  };

  const handleAddSubjectRow = () => {
    const newSubj: EditableSubjectRow = {
      id: `subj_${Date.now()}`,
      subject: 'New Subject',
      exam: 'End of Term',
      marks: 75,
      grade: 'D2',
      remarks: 'Satisfactory effort',
    };
    setEditableCard((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubj],
    }));
  };

  const handleDeleteSubjectRow = (id: string) => {
    setEditableCard((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
  };

  const handleSubjectChange = (id: string, field: keyof EditableSubjectRow, val: string | number) => {
    setEditableCard((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    }));
  };

  const handleExportCSV = () => {
    if (reportType === 'individual' && currentStudent) {
      const headers = ['Subject Name', 'Assessment Period', 'Marks Score (%)', 'Grade Letter', 'Teacher Remarks'];
      const rows = editableCard.subjects.map((g) => [g.subject, g.exam, g.marks, g.grade, g.remarks]);
      exportToCSV(`${editableCard.studentName.replace(/\s+/g, '_')}_Editable_Report_Card.csv`, headers, rows);
    } else if (reportType === 'financial') {
      const headers = ['Student', 'Class', 'Type', 'Term', 'Amount Due (UGX)', 'Amount Paid (UGX)', 'Status'];
      const rows = fees.map((f) => [f.student, f.cls, f.type, f.term, f.due, f.paid, f.status]);
      exportToCSV('Financial_Fees_Audit_Report.csv', headers, rows);
    } else {
      const headers = ['Student', 'Class', 'Subject', 'Exam', 'Score', 'Grade', 'Remarks'];
      const rows = grades.map((g) => [g.student, g.cls, g.subject, g.exam, g.marks, g.grade, g.remarks || '']);
      exportToCSV('Academic_Performance_Audit.csv', headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Reports & Academic Standards"
        sub="Individual student academic standard report cards, terminal transcripts, and bursary audit statements."
      >
        <Btn variant="secondary" onClick={handleExportCSV}>
          <Download size={16} /> Export CSV Workbook
        </Btn>
        <Btn variant="primary" onClick={() => window.print()}>
          <Printer size={16} /> Print Report
        </Btn>
      </PageHeader>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-4 no-print">
        <button
          onClick={() => setReportType('individual')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            reportType === 'individual'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Individual Student Academic Report Card
        </button>
        <button
          onClick={() => setReportType('financial')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            reportType === 'financial'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Financial & Fee Collection Audit
        </button>
        <button
          onClick={() => setReportType('academic')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            reportType === 'academic'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Academic Performance Summary Audit
        </button>
      </div>

      {/* 1. INDIVIDUAL STUDENT ACADEMIC STANDARD REPORT CARD */}
      {reportType === 'individual' && (
        <div className="space-y-6">
          {/* Controls Bar & Pre-Print Edit Customizer Banner */}
          <Card className="!p-4 no-print space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                <Sparkles size={18} className="text-indigo-600" />
                <span>Interactive Pre-Print Report Card Customizer</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                  Every Field Editable
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Btn variant="secondary" onClick={handleResetCardToDefaults} className="!text-xs">
                  <RotateCcw size={14} /> Reset Calculated Defaults
                </Btn>
                <Btn variant="secondary" onClick={handleAddSubjectRow} className="!text-xs">
                  <Plus size={14} /> Add Subject Row
                </Btn>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Filter Class Stream</label>
                <Select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    const firstStudentInClass = students.find((s) => s.cls === e.target.value);
                    if (firstStudentInClass) setSelectedStudentId(firstStudentInClass.id);
                  }}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Select Student *</label>
                <Select
                  value={currentStudent?.id || ''}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Academic Session / Term</label>
                <Select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
                  <option value="Term 1 2026">Term 1 2026</option>
                  <option value="Term 2 2026">Term 2 2026</option>
                  <option value="Term 3 2026">Term 3 2026</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Official Print-Ready Report Card Container */}
          {currentStudent ? (
            <Card className="!p-8 bg-white border border-slate-300 shadow-lg print:shadow-none print:border-none print-clean space-y-6 max-w-4xl mx-auto">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-indigo-900 pb-5 gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left w-full sm:w-auto">
                  {customLogo ? (
                    <img src={customLogo} alt="School Logo" className="w-16 h-16 rounded-xl object-cover border border-slate-300 flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black flex-shrink-0">
                      <School size={32} />
                    </div>
                  )}
                  <div className="space-y-1 w-full">
                    <input
                      type="text"
                      value={editableCard.schoolName}
                      onChange={(e) => setEditableCard({ ...editableCard, schoolName: e.target.value })}
                      className="text-xl sm:text-2xl font-black text-indigo-950 uppercase tracking-tight w-full bg-slate-50/60 hover:bg-slate-100/80 focus:bg-white border border-transparent hover:border-slate-300 rounded px-1 py-0.5"
                      placeholder="School Institution Name"
                    />
                    <input
                      type="text"
                      value={editableCard.schoolMotto}
                      onChange={(e) => setEditableCard({ ...editableCard, schoolMotto: e.target.value })}
                      className="text-xs font-semibold text-slate-600 w-full bg-slate-50/60 hover:bg-slate-100/80 focus:bg-white border border-transparent hover:border-slate-300 rounded px-1 py-0.5 block"
                      placeholder="Curriculum / Motto"
                    />
                    <input
                      type="text"
                      value={editableCard.schoolContact}
                      onChange={(e) => setEditableCard({ ...editableCard, schoolContact: e.target.value })}
                      className="text-[11px] text-slate-500 font-mono w-full bg-slate-50/60 hover:bg-slate-100/80 focus:bg-white border border-transparent hover:border-slate-300 rounded px-1 py-0.5 block"
                      placeholder="Postal Address & Phone Contact"
                    />
                  </div>
                </div>

                <div className="text-center sm:text-right bg-indigo-50 p-3 rounded-2xl border border-indigo-100 space-y-1 flex-shrink-0 min-w-[200px]">
                  <input
                    type="text"
                    value={editableCard.reportTitle}
                    onChange={(e) => setEditableCard({ ...editableCard, reportTitle: e.target.value })}
                    className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider text-center sm:text-right w-full bg-indigo-100/50 hover:bg-white border border-transparent rounded px-1 py-0.5"
                    placeholder="Document Title"
                  />
                  <input
                    type="text"
                    value={editableCard.termName}
                    onChange={(e) => setEditableCard({ ...editableCard, termName: e.target.value })}
                    className="text-sm font-black text-slate-900 text-center sm:text-right w-full bg-white/80 border border-transparent rounded px-1 py-0.5 block"
                    placeholder="Academic Period / Term"
                  />
                  <input
                    type="text"
                    value={editableCard.approvalStatus}
                    onChange={(e) => setEditableCard({ ...editableCard, approvalStatus: e.target.value })}
                    className="text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded px-2 py-0.5 text-center w-full uppercase"
                    placeholder="Approval Tag"
                  />
                </div>
              </div>

              {/* Student Identification Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Student Full Name</span>
                  <input
                    type="text"
                    value={editableCard.studentName}
                    onChange={(e) => setEditableCard({ ...editableCard, studentName: e.target.value })}
                    className="font-black text-slate-900 text-sm w-full bg-white/80 border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">LIN / Registration ID</span>
                  <input
                    type="text"
                    value={editableCard.studentId}
                    onChange={(e) => setEditableCard({ ...editableCard, studentId: e.target.value })}
                    className="font-mono font-bold text-indigo-700 text-sm w-full bg-white/80 border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Class & Stream</span>
                  <input
                    type="text"
                    value={editableCard.classStream}
                    onChange={(e) => setEditableCard({ ...editableCard, classStream: e.target.value })}
                    className="font-bold text-slate-900 text-xs w-full bg-white/80 border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Gender & Date of Birth</span>
                  <input
                    type="text"
                    value={editableCard.genderDob}
                    onChange={(e) => setEditableCard({ ...editableCard, genderDob: e.target.value })}
                    className="text-slate-800 font-semibold w-full bg-white/80 border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Parent / Guardian Name</span>
                  <input
                    type="text"
                    value={editableCard.guardianName}
                    onChange={(e) => setEditableCard({ ...editableCard, guardianName: e.target.value })}
                    className="text-slate-800 font-medium w-full bg-white/80 border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Emergency Contact Phone</span>
                  <input
                    type="text"
                    value={editableCard.emergencyContact}
                    onChange={(e) => setEditableCard({ ...editableCard, emergencyContact: e.target.value })}
                    className="text-slate-800 font-mono w-full bg-white/80 border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Date of Admission</span>
                  <input
                    type="text"
                    value={editableCard.admissionDate}
                    onChange={(e) => setEditableCard({ ...editableCard, admissionDate: e.target.value })}
                    className="text-slate-800 w-full bg-white/80 border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Class Position / Rank</span>
                  <input
                    type="text"
                    value={editableCard.classPosition}
                    onChange={(e) => setEditableCard({ ...editableCard, classPosition: e.target.value })}
                    className="font-bold text-indigo-900 w-full bg-white/80 border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
              </div>

              {/* Subject Academic Performance Breakdown Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Award size={16} className="text-indigo-600" /> Subject Assessment & Grading Breakdown
                  </h3>
                  <div className="flex items-center gap-2 no-print">
                    <span className="text-xs text-slate-500 font-medium">Assessed Subjects: {editableCard.subjects.length}</span>
                    <button
                      type="button"
                      onClick={handleAddSubjectRow}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Row
                    </button>
                  </div>
                </div>

                <div className="border border-slate-300 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 font-bold text-slate-800 uppercase text-[10px]">
                      <tr>
                        <th className="p-3 border-b border-slate-200">Subject Name</th>
                        <th className="p-3 border-b border-slate-200">Assessment / Exam Period</th>
                        <th className="p-3 border-b border-slate-200 text-center w-24">Score Marks (%)</th>
                        <th className="p-3 border-b border-slate-200 text-center w-24">Grade Letter</th>
                        <th className="p-3 border-b border-slate-200">Subject Teacher Remarks</th>
                        <th className="p-3 border-b border-slate-200 w-10 no-print"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableCard.subjects.map((s) => (
                        <tr key={s.id} className="border-t border-slate-200 hover:bg-slate-50/50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.subject}
                              onChange={(e) => handleSubjectChange(s.id, 'subject', e.target.value)}
                              className="font-bold text-slate-900 w-full bg-white/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5"
                              placeholder="Subject Name"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.exam}
                              onChange={(e) => handleSubjectChange(s.id, 'exam', e.target.value)}
                              className="text-slate-600 w-full bg-white/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5"
                              placeholder="Exam Period"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="text"
                              value={s.marks}
                              onChange={(e) => handleSubjectChange(s.id, 'marks', e.target.value)}
                              className="font-black text-slate-900 text-center text-sm w-full bg-white/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5"
                              placeholder="Marks"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="text"
                              value={s.grade}
                              onChange={(e) => handleSubjectChange(s.id, 'grade', e.target.value)}
                              className="font-black text-xs text-indigo-900 bg-indigo-50 border border-indigo-200 rounded px-1 py-0.5 text-center w-full"
                              placeholder="Grade"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.remarks}
                              onChange={(e) => handleSubjectChange(s.id, 'remarks', e.target.value)}
                              className="text-slate-600 italic w-full bg-white/60 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5"
                              placeholder="Teacher Remarks"
                            />
                          </td>
                          <td className="p-2 text-center no-print">
                            <button
                              type="button"
                              onClick={() => handleDeleteSubjectRow(s.id)}
                              className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove subject row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {editableCard.subjects.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                            No subject assessment rows. Click "+ Add Row" above to enter subjects.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Performance & Administrative Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-indigo-700 uppercase block">Terminal Average Score (%)</span>
                  <input
                    type="text"
                    value={editableCard.averageScore}
                    onChange={(e) => setEditableCard({ ...editableCard, averageScore: e.target.value })}
                    className="text-2xl font-black text-indigo-950 w-full bg-white/80 border border-indigo-200 rounded px-1 py-0.5"
                  />
                  <input
                    type="text"
                    value={editableCard.overallDivision}
                    onChange={(e) => setEditableCard({ ...editableCard, overallDivision: e.target.value })}
                    className="text-xs font-bold text-indigo-800 w-full bg-white/80 border border-indigo-200 rounded px-1 py-0.5 block"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Terminal Attendance Record</span>
                  <input
                    type="text"
                    value={editableCard.attendanceSummary}
                    onChange={(e) => setEditableCard({ ...editableCard, attendanceSummary: e.target.value })}
                    className="text-xs font-bold text-emerald-950 w-full bg-white/80 border border-emerald-200 rounded px-1 py-0.5"
                  />
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase block mt-2">Conduct & Discipline Rating</span>
                  <input
                    type="text"
                    value={editableCard.conductRating}
                    onChange={(e) => setEditableCard({ ...editableCard, conductRating: e.target.value })}
                    className="text-xs font-medium text-emerald-900 w-full bg-white/80 border border-emerald-200 rounded px-1 py-0.5 block"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-600 uppercase block">Next Term Resumption & Fees</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-bold">Resumes:</span>
                    <input
                      type="text"
                      value={editableCard.nextTermBegins}
                      onChange={(e) => setEditableCard({ ...editableCard, nextTermBegins: e.target.value })}
                      className="text-xs font-bold text-slate-900 w-full bg-white border border-slate-200 rounded px-1 py-0.5"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-bold">Fees:</span>
                    <input
                      type="text"
                      value={editableCard.nextTermFees}
                      onChange={(e) => setEditableCard({ ...editableCard, nextTermFees: e.target.value })}
                      className="text-xs font-bold text-slate-900 w-full bg-white border border-slate-200 rounded px-1 py-0.5"
                    />
                  </div>
                  <input
                    type="text"
                    value={editableCard.feeStanding}
                    onChange={(e) => setEditableCard({ ...editableCard, feeStanding: e.target.value })}
                    className="text-xs font-semibold text-slate-700 w-full bg-white border border-slate-200 rounded px-1 py-0.5 block mt-1"
                  />
                </div>
              </div>

              {/* Official Remarks & Signatures */}
              <div className="pt-4 border-t border-slate-300 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-800 block text-[11px]">Class Teacher Official Remarks:</label>
                    <textarea
                      rows={2}
                      value={editableCard.classTeacherRemarks}
                      onChange={(e) => setEditableCard({ ...editableCard, classTeacherRemarks: e.target.value })}
                      className="text-slate-700 italic w-full bg-white border border-slate-200 rounded p-1 text-xs"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-800 block text-[11px]">Headteacher / Principal Summary Assessment:</label>
                    <textarea
                      rows={2}
                      value={editableCard.headteacherRemarks}
                      onChange={(e) => setEditableCard({ ...editableCard, headteacherRemarks: e.target.value })}
                      className="text-slate-700 italic w-full bg-white border border-slate-200 rounded p-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-dashed border-slate-300 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">Class Teacher Signature & Title:</span>
                    <input
                      type="text"
                      value={editableCard.classTeacherName}
                      onChange={(e) => setEditableCard({ ...editableCard, classTeacherName: e.target.value })}
                      className="font-serif italic text-slate-800 text-sm font-semibold w-full bg-slate-50 border-b border-slate-400 pb-1"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">Headteacher Stamp & Signature:</span>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-400 pb-1">
                      <input
                        type="text"
                        value={editableCard.headteacherName}
                        onChange={(e) => setEditableCard({ ...editableCard, headteacherName: e.target.value })}
                        className="font-serif italic text-slate-800 font-bold text-sm w-full bg-slate-50"
                      />
                      <input
                        type="text"
                        value={editableCard.stampText}
                        onChange={(e) => setEditableCard({ ...editableCard, stampText: e.target.value })}
                        className="text-[9px] bg-slate-200 font-bold px-2 py-0.5 rounded text-slate-700 uppercase flex-shrink-0 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between gap-2 no-print">
                <p className="text-xs text-slate-400 italic">
                  Tip: All edits above are preserved for printing. Click button to launch browser print.
                </p>
                <Btn variant="primary" onClick={() => window.print()}>
                  <Printer size={16} /> Print Student Report Card
                </Btn>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400">
              Select a student above to display their academic standard report card.
            </Card>
          )}
        </div>
      )}

      {/* 2. FINANCIAL AUDIT VIEW */}
      {reportType === 'financial' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Fee Revenue Collection Breakdown by Stream (Thousands UGX)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Invoiced Billable Total vs Revenue Collected</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeDataByClass}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Due" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-900">
              Detailed Financial Bursary Audit Log
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class Stream</th>
                    <th className="p-3">Fee Category</th>
                    <th className="p-3">Term</th>
                    <th className="p-3">Invoiced (UGX)</th>
                    <th className="p-3">Paid (UGX)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((f) => (
                    <tr key={f.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{f.student}</td>
                      <td className="p-3">{f.cls}</td>
                      <td className="p-3">{f.type}</td>
                      <td className="p-3">{f.term}</td>
                      <td className="p-3 font-mono font-bold">{f.due.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">{f.paid.toLocaleString()}</td>
                      <td className="p-3">
                        <Badge tone={f.status === 'paid' ? 'green' : f.status === 'partial' ? 'yellow' : 'red'}>
                          {f.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 3. ACADEMIC PERFORMANCE AUDIT VIEW */}
      {reportType === 'academic' && (
        <div className="space-y-6">
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-900">
              Assessment Performance Master Score Sheet
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Stream</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Exam Period</th>
                    <th className="p-3">Marks (%)</th>
                    <th className="p-3">Calculated Grade</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{g.student}</td>
                      <td className="p-3">{g.cls}</td>
                      <td className="p-3 font-semibold text-slate-800">{g.subject}</td>
                      <td className="p-3">{g.exam}</td>
                      <td className="p-3 font-black text-slate-900">{g.marks}%</td>
                      <td className="p-3">
                        <Badge tone="blue">{g.grade}</Badge>
                      </td>
                      <td className="p-3 text-slate-500 italic">{g.remarks || 'Satisfactory'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
