import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      required: true,
      default: 'Engineering',
    },
    designation: {
      type: String,
      required: true,
      default: 'Team Member',
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      default: 'employee',
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    dob: {
      type: Date,
      default: null,
    },
    workLocation: {
      type: String,
      default: 'Headquarters (Hybrid)',
    },
    status: {
      type: String,
      enum: ['active', 'on_leave', 'deactivated'],
      default: 'active',
    },
    salary: {
      basic: { type: Number, default: 45000 },
      hra: { type: Number, default: 18000 },
      allowances: { type: Number, default: 7000 },
      deductions: { type: Number, default: 2000 },
      pf: { type: Number, default: 3500 },
      netPay: { type: Number, default: 64500 },
    },
    leaveBalances: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      paid: { type: Number, default: 18 },
    },
    documents: [
      {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const Employee = mongoose.model('Employee', employeeSchema);
