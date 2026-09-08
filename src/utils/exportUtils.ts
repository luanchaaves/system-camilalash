// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Utilities: Export Utilities (CSV & PDF com jsPDF)
// ========================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBRL, formatDate } from './formatters';
import { FinancialEntry, FinancialExpense, Client, Appointment } from '../types';

/**
 * Exporta dados tabulares para arquivo CSV no navegador.
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processCell = (val: string | number) => {
    const stringVal = String(val === null || val === undefined ? '' : val);
    const escaped = stringVal.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csvContent = [
    headers.map(processCell).join(';'),
    ...rows.map(row => row.map(processCell).join(';'))
  ].join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta Relatório Financeiro Executivo em PDF elegante.
 */
export function exportFinancialReportPDF(
  periodLabel: string,
  entries: FinancialEntry[],
  expenses: FinancialExpense[],
  summary: {
    revenue: number;
    expenses: number;
    netProfit: number;
    margin: number;
  }
) {
  const doc = new jsPDF();

  // Cabeçalho Premium
  doc.setFillColor(250, 248, 245);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(197, 168, 128); // Gold
  doc.setFontSize(18);
  doc.text('CAMILA RODRIGUES BEAUTY STUDIO', 14, 18);

  doc.setTextColor(44, 40, 37); // Text
  doc.setFontSize(12);
  doc.text(`Relatório Financeiro — ${periodLabel}`, 14, 28);

  doc.setFontSize(8);
  doc.setTextColor(120, 115, 110);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 34);

  // Quadro de Resumo
  doc.setFillColor(245, 240, 235);
  doc.roundedRect(14, 46, 182, 24, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(70, 65, 60);
  doc.text('Faturamento Realizado', 20, 54);
  doc.text('Despesas Pagas', 68, 54);
  doc.text('Lucro Líquido', 116, 54);
  doc.text('Margem', 160, 54);

  doc.setFontSize(11);
  doc.setTextColor(40, 140, 70); // Verde
  doc.text(formatBRL(summary.revenue), 20, 63);

  doc.setTextColor(200, 60, 60); // Vermelho
  doc.text(formatBRL(summary.expenses), 68, 63);

  doc.setTextColor(197, 140, 40); // Gold
  doc.text(formatBRL(summary.netProfit), 116, 63);

  doc.setTextColor(44, 40, 37);
  doc.text(`${summary.margin.toFixed(1)}%`, 160, 63);

  // Tabela de Entradas
  doc.setFontSize(11);
  doc.setTextColor(44, 40, 37);
  doc.text('Detalhamento de Entradas', 14, 78);

  const entriesData = entries.map(e => [
    formatDate(e.date),
    e.description,
    e.client?.full_name || '-',
    e.category,
    e.status === 'received' ? 'Recebido' : 'Pendente',
    formatBRL(e.amount),
  ]);

  autoTable(doc, {
    startY: 82,
    head: [['Data', 'Descrição', 'Cliente', 'Categoria', 'Status', 'Valor']],
    body: entriesData.length > 0 ? entriesData : [['-', 'Sem lançamentos no período', '-', '-', '-', '-']],
    headStyles: { fillColor: [197, 168, 128], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  // Tabela de Despesas
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 150;
  
  doc.setFontSize(11);
  doc.text('Detalhamento de Despesas', 14, finalY + 10);

  const expensesData = expenses.map(e => [
    formatDate(e.date),
    e.description,
    e.cost_type === 'fixed' ? 'Fixo' : 'Variável',
    e.category?.name || 'Geral',
    e.status === 'paid' ? 'Pago' : 'Pendente',
    formatBRL(e.amount),
  ]);

  autoTable(doc, {
    startY: finalY + 14,
    head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Status', 'Valor']],
    body: expensesData.length > 0 ? expensesData : [['-', 'Sem despesas no período', '-', '-', '-', '-']],
    headStyles: { fillColor: [140, 109, 63], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  doc.save(`Relatorio_Financeiro_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
}

/**
 * Exporta Lista de Clientes para PDF
 */
export function exportClientsPDF(clients: Client[]) {
  const doc = new jsPDF();

  doc.setFillColor(250, 248, 245);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(197, 168, 128);
  doc.setFontSize(16);
  doc.text('CAMILA RODRIGUES BEAUTY STUDIO', 14, 16);
  doc.setFontSize(11);
  doc.setTextColor(44, 40, 37);
  doc.text(`Relatório da Base de Clientes (${clients.length} cadastrados)`, 14, 25);

  const tableData = clients.map(c => [
    c.full_name,
    c.whatsapp,
    c.email || '-',
    c.origin || '-',
    c.status === 'active' ? 'Ativo' : 'Inativo',
    formatBRL(c.total_spent || 0),
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['Nome Completo', 'WhatsApp', 'E-mail', 'Origem', 'Status', 'Total Investido']],
    body: tableData,
    headStyles: { fillColor: [197, 168, 128], textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
  });

  doc.save(`Clientes_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

/**
 * Exporta Relatório de Atendimentos para PDF
 */
export function exportAppointmentsPDF(appointments: Appointment[], periodLabel: string) {
  const doc = new jsPDF();

  doc.setFillColor(250, 248, 245);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(197, 168, 128);
  doc.setFontSize(16);
  doc.text('CAMILA RODRIGUES BEAUTY STUDIO', 14, 16);
  doc.setFontSize(11);
  doc.setTextColor(44, 40, 37);
  doc.text(`Relatório da Agenda de Atendimentos — ${periodLabel}`, 14, 25);

  const tableData = appointments.map(a => [
    formatDate(a.start_time, "dd/MM/yyyy HH:mm"),
    a.client?.full_name || '-',
    a.service?.name || '-',
    a.appointment_type === 'maintenance' ? 'Manutenção' : 'Aplicação',
    a.status.toUpperCase(),
    formatBRL(a.total_amount),
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['Data / Hora', 'Cliente', 'Procedimento', 'Tipo', 'Status', 'Valor']],
    body: tableData,
    headStyles: { fillColor: [197, 168, 128], textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
  });

  doc.save(`Agendamentos_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
