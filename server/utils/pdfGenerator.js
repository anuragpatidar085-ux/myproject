import PDFDocument from 'pdfkit';

/**
 * Generate a PDF Payslip stream for an employee and payroll record
 * @param {Object} payroll - The payroll document populated with employee
 * @param {Object} res - Express response stream
 */
export const generatePayslipPDF = (payroll, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream directly to response
  doc.pipe(res);

  const primaryColor = '#1e3a8a';
  const secondaryColor = '#475569';
  const accentColor = '#2563eb';
  const tableBg = '#f8fafc';

  // 1. Header Banner
  doc
    .rect(0, 0, doc.page.width, 100)
    .fill(primaryColor);

  doc
    .fillColor('#ffffff')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('STAFFSYNC ENTERPRISE', 40, 28, { characterSpacing: 1 });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Workforce Intelligence & Human Resources Management', 40, 56);

  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('MONTHLY PAYSLIP', 400, 32, { align: 'right' });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Period: ${payroll.monthName || 'Month'} ${payroll.year}`, 400, 56, { align: 'right' });

  doc.moveDown(4);

  // 2. Employee Details Grid
  const emp = payroll.employee || {};
  const startY = 125;

  doc
    .rect(40, startY, 515, 80)
    .fill(tableBg)
    .stroke('#e2e8f0');

  doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold');
  doc.text('Employee Name:', 55, startY + 12);
  doc.text('Employee ID:', 55, startY + 32);
  doc.text('Department:', 55, startY + 52);

  doc.font('Helvetica');
  doc.text(`${emp.firstName || ''} ${emp.lastName || ''}`, 160, startY + 12);
  doc.text(`${emp.employeeCode || 'EMP-N/A'}`, 160, startY + 32);
  doc.text(`${emp.department || 'General'}`, 160, startY + 52);

  doc.font('Helvetica-Bold');
  doc.text('Designation:', 320, startY + 12);
  doc.text('Payment Status:', 320, startY + 32);
  doc.text('Payment Date:', 320, startY + 52);

  doc.font('Helvetica');
  doc.text(`${emp.designation || 'Staff'}`, 420, startY + 12);
  doc.fillColor('#16a34a').text(`${(payroll.paymentStatus || 'PAID').toUpperCase()}`, 420, startY + 32);
  doc.fillColor('#1e293b').text(`${new Date(payroll.paymentDate || Date.now()).toLocaleDateString()}`, 420, startY + 52);

  // 3. Earnings & Deductions Tables
  const tableTop = 230;

  // Header earnings
  doc.rect(40, tableTop, 250, 24).fill(accentColor);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('EARNINGS', 50, tableTop + 6);
  doc.text('AMOUNT', 210, tableTop + 6, { align: 'right' });

  // Header deductions
  doc.rect(305, tableTop, 250, 24).fill('#dc2626');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('DEDUCTIONS', 315, tableTop + 6);
  doc.text('AMOUNT', 475, tableTop + 6, { align: 'right' });

  // Data rows
  const earnings = [
    { label: 'Basic Salary', amount: payroll.basic },
    { label: 'House Rent Allowance (HRA)', amount: payroll.hra },
    { label: 'Special & Other Allowances', amount: payroll.allowances },
    { label: 'Performance Bonus', amount: payroll.bonus || 0 },
  ];

  const deductions = [
    { label: 'Provident Fund (PF)', amount: payroll.pf },
    { label: 'Income Tax (TDS / PT)', amount: payroll.tax },
    { label: 'Other Deductions / Advance', amount: payroll.deductions },
  ];

  let currentY = tableTop + 24;
  const maxRows = Math.max(earnings.length, deductions.length);

  for (let i = 0; i < maxRows; i++) {
    const rowY = currentY + i * 22;
    const isEven = i % 2 === 0;

    // Background zebra stripe
    if (isEven) {
      doc.rect(40, rowY, 250, 22).fill('#f1f5f9');
      doc.rect(305, rowY, 250, 22).fill('#f1f5f9');
    }

    // Earnings cell
    if (earnings[i]) {
      doc.fillColor('#334155').font('Helvetica').fontSize(9).text(earnings[i].label, 50, rowY + 5);
      doc.font('Helvetica-Bold').text(`$${Number(earnings[i].amount || 0).toLocaleString()}`, 210, rowY + 5, { align: 'right' });
    }

    // Deductions cell
    if (deductions[i]) {
      doc.fillColor('#334155').font('Helvetica').fontSize(9).text(deductions[i].label, 315, rowY + 5);
      doc.font('Helvetica-Bold').text(`$${Number(deductions[i].amount || 0).toLocaleString()}`, 475, rowY + 5, { align: 'right' });
    }
  }

  const totalsY = currentY + maxRows * 22 + 10;

  // Subtotal lines
  doc.rect(40, totalsY, 250, 24).fill('#e2e8f0');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('Total Gross Earnings', 50, totalsY + 6);
  doc.text(`$${Number(payroll.totalEarnings || 0).toLocaleString()}`, 210, totalsY + 6, { align: 'right' });

  doc.rect(305, totalsY, 250, 24).fill('#fee2e2');
  doc.fillColor('#991b1b').font('Helvetica-Bold').fontSize(10).text('Total Deductions', 315, totalsY + 6);
  doc.text(`$${Number(payroll.totalDeductions || 0).toLocaleString()}`, 475, totalsY + 6, { align: 'right' });

  // 4. Net Pay Big Box
  const netPayY = totalsY + 45;
  doc.rect(40, netPayY, 515, 55).fill('#ecfdf5').stroke('#86efac');
  doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(14).text('NET TAKE-HOME PAY', 60, netPayY + 18);
  doc.fontSize(20).text(`$${Number(payroll.netPay || 0).toLocaleString()}`, 380, netPayY + 15, { align: 'right' });

  // 5. Footer & Signatures
  const footerY = 580;
  doc.moveTo(40, footerY).lineTo(555, footerY).stroke('#cbd5e1');

  doc.fillColor('#64748b').fontSize(8).font('Helvetica');
  doc.text('This payslip is a system-generated computer document certified by StaffSync HRMS Platform.', 40, footerY + 12);
  doc.text('For queries regarding salary deductions, allowances or tax calculations, contact hr-payroll@staffsync.internal.', 40, footerY + 24);

  // Digital sign boxes
  doc.rect(40, footerY + 50, 180, 50).stroke('#e2e8f0');
  doc.text('Employer Authorization Stamp', 50, footerY + 55);
  doc.font('Helvetica-Bold').text('StaffSync Payroll Operations', 50, footerY + 75);

  doc.rect(375, footerY + 50, 180, 50).stroke('#e2e8f0');
  doc.font('Helvetica').text('Employee Acknowledgment', 385, footerY + 55);
  doc.font('Helvetica-Oblique').text('Verified electronically', 385, footerY + 75);

  doc.end();
};
