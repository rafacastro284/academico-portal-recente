'use server';

import { prisma } from "@/lib/prisma";
import { tipo_usuario } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcryptjs';

interface DadosUsuarioInput {
  nome: string;
  cpf: string;
  email: string;
  senha?: string;
  tipo: tipo_usuario;
  matricula?: string | null;
}

export async function cadastrarUsuarioAction(dados: DadosUsuarioInput) {
  try {
    const existe = await prisma.usuario.findFirst({
      where: { OR: [{ email: dados.email }, { cpf: dados.cpf }] }
    });
    if (existe) return { success: false, error: "Usuário já existe." };

    const hash = dados.senha ? await bcrypt.hash(dados.senha, 10) : undefined;
    
    await prisma.usuario.create({
      data: {
        nome: dados.nome, cpf: dados.cpf, email: dados.email,
        senha: hash, tipo: dados.tipo, matricula: dados.matricula || null,
      }
    });
    revalidatePath('/admin/usuarios'); 
    return { success: true };
  } catch (error) { return { success: false, error: "Erro ao cadastrar." }; }
}

export async function listarUsuariosAction() {
  const users = await prisma.usuario.findMany({ orderBy: { nome: 'asc' } });
  return { success: true, data: users };
}

export async function buscarUsuarioPorIdAction(id: number) {
  const u = await prisma.usuario.findUnique({ where: { idusuario: id } });
  return u ? { success: true, data: u } : { success: false, error: "Não encontrado" };
}

export async function atualizarUsuarioAction(id: number, dados: DadosUsuarioInput) {
  try {
    await prisma.usuario.update({
      where: { idusuario: id },
      data: { 
        nome: dados.nome, cpf: dados.cpf, email: dados.email, 
        tipo: dados.tipo, matricula: dados.matricula || null 
      },
    });
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (e) { return { success: false, error: "Erro ao atualizar." }; }
}

export async function excluirUsuarioAction(id: number) {
  try {
    await prisma.matriculaturma.deleteMany({ where: { idusuario: id } });
    await prisma.alunodisciplina.deleteMany({ where: { idaluno: id } });
    await prisma.usuario.delete({ where: { idusuario: id } });
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (e) { return { success: false, error: "Possui vínculos ou erro interno." }; }
}