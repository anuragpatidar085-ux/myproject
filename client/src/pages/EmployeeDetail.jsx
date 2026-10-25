import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/common/Toast';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Upload,
  UserCheck,
  Shield,
  Clock,
} from 'lucide-react';

const EmployeeDetail = () => {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);

  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      if (res.data?.success) {
        setEmployee(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docTitle || !docUrl) return;

    try {
      const res = await api.post(`/employees/${id}/documents`, {
        title: docTitle,
        fileUrl: docUrl,
      });
      if (res.data?.success) {
        setToast({ type: 'success', message: 'Document added to employee records!' });
        setDocTitle('');
        setDocUrl('');
        fetchEmployee();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Upload failed' });
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading employee details...</div>;
  }

  if (!employee) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Employee not found.</p>
        <Link to="/employees" className="mt-3 inline-block text-xs text-blue-600 underline">
          &larr; Back to Directory
        </Link>
      </div>
    );
  }

  const salary = employee.salary || {};
  const balances = employee.leaveBalances || {};

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back button */}
      <div>
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Employee Directory
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName}`}
              alt={employee.firstName}
              className="h-24 w-24 rounded-3xl object-cover ring-4 ring-blue-500/20"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-mono font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {employee.employeeCode}
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                {employee.designation} &bull; {employee.department}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {employee.workLocation}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Joined {new Date(employee.joiningDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Role: {employee.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
              employee.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {employee.status}
          </span>
        </div>

        {/* Tab switcher */}
        <div className="mt-8 flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`border-b-2 px-5 py-3 text-xs font-bold transition ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Profile & Compensation
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`border-b-2 px-5 py-3 text-xs font-bold transition ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Documents ({employee.documents?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab 1: Profile & Compensation */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact & Mapping Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Contact & Reporting
            </h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Reporting Manager</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName} (${employee.manager.designation})` : 'Executive Management'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.dob ? new Date(employee.dob).toLocaleDateString() : 'Not recorded'}
                </span>
              </div>
            </div>
          </div>

          {/* Leave Balances Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Leave Balances (Available)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase">Casual</span>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{balances.casual ?? 12}</p>
                <span className="text-[10px] text-blue-500">Days</span>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 uppercase">Sick</span>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{balances.sick ?? 10}</p>
                <span className="text-[10px] text-amber-500">Days</span>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 uppercase">Paid</span>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{balances.paid ?? 18}</p>
                <span className="text-[10px] text-emerald-500">Days</span>
              </div>
            </div>
          </div>

          {/* Salary Compensation Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Monthly Salary Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Basic Pay</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${salary.basic?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">HRA Allowance</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${salary.hra?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Other Allowances</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${salary.allowances?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">PF Deduction</span>
                <span className="font-bold text-rose-600">-${salary.pf?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Other Deductions</span>
                <span className="font-bold text-rose-600">-${salary.deductions?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-extrabold text-slate-900 dark:text-white">Net Take-Home Pay</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  ${salary.netPay?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Document list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employee.documents?.map((doc, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-start justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      View Document &rarr;
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload New Document Box */}
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50 max-w-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4" /> Attach Official Document / Verification
            </h4>
            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Document Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Tax Form W-4, Non-Disclosure Agreement"
                  required
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Document File URL</label>
                <input
                  type="url"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://.../document.pdf"
                  required
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                Upload & Save Document
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
