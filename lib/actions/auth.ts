'use server';

import { prisma } from "@/lib/prisma";
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function loginAction(dados: { cpf: string; senha: string }) {
  console.log("--- LOGIN ---", dados.cpf);
  try {
    const usuario = await prisma.usuario.findUnique({ 
        where: { cpf: dados.cpf },
        select: { idusuario: true, senha: true, tipo: true, nome: true }
    });

    if (!usuario) return { success: false, error: "CPF não encontrado." };

    const senhaBanco = usuario.senha || '';
    let senhaValida = false;

    // Suporte para senhas antigas (texto plano) e novas (hash)
    if (senhaBanco.startsWith('$2')) {
      senhaValida = await bcrypt.compare(dados.senha, senhaBanco);
    } else {
      senhaValida = senhaBanco === dados.senha;
    }

    if (!senhaValida) return { success: false, error: "Senha incorreta." };

    // Next.js 15: Await cookies
    const cookieStore = await cookies();
    cookieStore.set('portal_usuario_id', String(usuario.idusuario), {
      httpOnly: true, path: '/', maxAge: 86400 
    });

    const { senha, ...usuarioData } = usuario;
    return { success: true, usuario: usuarioData };
  } catch (error) { 
    console.error(error);
    return { success: false, error: "Erro interno." }; 
  }
}