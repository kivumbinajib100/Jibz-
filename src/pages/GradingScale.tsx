import React, { useState } from 'react';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { GradeScaleItem } from '../types';
import { Card, Badge, Btn, Input, Select, Label, Modal, PageHeader, Th, Td } from '../components/common/UI';

interface GradingScalePageProps {
  gradeScale: GradeScaleItem[];
  setGradeScale: React.Dispatch<React.SetStateAction<GradeScaleItem[]>>;
  onAddActivity: (action: string) => void;
}

export function GradingScalePage({
  gradeScale,
  setGradeScale,
  onAddActivity,
}: GradingScalePageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState<GradeScaleItem>({
    g: 'D1',
    min: 90,
    max: 100,
    remark: 'Distinction 1',
    tone: 'green',
  });

  const updateScaleBound = (index: number, field: keyof GradeScaleItem, val: any) => {
    const updated = [...gradeScale];
    updated[index] = { ...updated[index], [field]: val };
    setGradeScale(updated);
  };

  const handleRemove = (index: number) => {
    const item = gradeScale[index];
    const updated = gradeScale.filter((_, i) => i !== index);
    setGradeScale(updated);
    onAddActivity(`Removed grade threshold ${item.g}`);
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.g) return;

    setGradeScale([...gradeScale, newItem]);
    onAddActivity(`Added custom grade classification ${newItem.g}`);
    setIsAddOpen(false);
    setNewItem({
      g: '',
      min: 0,
      max: 100,
      remark: '',
      tone: 'blue',
    });
  };

  const handleSave = () => {
    onAddActivity(`Saved updated grading scale thresholds`);
    alert('Grading scale thresholds saved successfully!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grading Scale & Assessment Thresholds"
        sub="Configure mark percentage ranges and classification remarks for student transcripts."
      >
        <Btn variant="secondary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Grade Symbol
        </Btn>
        <Btn variant="primary" onClick={handleSave}>
          <CheckCircle2 size={16} /> Save Threshold Changes
        </Btn>
      </PageHeader>

      <Card className="!p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-900 flex justify-between items-center">
          <span>Standard National Primary / Secondary Grading Scale</span>
          <span className="text-xs text-slate-500 font-normal">
            Total Classifications: {gradeScale.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr>
                <Th>Grade Symbol</Th>
                <Th>Minimum Marks (%)</Th>
                <Th>Maximum Marks (%)</Th>
                <Th>Classification Remark</Th>
                <Th>Badge Style</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {gradeScale.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 border-b border-slate-100">
                  <Td>
                    <Input
                      value={item.g}
                      onChange={(e) => updateScaleBound(idx, 'g', e.target.value)}
                      className="!w-20 !py-1 !px-2 text-xs font-bold"
                    />
                  </Td>
                  <Td>
                    <Input
                      type="number"
                      value={item.min}
                      onChange={(e) => updateScaleBound(idx, 'min', Number(e.target.value))}
                      className="!w-24 !py-1 !px-2 text-xs"
                    />
                  </Td>
                  <Td>
                    <Input
                      type="number"
                      value={item.max}
                      onChange={(e) => updateScaleBound(idx, 'max', Number(e.target.value))}
                      className="!w-24 !py-1 !px-2 text-xs"
                    />
                  </Td>
                  <Td>
                    <Input
                      value={item.remark}
                      onChange={(e) => updateScaleBound(idx, 'remark', e.target.value)}
                      className="!py-1 !px-2 text-xs font-bold text-slate-800"
                    />
                  </Td>
                  <Td>
                    <Select
                      value={item.tone}
                      onChange={(e) => updateScaleBound(idx, 'tone', e.target.value)}
                      className="!py-1 !px-2 text-xs"
                    >
                      <option value="green">Green (High)</option>
                      <option value="blue">Blue (Pass)</option>
                      <option value="yellow">Yellow (Average)</option>
                      <option value="red">Red (Fail)</option>
                    </Select>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Add Grade */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Custom Grade Classification">
        <form onSubmit={handleAddGrade} className="space-y-4">
          <div>
            <Label>Grade Symbol *</Label>
            <Input
              required
              placeholder="e.g. D1, D2, C3, C4, P7, F9"
              value={newItem.g}
              onChange={(e) => setNewItem({ ...newItem, g: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Minimum Mark (%)</Label>
              <Input
                type="number"
                value={newItem.min}
                onChange={(e) => setNewItem({ ...newItem, min: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Maximum Mark (%)</Label>
              <Input
                type="number"
                value={newItem.max}
                onChange={(e) => setNewItem({ ...newItem, max: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label>Classification Remark</Label>
            <Input
              placeholder="e.g. Distinction, Credit, Pass, Fail"
              value={newItem.remark}
              onChange={(e) => setNewItem({ ...newItem, remark: e.target.value })}
            />
          </div>

          <div>
            <Label>Badge Color Style</Label>
            <Select
              value={newItem.tone}
              onChange={(e) => setNewItem({ ...newItem, tone: e.target.value as any })}
            >
              <option value="green">Green Tone (Distinction)</option>
              <option value="blue">Blue Tone (Credit)</option>
              <option value="yellow">Yellow Tone (Pass)</option>
              <option value="red">Red Tone (Failure)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Add Classification
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
