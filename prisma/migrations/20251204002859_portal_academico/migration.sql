-- CreateEnum
CREATE TYPE "tipo_usuario" AS ENUM ('aluno', 'professor', 'secretario', 'admin', 'diretor');

-- CreateTable
CREATE TABLE "alunodisciplina" (
    "idalunodisciplina" SERIAL NOT NULL,
    "idaluno" INTEGER NOT NULL,
    "iddisciplina" INTEGER NOT NULL,

    CONSTRAINT "alunodisciplina_pkey" PRIMARY KEY ("idalunodisciplina")
);

-- CreateTable
CREATE TABLE "disciplina" (
    "iddisciplina" SERIAL NOT NULL,
    "idprofessor" INTEGER NOT NULL,
    "nome_disciplina" VARCHAR(100),
    "carga_horaria" INTEGER,

    CONSTRAINT "disciplina_pkey" PRIMARY KEY ("iddisciplina")
);

-- CreateTable
CREATE TABLE "frequencia" (
    "idfrequencia" SERIAL NOT NULL,
    "idalunodisciplina" INTEGER NOT NULL,
    "data" DATE,
    "faltas" INTEGER DEFAULT 0,

    CONSTRAINT "frequencia_pkey" PRIMARY KEY ("idfrequencia")
);

-- CreateTable
CREATE TABLE "turma" (
    "idturma" SERIAL NOT NULL,
    "nome_turma" VARCHAR(50),
    "ano_letivo" INTEGER,
    "limite_vagas" INTEGER,
    "serie" VARCHAR(50),
    "turno" VARCHAR(30),

    CONSTRAINT "turma_pkey" PRIMARY KEY ("idturma")
);

-- CreateTable
CREATE TABLE "nota" (
    "idnota" SERIAL NOT NULL,
    "idalunodisciplina" INTEGER NOT NULL,
    "descricao" VARCHAR(200),
    "valor" DECIMAL(5,2),
    "data" DATE,

    CONSTRAINT "nota_pkey" PRIMARY KEY ("idnota")
);

-- CreateTable
CREATE TABLE "tarefa" (
    "idtarefa" SERIAL NOT NULL,
    "iddisciplina" INTEGER NOT NULL,
    "tipo" VARCHAR(50),
    "descricao" TEXT,

    CONSTRAINT "tarefa_pkey" PRIMARY KEY ("idtarefa")
);

-- CreateTable
CREATE TABLE "matriculaturma" (
    "idmatriculaturma" SERIAL NOT NULL,
    "idusuario" INTEGER NOT NULL,
    "idturma" INTEGER NOT NULL,

    CONSTRAINT "matriculaturma_pkey" PRIMARY KEY ("idmatriculaturma")
);

-- CreateTable
CREATE TABLE "usuario" (
    "idusuario" SERIAL NOT NULL,
    "cpf" VARCHAR(14),
    "matricula" VARCHAR(20),
    "nome" VARCHAR(100),
    "email" VARCHAR(100),
    "senha" VARCHAR(255),
    "tipo" "tipo_usuario" NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("idusuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_cpf_key" ON "usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- AddForeignKey
ALTER TABLE "alunodisciplina" ADD CONSTRAINT "alunodisciplina_idaluno_fkey" FOREIGN KEY ("idaluno") REFERENCES "usuario"("idusuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunodisciplina" ADD CONSTRAINT "alunodisciplina_iddisciplina_fkey" FOREIGN KEY ("iddisciplina") REFERENCES "disciplina"("iddisciplina") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplina" ADD CONSTRAINT "disciplina_idprofessor_fkey" FOREIGN KEY ("idprofessor") REFERENCES "usuario"("idusuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frequencia" ADD CONSTRAINT "frequencia_idalunodisciplina_fkey" FOREIGN KEY ("idalunodisciplina") REFERENCES "alunodisciplina"("idalunodisciplina") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_idalunodisciplina_fkey" FOREIGN KEY ("idalunodisciplina") REFERENCES "alunodisciplina"("idalunodisciplina") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_iddisciplina_fkey" FOREIGN KEY ("iddisciplina") REFERENCES "disciplina"("iddisciplina") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculaturma" ADD CONSTRAINT "matriculaturma_idturma_fkey" FOREIGN KEY ("idturma") REFERENCES "turma"("idturma") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculaturma" ADD CONSTRAINT "matriculaturma_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE RESTRICT ON UPDATE CASCADE;
