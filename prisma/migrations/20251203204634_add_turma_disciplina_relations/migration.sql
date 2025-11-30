-- CreateTable
CREATE TABLE "TurmaDisciplina" (
    "id" SERIAL NOT NULL,
    "turmaId" INTEGER NOT NULL,
    "disciplinaId" INTEGER NOT NULL,

    CONSTRAINT "TurmaDisciplina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TurmaDisciplina_turmaId_disciplinaId_key" ON "TurmaDisciplina"("turmaId", "disciplinaId");

-- AddForeignKey
ALTER TABLE "TurmaDisciplina" ADD CONSTRAINT "TurmaDisciplina_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turma"("idturma") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaDisciplina" ADD CONSTRAINT "TurmaDisciplina_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "disciplina"("iddisciplina") ON DELETE RESTRICT ON UPDATE CASCADE;
