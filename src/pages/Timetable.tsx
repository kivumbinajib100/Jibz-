import React, { useState } from 'react';
import { Plus, Clock, Trash2 } from 'lucide-react';
import { TimetableSlot, ClassItem, SubjectItem, Teacher } from '../types';
import { Card, Badge, Btn, Input, Select, Label, Modal, PageHeader } from '../components/common/UI';

interface TimetablePageProps {
  timetable: TimetableSlot[];
  setTimetable: React.Dispatch<React.SetStateAction<TimetableSlot[]>>;
  classes: ClassItem[];
  subjects: SubjectItem[];
  teachers: Teacher[];
  onAddActivity: (action: string) => void;
}

const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function TimetablePage({
  timetable,
  setTimetable,
  classes,
  subjects,
  teachers,
  onAddActivity,
}: TimetablePageProps) {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.name || 'P6 East');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<string>('All');

  const [formData, setFormData] = useState({
    day: 'Monday' as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday',
    time: '08:00 - 09:00',
    subject: subjects[0]?.name || 'Mathematics',
    teacher: teachers[0]?.name || 'Mrs. Auma',
    room: 'Rm 101',
  });

  const classTimetable = timetable.filter((t) => t.cls === selectedClass);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: TimetableSlot = {
      id: `slot_${Date.now()}`,
      day: formData.day,
      time: formData.time,
      subject: formData.subject,
      teacher: formData.teacher,
      room: formData.room,
      cls: selectedClass,
    };

    setTimetable([...timetable, newSlot]);
    onAddActivity(`Scheduled lesson for ${selectedClass} on ${formData.day} (${formData.time})`);
    setIsAddOpen(false);
  };

  const handleDeleteSlot = (id: string) => {
    setTimetable(timetable.filter((t) => t.id !== id));
    onAddActivity(`Removed timetable slot`);
  };

  const displayedDays = selectedDayTab === 'All' ? DAYS : DAYS.filter((d) => d === selectedDayTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Academic & Weekend Timetable"
        sub="Classroom lesson schedule matrix across weekdays and weekend (Saturday & Sunday) sessions."
      >
        <Btn variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Lesson Slot
        </Btn>
      </PageHeader>

      {/* Control Bar */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Label>Select Class Stream Schedule</Label>
            <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.room})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-1">Filter Day:</span>
            <button
              onClick={() => setSelectedDayTab('All')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                selectedDayTab === 'All'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Days
            </button>
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDayTab(d)}
                className={`px-2 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                  selectedDayTab === d
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Days Grid - 7 Days Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
        {displayedDays.map((day) => {
          const daySlots = classTimetable.filter((s) => s.day === day);
          const isWeekend = day === 'Saturday' || day === 'Sunday';

          return (
            <Card
              key={day}
              className={`!p-3.5 flex flex-col justify-between ${
                isWeekend ? 'bg-amber-50/40 border-amber-200/60' : 'bg-slate-50/50 border-slate-200/80'
              }`}
            >
              <div>
                <div className="pb-2.5 border-b border-slate-200 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">{day}</h3>
                    {isWeekend && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1 rounded">
                        Weekend
                      </span>
                    )}
                  </div>
                  <Badge tone={isWeekend ? 'yellow' : 'blue'}>{daySlots.length}</Badge>
                </div>

                <div className="space-y-2">
                  {daySlots.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-6 italic">No lessons</p>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1 text-xs relative group"
                      >
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="absolute top-1.5 right-1.5 p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                        <div className="flex items-center gap-1 font-bold text-indigo-600 text-[10px]">
                          <Clock size={11} /> {slot.time}
                        </div>
                        <p className="font-extrabold text-slate-900 text-xs leading-tight">{slot.subject}</p>
                        <p className="text-slate-500 text-[10px]">{slot.teacher}</p>
                        <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] rounded">
                          {slot.room}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Lesson to Schedule">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Day of the Week</Label>
            <Select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d} {d === 'Saturday' || d === 'Sunday' ? '(Weekend Session)' : ''}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Time Period</Label>
            <Input
              placeholder="e.g. 08:00 - 09:00 or 09:00 - 12:00"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
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
              <Label>Teacher</Label>
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

          <div>
            <Label>Classroom / Location</Label>
            <Input
              placeholder="e.g. Rm 101, Main Hall, Computer Lab"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Schedule Lesson
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
