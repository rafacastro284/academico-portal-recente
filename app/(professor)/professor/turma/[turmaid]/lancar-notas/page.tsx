'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// 👇 CORREÇÃO: Adicionado 'lancarNotasEmLoteAction' na importação
import { getAlunosDaTurmaAction, lancarNotasEmLoteAction } from '@/lib/actions/professor';
import styles from './LancarNotas.module.css'; 

export default function LancarNotasPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const turmaId = Number(params?.turmaid); 
  const disciplinaId = Number(searchParams.get('disciplina'));

  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados dos Filtros
  const [bimestre, setBimestre] = useState('1'); 
  const [avaliacao, setAvaliacao] = useState('AV1'); 
  const [notasDigitadas, setNotasDigitadas] = useState<Record<number, string>>({});

  // 1. Carrega alunos e TODAS as notas do banco
  useEffect(() => {
    async function carregar() {
      if (!turmaId || !disciplinaId) return;
      
      const res = await getAlunosDaTurmaAction(turmaId, disciplinaId);
      
      if (res.success && res.data) {
        setAlunos(res.data.alunos);
      }
      setLoading(false);
    }
    carregar();
  }, [turmaId, disciplinaId]);

  // 2. Quando muda o Bimestre/Avaliação, preenche os inputs com o que veio do banco
  useEffect(() => {
    const descricaoAlvo = `${bimestre}º Bimestre - ${avaliacao}`;
    const notasIniciais: Record<number, string> = {};

    alunos.forEach((aluno) => {
      // Agora 'aluno.nota' existe porque corrigimos o backend
      const notaEncontrada = aluno.nota?.find((n: any) => n.descricao === descricaoAlvo);
      
      if (notaEncontrada) {
        notasIniciais[aluno.idAlunoDisciplina] = String(notaEncontrada.valor);
      } else {
        notasIniciais[aluno.idAlunoDisciplina] = ''; // Limpa o campo se não tiver nota
      }
    });

    setNotasDigitadas(notasIniciais);
  }, [bimestre, avaliacao, alunos]);

  // 3. Atualiza estado ao digitar
  const handleNotaChange = (idAlunoDisciplina: number, valor: string) => {
    setNotasDigitadas(prev => ({ ...prev, [idAlunoDisciplina]: valor }));
  };

  // 4. Salva no Banco (EM LOTE)
  const handleSaveAllNotes = async () => {
    setSaving(true);
    const descricaoFinal = `${bimestre}º Bimestre - ${avaliacao}`;

    // Prepara array apenas com notas preenchidas e válidas
    const notasParaSalvar = Object.entries(notasDigitadas)
      .map(([id, valor]) => ({
        idAlunoDisciplina: Number(id),
        valor: parseFloat(valor)
      }))
      // Filtra valores inválidos ou vazios (para não salvar NaN)
      .filter(item => !isNaN(item.valor) && item.valor >= 0 && item.valor <= 10);

    if (notasParaSalvar.length === 0) {
      alert("Nenhuma nota válida preenchida para salvar.");
      setSaving(false);
      return;
    }

    // Chama a Server Action corrigida
    const resultado = await lancarNotasEmLoteAction({
      descricaoAvaliacao: descricaoFinal,
      notas: notasParaSalvar
    });

    if (resultado.success) {
      alert(`✅ Notas de ${descricaoFinal} salvas com sucesso!`);
      window.location.reload(); // Recarrega para garantir sincronia
    } else {
      alert('❌ Erro ao salvar: ' + resultado.error);
    }
    setSaving(false);
  };

  if (loading) return <div className={styles.container}>Carregando lista de alunos...</div>;
  if (!turmaId || !disciplinaId) return <div className={styles.container}>Erro: Turma ou Disciplina não identificada.</div>;

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: '20px' }}>
        <Link href={`/professor/turma/${turmaId}/alunos?disciplina=${disciplinaId}`} style={{textDecoration:'none', color:'#666'}}>
           &larr; Voltar para Lista
        </Link>
      </div>

      <div className={styles.filterBar}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: 5, fontWeight: 'bold' }}>Bimestre:</label>
            <select 
              value={bimestre} 
              onChange={(e) => setBimestre(e.target.value)}
              className={styles.selectInput}
            >
              <option value="1">1º Bimestre</option>
              <option value="2">2º Bimestre</option>
              <option value="3">3º Bimestre</option>
              <option value="4">4º Bimestre</option>
            </select>
          </div>
          <div>
            <label style={{ marginRight: 5, fontWeight: 'bold' }}>Avaliação:</label>
            <select 
              value={avaliacao} 
              onChange={(e) => setAvaliacao(e.target.value)}
              className={styles.selectInput}
            >
              <option value="AV1">AV1</option>
              <option value="AV2">AV2</option>
              <option value="AV3">AV3</option>
              <option value="AVD">AVD</option>
            </select>
          </div>
        </div>
        
        <button className={styles.saveButton} onClick={handleSaveAllNotes} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Todas as Notas'}
        </button>
      </div>

      <h3 className={styles.sectionTitle}>
        Lançando: {bimestre}º Bimestre - {avaliacao}
      </h3>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nome do Aluno</th>
              <th>Nota (0 - 10)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => {
              const notaAtual = notasDigitadas[aluno.idAlunoDisciplina] || '';
              const status = notaAtual === '' ? 'Pendente' : 'Preenchido';

              return (
                <tr key={aluno.idAlunoDisciplina}>
                  <td>{aluno.matricula || '-'}</td>
                  <td>{aluno.nome}</td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={notaAtual}
                      onChange={(e) => handleNotaChange(aluno.idAlunoDisciplina, e.target.value)}
                      className={styles.notaInput}
                      placeholder="-"
                    />
                  </td>
                  <td>
                    <span className={`${styles.statusTag} ${notaAtual !== '' ? styles.statusLancada : styles.statusPendente}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}