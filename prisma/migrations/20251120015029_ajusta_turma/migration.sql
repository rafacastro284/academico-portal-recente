-- DropForeignKey
ALTER TABLE "alunodisciplina" DROP CONSTRAINT "alunodisciplina_idaluno_fkey";

-- DropForeignKey
ALTER TABLE "alunodisciplina" DROP CONSTRAINT "alunodisciplina_iddisciplina_fkey";

-- DropForeignKey
ALTER TABLE "disciplina" DROP CONSTRAINT "disciplina_idprofessor_fkey";

-- DropForeignKey
ALTER TABLE "frequencia" DROP CONSTRAINT "frequencia_idalunodisciplina_fkey";

-- DropForeignKey
ALTER TABLE "matriculaturma" DROP CONSTRAINT "matriculaturma_idturma_fkey";

-- DropForeignKey
ALTER TABLE "matriculaturma" DROP CONSTRAINT "matriculaturma_idusuario_fkey";

-- DropForeignKey
ALTER TABLE "nota" DROP CONSTRAINT "nota_idalunodisciplina_fkey";

-- DropForeignKey
ALTER TABLE "tarefa" DROP CONSTRAINT "tarefa_iddisciplina_fkey";

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
