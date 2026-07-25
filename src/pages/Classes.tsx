import React, { useState } from 'react';
import { Plus, Search, Users, User, Eye, Edit, Trash2, FileSpreadsheet } from 'lucide-react';
import { ClassItem, Teacher, Student } from '../types';
import { Card, Badge, Btn, Input, Select, Label, Modal, ConfirmDialog, PageHeader } from '../components/common/UI';
import { ExcelImportModal } from '../components/ExcelImportModal';
import { exportToExcelWorkbook } from '../utils/excelCsv';

interface ClassesPageProps {
  classes: ClassItem[];
  setClasses: React.Dispatch<React.SetStateAction<ClassItem[]>>;
  teachers: Teacher[];
  students: Student[];
  onAddActivity: (action: string) => void;
}

export function ClassesPage({
  classes,
  setClasses,
  teachers,
  students,
  onAddActivity,
}: ClassesPageProps) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingClass, setViewingClass] = useState<ClassItem | null>(null);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleImportClasses = (parsedRows: string[][]) => {
    if (parsedRows.length < 2) return { successCount: 0, errors: ['File contains no class stream data rows'] };

    const header = parsedRows[0].map((h) => h.toLowerCase().trim());
    const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('class'));
    const gradeIdx = header.findIndex((h) => h.includes('level') || h.includes('grade'));
    const teacherIdx = header.findIndex((h) => h.includes('teacher') || h.includes('instructor'));
    const roomIdx = header.findIndex((h) => h.includes('room') || h.includes('hall') || h.includes('venue'));
    const capIdx = header.findIndex((h) => h.includes('cap') || h.includes('limit') || h.includes('max'));

    const newClasses: ClassItem[] = [];
    const errors: string[] = [];

    parsedRows.slice(1).forEach((row, rowIdx) => {
      const name = nameIdx !== -1 ? row[nameIdx] : row[0];
      if (!name || name.trim().length === 0) {
        errors.push(`Row ${rowIdx + 2}: Skipped (Class name missing)`);
        return;
      }

      const grade = (gradeIdx !== -1 ? row[gradeIdx] : '') || 'P1';
      const teacher = (teacherIdx !== -1 ? row[teacherIdx] : '') || teachers[0]?.name || 'Unassigned';
      const room = (roomIdx !== -1 ? row[roomIdx] : '') || 'Rm 101';
      const cap = capIdx !== -1 ? Number(row[capIdx]) || 35 : 35;

      const currentStudentCount = students.filter((s) => s.cls.toLowerCase() === name.trim().toLowerCase()).length;

      newClasses.push({
        id: `c_${Date.now()}_${rowIdx}`,
        name: name.trim(),
        grade: grade.trim(),
        teacher: teacher.trim(),
        count: currentStudentCount,
        capacity: cap,
        room: room.trim(),
      });
    });

    if (newClasses.length > 0) {
      setClasses((prev) => [...prev, ...newClasses]);
      onAddActivity(`Imported ${newClasses.length} class streams via Excel workbook`);
    }

    return { successCount: newClasses.length, errors };
  };

  const handleExportExcel = () => {
    const exportRows = filteredClasses.map((c) => [
      c.id,
      c.name,
      c.grade,
      c.teacher,
      c.count,
      c.capacity,
      c.room,
    ]);

    exportToExcelWorkbook('Class_Streams_2026.xlsx', [
      {
        sheetName: 'Classes',
        headers: ['Class ID', 'Class Stream Name', 'Grade Level', 'Class Teacher', 'Enrolled Students', 'Max Capacity', 'Assigned Room'],
        rows: exportRows,
      },
    ]);
    onAddActivity(`Exported ${filteredClasses.length} class streams to Excel workbook`);
  };

  const [formData, setFormData] = useState<Partial<ClassItem>>({
    name: '',
    grade: 'P1',
    teacher: teachers[0]?.name || 'Mrs. Auma',
    capacity: 35,
    room: 'Rm 101',
  });

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.grade.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher.toLowerCase().includes(search.toLowerCase()) ||
      c.room.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newClass: ClassItem = {
      id: `c_${Date.now()}`,
      name: formData.name,
      grade: formData.grade || 'P1',
      teacher: formData.teacher || 'Unassigned',
      count: 0,
      capacity: Number(formData.capacity) || 35,
      room: formData.room || 'Rm 100',
    };

    setClasses([...classes, newClass]);
    onAddActivity(`Created new class stream ${newClass.name}`);
    setIsAddOpen(false);
    resetForm();
  };

  const handleOpenEdit = (c: ClassItem) => {
    setEditingClass(c);
    setFormData({
      name: c.name,
      grade: c.grade,
      teacher: c.teacher,
      capacity: c.capacity,
      room: c.room,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !formData.name) return;

    const updated = classes.map((c) =>
      c.id === editingClass.id
        ? {
            ...c,
            name: formData.name!,
            grade: formData.grade || c.grade,
            teacher: formData.teacher || c.teacher,
            capacity: Number(formData.capacity) || c.capacity,
            room: formData.room || c.room,
          }
        : c
    );

    setClasses(updated);
    onAddActivity(`Updated class stream details for ${formData.name}`);
    setEditingClass(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingClassId) return;
    const c = classes.find((x) => x.id === deletingClassId);
    setClasses(classes.filter((x) => x.id !== deletingClassId));
    if (c) onAddActivity(`Deleted class stream ${c.name}`);
    setDeletingClassId(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      grade: 'P1',
      teacher: teachers[0]?.name || 'Mrs. Auma',
      capacity: 35,
      room: 'Rm 101',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Class Streams & Room Allocations" sub={`Active Streams: ${classes.length}`}>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" onClick={() => setIsExcelModalOpen(true)}>
            <FileSpreadsheet size={16} className="text-emerald-600" /> Excel Import / Export
          </Btn>
          <Btn variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Create Class Stream
          </Btn>
        </div>
      </PageHeader>

      <Card className="!p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search stream name, grade, class teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!pl-9"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((c) => {
          const classStudents = students.filter((s) => s.cls === c.name);
          const currentCount = classStudents.length || c.count;
          const pct = Math.min(100, Math.round((currentCount / c.capacity) * 100));

          return (
            <Card key={c.id} className="hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {c.grade}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{c.room}</p>
                    </div>
                  </div>
                  <Badge tone={pct > 90 ? 'red' : 'green'}>{pct}% Full</Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-600 my-4">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-slate-400" />
                    <span>
                      Class Teacher: <strong className="text-slate-800">{c.teacher}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-slate-400" />
                    <span>
                      Enrolled: <strong className="text-slate-800">{currentCount} Students</strong> (Cap: {c.capacity})
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct > 90 ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Btn
                  variant="outline"
                  className="!py-1 !px-2.5 !text-xs"
                  onClick={() => setViewingClass(c)}
                >
                  <Eye size={14} /> View Roster
                </Btn>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingClassId(c.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Class Modal */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Class Stream">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Stream Name *</Label>
            <Input
              required
              placeholder="e.g. P1 East, P4 West"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Grade Level</Label>
              <Select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              >
                {['Nursery', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Class Teacher</Label>
              <Select
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Room / Block</Label>
              <Input
                placeholder="e.g. Rm 101"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </div>
            <div>
              <Label>Class Capacity</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Create Class
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal open={!!editingClass} onClose={() => setEditingClass(null)} title="Edit Class Stream">
        {editingClass && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label>Stream Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Grade Level</Label>
                <Select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                >
                  {['Nursery', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Class Teacher</Label>
                <Select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Room / Block</Label>
                <Input
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>
              <div>
                <Label>Class Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Btn type="button" variant="secondary" onClick={() => setEditingClass(null)}>
                Cancel
              </Btn>
              <Btn type="submit" variant="primary">
                Save Stream Changes
              </Btn>
            </div>
          </form>
        )}
      </Modal>

      {/* View Roster Modal */}
      <Modal
        open={!!viewingClass}
        onClose={() => setViewingClass(null)}
        title={`Class Roster: ${viewingClass?.name}`}
        subtitle={`Class Teacher: ${viewingClass?.teacher} | Room: ${viewingClass?.room}`}
      >
        {viewingClass && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Students ({students.filter((s) => s.cls === viewingClass.name).length})
            </p>
            <div className="border border-slate-100 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Gender</th>
                    <th className="p-2.5">Guardian Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter((s) => s.cls === viewingClass.name)
                    .map((s) => (
                      <tr key={s.id} className="border-t border-slate-100">
                        <td className="p-2.5 font-mono text-indigo-600 font-bold">{s.id}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{s.name}</td>
                        <td className="p-2.5">{s.gender}</td>
                        <td className="p-2.5 text-slate-600">{s.phone}</td>
                      </tr>
                    ))}
                  {students.filter((s) => s.cls === viewingClass.name).length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        No students currently registered in this stream.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deletingClassId}
        title="Delete Class Stream"
        message="Are you sure you want to delete this class stream?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingClassId(null)}
      />

      {/* Excel Import & Export Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        entityType="classes"
        title="Class Streams & Room Allocations"
        onImportData={handleImportClasses}
        onExportData={handleExportExcel}
      />
    </div>
  );
}
