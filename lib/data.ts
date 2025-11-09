// lib/data.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createUsuario(data: {
  cpf?: string;
  matricula?: string;
  nome?: string;
  email?: string;
  senha?: string;
  tipo: "aluno" | "professor" | "secretario" | "admin";
}) {
  return await prisma.usuario.create({
    data,
  });
}

export async function getUsuarios() {
  return await prisma.usuario.findMany({
    orderBy: { idusuario: "asc" },
  });
}
