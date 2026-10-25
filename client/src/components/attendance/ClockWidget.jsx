import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import { Clock, CheckCircle2, LogIn, LogOut, Coffee } from 'lucide-react';

const ClockWidget = ({ onStatusChange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState('00:00:00');

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's status
  const fetchStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data?.success) {
        setAttendance(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Live elapsed counter if checked in and not checked out
  useEffect(() => {
    if (attendance?.checkIn && !attendance?.checkOut) {
      const interval = setInterval(() => {
        const start = new Date(attendance.checkIn).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, now - start);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setElapsed(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }, 1000);
      return () => clearInterval(interval);
    } else if (attendance?.workHours) {
      const totalMinutes = Math.round(attendance.workHours * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      setElapsed(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    } else {
      setElapsed('00:00:00');
    }
  }, [attendance]);

  const handleCheckIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/attendance/check-in', {
        location: 'Office Desk / Remote',
      });
      if (res.data?.success) {
        setAttendance(res.data.data);
        onStatusChange?.(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/attendance/check-out');
      if (res.data?.success) {
        setAttendance(res.data.data);
        onStatusChange?.(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = !!attendance?.checkIn;
  const isCheckedOut = !!attendance?.checkOut;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Clock display */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Live Workforce Clock
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                {currentTime.toLocaleTimeString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Shift status & duration */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Current Shift Duration
          </p>
          <div className="text-2xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
            {elapsed}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {isCheckedOut ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Shift Completed ({attendance.workHours}h)
              </span>
            ) : isCheckedIn ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Active Shift ({attendance.status?.toUpperCase()})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                Not Clocked In Today
              </span>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              Clock In Now
            </button>
          ) : !isCheckedOut ? (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/25 transition-all hover:bg-rose-700 hover:shadow-lg disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              Clock Out Shift
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Shift Finished
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="mt-3 text-xs font-semibold text-rose-500 text-center md:text-left">
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export default ClockWidget;
