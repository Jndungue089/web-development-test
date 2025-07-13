import type { Project } from "../components/ProjectCardBase";
// @ts-ignore
import { saveAs } from "file-saver";

export function exportProjectsToCSV(projects: Project[]) {
  const header = ["ID", "Título", "Descrição", "Status", "Criado em", "Prioridade"];
  const rows = projects.map(p => [
    p.id,
    p.title,
    p.description,
    p.status,
    p.createdAt ? p.createdAt.toLocaleDateString("pt-BR") : "",
    p.priority || ""
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "projetos.csv");
}

// PDF export placeholder (use jsPDF or similar)
export function exportProjectsToPDF(projects: Project[]) {
  // Implementação futura: usar jsPDF para gerar PDF
  alert("Exportação para PDF em breve!");
}
