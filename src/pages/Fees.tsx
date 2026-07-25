import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Receipt,
  Printer,
  Trash2,
  Edit,
  Download,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { FeeRecord, Student, ClassItem } from '../types';
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
import { exportToExcelWorkbook } from '../utils/excelCsv';
import { ExcelImportModal } from '../components/ExcelImportModal';

interface FeesPageProps {
  fees: FeeRecord[];
  setFees: React.Dispatch<React.SetStateAction<FeeRecord[]>>;
  students: Student[];
  classes: ClassItem[];
  onAddActivity: (action: string) => void;
}

export function FeesPage({ fees, setFees, students, classes, onAddActivity }: FeesPageProps) {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [receiptRecord, setReceiptRecord] = useState<FeeRecord | null>(null);
  const [deletingFeeId, setDeletingFeeId] = useState<string | null>(null);

  // Custom Categories list
  const [feeCategories, setFeeCategories] = useState<string[]>([
    'Tuition Fee',
    'Boarding Fee',
    'Library & Computer',
    'Transport Fee',
    'Uniform & Sports',
    'Building & Maintenance',
    'Examination & Assessment',
  ]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    cls: classes[0]?.name || 'P1 East',
    type: 'Tuition Fee',
    term: 'Term 2',
    due: 450000,
    paid: 450000,
    dueDate: '2026-08-01',
  });

  const totalDue = fees.reduce((acc, f) => acc + f.due, 0);
  const totalPaid = fees.reduce((acc, f) => acc + f.paid, 0);
  const totalOutstanding = totalDue - totalPaid;
  const collectionPct = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  const classStudents = students.filter((s) => s.cls === formData.cls);

  const filteredFees = fees.filter((f) => {
    const q = search.toLowerCase();
    const matchesSearch =
      f.student.toLowerCase().includes(q) ||
      f.cls.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q);
    const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomCategory = () => {
    const val = customCategoryInput.trim();
    if (val && !feeCategories.includes(val)) {
      setFeeCategories([...feeCategories, val]);
      setFormData({ ...formData, type: val });
      setCustomCategoryInput('');
      setShowAddCategory(false);
      onAddActivity(`Added custom fee category: ${val}`);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formData.studentId) || classStudents[0];
    if (!student) {
      alert('Please select a student.');
      return;
    }

    const dueAmount = Number(formData.due);
    const paidAmount = Number(formData.paid);
    const status: 'paid' | 'partial' | 'pending' =
      paidAmount >= dueAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';

    const newFee: FeeRecord = {
      id: `fee_${Date.now()}`,
      studentId: student.id,
      student: student.name,
      cls: formData.cls,
      type: formData.type,
      term: formData.term,
      due: dueAmount,
      paid: paidAmount,
      status,
      dueDate: formData.dueDate,
      lastPaymentDate: new Date().toISOString().split('T')[0],
    };

    setFees([newFee, ...fees]);
    onAddActivity(`Recorded fee payment of UGX ${paidAmount.toLocaleString()} for ${student.name}`);
    setIsRecordOpen(false);
  };

  const handleOpenEdit = (f: FeeRecord) => {
    setEditingFee(f);
    setFormData({
      studentId: f.studentId,
      cls: f.cls,
      type: f.type,
      term: f.term,
      due: f.due,
      paid: f.paid,
      dueDate: f.dueDate,
    });
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee) return;

    const dueAmount = Number(formData.due);
    const paidAmount = Number(formData.paid);
    const status: 'paid' | 'partial' | 'pending' =
      paidAmount >= dueAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';

    const updated = fees.map((f) =>
      f.id === editingFee.id
        ? {
            ...f,
            due: dueAmount,
            paid: paidAmount,
            type: formData.type,
            term: formData.term,
            status,
            lastPaymentDate: new Date().toISOString().split('T')[0],
          }
        : f
    );

    setFees(updated);
    onAddActivity(`Updated payment record for ${editingFee.student}`);
    setEditingFee(null);
  };

  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleDelete = () => {
    if (!deletingFeeId) return;
    setFees(fees.filter((x) => x.id !== deletingFeeId));
    onAddActivity('Deleted fee record');
    setDeletingFeeId(null);
  };

  const handleImportFees = (parsedRows: string[][]) => {
    if (parsedRows.length < 2) return { successCount: 0, errors: ['File contains no fee data rows'] };

    const header = parsedRows[0].map((h) => h.toLowerCase().trim());
    const stuIdIdx = header.findIndex((h) => h.includes('student id') || h.includes('stuid'));
    const stuNameIdx = header.findIndex((h) => h.includes('student') && !h.includes('id'));
    const classIdx = header.findIndex((h) => h.includes('class') || h.includes('stream'));
    const termIdx = header.findIndex((h) => h.includes('term') || h.includes('session'));
    const dueIdx = header.findIndex((h) => h.includes('due') || h.includes('total') || h.includes('amount'));
    const paidIdx = header.findIndex((h) => h.includes('paid') || h.includes('cleared'));
    const typeIdx = header.findIndex((h) => h.includes('type') || h.includes('category') || h.includes('fee'));
    const dateIdx = header.findIndex((h) => h.includes('date') || h.includes('deadline'));

    const newFees: FeeRecord[] = [];
    const errors: string[] = [];

    parsedRows.slice(1).forEach((row, rowIdx) => {
      const studentName = (stuNameIdx !== -1 ? row[stuNameIdx] : row[1] || row[0]) || 'Imported Student';
      const studentId = (stuIdIdx !== -1 ? row[stuIdIdx] : row[0]) || `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      const cls = (classIdx !== -1 ? row[classIdx] : '') || 'P1 East';
      const term = (termIdx !== -1 ? row[termIdx] : '') || 'Term 1 2026';
      const feeType = (typeIdx !== -1 ? row[typeIdx] : '') || 'Tuition Fee';
      const due = dueIdx !== -1 ? Number(row[dueIdx]) || 850000 : 850000;
      const paid = paidIdx !== -1 ? Number(row[paidIdx]) || 0 : 0;
      const dueDate = (dateIdx !== -1 ? row[dateIdx] : '') || '2026-08-01';

      const statusVal: 'paid' | 'partial' | 'pending' =
        paid >= due ? 'paid' : paid > 0 ? 'partial' : 'pending';

      newFees.push({
        id: `fee_${Date.now()}_${rowIdx}`,
        studentId,
        student: studentName.trim(),
        cls: cls.trim(),
        type: feeType.trim(),
        term: term.trim(),
        due,
        paid,
        status: statusVal,
        dueDate: dueDate.trim(),
        lastPaymentDate: new Date().toISOString().split('T')[0],
      });
    });

    if (newFees.length > 0) {
      setFees((prev) => [...newFees, ...prev]);
      onAddActivity(`Imported ${newFees.length} fee records via Excel workbook`);
    }

    return { successCount: newFees.length, errors };
  };

  const handleExportExcel = () => {
    const exportRows = filteredFees.map((f) => [
      f.id,
      f.studentId,
      f.student,
      f.cls,
      f.type,
      f.term,
      f.due,
      f.paid,
      f.due - f.paid,
      f.status,
      f.dueDate,
    ]);

    exportToExcelWorkbook('Bursary_Fee_Ledger_2026.xlsx', [
      {
        sheetName: 'FeeRecords',
        headers: ['Invoice ID', 'Student ID', 'Student Name', 'Class Stream', 'Category', 'Academic Term', 'Total Due (UGX)', 'Total Paid (UGX)', 'Outstanding Balance (UGX)', 'Status', 'Due Date'],
        rows: exportRows,
      },
    ]);
    onAddActivity(`Exported ${filteredFees.length} fee records to Excel workbook`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bursary & Fee Management"
        sub="Track tuition payments, custom fee categories, update student payment balances, and print receipts."
      >
        <div className="flex items-center gap-2">
          <Btn variant="secondary" onClick={() => setIsExcelModalOpen(true)}>
            <FileSpreadsheet size={16} className="text-emerald-600" /> Excel Import / Export
          </Btn>
          <Btn variant="primary" onClick={() => setIsRecordOpen(true)}>
            <Plus size={16} /> Record Payment
          </Btn>
        </div>
      </PageHeader>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Billable Fees</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            UGX {(totalDue / 1000000).toFixed(2)}M
          </h3>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-xs">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Total Revenue Collected</p>
          <h3 className="text-2xl font-black text-emerald-800 mt-1">
            UGX {(totalPaid / 1000000).toFixed(2)}M
          </h3>
          <p className="text-xs text-emerald-600 font-bold mt-1">{collectionPct}% Collection Rate</p>
        </div>
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 shadow-xs">
          <p className="text-xs font-semibold text-rose-700 uppercase">Outstanding Balance</p>
          <h3 className="text-2xl font-black text-rose-800 mt-1">
            UGX {(totalOutstanding / 1000000).toFixed(2)}M
          </h3>
        </div>
        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-xs">
          <p className="text-xs font-semibold text-indigo-700 uppercase">Total Records</p>
          <h3 className="text-2xl font-black text-indigo-800 mt-1">{fees.length} Invoices</h3>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="!p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search student, class, fee type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!pl-9"
            />
          </div>
          <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">All Payment Statuses</option>
            <option value="paid">Fully Paid</option>
            <option value="partial">Partially Paid</option>
            <option value="pending">Pending Payment</option>
          </Select>
        </div>
      </Card>

      {/* Fee Records Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <Th>Student Name & Stream</Th>
                <Th>Fee Category & Term</Th>
                <Th>Amount Due</Th>
                <Th>Amount Paid</Th>
                <Th>Balance</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                    No payment records match filters.
                  </td>
                </tr>
              ) : (
                filteredFees.map((f) => {
                  const balance = f.due - f.paid;

                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80 border-b border-slate-100">
                      <Td>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{f.student}</p>
                          <p className="text-[11px] text-slate-500">{f.cls}</p>
                        </div>
                      </Td>
                      <Td>
                        <p className="font-semibold text-slate-800 text-xs">{f.type}</p>
                        <p className="text-[10px] text-slate-400">{f.term}</p>
                      </Td>
                      <Td>
                        <span className="font-bold text-slate-900 text-xs">
                          UGX {f.due.toLocaleString()}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-bold text-emerald-700 text-xs">
                          UGX {f.paid.toLocaleString()}
                        </span>
                      </Td>
                      <Td>
                        <span
                          className={`font-bold text-xs ${
                            balance > 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          UGX {balance.toLocaleString()}
                        </span>
                      </Td>
                      <Td>
                        <Badge
                          tone={
                            f.status === 'paid' ? 'green' : f.status === 'partial' ? 'yellow' : 'red'
                          }
                        >
                          {f.status === 'paid'
                            ? 'Fully Paid'
                            : f.status === 'partial'
                            ? 'Partial'
                            : 'Pending'}
                        </Badge>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(f)}
                            title="Update Payment Amount"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setReceiptRecord(f)}
                            title="Print Receipt"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          >
                            <Receipt size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingFeeId(f.id)}
                            title="Delete Fee Record"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 size={16} />
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

      {/* Record Fee Payment Modal */}
      <Modal open={isRecordOpen} onClose={() => setIsRecordOpen(false)} title="Record Fee Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <Label>Class Stream</Label>
            <Select
              value={formData.cls}
              onChange={(e) => setFormData({ ...formData, cls: e.target.value, studentId: '' })}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Select Student *</Label>
            <Select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            >
              <option value="">-- Choose Student --</option>
              {classStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label>Fee Category</Label>
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                + Add Custom Category
              </button>
            </div>

            {showAddCategory && (
              <div className="flex gap-2 mb-2 p-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <Input
                  placeholder="e.g. Graduation Fee, Trip Fee"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="!py-1.5 !text-xs"
                />
                <Btn type="button" variant="primary" className="!py-1.5 !text-xs" onClick={handleAddCustomCategory}>
                  Add
                </Btn>
              </div>
            )}

            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {feeCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Total Billable Due (UGX) *</Label>
              <Input
                type="number"
                required
                value={formData.due}
                onChange={(e) => setFormData({ ...formData, due: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Amount Paid Now (UGX) *</Label>
              <Input
                type="number"
                required
                value={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label>Academic Term & Due Date</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </Select>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Btn type="button" variant="secondary" onClick={() => setIsRecordOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              Record Receipt
            </Btn>
          </div>
        </form>
      </Modal>

      {/* Edit / Update Student Payment Balance Modal */}
      <Modal open={!!editingFee} onClose={() => setEditingFee(null)} title="Update Fee Payment per Student">
        {editingFee && (
          <form onSubmit={handleUpdatePayment} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{editingFee.student}</p>
              <p className="text-slate-500">{editingFee.cls} • {editingFee.type} ({editingFee.term})</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Total Billable Due (UGX)</Label>
                <Input
                  type="number"
                  value={formData.due}
                  onChange={(e) => setFormData({ ...formData, due: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Updated Total Amount Paid (UGX)</Label>
                <Input
                  type="number"
                  value={formData.paid}
                  onChange={(e) => setFormData({ ...formData, paid: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
              Remaining Balance: UGX {(Number(formData.due) - Number(formData.paid)).toLocaleString()}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Btn type="button" variant="secondary" onClick={() => setEditingFee(null)}>
                Cancel
              </Btn>
              <Btn type="submit" variant="primary">
                Save Payment Update
              </Btn>
            </div>
          </form>
        )}
      </Modal>

      {/* Official Receipt Modal */}
      <Modal
        open={!!receiptRecord}
        onClose={() => setReceiptRecord(null)}
        title="Official Bursary Receipt"
      >
        {receiptRecord && (
          <div className="space-y-4 text-xs">
            <div className="text-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-lg text-indigo-900 uppercase">St. Jude Academy</h3>
              <p className="text-[10px] text-slate-500">Official Payment Voucher Receipt</p>
              <p className="font-mono text-xs font-bold text-indigo-600 mt-1">
                REC-{receiptRecord.id.replace('fee_', '')}
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Student Name:</span>
                <span className="font-black text-slate-900">{receiptRecord.student}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Class Stream:</span>
                <span>{receiptRecord.cls}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Fee Description:</span>
                <span>
                  {receiptRecord.type} ({receiptRecord.term})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Total Invoiced:</span>
                <span>UGX {receiptRecord.due.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-black">
                <span>Amount Paid:</span>
                <span>UGX {receiptRecord.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold border-t border-slate-200 pt-1">
                <span>Remaining Balance:</span>
                <span>UGX {(receiptRecord.due - receiptRecord.paid).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="primary" onClick={() => window.print()}>
                <Printer size={16} /> Print Receipt
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deletingFeeId}
        title="Delete Fee Invoice"
        message="Are you sure you want to delete this payment record?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingFeeId(null)}
      />

      {/* Excel Import & Export Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        entityType="fees"
        title="Bursary & Fee Records"
        onImportData={handleImportFees}
        onExportData={handleExportExcel}
      />
    </div>
  );
}
