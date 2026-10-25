import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import {
  CalendarCheck,
  Plus,
  Check,
  X,
  Clock,
  Calendar,
  User,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const Leaves = () => {
  const { user, hasRole } = useAuth();
  const isAdminOrManager = hasRole('admin', 'manager');

  const [activeTab, setActiveTab] = useState('my'); // 'my', 'all', 'calendar'
  const [balances, setBalances] = useState({ casual: 12, sick: 10, paid: 18 });
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [teamCalendar, setTeamCalendar] = useState([]);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewNote, setReviewNote] = useState('');

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      if (res.data?.success) {
        setBalances(res.data.data.balances || { casual: 12, sick: 10, paid: 18 });
        setMyRequests(res.data.data.requests || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllLeaves = async () => {
    try {
      const res = await api.get('/leaves/all');
      if (res.data?.success) {
        setAllRequests(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeamCalendar = async () => {
    try {
      const res = await api.get('/leaves/team-calendar');
      if (res.data?.success) {
        setTeamCalendar(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
    if (isAdminOrManager) fetchAllLeaves();
    fetchTeamCalendar();
  }, []);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/leaves/apply', {
        leaveType,
        startDate,
        endDate,
        reason,
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: 'Leave application submitted successfully!' });
        setIsApplyModalOpen(false);
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchMyLeaves();
        if (isAdminOrManager) fetchAllLeaves();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Application failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewNote(action === 'approved' ? 'Approved by manager' : 'Declined due to scheduling constraints');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/leaves/${selectedLeave._id}/review`, {
        status: reviewAction,
        reviewNote,
      });

      if (res.data?.success) {
        setToast({
          type: 'success',
          message: `Leave request has been ${reviewAction}! Balance updated automatically.`,
        });
        setReviewModalOpen(false);
        fetchAllLeaves();
        fetchMyLeaves();
        fetchTeamCalendar();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Review failed' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-blue-600" />
            Leave Management & Approvals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track leave balances, submit requests with automatic deduction, and monitor team availability.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Apply for Leave
        </button>
      </div>

      {/* Leave Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Casual Leave Balance
            </span>
            <span className="text-xs text-blue-500 font-semibold">12 allotted / yr</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-700 dark:text-blue-300">{balances.casual}</span>
            <span className="text-xs font-semibold text-blue-500">Days Available</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 dark:border-amber-900 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Sick Leave Balance
            </span>
            <span className="text-xs text-amber-500 font-semibold">10 allotted / yr</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-700 dark:text-amber-300">{balances.sick}</span>
            <span className="text-xs font-semibold text-amber-500">Days Available</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Paid / Privilege Leave
            </span>
            <span className="text-xs text-emerald-500 font-semibold">18 allotted / yr</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{balances.paid}</span>
            <span className="text-xs font-semibold text-emerald-500">Days Available</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('my')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'my'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          My Applications ({myRequests.length})
        </button>

        {isAdminOrManager && (
          <button
            onClick={() => setActiveTab('all')}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Team Requests ({allRequests.filter((r) => r.status === 'pending').length} Pending)
          </button>
        )}

        <button
          onClick={() => setActiveTab('calendar')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'calendar'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          Team Leave Calendar
        </button>
      </div>

      {/* Tab Content: My Requests */}
      {activeTab === 'my' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="p-4">Leave Type</th>
                <th className="p-4">Period</th>
                <th className="p-4">Days</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4">Manager Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {myRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No leave requests found. Click "Apply for Leave" above to request time off.
                  </td>
                </tr>
              ) : (
                myRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white uppercase">{req.leaveType}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {new Date(req.startDate).toLocaleDateString()} &rarr; {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-blue-600">{req.daysCount} days</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{req.reason}</td>
                    <td className="p-4">
                      <span className={`border text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 italic">{req.reviewNote || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: All Team Requests (Manager/Admin Approval Workflow) */}
      {isAdminOrManager && activeTab === 'all' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="p-4">Employee</th>
                <th className="p-4">Type</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {allRequests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={req.employee?.avatar || 'https://via.placeholder.com/32'}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {req.employee?.firstName} {req.employee?.lastName}
                        </p>
                        <span className="text-[10px] text-slate-400">{req.employee?.department}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 uppercase font-bold text-slate-800 dark:text-slate-200">{req.leaveType}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-bold text-blue-600">{req.daysCount} days</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{req.reason}</td>
                  <td className="p-4">
                    <span className={`border text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {req.status === 'pending' ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenReview(req, 'approved')}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleOpenReview(req, 'rejected')}
                          className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-rose-700"
                        >
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Reviewed by {req.reviewerName || 'Manager'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Team Leave Calendar */}
      {activeTab === 'calendar' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Approved Team Leaves Roster
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamCalendar.map((leave) => (
              <div
                key={leave._id}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={leave.employee?.avatar || 'https://via.placeholder.com/32'}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {leave.employee?.department} &bull; {leave.employee?.designation}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Out of Office</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 uppercase">
                    {leave.leaveType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply for Leave">
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            >
              <option value="casual">Casual Leave (Balance: {balances.casual}d)</option>
              <option value="sick">Sick Leave (Balance: {balances.sick}d)</option>
              <option value="paid">Paid / Privilege Leave (Balance: {balances.paid}d)</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Reason for Leave *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
              placeholder="State the reason for this time-off request..."
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Leave Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`${reviewAction === 'approved' ? 'Approve' : 'Reject'} Leave Request`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Employee: <span className="font-bold">{selectedLeave?.employee?.firstName} {selectedLeave?.employee?.lastName}</span>
            <br />
            Type: <span className="font-bold uppercase">{selectedLeave?.leaveType}</span> ({selectedLeave?.daysCount} days)
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Review Comments</label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows="3"
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md ${
                reviewAction === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm {reviewAction === 'approved' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
