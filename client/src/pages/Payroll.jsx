import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import {
  CreditCard,
  DollarSign,
  Download,
  Calendar,
  FileText,
  Play,
  TrendingUp,
  Receipt,
  Eye,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Payroll = () => {
  const { user, hasRole } = useAuth();
  const isAdminOrManager = hasRole('admin', 'manager');

  const [activeTab, setActiveTab] = useState(isAdminOrManager ? 'all' : 'my');
  const [summary, setSummary] = useState(null);
  const [payrollList, setPayrollList] = useState([]);
  const [myPayrolls, setMyPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Batch generation modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchMonth, setBatchMonth] = useState(new Date().getMonth() + 1);
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  // Selected payslip modal preview
  const [previewPayroll, setPreviewPayroll] = useState(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/payroll/summary');
      if (res.data?.success) setSummary(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll/all');
      if (res.data?.success) setPayrollList(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPayroll = async () => {
    try {
      const res = await api.get('/payroll/my');
      if (res.data?.success) setMyPayrolls(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAdminOrManager) {
      fetchSummary();
      fetchAllPayroll();
    }
    fetchMyPayroll();
  }, []);

  const handleGenerateBatch = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post('/payroll/generate-batch', {
        month: batchMonth,
        year: batchYear,
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message });
        setBatchModalOpen(false);
        fetchAllPayroll();
        fetchSummary();
        fetchMyPayroll();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Batch generation failed' });
    } finally {
      setGenerating(false);
    }
  };

  // Client-side Instant PDF Generator using jsPDF
  const handleDownloadPDF = (record) => {
    const doc = new jsPDF();
    const emp = record.employee || {};

    // Header Branding
    doc.setFillColor(30, 58, 138); // Deep Navy Blue
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('STAFFSYNC ENTERPRISE', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Workforce Operations & Payroll Suite', 14, 25);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MONTHLY PAYSLIP', 196, 18, { align: 'right' });
    doc.setFontSize(9);
    doc.text(`${record.monthName} ${record.year}`, 196, 25, { align: 'right' });

    // Employee Info Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 45, 182, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 45, 182, 32, 2, 2, 'D');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Name:', 20, 54);
    doc.text('Employee ID:', 20, 62);
    doc.text('Department:', 20, 70);

    doc.setFont('helvetica', 'normal');
    doc.text(`${emp.firstName || ''} ${emp.lastName || ''}`, 55, 54);
    doc.text(`${emp.employeeCode || 'EMP-1001'}`, 55, 62);
    doc.text(`${emp.department || 'Engineering'}`, 55, 70);

    doc.setFont('helvetica', 'bold');
    doc.text('Designation:', 110, 54);
    doc.text('Payment Status:', 110, 62);
    doc.text('Date Processed:', 110, 70);

    doc.setFont('helvetica', 'normal');
    doc.text(`${emp.designation || 'Specialist'}`, 145, 54);
    doc.setTextColor(22, 163, 74);
    doc.text(`${(record.paymentStatus || 'PAID').toUpperCase()}`, 145, 62);
    doc.setTextColor(30, 41, 59);
    doc.text(`${new Date(record.paymentDate || Date.now()).toLocaleDateString()}`, 145, 70);

    // Earnings and Deductions Table
    const tableData = [
      ['Basic Salary', `$${record.basic?.toLocaleString()}`, 'Provident Fund (PF)', `$${record.pf?.toLocaleString()}`],
      ['House Rent Allowance (HRA)', `$${record.hra?.toLocaleString()}`, 'Income Tax (TDS)', `$${record.tax?.toLocaleString()}`],
      ['Special Allowances', `$${record.allowances?.toLocaleString()}`, 'Other Deductions', `$${record.deductions?.toLocaleString()}`],
      ['Performance Bonus', `$${(record.bonus || 0)?.toLocaleString()}`, '', ''],
      ['Total Gross Earnings', `$${record.totalEarnings?.toLocaleString()}`, 'Total Deductions', `$${record.totalDeductions?.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: 85,
      head: [['Earnings Head', 'Amount', 'Deductions Head', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Take-Home Box
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(14, finalY, 182, 22, 2, 2, 'FD');

    doc.setTextColor(6, 95, 70);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NET SALARY TAKE-HOME:', 22, finalY + 14);

    doc.setFontSize(16);
    doc.text(`$${record.netPay?.toLocaleString()}`, 188, finalY + 15, { align: 'right' });

    // Signatures
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory: StaffSync Finance & Payroll Operations', 14, finalY + 45);
    doc.text('This is an electronically generated statement certified by StaffSync HRMS.', 14, finalY + 52);

    doc.save(`StaffSync_Payslip_${emp.employeeCode || 'EMP'}_${record.monthName}_${record.year}.pdf`);
    setToast({ type: 'success', message: 'Payslip PDF generated & downloaded!' });
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Payroll & Monthly Payslips
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated salary calculations, allowances, deductions, and compliant PDF payslips.
          </p>
        </div>

        {isAdminOrManager && (
          <button
            onClick={() => setBatchModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
          >
            <Play className="h-4 w-4" /> Run Monthly Payroll Batch
          </button>
        )}
      </div>

      {/* Summary Metrics for Admin */}
      {isAdminOrManager && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Monthly Net Payroll
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ${summary.totalPayroll?.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold">{summary.currentMonth} {summary.currentYear}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Gross Earnings
            </span>
            <p className="text-2xl font-black text-blue-600 mt-1">
              ${summary.totalEarnings?.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400">Before statutory deductions</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total PF & Tax Deductions
            </span>
            <p className="text-2xl font-black text-rose-600 mt-1">
              ${summary.totalDeductions?.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400">Withheld & remitted</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Employees Processed
            </span>
            <p className="text-2xl font-black text-purple-600 mt-1">
              {summary.processedCount} / {summary.activeEmployeesCount}
            </p>
            <span className="text-[11px] text-slate-400">Active roster covered</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {isAdminOrManager && (
          <button
            onClick={() => setActiveTab('all')}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            All Company Payroll Slips ({payrollList.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab('my')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'my'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          My Payslips ({myPayrolls.length})
        </button>
      </div>

      {/* Tab: My Payslips */}
      {activeTab === 'my' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="p-4">Pay Period</th>
                <th className="p-4">Gross Earnings</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Net Take-Home</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {myPayrolls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No payslips available yet for your profile.
                  </td>
                </tr>
              ) : (
                myPayrolls.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {rec.monthName} {rec.year}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">${rec.totalEarnings?.toLocaleString()}</td>
                    <td className="p-4 text-rose-600">-${rec.totalDeductions?.toLocaleString()}</td>
                    <td className="p-4 font-black text-emerald-600 text-sm">
                      ${rec.netPay?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 uppercase">
                        {rec.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDownloadPDF(rec)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
                      >
                        <Download className="h-3.5 w-3.5" /> Download PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: All Payroll (Admin/Manager) */}
      {isAdminOrManager && activeTab === 'all' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="p-4">Employee</th>
                <th className="p-4">Period</th>
                <th className="p-4">Basic Pay</th>
                <th className="p-4">Allowances</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Net Pay</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {payrollList.map((rec) => (
                <tr key={rec._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rec.employee?.avatar || 'https://via.placeholder.com/32'}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {rec.employee?.firstName} {rec.employee?.lastName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">{rec.employee?.employeeCode}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {rec.monthName} {rec.year}
                  </td>
                  <td className="p-4">${rec.basic?.toLocaleString()}</td>
                  <td className="p-4 text-blue-600">+${(rec.hra + rec.allowances)?.toLocaleString()}</td>
                  <td className="p-4 text-rose-600">-${rec.totalDeductions?.toLocaleString()}</td>
                  <td className="p-4 font-black text-emerald-600 text-sm">
                    ${rec.netPay?.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDownloadPDF(rec)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Batch Generator Modal */}
      <Modal isOpen={batchModalOpen} onClose={() => setBatchModalOpen(false)} title="Generate Monthly Payroll Batch">
        <form onSubmit={handleGenerateBatch} className="space-y-4">
          <p className="text-xs text-slate-500">
            This will calculate salaries, statutory deductions, tax withholding, and generate verified payslips for all active employees.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Month</label>
              <select
                value={batchMonth}
                onChange={(e) => setBatchMonth(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Year</label>
              <input
                type="number"
                value={batchYear}
                onChange={(e) => setBatchYear(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBatchModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Processing Batch...' : 'Generate & Certify Payroll'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payroll;
