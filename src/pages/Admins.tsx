import React, { useState } from 'react';
import {
  UserCog,
  Plus,
  ShieldCheck,
  Mail,
  Clock,
  Lock,
  Edit,
  Trash2,
  KeyRound,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Building,
  UserX,
  UserCheck,
} from 'lucide-react';
import { AdminUser } from '../types';
import {
  Card,
  Badge,
  Btn,
  Input,
  Select,
  Label,
  Modal,
  PageHeader,
  ConfirmDialog,
} from '../components/common/UI';

interface AdminsPageProps {
  admins: AdminUser[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  onAddActivity: (action: string) => void;
  currentUser?: AdminUser | null;
}

export function AdminsPage({
  admins,
  setAdmins,
  onAddActivity,
  currentUser,
}: AdminsPageProps) {
  const isUserNajib = currentUser?.username.toLowerCase() === 'najib';
  const isSuperAdmin = currentUser?.role === 'Super Admin' || isUserNajib;

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [resetPassAdmin, setResetPassAdmin] = useState<AdminUser | null>(null);
  const [deleteAdminTarget, setDeleteAdminTarget] = useState<AdminUser | null>(null);

  // Forms state
  const [addForm, setAddForm] = useState({
    username: '',
    password: 'Password123',
    name: '',
    role: 'Accountant',
    email: '',
    phone: '',
    department: 'Administrative Office',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    role: 'Accountant',
    email: '',
    phone: '',
    department: '',
    password: '',
  });

  const [newResetPassword, setNewResetPassword] = useState('Najib@123');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const toggleStatus = (id: string) => {
    setAdmins(
      admins.map((a) =>
        a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
      )
    );
    const target = admins.find((a) => a.id === id);
    if (target) onAddActivity(`Toggled admin status for user '${target.username}'`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.username || !addForm.name) return;

    const creatorTag = currentUser?.username.toLowerCase() === 'najib' ? 'najib' : currentUser?.username.toLowerCase() || 'admin';

    const newAdmin: AdminUser = {
      id: `adm_${Date.now()}`,
      username: addForm.username.toLowerCase().replace(/\s+/g, '_'),
      password: addForm.password || 'Password123',
      name: addForm.name,
      role: addForm.role,
      email: addForm.email || `${addForm.username.toLowerCase()}@school.edu`,
      phone: addForm.phone || '+256 700 000000',
      department: addForm.department || 'Administration',
      status: 'active',
      lastLogin: 'Never',
      avatarColor: 'bg-indigo-600',
      createdBy: creatorTag,
    };

    setAdmins([...admins, newAdmin]);
    onAddActivity(`Created admin user '${newAdmin.username}' (${newAdmin.role})`);
    setIsAddOpen(false);
    setAddForm({
      username: '',
      password: 'Password123',
      name: '',
      role: 'Accountant',
      email: '',
      phone: '',
      department: 'Administrative Office',
    });
  };

  const handleOpenEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditForm({
      name: admin.name,
      username: admin.username,
      role: admin.role,
      email: admin.email,
      phone: admin.phone || '',
      department: admin.department || '',
      password: admin.password || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    const updated = admins.map((a) =>
      a.id === editingAdmin.id
        ? {
            ...a,
            name: editForm.name,
            username: editForm.username,
            role: editForm.role,
            email: editForm.email,
            phone: editForm.phone,
            department: editForm.department,
            password: editForm.password || a.password,
          }
        : a
    );

    setAdmins(updated);
    onAddActivity(`Updated admin details for '${editForm.username}'`);
    setEditingAdmin(null);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassAdmin || !newResetPassword) return;

    setAdmins(
      admins.map((a) =>
        a.id === resetPassAdmin.id ? { ...a, password: newResetPassword } : a
      )
    );

    onAddActivity(`Reset password for admin user '${resetPassAdmin.username}'`);
    setResetSuccessMsg(`Password successfully set to "${newResetPassword}"`);
    setTimeout(() => {
      setResetSuccessMsg('');
      setResetPassAdmin(null);
      setNewResetPassword('Najib@123');
    }, 1500);
  };

  const handleDeleteAdmin = () => {
    if (!deleteAdminTarget) return;

    // Guard against deleting main admin Najib
    if (deleteAdminTarget.username.toLowerCase() === 'najib') {
      alert('The primary Super Admin user (Najib) cannot be deleted.');
      setDeleteAdminTarget(null);
      return;
    }

    setAdmins(admins.filter((a) => a.id !== deleteAdminTarget.id));
    onAddActivity(`Deleted admin account '${deleteAdminTarget.username}'`);
    setDeleteAdminTarget(null);
  };

  // Requirement: "User Najib should be a main super in private admin account and super admin accounts created by him should not be able to see admins created by him"
  const visibleAdmins = admins.filter((a) => {
    if (isUserNajib) return true; // Main Super Admin Najib sees all accounts

    const isNajibUser = a.username.toLowerCase() === 'najib';
    const isCreatedByNajib = a.createdBy === 'najib' || a.createdBy === 'adm1';
    const isSelf = currentUser ? (a.id === currentUser.id || a.username.toLowerCase() === currentUser.username.toLowerCase()) : false;

    // Never show main admin Najib to other users
    if (isNajibUser) return false;

    // Super admin accounts created by Najib cannot see other admins created by Najib
    if (isCreatedByNajib && !isSelf) return false;

    return true;
  });

  const filteredAdmins = visibleAdmins.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      a.name.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'All' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Accounts & Access Security"
        sub="Super Admin portal to manage administrative user accounts and access permissions."
      >
        {isSuperAdmin && (
          <Btn variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Create Admin Account
          </Btn>
        )}
      </PageHeader>

      {/* Search & Filter Controls */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, username, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Role:</span>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="!py-1.5 !text-xs"
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Accountant">Accountant</option>
              <option value="Registrar">Registrar</option>
              <option value="Teacher">Teacher</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Admin User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAdmins.map((a) => {
          const isPrimaryNajib = a.username.toLowerCase() === 'najib';

          return (
            <Card key={a.id} className="hover:shadow-md transition-all flex flex-col justify-between border-slate-200">
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    {a.avatarUrl ? (
                      <img
                        src={a.avatarUrl}
                        alt={a.name}
                        className="w-10 h-10 rounded-xl object-cover border border-indigo-200 shadow-xs"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl ${
                          a.avatarColor || 'bg-indigo-600'
                        } text-white font-extrabold text-xs flex items-center justify-center shadow-xs`}
                      >
                        {a.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                        {a.name}
                        {isPrimaryNajib && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
                            Main Admin
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-mono font-bold text-indigo-600">@{a.username}</p>
                    </div>
                  </div>

                  <Badge tone={a.status === 'active' ? 'green' : 'red'}>
                    {a.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Account Properties */}
                <div className="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">System Role:</span>
                    <strong className="text-slate-900 font-bold">{a.role}</strong>
                  </p>
                  <p className="flex items-center justify-between truncate">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-800 font-medium truncate max-w-[170px]">{a.email}</span>
                  </p>
                  {a.phone && (
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="text-slate-800 font-medium">{a.phone}</span>
                    </p>
                  )}
                  <p className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>Last Login:</span>
                    <span className="font-semibold text-slate-600">{a.lastLogin}</span>
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              {isSuperAdmin && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      title="Edit Admin Details"
                      className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <Edit size={15} />
                    </button>

                    <button
                      onClick={() => setResetPassAdmin(a)}
                      title="Reset User Password"
                      className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors"
                    >
                      <KeyRound size={15} />
                    </button>

                    {!isPrimaryNajib && (
                      <button
                        onClick={() => setDeleteAdminTarget(a)}
                        title="Delete Admin Account"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {!isPrimaryNajib && (
                    <Btn
                      variant={a.status === 'active' ? 'secondary' : 'success'}
                      className="!py-1 !px-2.5 !text-[11px]"
                      onClick={() => toggleStatus(a.id)}
                    >
                      {a.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Btn>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal: Create Admin */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Admin Account">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Username *</Label>
              <Input
                required
                placeholder="e.g. jsmith_bursar"
                value={addForm.username}
                onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
              />
            </div>
            <div>
              <Label>Initial Password *</Label>
              <Input
                type="text"
                required
                placeholder="e.g. Password123"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Full Name *</Label>
            <Input
              required
              placeholder="e.g. John Smith"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>System Role (Custom Title)</Label>
              <Input
                placeholder="e.g. Accountant, Director of Studies, Bursar"
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              />
            </div>
            <div>
              <Label>Work Email</Label>
              <Input
                type="email"
                placeholder="user@school.edu"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="+256 700 123456"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                placeholder="Administrative Office"
                value={addForm.department}
                onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Create User
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Admin */}
      <Modal open={!!editingAdmin} onClose={() => setEditingAdmin(null)} title="Edit Admin User Account">
        {editingAdmin && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Full Name *</Label>
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Username *</Label>
                <Input
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>System Role (Custom Title)</Label>
                <Input
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="text"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Btn type="button" variant="secondary" onClick={() => setEditingAdmin(null)}>
                Cancel
              </Btn>
              <Btn type="submit" variant="primary">
                Save Admin Details
              </Btn>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Reset Password */}
      <Modal open={!!resetPassAdmin} onClose={() => setResetPassAdmin(null)} title="Reset Password for Admin">
        {resetPassAdmin && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {resetSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" /> {resetSuccessMsg}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-600 mb-3">
                Resetting credentials for <strong className="text-slate-900">{resetPassAdmin.name}</strong> (@{resetPassAdmin.username}).
              </p>
              <Label>Set New Password *</Label>
              <Input
                type="text"
                required
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
                placeholder="e.g. Najib@123"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Btn
                type="button"
                variant="secondary"
                onClick={() => setNewResetPassword('Najib@123')}
              >
                Preset Najib@123
              </Btn>
              <Btn type="submit" variant="primary">
                Apply New Password
              </Btn>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteAdminTarget}
        title="Delete Admin Account"
        message={`Are you sure you want to permanently delete admin user '${deleteAdminTarget?.name}' (@${deleteAdminTarget?.username})? This action cannot be undone.`}
        onConfirm={handleDeleteAdmin}
        onCancel={() => setDeleteAdminTarget(null)}
      />
    </div>
  );
}
