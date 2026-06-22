export interface Student {
  id: number;
  matricula: string;
  name: string;
  subject: string;
  absences: number;
  parcial: string;
  partialAverage: number;
  status: "Regular" | "Reprobado por Faltas";
}

export const mockStudents: Student[] = [
  {
    id: 1,
    matricula: "2024-001",
    name: "Ana García Martínez",
    subject: "Programación Avanzada",
    absences: 2,
    parcial: "1",
    partialAverage: 8.5,
    status: "Regular",
  },
  {
    id: 2,
    matricula: "2024-002",
    name: "Carlos Rodríguez López",
    subject: "Base de Datos",
    absences: 8,
    parcial: "1",
    partialAverage: 6.2,
    status: "Reprobado por Faltas",
  },
  {
    id: 3,
    matricula: "2024-003",
    name: "María Elena Fernández",
    subject: "Programación Avanzada",
    absences: 1,
    parcial: "1",
    partialAverage: 9.2,
    status: "Regular",
  },
  {
    id: 4,
    matricula: "2024-004",
    name: "José Luis Hernández",
    subject: "Sistemas Operativos",
    absences: 3,
    parcial: "1",
    partialAverage: 7.8,
    status: "Regular",
  },
  {
    id: 5,
    matricula: "2024-005",
    name: "Laura Patricia Sánchez",
    subject: "Ingeniería de Software",
    absences: 0,
    parcial: "1",
    partialAverage: 9.5,
    status: "Regular",
  },
  {
    id: 6,
    matricula: "2024-006",
    name: "Roberto Martínez Díaz",
    subject: "Base de Datos",
    absences: 7,
    parcial: "1",
    partialAverage: 5.8,
    status: "Reprobado por Faltas",
  },
  {
    id: 7,
    matricula: "2024-007",
    name: "Patricia Gómez Ruiz",
    subject: "Redes de Computadoras",
    absences: 2,
    parcial: "1",
    partialAverage: 8.7,
    status: "Regular",
  },
  {
    id: 8,
    matricula: "2024-008",
    name: "Miguel Ángel Torres",
    subject: "Programación Avanzada",
    absences: 4,
    parcial: "1",
    partialAverage: 7.3,
    status: "Regular",
  },
];
