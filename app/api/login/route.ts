import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { cpf, senha } = await request.json();

    // Busca o usuário pelo CPF
    const user = await prisma.usuario.findUnique({
      where: { cpf },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(senha, user.senha ?? '');
    if (!senhaCorreta) {
      return NextResponse.json(
        { error: 'Senha incorreta.' },
        { status: 401 }
      );
    }

    // Define o caminho de redirecionamento conforme o tipo do usuário
    let redirectPath = '/';
    switch (user.tipo) {
      case 'aluno':
        redirectPath = '/aluno/dashboard';
        break;
      case 'professor':
        redirectPath = '/professor/dashboard';
        break;
      case 'secretario':
        redirectPath = '/secretario/dashboard';
        break;
      case 'diretor':
        redirectPath = '/diretor/dashboard';
        break;
      case 'admin':
        redirectPath = '/admin/dashboard';
        break;
      default:
        redirectPath = '/';
    }

    // Retorna dados do usuário e o caminho correto
    return NextResponse.json({
      message: 'Login bem-sucedido!',
      usuario: {
        id: user.idusuario,
        nome: user.nome,
        tipo: user.tipo,
        cpf: user.cpf,
      },
      redirectPath,
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
