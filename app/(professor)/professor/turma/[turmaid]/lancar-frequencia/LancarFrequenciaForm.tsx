'use client';

import React, { useState } from 'react';
import styles from './LancarFrequencia.module.css'; 
import { lancarFrequenciaAction } from '@/lib/actions'; // Importe a Server Action

interface LancarFrequenciaFormProps {
    alunoIdDisciplina: number;
    disciplinaId: number;
    statusInicial: 'P' | 'F' | 'N/A';
    dataInicial: string; // Formato YYYY-MM-DD
}

export default function LancarFrequenciaForm({
    alunoIdDisciplina,
    disciplinaId,
    statusInicial,
    dataInicial,
}: LancarFrequenciaFormProps) {
    
    // Estado para a data selecionada e o status (P=Presente, F=Falta)
    const [dataSelecionada, setDataSelecionada] = useState(dataInicial);
    const [statusFrequencia, setStatusFrequencia] = useState<'P' | 'F'>(
        statusInicial === 'F' ? 'F' : 'P' // Se não for 'F', assume 'P' para o rádio
    );
    
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const novaData = e.target.value;
        // 🎯 OBS: Se você quiser que o statusInicial mude quando o professor mudar a data, 
        // você precisará de um useEffect para chamar o getDadosLancamentoFrequenciaAction 
        // novamente. Por enquanto, a mudança de data apenas prepara o salvamento.
        setDataSelecionada(novaData);
        setStatusMessage('');
    };

    const handleLancarFrequencia = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSaving(true);
        setStatusMessage('Salvando frequência...');

        // 🎯 A action de salvar frequência espera um array de registros (para lançar em lote).
        // Aqui, lançamos apenas o registro deste aluno.
        const dadosParaAcao = {
            disciplinaId: disciplinaId,
            data: dataSelecionada,
            registros: [{ 
                idAlunoDisciplina: alunoIdDisciplina, 
                status: statusFrequencia 
            }]
        };

        const resultado = await lancarFrequenciaAction(dadosParaAcao);

        if (resultado.success) {
            setStatusMessage(`✅ Frequência (${statusFrequencia === 'P' ? 'PRESENÇA' : 'FALTA'}) lançada com sucesso para ${dataSelecionada}!`);
        } else {
            setStatusMessage(`❌ Erro ao salvar: ${resultado.error || 'Erro interno.'}`);
        }
        
        setIsSaving(false);
    };

    return (
        <div className={styles.formContainer}>
            
            <h3 className={styles.sectionTitle}>Registro de Frequência</h3>

            <form onSubmit={handleLancarFrequencia} className={styles.frequenciaForm}>
                
                {/* Campo de Data */}
                <div className={styles.inputGroup}>
                    <label htmlFor="dataLancamento">Data do Registro:</label>
                    <input
                        type="date"
                        id="dataLancamento"
                        name="dataLancamento"
                        value={dataSelecionada}
                        onChange={handleDataChange}
                        required
                        className={styles.inputField}
                        disabled={isSaving}
                    />
                </div>
                
                {/* Status Inicial do Dia */}
                <p className={styles.statusInfo}>
                    Status Inicial: 
                    <span className={statusInicial === 'F' ? styles.statusFalta : styles.statusPresenca}>
                        {statusInicial === 'F' ? ' FALTA' : statusInicial === 'P' ? ' PRESENÇA' : ' N/A (Não Lançado)'}
                    </span>
                </p>

                {/* Opções de Frequência */}
                <div className={styles.radioGroup}>
                    <label>
                        <input
                            type="radio"
                            name="status"
                            value="P"
                            checked={statusFrequencia === 'P'}
                            onChange={() => setStatusFrequencia('P')}
                            disabled={isSaving}
                        />
                        Presente (0 Faltas)
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="status"
                            value="F"
                            checked={statusFrequencia === 'F'}
                            onChange={() => setStatusFrequencia('F')}
                            disabled={isSaving}
                        />
                        Falta (1 Falta)
                    </label>
                </div>
                
                <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={isSaving}
                >
                    {isSaving ? 'Salvando...' : 'Registrar Frequência'}
                </button>
            </form>

            {statusMessage && <p className={styles.status}>{statusMessage}</p>}
        </div>
    );
}