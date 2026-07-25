import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { Student, ClassItem, SubjectItem, GradeRecord, GradeScaleItem } from '../types';
import {
  Card,
  Badge,
  Btn,
  Input,
  Select,
  Label,
  Modal,
  ConfirmDialog,
  PageHeader,
  Th,
  Td,
} from '../components/common/UI';
import { exportToExcelWorkbook } from '../utils/excelCsv';
import { ExcelImportModal } from '../components/ExcelImportModal';

interface GradesPageProps {
  students: Student[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  grades: GradeRecord[];
  setGrades: React.Dispatch<React.SetStateAction<GradeRecord[]>>;
  gradeScale: GradeScaleItem[];
  onAddActivity: (action: string) => void;
}

export function GradesPage({
  students,
  classes,
  subjects,
  grades,
  setGrades,
  gradeScale,
  onAddActivity,
}: GradesPageProps) {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [search, setSearch] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingGradeId, setDeletingGradeId] = useState<string | null>(null);

  // Helper to compute grade letter from score
  const getGradeFromMarks = (marks: number): string => {
    const found = gradeScale.find((s) => marks >= s.min && marks <= s.max);
    return found ? found.g : 'F9';
  };

  const [formData, setFormData] = useState({
    studentId: '',
    cls: classes[0]?.name || 'P6 East',
    subject: subjects[0]?.name || 'Mathematics',
    exam: 'Mid-Term',
    marks: 75,
    remarks: '',
  });

  const classStudents = students.filter((s) => s.cls === formData.cls);

  const filteredGrades = grades.filter((g) => {
    const q = search.toLowerCase();
    const matchesSearch =
      g.student.toLowerCase().includes(q) ||
      g.subject.toLowerCase().includes(q) ||
      g.grade.toLowerCase().includes(q);
    const matchesClass = selectedClass === 'all' || g.cls === selectedClass;
    const matchesSubject = selectedSubject === 'all' || g.subject === selectedSubject;
    return matchesSearch && matchesClass && matchesSubject;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formData.studentId) || classStudents[0];
    if (!student) {
      alert('Please select a student.');
      return;
    }

    const calculatedGrade = getGradeFromMarks(Number(formData.marks));
    const newRecord: GradeRecord = {
      id: `g_${Date.now()}`,
      studentId: student.id,
      student: student.name,
      cls: formData.cls,
      subject: formData.subject,
      exam: formData.exam,
      marks: Number(formData.marks),
      grade: calculatedGrade,
      date: new Date().toISOString().split('T')[0],
      remarks: formData.remarks || 'Satisfactory performance',
    };

    setGrades([newRecord, ...grades]);
    onAddActivity(`Recorded ${formData.exam} mark (${formData.marks}%, ${calculatedGrade}) for ${student.name}`);
    setIsAddOpen(false);
  };

  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleDelete = () => {
    if (!deletingGradeId) return;
    setGrades(grades.filter((x) => x.id !== deletingGradeId));
    onAddActivity(`Deleted grade record`);
    setDeletingGradeId(null);
  };

  const handleImportGrades = (parsedRows: string[][]) => {
    if (parsedRows.length < 2) return { successCount: 0, errors: ['File contains no assessment mark rows'] };

    const header = parsedRows[0].map((h) => h.toLowerCase().trim());
    const stuIdIdx = header.findIndex((h) => h.includes('student id') || h.includes('stuid'));
    const stuNameIdx = header.findIndex((h) => h.includes('student') && !h.includes('id'));
    const classIdx = header.findIndex((h) => h.includes('class') || h.includes('stream'));
    const subIdx = header.findIndex((h) => h.includes('subject') || h.includes('course'));
    const examIdx = header.findIndex((h) => h.includes('exam') || h.includes('assessment') || h.includes('test'));
    const markIdx = header.findIndex((h) => h.includes('mark') || h.includes('score') || h.includes('point'));
    const remarkIdx = header.findIndex((h) => h.includes('remark') || h.includes('comment'));

    const newRecords: GradeRecord[] = [];
    const errors: string[] = [];

    parsedRows.slice(1).forEach((row, rowIdx) => {
      const studentName = (stuNameIdx !== -1 ? row[stuNameIdx] : row[1] || row[0]) || 'Imported Student';
      const studentId = (stuIdIdx !== -1 ? row[stuIdIdx] : row[0]) || `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      const cls = (classIdx !== -1 ? row[classIdx] : '') || 'P6 East';
      const subject = (subIdx !== -1 ? row[subIdx] : '') || 'Mathematics';
      const exam = (examIdx !== -1 ? row[examIdx] : '') || 'Mid-Term Exam';
      const marks = markIdx !== -1 ? Number(row[markIdx]) || 70 : 70;
      const remarks = (remarkIdx !== -1 ? row[remarkIdx] : '') || 'Good performance';

      newRecords.push({
        id: `g_${Date.now()}_${rowIdx}`,
        studentId,
        student: studentName.trim(),
        cls: cls.trim(),
        subject: subject.trim(),
        exam: exam.trim(),
        marks,
        grade: getGradeFromMarks(marks),
        date: new Date().toISOString().split('T')[0],
        remarks: remarks.trim(),
      });
    });

    if (newRecords.length > 0) {
      setGrades((prev) => [...newRecords, ...prev]);
      onAddActivity(`Imported ${newRecords.length} assessment records via Excel workbook`);
    }

    return { successCount: newRecords.length, errors };
  };

  const handleExportExcel = () => {
    const exportRows = filteredGrades.map((g) => [
      g.studentId,
      g.student,
      g.cls,
      g.subject,
      g.exam,
      g.marks,
      g.grade,
      g.date,
      g.remarks || '',
    ]);

    exportToExcelWorkbook('Assessment_Grades_Registry_2026.xlsx', [
      {
        sheetName: 'Grades',
        headers: ['Student ID', 'Student Name', 'Class Stream', 'Subject Name', 'Exam Type', 'Marks Score (%)', 'Calculated Grade', 'Date Entered', 'Teacher Remarks'],
        rows: exportRows,
      },
    ]);
    onAddActivity(`Exported ${filteredGrades.length} grade records to Excel workbook`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grade Book & Assessment Score Registry"
        sub="Record assessment scores, manage exam marks, and track student subject rankings."
      >
        <div className="flex items-center gap-2">
          <Btn variant="secondary" onClick={() => setIsExcelModalOpen(true)}>
            <FileSpreadsheet size={16} className="text-emerald-600" /> Excel Import / Export
          </Btn>
          <Btn variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Enter Assessment Score
          </Btn>
        </div>
      </PageHeader>

      {/* Filter Bar */}
      <Card className="!p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search student, subject, grade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!pl-9"
            />
          </div>

          <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="all">All Class Streams</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Grade Book Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Grade Book Entries ({filteredGrades.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <Th>Student Name & Stream</Th>
                <Th>Subject</Th>
                <Th>Exam Type</Th>
                <Th>Score / Marks</Th>
                <Th>Calculated Grade</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    No grade records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 border-b border-slate-100">
                    <Td>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{g.student}</p>
                        <p className="text-[11px] text-slate-500">{g.cls}</p>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-semibold text-slate-800 text-xs">{g.subject}</span>
                    </Td>
                    <Td>
                      <Badge tone="purple">{g.exam}</Badge>
                    </Td>
                    <Td>
                      <span className="font-black text-slate-900 text-sm">{g.marks}%</span>
                    </Td>
                    <Td>
                      <Badge tone="blue">{g.grade}</Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDeletingGradeId(g.id)}
                          title="Delete Score"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Grade Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Enter Assessment Score">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Class Stream</Label>
            <Select
              value={formData.cls}
              onChange={(e) => setFormData({ ...formData, cls: e.target.value, studentId: '' })}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Select Student *</Label>
            <Select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            >
              <option value="">-- Choose Student --</option>
              {classStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Subject</Label>
              <Select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Assessment Exam</Label>
              <Select
                value={formData.exam}
                onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
              >
                <option value="Beginning of Term">Beginning of Term</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="End of Term">End of Term</option>
                <option value="Mock Examination">Mock Examination</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Score / Marks (0 - 100) *</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={100}
                required
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
              />
              <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl font-bold text-indigo-700 text-sm whitespace-nowrap">
                Grade: {getGradeFromMarks(Number(formData.marks))}
              </div>
            </div>
          </div>

          <div>
            <Label>Teacher Remarks</Label>
            <Input
              placeholder="e.g. Excellent grasp of concepts"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Save Score
            </Btn>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deletingGradeId}
        title="Delete Score"
        message="Are you sure you want to remove this assessment entry?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingGradeId(null)}
      />

      {/* Excel Import & Export Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        entityType="grades"
        title="Grade Book & Assessment Score Registry"
        onImportData={handleImportGrades}
        onExportData={handleExportExcel}
      />
    </div>
  );
}
