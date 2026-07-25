import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  CheckCheck,
  Calendar,
  Users,
} from 'lucide-react';
import { Student, ClassItem, AttendanceRecord } from '../types';
import { Card, Badge, Btn, Select, Input, PageHeader, Th, Td } from '../components/common/UI';

interface AttendancePageProps {
  students: Student[];
  classes: ClassItem[];
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  onAddActivity: (action: string) => void;
}

export function AttendancePage({
  students,
  classes,
  attendanceRecords,
  setAttendanceRecords,
  onAddActivity,
}: AttendancePageProps) {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.name || 'P6 East');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Local attendance status map for the active session { studentId: 'present' | 'absent' | 'late' }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'late'>>(() => {
    const map: Record<string, 'present' | 'absent' | 'late'> = {};
    students.forEach((s) => {
      map[s.id] = 'present';
    });
    return map;
  });

  const classStudents = students.filter((s) => s.cls === selectedClass);

  const setStudentStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const map: Record<string, 'present' | 'absent' | 'late'> = { ...attendanceMap };
    classStudents.forEach((s) => {
      map[s.id] = 'present';
    });
    setAttendanceMap(map);
  };

  const handleSaveSession = () => {
    const newRecords: AttendanceRecord[] = classStudents.map((s) => ({
      id: `att_${s.id}_${selectedDate}`,
      studentId: s.id,
      studentName: s.name,
      cls: selectedClass,
      date: selectedDate,
      status: attendanceMap[s.id] || 'present',
    }));

    // Replace or insert
    const otherRecords = attendanceRecords.filter(
      (r) => !(r.cls === selectedClass && r.date === selectedDate)
    );
    setAttendanceRecords([...newRecords, ...otherRecords]);
    onAddActivity(`Marked daily attendance for ${selectedClass} on ${selectedDate}`);
    alert(`Attendance marked successfully for ${classStudents.length} students in ${selectedClass}!`);
  };

  // Stats for this session
  const presentCount = classStudents.filter((s) => (attendanceMap[s.id] || 'present') === 'present').length;
  const absentCount = classStudents.filter((s) => attendanceMap[s.id] === 'absent').length;
  const lateCount = classStudents.filter((s) => attendanceMap[s.id] === 'late').length;
  const presentPct = classStudents.length > 0 ? Math.round((presentCount / classStudents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Attendance Register"
        sub="Mark and audit daily classroom attendance records for all streams."
      />

      {/* Control Bar */}
      <Card className="!p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Select Class Stream
            </label>
            <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.room})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Session Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Btn variant="secondary" className="flex-1" onClick={markAllPresent}>
              <CheckCheck size={16} /> Mark All Present
            </Btn>
            <Btn variant="primary" className="flex-1" onClick={handleSaveSession}>
              <Save size={16} /> Save Register
            </Btn>
          </div>
        </div>
      </Card>

      {/* Session Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Roster</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{classStudents.length} Students</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
          <p className="text-[10px] font-bold text-emerald-700 uppercase">Present Rate</p>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            {presentCount} ({presentPct}%)
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/60">
          <p className="text-[10px] font-bold text-rose-700 uppercase">Absent Students</p>
          <p className="text-xl font-black text-rose-800 mt-0.5">{absentCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
          <p className="text-[10px] font-bold text-amber-700 uppercase">Late Arrivals</p>
          <p className="text-xl font-black text-amber-800 mt-0.5">{lateCount}</p>
        </div>
      </div>

      {/* Attendance Marking List */}
      <Card className="!p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Attendance Register: <span className="text-indigo-600">{selectedClass}</span> ({selectedDate})
          </h3>
          <span className="text-xs text-slate-500">{classStudents.length} Students Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <Th>ID & Student Name</Th>
                <Th>Gender</Th>
                <Th>Attendance Status Selection</Th>
              </tr>
            </thead>
            <tbody>
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400 text-sm">
                    No students currently enrolled in {selectedClass}.
                  </td>
                </tr>
              ) : (
                classStudents.map((s) => {
                  const currentStatus = attendanceMap[s.id] || 'present';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 border-b border-slate-100">
                      <Td>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                          <p className="text-[11px] font-mono text-indigo-600">{s.id}</p>
                        </div>
                      </Td>
                      <Td>{s.gender}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setStudentStatus(s.id, 'present')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <CheckCircle size={14} /> Present
                          </button>

                          <button
                            onClick={() => setStudentStatus(s.id, 'late')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              currentStatus === 'late'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Clock size={14} /> Late
                          </button>

                          <button
                            onClick={() => setStudentStatus(s.id, 'absent')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <XCircle size={14} /> Absent
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
