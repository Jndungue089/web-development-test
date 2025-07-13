import React from "react";

export type ArchivedProject = {
  id: string;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  owner: string;
  members: string[];
  archived: boolean;
};

interface ArchivedProjectsListProps {
  projects: ArchivedProject[];
  onUnarchive: (id: string) => void;
  onUnarchiveAll: () => void;
}

export default function ArchivedProjectsList({ projects, onUnarchive, onUnarchiveAll }: ArchivedProjectsListProps) {
  return (
    <div>
      <h2>Projetos Arquivados</h2>
      {projects.length > 1 && (
        <button onClick={() => window.confirm("Deseja desarquivar TODOS os projetos arquivados?") && onUnarchiveAll()}>
          Desarquivar Todos
        </button>
      )}
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <span>{project.title}</span>
            <button onClick={() => window.confirm(`Deseja desarquivar o projeto \"${project.title}\"?`) && onUnarchive(project.id)}>
              Desarquivar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
