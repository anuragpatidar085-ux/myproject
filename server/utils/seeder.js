import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Employee } from '../models/Employee.js';
import { Attendance } from '../models/Attendance.js';
import { Leave } from '../models/Leave.js';
import { Payroll } from '../models/Payroll.js';
import { JobOpening } from '../models/JobOpening.js';
import { Candidate } from '../models/Candidate.js';
import { Announcement } from '../models/Announcement.js';
import { AuditLog } from '../models/AuditLog.js';

dotenv.config();

const sampleEmployees = [
  {
    employeeCode: 'EMP-1001',
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'admin@staffsync.com',
    phone: '+1 (555) 234-5678',
    department: 'Human Resources',
    designation: 'VP of People & Culture',
    role: 'admin',
    workLocation: 'New York HQ (Hybrid)',
    dob: new Date('1988-10-14'),
    joiningDate: new Date('2021-03-15'),
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    salary: { basic: 85000, hra: 34000, allowances: 15000, pf: 6000, deductions: 4000, netPay: 124000 },
  },
  {
    employeeCode: 'EMP-1002',
    firstName: 'David',
    lastName: 'Kim',
    email: 'manager@staffsync.com',
    phone: '+1 (555) 345-6789',
    department: 'Engineering',
    designation: 'Director of Engineering',
    role: 'manager',
    workLocation: 'San Francisco (Onsite)',
    dob: new Date('1990-10-28'),
    joiningDate: new Date('2022-01-10'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    salary: { basic: 95000, hra: 38000, allowances: 17000, pf: 7000, deductions: 5000, netPay: 138000 },
  },
  {
    employeeCode: 'EMP-1003',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'employee@staffsync.com',
    phone: '+1 (555) 456-7890',
    department: 'Engineering',
    designation: 'Senior Full Stack Engineer',
    role: 'employee',
    workLocation: 'Remote (US)',
    dob: new Date('1994-06-18'),
    joiningDate: new Date('2022-10-01'),
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    salary: { basic: 70000, hra: 28000, allowances: 12000, pf: 5000, deductions: 3500, netPay: 101500 },
  },
  {
    employeeCode: 'EMP-1004',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@staffsync.com',
    phone: '+1 (555) 567-8901',
    department: 'Product',
    designation: 'Principal Product Manager',
    role: 'manager',
    workLocation: 'New York HQ (Hybrid)',
    dob: new Date('1991-04-12'),
    joiningDate: new Date('2023-02-14'),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    salary: { basic: 88000, hra: 35000, allowances: 14000, pf: 6200, deductions: 4200, netPay: 126600 },
  },
  {
    employeeCode: 'EMP-1005',
    firstName: 'Aaliyah',
    lastName: 'Patel',
    email: 'aaliyah.patel@staffsync.com',
    phone: '+1 (555) 678-9012',
    department: 'Design',
    designation: 'Senior Product Designer',
    role: 'employee',
    workLocation: 'San Francisco (Hybrid)',
    dob: new Date('1995-10-20'),
    joiningDate: new Date('2023-06-01'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    salary: { basic: 65000, hra: 26000, allowances: 10000, pf: 4800, deductions: 3200, netPay: 93000 },
  },
  {
    employeeCode: 'EMP-1006',
    firstName: 'Lucas',
    lastName: 'Silva',
    email: 'lucas.silva@staffsync.com',
    phone: '+1 (555) 789-0123',
    department: 'Marketing',
    designation: 'Growth Marketing Lead',
    role: 'employee',
    workLocation: 'Remote (Brazil)',
    dob: new Date('1993-08-05'),
    joiningDate: new Date('2023-09-15'),
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    salary: { basic: 58000, hra: 23000, allowances: 9000, pf: 4200, deductions: 2800, netPay: 83000 },
  },
  {
    employeeCode: 'EMP-1007',
    firstName: 'Chloe',
    lastName: 'Dupont',
    email: 'chloe.dupont@staffsync.com',
    phone: '+1 (555) 890-1234',
    department: 'Finance',
    designation: 'Senior Financial Analyst',
    role: 'employee',
    workLocation: 'New York HQ (Onsite)',
    dob: new Date('1992-12-09'),
    joiningDate: new Date('2022-05-18'),
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    salary: { basic: 68000, hra: 27000, allowances: 11000, pf: 5000, deductions: 3400, netPay: 97600 },
  },
];

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('\x1b[34m%s\x1b[0m', '🌱 Seeding StaffSync with Enterprise HRMS Demo Data...');

    // Clear existing collections
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});
    await JobOpening.deleteMany({});
    await Candidate.deleteMany({});
    await Announcement.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Create Employees & Users
    const createdEmployees = [];
    for (const empData of sampleEmployees) {
      const employee = await Employee.create({
        ...empData,
        leaveBalances: { casual: 10, sick: 9, paid: 15 },
        documents: [
          {
            title: 'Employment Offer Letter',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            uploadedAt: empData.joiningDate,
          },
          {
            title: 'Identity Verification & Tax W-4',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            uploadedAt: empData.joiningDate,
          },
        ],
      });

      const user = await User.create({
        email: empData.email,
        password: 'Password123!',
        role: empData.role,
        employeeId: employee._id,
      });

      employee.userId = user._id;
      await employee.save();
      createdEmployees.push(employee);
    }

    // Set Manager mapping: EMP-1002 (David Kim) manages EMP-1003 and EMP-1005
    const david = createdEmployees.find((e) => e.email === 'manager@staffsync.com');
    const sarah = createdEmployees.find((e) => e.email === 'admin@staffsync.com');

    for (const emp of createdEmployees) {
      if (emp.department === 'Engineering' && emp.email !== 'manager@staffsync.com') {
        emp.manager = david._id;
        await emp.save();
      } else if (emp.email !== 'admin@staffsync.com') {
        emp.manager = sarah._id;
        await emp.save();
      }
    }

    // 2. Attendance records for past 7 days
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      for (const emp of createdEmployees) {
        // Skip some days or employees for realism
        const isToday = dateStr === todayStr;
        const checkInHour = 8 + Math.floor(Math.random() * 2); // 8 AM or 9 AM
        const checkInMinute = Math.floor(Math.random() * 50);
        const checkIn = new Date(d);
        checkIn.setHours(checkInHour, checkInMinute, 0);

        const checkOut = new Date(d);
        checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 45), 0);

        const workHours = isToday ? 4.5 : Math.round(((checkOut - checkIn) / 3600000) * 10) / 10;
        const status = checkInHour >= 9 && checkInMinute > 30 ? 'late' : 'present';

        await Attendance.create({
          employee: emp._id,
          date: dateStr,
          checkIn,
          checkOut: isToday ? null : checkOut,
          workHours: isToday ? 0 : workHours,
          status,
          notes: status === 'late' ? 'Traffic delay on transit' : 'Regular office check-in',
          location: emp.workLocation.includes('Remote') ? 'Remote (Home Office)' : 'HQ - Tower A, 4th Floor',
        });
      }
    }

    // 3. Leave Requests
    await Leave.create([
      {
        employee: createdEmployees[2]._id, // Elena
        leaveType: 'casual',
        startDate: new Date(Date.now() + 86400000 * 3),
        endDate: new Date(Date.now() + 86400000 * 5),
        daysCount: 3,
        reason: 'Family wedding out of state',
        status: 'pending',
      },
      {
        employee: createdEmployees[4]._id, // Aaliyah
        leaveType: 'paid',
        startDate: new Date(Date.now() + 86400000 * 10),
        endDate: new Date(Date.now() + 86400000 * 14),
        daysCount: 5,
        reason: 'Annual vacation trip to Europe',
        status: 'approved',
        reviewedBy: sarah._id,
        reviewerName: 'Sarah Connor',
        reviewNote: 'Approved. Enjoy your vacation!',
        reviewedAt: new Date(),
      },
      {
        employee: createdEmployees[5]._id, // Lucas
        leaveType: 'sick',
        startDate: new Date(Date.now() - 86400000 * 4),
        endDate: new Date(Date.now() - 86400000 * 3),
        daysCount: 2,
        reason: 'Seasonal viral flu',
        status: 'approved',
        reviewedBy: sarah._id,
        reviewerName: 'Sarah Connor',
        reviewNote: 'Get well soon',
        reviewedAt: new Date(Date.now() - 86400000 * 4),
      },
    ]);

    // 4. Payroll Records for Current & Previous Month
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (const emp of createdEmployees) {
      const basic = emp.salary.basic;
      const hra = emp.salary.hra;
      const allowances = emp.salary.allowances;
      const pf = emp.salary.pf;
      const deductions = emp.salary.deductions;
      const tax = Math.round(basic * 0.1);
      const totalEarnings = basic + hra + allowances;
      const totalDeductions = pf + deductions + tax;
      const netPay = totalEarnings - totalDeductions;

      await Payroll.create({
        employee: emp._id,
        month: currentMonth,
        year: currentYear,
        monthName: monthNames[currentMonth - 1],
        basic,
        hra,
        allowances,
        bonus: 1000,
        pf,
        tax,
        deductions,
        totalEarnings: totalEarnings + 1000,
        totalDeductions,
        netPay: netPay + 1000,
        paymentStatus: 'paid',
        paymentDate: new Date(),
      });
    }

    // 5. Job Openings & Candidates (Recruitment Pipeline)
    const job1 = await JobOpening.create({
      title: 'Senior Cloud DevOps Engineer',
      department: 'Engineering',
      location: 'Hybrid / Remote',
      jobType: 'Full-time',
      vacancies: 2,
      experience: '4-7 years',
      salaryRange: '$120,000 - $150,000',
      description: 'Lead Kubernetes orchestration, Terraform automation, and CI/CD resilience.',
      status: 'open',
    });

    const job2 = await JobOpening.create({
      title: 'Product Marketing Specialist',
      department: 'Marketing',
      location: 'New York HQ',
      jobType: 'Full-time',
      vacancies: 1,
      experience: '2-4 years',
      salaryRange: '$85,000 - $105,000',
      description: 'Drive GTM campaigns, product messaging, and user acquisition funnels.',
      status: 'open',
    });

    await Candidate.create([
      {
        name: 'Jordan Hayes',
        email: 'jordan.hayes@example.com',
        phone: '+1 (555) 912-3456',
        jobOpening: job1._id,
        jobTitle: job1.title,
        stage: 'interview',
        rating: 5,
        experienceYears: 6,
        notes: 'Exceptional deep-dive on AWS architectures and multi-region failover.',
      },
      {
        name: 'Samantha Rivera',
        email: 'samantha.rivera@example.com',
        phone: '+1 (555) 823-4567',
        jobOpening: job1._id,
        jobTitle: job1.title,
        stage: 'screening',
        rating: 4,
        experienceYears: 4,
        notes: 'Solid Docker & GitHub Actions background. Scheduled for technical screen.',
      },
      {
        name: 'Liam Chen',
        email: 'liam.chen@example.com',
        phone: '+1 (555) 734-5678',
        jobOpening: job2._id,
        jobTitle: job2.title,
        stage: 'offer',
        rating: 5,
        experienceYears: 4,
        notes: 'Offer package sent for VP Marketing approval.',
      },
      {
        name: 'Devon Brooks',
        email: 'devon.brooks@example.com',
        phone: '+1 (555) 645-6789',
        jobOpening: job2._id,
        jobTitle: job2.title,
        stage: 'applied',
        rating: 4,
        experienceYears: 3,
        notes: 'Impressive B2B SaaS portfolio submitted via LinkedIn.',
      },
    ]);

    // 6. Announcements
    await Announcement.create([
      {
        title: '🎉 Q4 All-Hands Town Hall & Product Roadmap Reveal',
        content:
          'Join leadership this Thursday at 3:00 PM EST in the Main Auditorium or on Zoom for our quarterly company townhall. We will celebrate milestone achievements and review 2027 strategic expansion plans!',
        priority: 'high',
        targetDepartment: 'All',
        authorName: 'Sarah Connor (VP HR)',
        isPinned: true,
      },
      {
        title: '🩺 Annual Health Insurance Open Enrollment Window',
        content:
          'The health, dental, and vision insurance benefit renewal portal is open until November 15th. Please review and update your dependent coverage options in the benefits tab.',
        priority: 'urgent',
        targetDepartment: 'All',
        authorName: 'People Operations',
        isPinned: true,
      },
      {
        title: '🚀 Engineering Tech Talk: Microservices & Event Streaming',
        content:
          'David Kim will be hosting an engineering deep dive into our distributed event bus architecture this Friday at 11:00 AM.',
        priority: 'medium',
        targetDepartment: 'Engineering',
        authorName: 'David Kim',
        isPinned: false,
      },
    ]);

    // 7. Initial Audit Trail
    await AuditLog.create([
      {
        actorName: 'Sarah Connor',
        actorEmail: 'admin@staffsync.com',
        actorRole: 'admin',
        action: 'SYSTEM_INITIALIZED',
        entityType: 'System',
        details: 'StaffSync HRMS Enterprise Suite successfully provisioned with production seed data.',
      },
      {
        actorName: 'David Kim',
        actorEmail: 'manager@staffsync.com',
        actorRole: 'manager',
        action: 'PAYROLL_GENERATED',
        entityType: 'Payroll',
        details: `Generated October payroll batch for ${createdEmployees.length} employees.`,
      },
    ]);

    console.log('\x1b[32m%s\x1b[0m', '✔ StaffSync Database Seeded Successfully!');
    console.log('\x1b[36m%s\x1b[0m', '---------------------------------------------------');
    console.log('Demo Credentials (Password for all: Password123!)');
    console.log('1. Admin/HR:  admin@staffsync.com');
    console.log('2. Manager:   manager@staffsync.com');
    console.log('3. Employee:  employee@staffsync.com');
    console.log('\x1b[36m%s\x1b[0m', '---------------------------------------------------');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// Run directly if invoked as script
if (process.argv[1]?.includes('seeder.js')) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}
