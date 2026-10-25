import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  UserX,
  UserCheck,
  Mail,
  Phone,
  Briefcase,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DEPARTMENTS = ['All', 'Engineering', 'Human Resources', 'Product', 'Design', 'Marketing', 'Finance'];
const STATUSES = ['All', 'active', 'on_leave', 'deactivated'];

const Employees = () => {
  const { user, hasRole } = useAuth();
  const isAdminOrManager = hasRole('admin', 'manager');

  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    role: 'employee',
    workLocation: 'Headquarters (Hybrid)',
    manager: '',
    basic: 50000,
    hra: 20000,
    allowances: 8000,
    pf: 4000,
    deductions: 2500,
  });

  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/employees', {
        params: {
          page,
          limit: 8,
          search,
          department,
          status,
        },
      });
      if (res.data?.success) {
        setEmployees(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
  }, [search, department, status]);

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: 'Associate Engineer',
      role: 'employee',
      workLocation: 'Headquarters (Hybrid)',
      manager: '',
      basic: 50000,
      hra: 20000,
      allowances: 8000,
      pf: 4000,
      deductions: 2500,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      designation: emp.designation,
      role: emp.role || 'employee',
      workLocation: emp.workLocation || 'Headquarters (Hybrid)',
      manager: emp.manager?._id || emp.manager || '',
      basic: emp.salary?.basic || 50000,
      hra: emp.salary?.hra || 20000,
      allowances: emp.salary?.allowances || 8000,
      pf: emp.salary?.pf || 4000,
      deductions: emp.salary?.deductions || 2500,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        salary: {
          basic: Number(formData.basic),
          hra: Number(formData.hra),
          allowances: Number(formData.allowances),
          pf: Number(formData.pf),
          deductions: Number(formData.deductions),
        },
      };

      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee._id}`, payload);
        setToast({ type: 'success', message: 'Employee updated successfully!' });
      } else {
        await api.post('/employees', payload);
        setToast({ type: 'success', message: 'New employee added successfully!' });
      }
      setIsModalOpen(false);
      fetchEmployees(pagination.page);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Action failed' });
    }
  };

  const handleToggleStatus = async (emp) => {
    const nextStatus = emp.status === 'active' ? 'deactivated' : 'active';
    if (!window.confirm(`Are you sure you want to change status to "${nextStatus}"?`)) return;

    try {
      await api.patch(`/employees/${emp._id}/status`, { status: nextStatus });
      setToast({ type: 'success', message: `Employee marked as ${nextStatus}` });
      fetchEmployees(pagination.page);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Status toggle failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-blue-600" />
            Employee Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, manage roles, and review profiles of all {pagination.total} company staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {isAdminOrManager && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, code..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Dept:</span>
          </div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>{st === 'All' ? 'All' : st.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Code & Status */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName}`}
                      alt={emp.firstName}
                      className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                        emp.status === 'active'
                          ? 'bg-emerald-500'
                          : emp.status === 'on_leave'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {emp.employeeCode}
                  </span>
                </div>

                {/* Name & Title */}
                <div className="mt-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">
                    {emp.firstName} {emp.lastName}
                  </h3>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {emp.designation}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {emp.department} &bull; {emp.workLocation}
                  </p>
                </div>

                {/* Contact info */}
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                  {emp.manager && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <Briefcase className="h-3 w-3 shrink-0 text-slate-400" />
                      <span>Manager: {emp.manager?.firstName} {emp.manager?.lastName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    emp.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {emp.status}
                </span>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/employees/${emp._id}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                    title="View Full Profile"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  {isAdminOrManager && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        title="Edit Employee"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`rounded-lg p-1.5 transition ${
                          emp.status === 'active'
                            ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40'
                            : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                        title={emp.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {emp.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="p-4">Employee</th>
                <th className="p-4">Code</th>
                <th className="p-4">Department</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar || 'https://via.placeholder.com/32'} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[10px] text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-300">{emp.employeeCode}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{emp.department}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                  <td className="p-4 text-slate-500">{emp.workLocation}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        emp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link to={`/employees/${emp._id}`} className="p-1 text-slate-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Link>
                      {isAdminOrManager && (
                        <>
                          <button onClick={() => handleOpenEditModal(emp)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleToggleStatus(emp)} className="p-1 text-slate-400 hover:text-rose-600">
                            <UserX className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 dark:border-slate-800">
        <p className="text-xs text-slate-500">
          Showing page <span className="font-bold text-slate-900 dark:text-white">{pagination.page}</span> of {pagination.pages}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEmployees(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-300"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <button
            onClick={() => fetchEmployees(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-300"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? `Edit Employee: ${editingEmployee.firstName} ${editingEmployee.lastName}` : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Work Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editingEmployee}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              >
                {DEPARTMENTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin / HR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Work Location</label>
              <input
                type="text"
                value={formData.workLocation}
                onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Reporting Manager (Optional ID)</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Manager ObjectId or leave blank"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Salary Structure Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Monthly Salary Structure ($)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Basic Pay</label>
                <input
                  type="number"
                  value={formData.basic}
                  onChange={(e) => setFormData({ ...formData, basic: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">HRA</label>
                <input
                  type="number"
                  value={formData.hra}
                  onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Allowances</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">PF Deduction</label>
                <input
                  type="number"
                  value={formData.pf}
                  onChange={(e) => setFormData({ ...formData, pf: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Other Deductions</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="flex flex-col justify-end">
                <span className="text-[11px] text-slate-500">Estimated Net Pay</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  ${Number(formData.basic || 0) + Number(formData.hra || 0) + Number(formData.allowances || 0) - Number(formData.pf || 0) - Number(formData.deductions || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
            >
              {editingEmployee ? 'Save Changes' : 'Create Employee Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
