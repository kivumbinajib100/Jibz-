import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import { AcademicYear } from '../types';
import { Card, Badge, Btn, Input, Select, Label, Modal, PageHeader } from '../components/common/UI';

interface AcademicYearsPageProps {
  academicYears: AcademicYear[];
  setAcademicYears: React.Dispatch<React.SetStateAction<AcademicYear[]>>;
  onAddActivity: (action: string) => void;
}

export function AcademicYearsPage({
  academicYears,
  setAcademicYears,
  onAddActivity,
}: AcademicYearsPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '2027 Academic Year',
    start: 'Feb 2027',
    end: 'Dec 2027',
    terms: 3,
    currentTerm: 'Term 1',
  });

  const setActiveYear = (id: string) => {
    const updated = academicYears.map((ay) => ({ ...ay, current: ay.id === id }));
    setAcademicYears(updated);
    const selected = academicYears.find((ay) => ay.id === id);
    if (selected) onAddActivity(`Set active academic year to ${selected.name}`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAY: AcademicYear = {
      id: `ay_${Date.now()}`,
      name: formData.name,
      start: formData.start,
      end: formData.end,
      current: false,
      terms: Number(formData.terms) || 3,
      currentTerm: formData.currentTerm,
    };
    setAcademicYears([...academicYears, newAY]);
    onAddActivity(`Created academic year ${newAY.name}`);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Calendar & Session Terms"
        sub="Manage school calendar cycles, term switches, and historical academic periods."
      >
        <Btn variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> New Academic Session
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {academicYears.map((ay) => (
          <Card
            key={ay.id}
            className={`transition-all ${
              ay.current ? 'border-2 border-indigo-600 bg-indigo-50/20 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{ay.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {ay.start} — {ay.end}
                  </p>
                </div>
              </div>
              {ay.current ? (
                <Badge tone="green" className="!px-3 !py-1">
                  <CheckCircle2 size={13} /> Active Session
                </Badge>
              ) : (
                <Badge tone="gray">Inactive</Badge>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 my-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Active Current Term:</span>
                <span className="font-bold text-indigo-600">{ay.currentTerm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Total Terms per Year:</span>
                <span className="font-bold text-slate-800">{ay.terms} Terms</span>
              </div>
            </div>

            {!ay.current && (
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Btn variant="outline" className="!py-1.5 !text-xs" onClick={() => setActiveYear(ay.id)}>
                  Set as Active Calendar Year
                </Btn>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Academic Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Academic Year Name *</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Month/Year</Label>
              <Input
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              />
            </div>
            <div>
              <Label>End Month/Year</Label>
              <Input
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Number of Terms</Label>
              <Input
                type="number"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Current Term</Label>
              <Select
                value={formData.currentTerm}
                onChange={(e) => setFormData({ ...formData, currentTerm: e.target.value })}
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Save Academic Year
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
