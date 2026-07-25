import React, { useState } from 'react';
import { Megaphone, Plus, AlertTriangle, Info, Trash2, Clock } from 'lucide-react';
import { Announcement } from '../types';
import { Card, Badge, Btn, Input, Select, Label, Modal, PageHeader } from '../components/common/UI';

interface AnnouncementsPageProps {
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  onAddActivity: (action: string) => void;
}

export function AnnouncementsPage({
  announcements,
  setAnnouncements,
  onAddActivity,
}: AnnouncementsPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'high' | 'normal' | 'low',
    audience: 'all' as 'all' | 'teachers' | 'students' | 'parents',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const newAnnouncement: Announcement = {
      id: `a_${Date.now()}`,
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
      audience: formData.audience,
      by: 'NAJIB (Super Admin)',
      time: 'Just now',
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    onAddActivity(`Posted announcement: ${newAnnouncement.title}`);
    setIsAddOpen(false);
    setFormData({ title: '', content: '', priority: 'normal', audience: 'all' });
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    onAddActivity(`Deleted announcement`);
  };

  const priorityCfg = {
    high: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
    normal: { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    low: { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Bulletins & Announcements"
        sub="Broadcast important notices to students, faculty, and parents."
      >
        <Btn variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Post Announcement
        </Btn>
      </PageHeader>

      <div className="space-y-4">
        {announcements.map((a) => {
          const cfg = priorityCfg[a.priority] || priorityCfg.normal;

          return (
            <Card key={a.id} className={`!p-5 ${cfg.bg} border ${cfg.border} relative group`}>
              <button
                onClick={() => handleDelete(a.id)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                title="Delete Announcement"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Badge
                  tone={
                    a.priority === 'high' ? 'red' : a.priority === 'normal' ? 'blue' : 'gray'
                  }
                >
                  {a.priority.toUpperCase()} PRIORITY
                </Badge>
                <Badge tone="purple">Audience: {a.audience.toUpperCase()}</Badge>
                <span className="text-xs text-slate-400 font-medium ml-auto pr-8">{a.time}</span>
              </div>

              <h3 className={`font-extrabold text-base mb-1 ${cfg.color}`}>{a.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{a.content}</p>

              <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Author: {a.by}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Post Announcement">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Announcement Headline *</Label>
            <Input
              required
              placeholder="e.g. End of Term Examination Schedule"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority Level</Label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="high">High (Urgent Alert)</option>
                <option value="normal">Normal Priority</option>
                <option value="low">Low Priority</option>
              </Select>
            </div>
            <div>
              <Label>Target Audience</Label>
              <Select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
              >
                <option value="all">Everyone</option>
                <option value="teachers">Teaching Faculty Only</option>
                <option value="students">Students Only</option>
                <option value="parents">Guardians & Parents</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notice Details & Content *</Label>
            <textarea
              required
              rows={4}
              placeholder="Write full announcement message details..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Broadcast Notice
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
