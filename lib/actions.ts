'use server'; 

import prisma from './prisma'; // Importa a instância única do Prisma

// Importa a função para revalidar o cache do Next.js
import { revalidatePath } from 'next/cache'; 

// Exemplo de função de cadastro
export async function cadastrarNovoAluno(formData: FormData) {
  const nome = formData.get('nome') as string;
  const matricula = formData.get('matricula') as string;

  try {
    await prisma.aluno.create({ // Aluno deve ser o nome da sua tabela no schema
      data: {
        nome: nome,
        matricula: matricula,
      },
    });

    // Recarrega os dados da rota '/aluno' após o cadastro
    revalidatePath('/aluno'); 

    return { success: true };

  } catch (error) {
    console.error("Erro no cadastro:", error);
    return { success: false, message: 'Falha ao cadastrar. Verifique os dados.' };
  }
}