export const studentData = {
  name: "Maria Da Silva",
  matricula: "N/A",
  turma: "Turma não definida",
  generalStats: {
    disciplinas: 4,
    mediaGeral: 7.9,
    frequencia: 93,
  },
  disciplinas: [
    {
      id: "1",
      name: "Matemática",
      professor: "Prof. Carlos Silva",
      notaAtual: 8.5,
      frequencia: 95,
    },
    {
      id: "2",
      name: "Português",
      professor: "Prof. Ana Santos",
      notaAtual: 7.2,
      frequencia: 88,
    },
    {
      id: "3",
      name: "História",
      professor: "Prof. Ricardo Lima",
      notaAtual: 9.0,
      frequencia: 98,
    },
    {
      id: "4",
      name: "Física",
      professor: "Prof. Mariana Costa",
      notaAtual: 6.8,
      frequencia: 92,
    },
  ],
};

export const subjectDetails = {
  // Chave '1' corresponde ao ID de Matemática
  "1": {
    grades: {
      summary: {
        mediaAtual: 8.5,
        situacao: "Aprovado",
        bimestres: 2,
      },
      bimestres: [
        { id: 1, name: "1º Bimestre", av1: 8.5, av2: 7, av3: 9, media: 8.2, situacao: "APROVADO" },
        { id: 2, name: "2º Bimestre", av1: 7.5, av2: 8, av3: null, media: 7.8, situacao: "CURSANDO" },
      ],
    },
    attendance: {
      summary: {
        frequencia: "50%",
        presencas: 2,
        faltas: 1,
        justificadas: 1,
      },
      logs: [
        { id: 1, data: "14/03/2025", dia: "Sexta-feira", status: "Presente", observacoes: "-" },
        { id: 2, data: "16/03/2025", dia: "Domingo", status: "Presente", observacoes: "-" },
        { id: 3, data: "18/03/2025", dia: "Quarta-feira", status: "Falta", observacoes: "Não justificada" },
        { id: 4, data: "21/03/2025", dia: "Sexta-feira", status: "Justificada", observacoes: "Atestado médico" },
      ],
    },
  },

};

export const adminUserData = {
  summary: {
    total: 6,
    alunos: 2,
    professores: 1,
    diretores: 1,
    secretarios: 0,
    administradores: 1,
  },
  users: [
    {
      id: "u1",
      nome: "Joana Maria",
      cpf: "111.111.111-11",
      perfil: "ADMIN",
      matricula: "-",
      email: "admin@escola.com",
      dataCadastro: "02/11/2025",
    },
    {
      id: "u2",
      nome: "Fernanda Lima",
      cpf: "888.888.888-88",
      perfil: "ALUNO",
      matricula: "8888888888",
      email: "aluna@escola.com",
      dataCadastro: "02/11/2025",
    },
    {
      id: "u3",
      nome: "Eduardo Pereira",
      cpf: "444.444.444-44",
      perfil: "ALUNO",
      matricula: "4444444444",
      email: "aluno@escola.com",
      dataCadastro: "02/11/2025",
    },
    {
      id: "u4",
      nome: "Carlos Silva",
      cpf: "222.222.222-22", 
      perfil: "PROFESSOR",
      matricula: "PROF001",
      email: "everton@escola.com",
      dataCadastro: "02/11/2025",
    },
    {
      id: "u5",
      nome: "Jorge Amado",
      cpf: "333.333.333-33",
      perfil: "DIRETOR",
      matricula: "DIR001",
      email: "diretor@escola.com",
      dataCadastro: "02/11/2025",
    },
    {
      id: "u6",
      nome: "Etelbio da Paz",
      cpf: "999.999.999-99",
      perfil: "SECRETARIO",
      matricula: "SEC001",
      email: "secretario@escola.com",
      dataCadastro: "02/11/2025",
    },
  ],
};

export const diretorData = {
  header: {
    nome: "Diretor Teste",
    CPF: "DIR001",
  },
  summary: {
    alunos: 285,
    professores: 18,
    turmas: 12,
    mediaGeral: 7.8,
  },
  desempenho: {
    summary: {
      mediaGeral: 7.6,
      aprovados: 4,
      recuperacao: 2,
      reprovados: 0,
    },
    alunos: [
      { id: 'a1', nome: 'Ana Clara Silva', turma: '9º Ano A', media: 8.5, frequencia: '95%', situacao: 'Aprovado' },
      { id: 'a2', nome: 'Bruno Oliveira', turma: '9º Ano A', media: 7.2, frequencia: '88%', situacao: 'Aprovado' },
      // ... adiciona mais alunos aq
    ],
  },
  frequencia: {
    summary: {
      frequenciaGeral: '91.1%',
      presencas: 200,
      faltas: 20,
      alunosCriticos: 23,
    },
    turmas: [
      { id: 't1', nome: '6º Ano A', totalAlunos: 24, frequenciaMedia: '94%', alunosBaixaFreq: 2, status: 'Ótima' },
      { id: 't2', nome: '6º Ano B', totalAlunos: 26, frequenciaMedia: '92%', alunosBaixaFreq: 3, status: 'Ótima' },
      { id: 't3', nome: '7º Ano A', totalAlunos: 28, frequenciaMedia: '91%', alunosBaixaFreq: 3, status: 'Ótima' },
      { id: 't4', nome: '7º Ano B', totalAlunos: 25, frequenciaMedia: '89%', alunosBaixaFreq: 3, status: 'Atenção' },
    ],
  },
  corpoDocente: [
    { id: 'p1', nome: 'Carlos Silva', CPF: 'PROF001', disciplina: 'Matemática', turmas: '9º Ano A, 9º Ano B', totalAlunos: 50, status: 'Ativo' },
    { id: 'p2', nome: 'Ana Santos', CPF: 'PROF002', disciplina: 'Português', turmas: '8º Ano A, 8º Ano B', totalAlunos: 50, status: 'Ativo' },
    { id: 'p3', nome: 'Ricardo Lima', CPF: 'PROF003', disciplina: 'História', turmas: '7º Ano A, 7º Ano B', totalAlunos: 50, status: 'Ativo' },
    { id: 'p4', nome: 'Mariana Costa', CPF: 'PROF004', disciplina: 'Física', turmas: '9º Ano A, 9º Ano B', totalAlunos: 50, status: 'Ativo' },
  ],
};

export const filterOptions = {
  turmas: [
    { id: 't1', nome: '6º Ano A' },
    { id: 't2', nome: '6º Ano B' },
    { id: 't3', nome: '7º Ano A' },
    { id: 't4', nome: '7º Ano B' },
    { id: 't5', nome: '8º Ano A' },
    { id: 't6', nome: '8º Ano B' },
    { id: 't7', nome: '9º Ano A' },
    { id: 't8', nome: '9º Ano B' },
  ],
  bimestres: [
    { id: 'b1', nome: '1º Bimestre' },
    { id: 'b2', nome: '2º Bimestre' },
    { id: 'b3', nome: '3º Bimestre' },
    { id: 'b4', nome: '4º Bimestre' },
  ],
  disciplinas: [
    'Matemática', 'Português', 'História', 'Geografia', 
    'Física', 'Química', 'Biologia', 'Inglês',
  ]
};

export const desempenhoDisciplinaData = {
  alunos: [
    // Turma 9A - Matemática
    { id: 'd1', nome: 'Ana Clara Silva', turma: '9º Ano A', disciplina: 'Matemática', nota: 9.5 },
    { id: 'd2', nome: 'Bruno Oliveira', turma: '9º Ano A', disciplina: 'Matemática', nota: 7.2 },
    { id: 'd3', nome: 'Carla Dias', turma: '9º Ano A', disciplina: 'Matemática', nota: 8.0 },
    { id: 'd4', nome: 'Daniel Moreira', turma: '9º Ano A', disciplina: 'Matemática', nota: 6.5 },
    // Turma 9A - Português
    { id: 'd5', nome: 'Ana Clara Silva', turma: '9º Ano A', disciplina: 'Português', nota: 8.5 },
    { id: 'd6', nome: 'Bruno Oliveira', turma: '9º Ano A', disciplina: 'Português', nota: 9.0 },
    { id: 'd7', nome: 'Carla Dias', turma: '9º Ano A', disciplina: 'Português', nota: 7.5 },
    { id: 'd8', nome: 'Daniel Moreira', turma: '9º Ano A', disciplina: 'Português', nota: 8.0 },
    // Turma 8A - História
    { id: 'd9', nome: 'Eduardo Costa', turma: '8º Ano A', disciplina: 'História', nota: 10.0 },
    { id: 'd10', nome: 'Fernanda Lima', turma: '8º Ano A', disciplina: 'História', nota: 6.0 },
    { id: 'd11', nome: 'Gabriel Santos', turma: '8º Ano A', disciplina: 'História', nota: 7.0 },
  ]
};

export const professorData = {
  header: {
    nome: "Professor Teste",
    CPF: "PROF001",
    materiaPrincipal: "Matemática", // Exemplo, pode ser N/A na tela inicial
  },
  summary: {
    turmas: 4,
    alunos: 115,
    disciplinas: 2, // Ex: Matemática e Física
  },
  turmas: [
    {
      id: 't1',
      nome: '9º Ano A',
      disciplina: 'Matemática',
      horario: '08:00-09:30',
      totalAlunos: 32,
      alunos: [
        { matricula: '2024001', nome: 'Ana Clara Silva', status: 'CURSANDO', mediaAtual: 8.5, frequencia: '95%' },
        { matricula: '2024002', nome: 'Bruno Oliveira Santos', status: 'CURSANDO', mediaAtual: 7.2, frequencia: '88%' },
        { matricula: '2024003', nome: 'Carla Rodrigues', status: 'CURSANDO', mediaAtual: 6.8, frequencia: '92%' },
        { matricula: '2024004', nome: 'Daniel Costa Lima', status: 'CURSANDO', mediaAtual: 9.0, frequencia: '96%' },
        { matricula: '2024005', nome: 'Eduardo Pereira', status: 'RECUPERAÇÃO', mediaAtual: 5.5, frequencia: '85%' },
      ],
      notasLancadas: [
        { matricula: '2024001', nota: 9.0, status: 'Lançada', ultimaAtualizacao: '02/11/2025' },
        { matricula: '2024002', nota: 7.5, status: 'Lançada', ultimaAtualizacao: '02/11/2025' },
        { matricula: '2024003', nota: 6.4, status: 'Lançada', ultimaAtualizacao: '02/11/2025' },
        // ... outras notas
      ],
      frequenciaLancada: [
        { matricula: '2024001', status: 'P', data: '02/11/2025' },
        { matricula: '2024002', status: 'F', data: '02/11/2025' },
      ],
    },
    {
      id: 't2',
      nome: '9º Ano B',
      disciplina: 'Matemática',
      horario: '10:00-11:30',
      totalAlunos: 28,
      alunos: [
        { matricula: '2024006', nome: 'Fabiana Melo', status: 'CURSANDO', mediaAtual: 8.0, frequencia: '90%' },
        { matricula: '2024007', nome: 'Gustavo Paiva', status: 'CURSANDO', mediaAtual: 6.0, frequencia: '80%' },
      ],
    },
    {
      id: 't3',
      nome: '1º Ano Médio A',
      disciplina: 'Física',
      horario: '14:00-15:30',
      totalAlunos: 30,
      alunos: [
        { matricula: '2024008', nome: 'Helena Costa', status: 'CURSANDO', mediaAtual: 7.8, frequencia: '92%' },
        { matricula: '2024009', nome: 'Igor Rocha', status: 'CURSANDO', mediaAtual: 9.2, frequencia: '98%' },
      ],
    },
    {
      id: 't4',
      nome: '2º Ano Médio B',
      disciplina: 'Matemática',
      horario: '16:00-17:30',
      totalAlunos: 25,
      alunos: [
        { matricula: '2024010', nome: 'Juliana Lins', status: 'CURSANDO', mediaAtual: 7.0, frequencia: '87%' },
        { matricula: '2024011', nome: 'Kleber Souza', status: 'CURSANDO', mediaAtual: 6.5, frequencia: '82%' },
      ],
    },
  ],
};

// Em 'mockData.ts' (ou onde você centraliza seus mocks)

// --- Tipos (Opcional, mas boa prática) ---
export interface Turma {
  id: number;
  nome: string;
}
export interface Professor {
  id: number;
  nome: string;
}
export interface Materia {
  id: number;
  nome: string;
}

// --- Mocks ---
export const mockProfessores: Professor[] = [
  { id: 101, nome: "Ana Silva (Matemática)" },
  { id: 102, nome: "Bruno Costa (Português)" },
  { id: 103, nome: "Carla Dias (História)" },
  { id: 104, nome: "Diego Matos (Ciências)" },
];

export const mockMaterias: Materia[] = [
  { id: 1, nome: "Matemática" },
  { id: 2, nome: "Português" },
  { id: 3, nome: "História" },
  { id: 4, nome: "Ciências" },
  { id: 5, nome: "Geografia" },
  { id: 6, nome: "Educação Física" },
];

export const mockTurmas: Turma[] = [
  { id: 1, nome: "9º Ano A" },
  { id: 2, nome: "9º Ano B" },
  { id: 3, nome: "8º Ano A" },
];

// --- Constantes da Grade ---
export const diasDaSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];


export const horarios = [
  "07:00 - 07:50",
  "07:50 - 08:40",
  "08:40 - 09:30",
  "PAUSA (09:30 - 09:50)", // Pausa da Manhã
  "09:50 - 10:40",
  "10:40 - 11:30",
  "ALMOÇO (11:30 - 13:30)", // Almoço de 1.5h
  "13:30 - 14:20",
  "14:20 - 15:10",
  "PAUSA (15:10 - 15:30)", // Pausa da Tarde
  "15:30 - 16:20",
  "16:20 - 17:10", // Última aula termina 17:10 (dentro do limite das 17:30)
];

// ... (seus outros mocks, como diasDaSemana, mockTurmas, etc.)