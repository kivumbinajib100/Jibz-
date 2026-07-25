import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, GraduationCap, Phone, Mail, Award, FileSpreadsheet } from 'lucide-react';
import { Teacher, SubjectItem } from '../types';
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

interface TeachersPageProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  subjects: SubjectItem[];
  globalSearch: string;
  onAddActivity: (action: string) => void;
}

export function TeachersPage({
  teachers,
  setTeachers,
  subjects,
  globalSearch,
  onAddActivity,
}: TeachersPageProps) {
  const [search, setSearch] = useState(globalSearch || '');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleImportTeachers = (parsedRows: string[][]) => {
    if (parsedRows.length < 2) return { successCount: 0, errors: ['File contains no teacher data rows'] };

    const header = parsedRows[0].map((h) => h.toLowerCase().trim());
    const nameIdx = header.findIndex((h) => h.includes('name'));
    const specIdx = header.findIndex((h) => h.includes('spec') || h.includes('subject'));
    const qualIdx = header.findIndex((h) => h.includes('qual') || h.includes('degree'));
    const statusIdx = header.findIndex((h) => h.includes('status'));
    const phoneIdx = header.findIndex((h) => h.includes('phone') || h.includes('contact'));
    const emailIdx = header.findIndex((h) => h.includes('email') || h.includes('mail'));

    const newTeachers: Teacher[] = [];
    const errors: string[] = [];

    parsedRows.slice(1).forEach((row, rowIdx) => {
      const name = nameIdx !== -1 ? row[nameIdx] : row[0];
      if (!name || name.trim().length === 0) {
        errors.push(`Row ${rowIdx + 2}: Skipped (Teacher name missing)`);
        return;
      }

      const spec = (specIdx !== -1 ? row[specIdx] : '') || 'Mathematics';
      const qual = (qualIdx !== -1 ? row[qualIdx] : '') || 'B.Ed';
      const statusRaw = (statusIdx !== -1 ? row[statusIdx] : 'active').toLowerCase();
      let status: 'active' | 'on leave' | 'inactive' = 'active';
      if (statusRaw.includes('leave')) status = 'on leave';
      else if (statusRaw.includes('inact')) status = 'inactive';

      const phone = (phoneIdx !== -1 ? row[phoneIdx] : '') || '+256-770-000000';
      const email = (emailIdx !== -1 ? row[emailIdx] : '') || `${name.toLowerCase().replace(/\s+/g, '')}@school.edu`;

      newTeachers.push({
        id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name.trim(),
        spec: spec.trim(),
        qual: qual.trim(),
        subjects: spec.trim(),
        status,
        phone: phone.trim(),
        email: email.trim(),
      });
    });

    if (newTeachers.length > 0) {
      setTeachers((prev) => [...newTeachers, ...prev]);
      onAddActivity(`Imported ${newTeachers.length} teacher records via Excel workbook`);
    }

    return { successCount: newTeachers.length, errors };
  };

  const handleExportExcel = () => {
    const exportRows = filteredTeachers.map((t) => [
      t.id,
      t.name,
      t.spec,
      t.qual,
      t.subjects,
      t.status,
      t.phone,
      t.email,
    ]);

    exportToExcelWorkbook('Teachers_Faculty_2026.xlsx', [
      {
        sheetName: 'Teachers',
        headers: ['Teacher ID', 'Full Name', 'Primary Specialization', 'Qualification', 'Assigned Subjects', 'Status', 'Phone', 'Email'],
        rows: exportRows,
      },
    ]);
    onAddActivity(`Exported ${filteredTeachers.length} teacher records to Excel workbook`);
  };

  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    spec: subjects[0]?.name || 'Mathematics',
    qual: 'B.Ed',
    subjects: 'Mathematics',
    status: 'active',
    phone: '',
    email: '',
  });

  const filteredTeachers = teachers.filter((t) => {
    const q = (search || globalSearch).toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      t.spec.toLowerCase().includes(q) ||
      t.subjects.toLowerCase().includes(q);
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newTeacher: Teacher = {
      id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      spec: formData.spec || 'General',
      qual: formData.qual || 'B.Ed',
      subjects: formData.subjects || formData.spec || 'General',
      status: (formData.status as 'active' | 'on leave' | 'inactive') || 'active',
      phone: formData.phone || '+256-770-000000',
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@school.edu`,
    };

    setTeachers([newTeacher, ...teachers]);
    onAddActivity(`Added new teacher ${newTeacher.name}`);
    setIsAddOpen(false);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !formData.name) return;

    setTeachers(teachers.map((t) => (t.id === editingTeacher.id ? ({ ...t, ...formData } as Teacher) : t)));
    onAddActivity(`Updated teacher details for ${formData.name}`);
    setEditingTeacher(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingTeacherId) return;
    const t = teachers.find((x) => x.id === deletingTeacherId);
    setTeachers(teachers.filter((x) => x.id !== deletingTeacherId));
    if (t) onAddActivity(`Removed teacher ${t.name}`);
    setDeletingTeacherId(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      spec: subjects[0]?.name || 'Mathematics',
      qual: 'B.Ed',
      subjects: 'Mathematics',
      status: 'active',
      phone: '',
      email: '',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teaching Staff Directory"
        sub={`Total Faculty Members: ${teachers.length}`}
      >
        <div className="flex items-center gap-2">
          <Btn variant="secondary" onClick={() => setIsExcelModalOpen(true)}>
            <FileSpreadsheet size={16} className="text-emerald-600" /> Excel Import / Export
          </Btn>
          <Btn variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Add Faculty Member
          </Btn>
        </div>
      </PageHeader>

      <Card className="!p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search teacher name, specialization, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!pl-9"
            />
          </div>
          <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">All Employment Statuses</option>
            <option value="active">Active Staff</option>
            <option value="on leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-base shadow-xs">
                    {t.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{t.name}</h3>
                    <p className="text-[11px] font-mono text-indigo-600 font-medium">{t.id}</p>
                  </div>
                </div>
                <Badge tone={t.status === 'active' ? 'green' : t.status === 'on leave' ? 'yellow' : 'red'}>
                  {t.status}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-600 my-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={15} className="text-slate-400" />
                  <span>Qualification: <strong className="text-slate-800">{t.qual}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={15} className="text-slate-400" />
                  <span>Spec: <strong className="text-slate-800">{t.spec}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-400" />
                  <span>{t.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-slate-400" />
                  <span className="truncate">{t.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-500">
                Subjects: <span className="text-indigo-600">{t.subjects}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingTeacher(t);
                    setFormData({ ...t });
                  }}
                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setDeletingTeacherId(t.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Teacher Modal */}
      <Modal
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          resetForm();
        }}
        title="Add Faculty Member"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Full Teacher Name *</Label>
            <Input
              required
              placeholder="e.g. Mrs. Jane Auma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Specialization</Label>
              <Input
                placeholder="e.g. Mathematics"
                value={formData.spec}
                onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
              />
            </div>
            <div>
              <Label>Highest Qualification</Label>
              <Input
                placeholder="e.g. B.Ed Mathematics"
                value={formData.qual}
                onChange={(e) => setFormData({ ...formData, qual: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Assigned Subjects</Label>
            <Input
              placeholder="e.g. Mathematics, Integrated Science"
              value={formData.subjects}
              onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="+256-770-000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'on leave' | 'inactive',
                  })
                }
              >
                <option value="active">Active</option>
                <option value="on leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Save Faculty
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        open={!!editingTeacher}
        onClose={() => setEditingTeacher(null)}
        title={`Edit Teacher: ${editingTeacher?.name}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Label>Full Teacher Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Specialization</Label>
              <Input
                value={formData.spec}
                onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
              />
            </div>
            <div>
              <Label>Qualification</Label>
              <Input
                value={formData.qual}
                onChange={(e) => setFormData({ ...formData, qual: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Assigned Subjects</Label>
            <Input
              value={formData.subjects}
              onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'on leave' | 'inactive',
                  })
                }
              >
                <option value="active">Active</option>
                <option value="on leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setEditingTeacher(null)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Update Faculty
            </Btn>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deletingTeacherId}
        title="Remove Faculty Member"
        message="Are you sure you want to remove this teacher from active faculty records?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingTeacherId(null)}
      />

      {/* Excel Import & Export Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        entityType="teachers"
        title="Teaching Staff Directory"
        onImportData={handleImportTeachers}
        onExportData={handleExportExcel}
      />
    </div>
  );
}
