import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FlaggedEmail } from '../types';

export const generatePDFReport = (flaggedEmails: FlaggedEmail[]) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text('IronInbox - Phishing Detection Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Gray color
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total Flagged Emails: ${flaggedEmails.length}`, 14, 33);
  
  // Add a line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 38, 196, 38);
  
  // Calculate statistics
  const stats = {
    critical: flaggedEmails.filter(e => e.riskLevel === 'Critical').length,
    high: flaggedEmails.filter(e => e.riskLevel === 'High').length,
    medium: flaggedEmails.filter(e => e.riskLevel === 'Medium').length,
    low: flaggedEmails.filter(e => e.riskLevel === 'Low').length,
  };
  
  // Add statistics section
  let yPos = 48;
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.text('Risk Distribution', 14, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Critical Risk: ${stats.critical} emails`, 20, yPos);
  yPos += 6;
  doc.text(`High Risk: ${stats.high} emails`, 20, yPos);
  yPos += 6;
  doc.text(`Medium Risk: ${stats.medium} emails`, 20, yPos);
  yPos += 6;
  doc.text(`Low Risk: ${stats.low} emails`, 20, yPos);
  
  yPos += 12;
  
  // Prepare table data
  const tableData = flaggedEmails.map(email => [
    email.received,
    email.sender.length > 35 ? email.sender.substring(0, 32) + '...' : email.sender,
    email.subject.length > 40 ? email.subject.substring(0, 37) + '...' : email.subject,
    email.signals.map(s => `${s.type}: ${s.value}`).join(', ').substring(0, 30) + '...',
    email.riskLevel
  ]);
  
  // Add table
  autoTable(doc, {
    startY: yPos,
    head: [['Time', 'Sender', 'Subject', 'Signals', 'Risk']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235], // Blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 45 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
      4: { 
        cellWidth: 20,
        fontStyle: 'bold'
      }
    },
    didParseCell: (data) => {
      // Color-code risk levels
      if (data.section === 'body' && data.column.index === 4) {
        const risk = data.cell.raw as string;
        switch (risk) {
          case 'Critical':
            data.cell.styles.textColor = [220, 38, 38]; // Red
            break;
          case 'High':
            data.cell.styles.textColor = [234, 88, 12]; // Orange
            break;
          case 'Medium':
            data.cell.styles.textColor = [202, 138, 4]; // Yellow
            break;
          case 'Low':
            data.cell.styles.textColor = [37, 99, 235]; // Blue
            break;
        }
      }
    },
    margin: { top: 10, bottom: 20, left: 14, right: 14 }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'IronInbox Security System - Confidential',
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save the PDF
  const filename = `IronInbox_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
