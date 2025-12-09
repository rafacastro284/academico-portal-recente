import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Método POST → Cadastrar novo usuário
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, cpf, matricula, email, senha, tipo } = body;

    if (!email || !senha || !nome || !cpf || !tipo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Verifica se o tipo de usuário é válido
    const tiposValidos = ['aluno', 'professor', 'secretario', 'admin', 'diretor'];
    if (!tiposValidos.includes(tipo.toLowerCase())) {
      return NextResponse.json(
        { error: 'Tipo de usuário inválido' },
        { status: 400 }
      );
    }

    // Verifica se já existe um usuário com o mesmo email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado' },
        { status: 400 }
      );
    }

    // Criptografa a senha
    const hashedSenha = await bcrypt.hash(senha, 10);

    // Cria o novo usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        cpf,
        matricula,
        email,
        senha: hashedSenha,
        tipo: tipo.toLowerCase(), // precisa ser igual ao enum do schema
      },
    });

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', usuario: novoUsuario },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
