import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, FileSpreadsheet } from 'lucide-react';
import { SubjectItem } from '../types';
import { Card, Badge, Btn, Input, Label, Modal, ConfirmDialog, PageHeader } from '../components/common/UI';
import { ExcelImportModal } from '../components/ExcelImportModal';
import { exportToExcelWorkbook } from '../utils/excelCsv';

interface SubjectsPageProps {
  subjects: SubjectItem[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectItem[]>>;
  onAddActivity: (action: string) => void;
}

export function SubjectsPage({ subjects, setSubjects, onAddActivity }: SubjectsPageProps) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleImportSubjects = (parsedRows: string[][]) => {
    if (parsedRows.length < 2) return { successCount: 0, errors: ['File contains no subject data rows'] };

    const header = parsedRows[0].map((h) => h.toLowerCase().trim());
    const codeIdx = header.findIndex((h) => h.includes('code') || h.includes('id'));
    const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('subject') || h.includes('title'));
    const deptIdx = header.findIndex((h) => h.includes('dept') || h.includes('department') || h.includes('faculty'));
    const creditsIdx = header.findIndex((h) => h.includes('credit') || h.includes('unit') || h.includes('period'));

    const newSubjects: SubjectItem[] = [];
    const errors: string[] = [];

    parsedRows.slice(1).forEach((row, rowIdx) => {
      const name = nameIdx !== -1 ? row[nameIdx] : row[1] || row[0];
      if (!name || name.trim().length === 0) {
        errors.push(`Row ${rowIdx + 2}: Skipped (Subject name missing)`);
        return;
      }

      const code = (codeIdx !== -1 ? row[codeIdx] : '') || `SUB-${Math.floor(100 + Math.random() * 900)}`;
      const dept = (deptIdx !== -1 ? row[deptIdx] : '') || 'General';
      const credits = creditsIdx !== -1 ? Number(row[creditsIdx]) || 3 : 3;

      newSubjects.push({
        id: `sub_${Date.now()}_${rowIdx}`,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        credits,
        teachers: 2,
        department: dept.trim(),
      });
    });

    if (newSubjects.length > 0) {
      setSubjects((prev) => [...prev, ...newSubjects]);
      onAddActivity(`Imported ${newSubjects.length} subjects to curriculum via Excel workbook`);
    }

    return { successCount: newSubjects.length, errors };
  };

  const handleExportExcel = () => {
    const exportRows = filteredSubjects.map((s) => [
      s.code,
      s.name,
      s.department,
      s.credits,
      s.teachers,
    ]);

    exportToExcelWorkbook('Subject_Curriculum_2026.xlsx', [
      {
        sheetName: 'Subjects',
        headers: ['Subject Code', 'Subject Name', 'Department', 'Credits/Periods', 'Faculty Teachers'],
        rows: exportRows,
      },
    ]);
    onAddActivity(`Exported ${filteredSubjects.length} subjects to Excel workbook`);
  };

  const [formData, setFormData] = useState<Partial<SubjectItem>>({
    name: '',
    code: '',
    credits: 3,
    teachers: 2,
    department: 'Sciences',
  });

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const newSubject: SubjectItem = {
      id: `sub_${Date.now()}`,
      name: formData.name,
      code: formData.code.toUpperCase(),
      credits: Number(formData.credits) || 3,
      teachers: Number(formData.teachers) || 1,
      department: formData.department || 'General',
    };

    setSubjects([...subjects, newSubject]);
    onAddActivity(`Added new subject curriculum: ${newSubject.name} (${newSubject.code})`);
    setIsAddOpen(false);
    resetForm();
  };

  const handleOpenEdit = (s: SubjectItem) => {
    setEditingSubject(s);
    setFormData({
      name: s.name,
      code: s.code,
      credits: s.credits,
      teachers: s.teachers,
      department: s.department,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !formData.name) return;

    setSubjects(
      subjects.map((s) =>
        s.id === editingSubject.id
          ? {
              ...s,
              name: formData.name!,
              code: (formData.code || s.code).toUpperCase(),
              credits: Number(formData.credits) || s.credits,
              teachers: Number(formData.teachers) || s.teachers,
              department: formData.department || s.department,
            }
          : s
      )
    );
    onAddActivity(`Updated subject ${formData.name}`);
    setEditingSubject(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingSubjectId) return;
    const sub = subjects.find((x) => x.id === deletingSubjectId);
    setSubjects(subjects.filter((x) => x.id !== deletingSubjectId));
    if (sub) onAddActivity(`Removed subject ${sub.name}`);
    setDeletingSubjectId(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      credits: 3,
      teachers: 2,
      department: 'Sciences',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Curriculum & Subjects"
        sub={`Active Subjects: ${subjects.length}`}
      >
        <div className="flex items-center gap-2">
          <Btn variant="secondary" onClick={() => setIsExcelModalOpen(true)}>
            <FileSpreadsheet size={16} className="text-emerald-600" /> Excel Import / Export
          </Btn>
          <Btn variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Add Subject
          </Btn>
        </div>
      </PageHeader>

      <Card className="!p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search subject, code, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!pl-9"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((s) => (
          <Card key={s.id} className="hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-extrabold text-xs shadow-xs">
                    {s.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                    <Badge tone="purple">{s.department}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 my-3">
                <p>
                  Credits / Weighting: <strong className="text-slate-800">{s.credits} Units</strong>
                </p>
                <p>
                  Assigned Faculty: <strong className="text-slate-800">{s.teachers} Teachers</strong>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-1">
              <button
                onClick={() => handleOpenEdit(s)}
                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => setDeletingSubjectId(s.id)}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Subject Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Subject to Curriculum">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Subject Title *</Label>
            <Input
              required
              placeholder="e.g. Mathematics, Integrated Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Subject Code *</Label>
              <Input
                required
                placeholder="e.g. MTC, SCI"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                placeholder="e.g. Sciences, Humanities"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Course Credits</Label>
              <Input
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Assigned Teachers</Label>
              <Input
                type="number"
                value={formData.teachers}
                onChange={(e) => setFormData({ ...formData, teachers: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Save Subject
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal open={!!editingSubject} onClose={() => setEditingSubject(null)} title="Edit Subject">
        {editingSubject && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label>Subject Title *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Subject Code *</Label>
                <Input
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Course Credits</Label>
                <Input
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Assigned Teachers</Label>
                <Input
                  type="number"
                  value={formData.teachers}
                  onChange={(e) => setFormData({ ...formData, teachers: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Btn type="button" variant="secondary" onClick={() => setEditingSubject(null)}>
                Cancel
              </Btn>
              <Btn type="submit" variant="primary">
                Save Changes
              </Btn>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deletingSubjectId}
        title="Remove Subject"
        message="Are you sure you want to remove this subject from the school curriculum?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingSubjectId(null)}
      />

      {/* Excel Import & Export Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        entityType="subjects"
        title="Academic Curriculum & Subjects"
        onImportData={handleImportSubjects}
        onExportData={handleExportExcel}
      />
    </div>
  );
}
