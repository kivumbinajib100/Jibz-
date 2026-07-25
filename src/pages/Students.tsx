import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Download,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { Student, ClassItem, FeeRecord, GradeRecord } from '../types';
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
import { ExcelImportModal } from '../components/ExcelImportModal';
import { exportToExcelWorkbook } from '../utils/excelCsv';

interface StudentsPageProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classes: ClassItem[];
  fees: FeeRecord[];
  grades: GradeRecord[];
  globalSearch: string;
  onAddActivity: (action: string) => void;
}

export function StudentsPage({
  students,
  setStudents,
  classes,
  fees,
  grades,
  globalSearch,
  onAddActivity,
}: StudentsPageProps) {
  const [search, setSearch] = useState(globalSearch || '');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleImportStudents = (parsedRows: string[][]) => {
    if (parsedRows.length < 2) return { successCount: 0, errors: ['File contains no student data rows'] };

    const header = parsedRows[0].map((h) => h.toLowerCase().trim());
    const nameIdx = header.findIndex((h) => h.includes('name') && !h.includes('guardian') && !h.includes('parent'));
    const genderIdx = header.findIndex((h) => h.includes('gender') || h.includes('sex'));
    const classIdx = header.findIndex((h) => h.includes('class') || h.includes('stream') || h.includes('cls'));
    const statusIdx = header.findIndex((h) => h.includes('status'));
    const dobIdx = header.findIndex((h) => h.includes('dob') || h.includes('birth'));
    const guardianIdx = header.findIndex((h) => h.includes('guardian') || h.includes('parent'));
    const phoneIdx = header.findIndex((h) => h.includes('phone') || h.includes('contact') || h.includes('mobile'));
    const emailIdx = header.findIndex((h) => h.includes('email') || h.includes('mail'));
    const addressIdx = header.findIndex((h) => h.includes('address') || h.includes('residence') || h.includes('location'));

    const newStudents: Student[] = [];
    const errors: string[] = [];

    parsedRows.slice(1).forEach((row, rowIdx) => {
      const name = nameIdx !== -1 ? row[nameIdx] : row[0];
      if (!name || name.trim().length === 0) {
        errors.push(`Row ${rowIdx + 2}: Skipped (Student name is missing)`);
        return;
      }

      const gender = (genderIdx !== -1 ? row[genderIdx] : 'Male').match(/female|f/i) ? 'Female' : 'Male';
      const cls = (classIdx !== -1 ? row[classIdx] : '') || classes[0]?.name || 'P1 East';
      const statusRaw = statusIdx !== -1 ? row[statusIdx].toLowerCase() : 'active';
      const status = statusRaw.includes('inact') ? 'inactive' : 'active';
      const dob = (dobIdx !== -1 ? row[dobIdx] : '') || '2016-01-01';
      const guardian = (guardianIdx !== -1 ? row[guardianIdx] : '') || `${name.split(' ')[0]}'s Guardian`;
      const phone = (phoneIdx !== -1 ? row[phoneIdx] : '') || '+256 700 000000';
      const email = (emailIdx !== -1 ? row[emailIdx] : '') || '';
      const address = (addressIdx !== -1 ? row[addressIdx] : '') || 'Main Campus';

      const studentId = `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      newStudents.push({
        id: studentId,
        name: name.trim(),
        gender,
        cls: cls.trim(),
        status,
        dob: dob.trim(),
        guardian: guardian.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        admissionDate: new Date().toISOString().split('T')[0],
      });
    });

    if (newStudents.length > 0) {
      setStudents((prev) => [...newStudents, ...prev]);
      onAddActivity(`Imported ${newStudents.length} student records via Excel workbook`);
    }

    return { successCount: newStudents.length, errors };
  };

  const handleExportExcel = () => {
    const exportRows = filteredStudents.map((s) => [
      s.id,
      s.name,
      s.gender,
      s.cls,
      s.status,
      s.dob,
      s.guardian,
      s.phone,
      s.email || '',
      s.address || '',
    ]);

    exportToExcelWorkbook('Students_Registry_2026.xlsx', [
      {
        sheetName: 'Students',
        headers: ['Student ID', 'Full Name', 'Gender', 'Class Stream', 'Status', 'Date of Birth', 'Guardian Name', 'Phone', 'Email', 'Address'],
        rows: exportRows,
      },
    ]);
    onAddActivity(`Exported ${filteredStudents.length} student records to Excel workbook`);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    gender: 'Male',
    cls: classes[0]?.name || 'P1 East',
    status: 'active',
    dob: '2015-01-01',
    guardian: '',
    phone: '',
    email: '',
    address: '',
  });

  const filteredStudents = students.filter((s) => {
    const query = (search || globalSearch).toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query) ||
      s.guardian.toLowerCase().includes(query);
    const matchesClass = selectedClass === 'all' || s.cls === selectedClass;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    const matchesGender = selectedGender === 'all' || s.gender === selectedGender;
    return matchesSearch && matchesClass && matchesStatus && matchesGender;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.guardian) return;

    const newId = `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newStudent: Student = {
      id: newId,
      name: formData.name,
      gender: (formData.gender as 'Male' | 'Female') || 'Male',
      cls: formData.cls || 'P1 East',
      status: (formData.status as 'active' | 'inactive') || 'active',
      dob: formData.dob || '2015-01-01',
      guardian: formData.guardian,
      phone: formData.phone || '+256-700-000000',
      email: formData.email,
      address: formData.address,
      admissionDate: new Date().toISOString().split('T')[0],
    };

    setStudents([newStudent, ...students]);
    onAddActivity(`Registered new student ${newStudent.name} (${newStudent.id})`);
    setIsAddOpen(false);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !formData.name) return;

    const updated = students.map((s) =>
      s.id === editingStudent.id ? ({ ...s, ...formData } as Student) : s
    );
    setStudents(updated);
    onAddActivity(`Updated student details for ${formData.name}`);
    setEditingStudent(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingStudentId) return;
    const s = students.find((x) => x.id === deletingStudentId);
    setStudents(students.filter((x) => x.id !== deletingStudentId));
    if (s) onAddActivity(`Deleted student ${s.name}`);
    setDeletingStudentId(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'Male',
      cls: classes[0]?.name || 'P1 East',
      status: 'active',
      dob: '2015-01-01',
      guardian: '',
      phone: '',
      email: '',
      address: '',
    });
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setFormData({ ...s });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Admissions & Management"
        sub={`Total Registered Students: ${students.length}`}
      >
        <div className="flex items-center gap-2">
          <Btn variant="secondary" onClick={() => setIsExcelModalOpen(true)}>
            <FileSpreadsheet size={16} className="text-emerald-600" /> Excel Import / Export
          </Btn>
          <Btn variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Register Student
          </Btn>
        </div>
      </PageHeader>

      {/* Filters Bar */}
      <Card className="!p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, ID, guardian..."
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

          <Select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>

          <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </Select>
        </div>
      </Card>

      {/* Student List Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <Th>ID & Student Name</Th>
                <Th>Class Stream</Th>
                <Th>Gender</Th>
                <Th>Guardian & Contact</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <Td>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-[11px] font-mono font-medium text-indigo-600">{s.id}</p>
                      </div>
                    </Td>
                    <Td>
                      <Badge tone="blue">{s.cls}</Badge>
                    </Td>
                    <Td>
                      <span className="text-xs font-medium text-slate-700">{s.gender}</span>
                    </Td>
                    <Td>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{s.guardian}</p>
                        <p className="text-[11px] text-slate-500">{s.phone}</p>
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={s.status === 'active' ? 'green' : 'red'}>
                        {s.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingStudent(s)}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          title="Edit Student"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingStudentId(s.id)}
                          title="Delete Student"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Add Student Modal */}
      <Modal
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          resetForm();
        }}
        title="Register New Student"
        subtitle="Fill in student bio and guardian details for school admission."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Full Student Name *</Label>
            <Input
              required
              placeholder="e.g. Grace Namutebi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Gender *</Label>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </div>
            <div>
              <Label>Class Stream *</Label>
              <Select
                value={formData.cls}
                onChange={(e) => setFormData({ ...formData, cls: e.target.value })}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Guardian & Emergency Info
            </p>
            <div className="space-y-3">
              <div>
                <Label>Guardian Name *</Label>
                <Input
                  required
                  placeholder="e.g. Peter Namutebi"
                  value={formData.guardian}
                  onChange={(e) => setFormData({ ...formData, guardian: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+256-700-000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="guardian@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Residential Address</Label>
                <Input
                  placeholder="Plot / Street / Village address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Save & Register
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        open={!!editingStudent}
        onClose={() => {
          setEditingStudent(null);
          resetForm();
        }}
        title={`Edit Student: ${editingStudent?.name}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Label>Full Student Name *</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Gender</Label>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </div>
            <div>
              <Label>Class Stream</Label>
              <Select
                value={formData.cls}
                onChange={(e) => setFormData({ ...formData, cls: e.target.value })}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div>
              <Label>Guardian Name</Label>
              <Input
                value={formData.guardian}
                onChange={(e) => setFormData({ ...formData, guardian: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Guardian Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingStudent(null);
                resetForm();
              }}
            >
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Update Student
            </Btn>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      <Modal
        open={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        title="Student Profile & Transcript"
        size="lg"
      >
        {viewingStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                {viewingStudent.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-slate-900">{viewingStudent.name}</h3>
                  <Badge tone={viewingStudent.status === 'active' ? 'green' : 'red'}>
                    {viewingStudent.status}
                  </Badge>
                </div>
                <p className="text-xs font-mono font-bold text-indigo-600">{viewingStudent.id}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Class Stream: <span className="font-bold text-slate-800">{viewingStudent.cls}</span> | Gender:{' '}
                  <span className="font-bold text-slate-800">{viewingStudent.gender}</span>
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <p className="text-slate-400 font-bold uppercase">Guardian</p>
                <p className="font-bold text-slate-800 mt-0.5">{viewingStudent.guardian}</p>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <p className="text-slate-400 font-bold uppercase">Phone Number</p>
                <p className="font-bold text-slate-800 mt-0.5">{viewingStudent.phone}</p>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <p className="text-slate-400 font-bold uppercase">Date of Birth</p>
                <p className="font-bold text-slate-800 mt-0.5">{viewingStudent.dob}</p>
              </div>
            </div>

            {/* Fees History */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Fee Payment Summary</h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                {fees
                  .filter((f) => f.studentId === viewingStudent.id || f.student === viewingStudent.name)
                  .map((f) => (
                    <div key={f.id} className="flex items-center justify-between text-xs">
                      <span>
                        {f.type} ({f.term}):
                      </span>
                      <span className="font-bold">
                        Paid: UGX {f.paid.toLocaleString()} / UGX {f.due.toLocaleString()}
                      </span>
                    </div>
                  ))}
                {fees.filter(
                  (f) => f.studentId === viewingStudent.id || f.student === viewingStudent.name
                ).length === 0 && (
                  <p className="text-xs text-slate-400">No fee payment records found.</p>
                )}
              </div>
            </div>

            {/* Grades History */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Academic Grades</h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 font-bold text-slate-500">
                    <tr>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Exam</th>
                      <th className="p-2">Marks</th>
                      <th className="p-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades
                      .filter(
                        (g) => g.studentId === viewingStudent.id || g.student === viewingStudent.name
                      )
                      .map((g) => (
                        <tr key={g.id} className="border-t border-slate-100">
                          <td className="p-2 font-medium">{g.subject}</td>
                          <td className="p-2">{g.exam}</td>
                          <td className="p-2 font-bold">{g.marks}%</td>
                          <td className="p-2">
                            <Badge tone="blue">{g.grade}</Badge>
                          </td>
                        </tr>
                      ))}
                    {grades.filter(
                      (g) => g.studentId === viewingStudent.id || g.student === viewingStudent.name
                    ).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-400">
                          No grades logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!deletingStudentId}
        title="Delete Student Record"
        message="Are you sure you want to delete this student record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeletingStudentId(null)}
      />

      {/* Excel Import & Export Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        entityType="students"
        title="Students Registry"
        onImportData={handleImportStudents}
        onExportData={handleExportExcel}
      />
    </div>
  );
}
