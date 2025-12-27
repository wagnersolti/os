
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ServiceOrder, CompanyInfo } from '../types';

export const pdfService = {
  generateOS(os: ServiceOrder, company: CompanyInfo) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header - Logo and Company Name
    if (company.logo) {
      // Assuming logo is base64
      try {
        doc.addImage(company.logo, 'PNG', 14, 10, 30, 30);
      } catch (e) {
        console.error("Error adding logo to PDF", e);
      }
    }

    const startX = company.logo ? 50 : 14;
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue 600
    doc.text(company.name.toUpperCase(), startX, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(company.address || 'Sistema de Gestão Profissional', startX, 28);
    if (company.phone) doc.text(`Tel: ${company.phone}`, startX, 33);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`ORDEM DE SERVIÇO #${os.orderNumber}`, pageWidth - 14, 22, { align: 'right' });
    
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(os.createdAt).toLocaleDateString('pt-BR')}`, pageWidth - 14, 28, { align: 'right' });

    // Customer Info Box
    doc.setDrawColor(230);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, 45, pageWidth - 28, 35, 3, 3, 'FD');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', 20, 53);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nome: ${os.customerName}`, 20, 60);
    doc.text(`Status Atual: ${os.status}`, 20, 66);
    doc.text(`Descrição do Problema:`, 20, 72);
    
    // Description wrap
    const splitDesc = doc.splitTextToSize(os.description, pageWidth - 45);
    doc.text(splitDesc, 20, 77);

    // Items Table
    const tableData = os.items.map(item => [
      item.name,
      item.quantity.toString(),
      `R$ ${item.unitPrice.toFixed(2)}`,
      `R$ ${item.total.toFixed(2)}`
    ]);

    (doc as any).autoTable({
      startY: 85,
      head: [['Item/Serviço', 'Qtd', 'Unitário', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontSize: 10 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;

    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL GERAL: R$ ${os.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - 14, finalY + 15, { align: 'right' });

    // Footer / Signature
    doc.setDrawColor(200);
    doc.line(14, 260, 90, 260);
    doc.line(pageWidth - 90, 260, pageWidth - 14, 260);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Assinatura do Técnico', 52, 265, { align: 'center' });
    doc.text('Assinatura do Cliente', pageWidth - 52, 265, { align: 'center' });

    doc.save(`OS_${os.orderNumber}_${os.customerName.replace(/\s+/g, '_')}.pdf`);
  }
};
