'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './DiretorDashboard.module.css';
import { 
  getRelatorioCompletoAction 
} from '@/lib/actions/diretoria';

const IconGerenciarDisciplinas = () => <>📊</>;
const IconCadastrarDisciplina = () => <>➕</>;
const IconGerenciarTurmas = () => <>🏫</>;
const IconGerenciarProfessores = () => <>👨‍🏫</>;
const IconGerenciarAlunos = () => <>🎓</>;
const IconRelatorio = () => <>📄</>;

export default function DiretorDashboard() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showRelatorioCard, setShowRelatorioCard] = useState(false);

  const handleGerarRelatorio = async () => {
    try {
      setIsGeneratingPdf(true);
      
      const resultado = await getRelatorioCompletoAction();
      
      if (resultado.success && resultado.data) {
        await generateABNTPDF(resultado.data);
      } else {
        alert('Erro ao gerar relatório: ' + (resultado.error || 'Dados não disponíveis'));
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Função para gerar PDF no padrão ABNT
  const generateABNTPDF = async (data: any) => {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 30;
    const marginRight = pageWidth - 30;
    const lineHeight = 7;
    
    // Configurações de fonte ABNT (Times New Roman ou similar)
    doc.setFont('times');
    doc.setFontSize(12);
    
    let yPosition = 40;
    let pageNumber = 1;
    
    // Função para adicionar rodapé com numeração
    const addFooter = (pageNum: number) => {
      const currentY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${pageNum}`, pageWidth / 2, currentY, { align: 'center' });
    };
    
    // Função para verificar se precisa de nova página
    const checkNewPage = () => {
      if (yPosition > 270) {
        addFooter(pageNumber);
        doc.addPage();
        pageNumber++;
        yPosition = 40;
        return true;
      }
      return false;
    };
    
    // CAPA
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text('RELATÓRIO DE GESTÃO ESCOLAR', pageWidth / 2, 60, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('INSTITUIÇÃO DE ENSINO', pageWidth / 2, 80, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text('Relatório técnico-administrativo', pageWidth / 2, 100, { align: 'center' });
    
    const currentDate = new Date();
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const formattedDate = `${currentDate.getDate()} de ${months[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
    
    doc.text(`Data: ${formattedDate}`, pageWidth / 2, 120, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Sistema de Gestão Acadêmica', pageWidth / 2, 140, { align: 'center' });
    
    addFooter(pageNumber);
    
    // PÁGINA 1: SUMÁRIO
    doc.addPage();
    pageNumber++;
    yPosition = 40;
    
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('SUMÁRIO', marginLeft, yPosition);
    yPosition += 20;
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    
    const sections = [
      '1. DADOS INSTITUCIONAIS',
      '2. CORPO DOCENTE',
      '3. TURMAS EM FUNCIONAMENTO',
      '4. DISCIPLINAS OFERTADAS',
      '5. INDICADORES DE FREQUÊNCIA',
      '6. CONSIDERAÇÕES FINAIS'
    ];
    
    sections.forEach((section, index) => {
      doc.text(section, marginLeft, yPosition + (index * lineHeight * 1.5));
    });
    
    yPosition += (sections.length * lineHeight * 1.5) + 20;
    addFooter(pageNumber);
    
    // PÁGINA 2: DADOS INSTITUCIONAIS
    doc.addPage();
    pageNumber++;
    yPosition = 40;
    
    // Seção 1
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('1. DADOS INSTITUCIONAIS', marginLeft, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    
    const stats = data?.stats || {};
    const institutionalData = [
      `Total de alunos matriculados: ${stats.alunos || '0'}`,
      `Corpo docente: ${stats.professores || '0'} professores`,
      `Turmas em funcionamento: ${stats.turmas || '0'}`,
      `Média geral de aproveitamento: ${stats.mediaGeral || '0,0'}`
    ];
    
    institutionalData.forEach((item, index) => {
      doc.text(item, marginLeft, yPosition + (index * lineHeight * 1.2));
    });
    
    yPosition += (institutionalData.length * lineHeight * 1.2) + 20;
    checkNewPage();
    
    // SEÇÃO 2: CORPO DOCENTE
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('2. CORPO DOCENTE', marginLeft, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    
    if (data?.professores && data.professores.length > 0) {
      data.professores.forEach((prof: any, index: number) => {
        checkNewPage();
        
        const profNumber = index + 1;
        doc.setFont('times', 'bold');
        doc.text(`${profNumber}. ${prof.nome || 'Professor não identificado'}`, marginLeft, yPosition);
        
        doc.setFont('times', 'normal');
        if (prof.cpf) {
          yPosition += lineHeight;
          doc.text(`   CPF: ${prof.cpf}`, marginLeft + 5, yPosition);
        }
        
        if (prof.disciplinas && prof.disciplinas.length > 0) {
          yPosition += lineHeight;
          const discText = prof.disciplinas.slice(0, 3).join('; ');
          const finalText = prof.disciplinas.length > 3 ? `${discText}; ...` : discText;
          doc.text(`   Disciplinas ministradas: ${finalText}`, marginLeft + 5, yPosition);
        }
        
        yPosition += lineHeight * 1.5;
      });
    } else {
      doc.text('Não há dados de professores cadastrados.', marginLeft, yPosition);
      yPosition += lineHeight * 2;
    }
    
    yPosition += 10;
    checkNewPage();
    
    // SEÇÃO 3: TURMAS EM FUNCIONAMENTO
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('3. TURMAS EM FUNCIONAMENTO', marginLeft, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    
    if (data?.turmas && data.turmas.length > 0) {
      data.turmas.forEach((turma: any, index: number) => {
        checkNewPage();
        
        const turmaNumber = index + 1;
        doc.setFont('times', 'bold');
        doc.text(`${turmaNumber}. Turma: ${turma.nome || 'Não identificada'}`, marginLeft, yPosition);
        
        doc.setFont('times', 'normal');
        yPosition += lineHeight;
        doc.text(`   Série/Ano: ${turma.serie || 'Não informado'}`, marginLeft + 5, yPosition);
        
        yPosition += lineHeight;
        doc.text(`   Turno: ${turma.turno || 'Não informado'}`, marginLeft + 5, yPosition);
        
        yPosition += lineHeight;
        doc.text(`   Quantidade de alunos: ${turma.totalAlunos || '0'}`, marginLeft + 5, yPosition);
        
        if (turma.professorNome && turma.professorNome !== 'Sem professor') {
          yPosition += lineHeight;
          doc.text(`   Professor responsável: ${turma.professorNome}`, marginLeft + 5, yPosition);
        }
        
        yPosition += lineHeight * 1.5;
      });
    } else {
      doc.text('Não há dados de turmas cadastradas.', marginLeft, yPosition);
      yPosition += lineHeight * 2;
    }
    
    yPosition += 10;
    checkNewPage();
    
    // SEÇÃO 4: DISCIPLINAS OFERTADAS
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('4. DISCIPLINAS OFERTADAS', marginLeft, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    
    if (data?.disciplinas && data.disciplinas.length > 0) {
      data.disciplinas.forEach((disc: any, index: number) => {
        checkNewPage();
        
        const discNumber = index + 1;
        doc.setFont('times', 'bold');
        doc.text(`${discNumber}. ${disc.nome_disciplina || 'Disciplina não identificada'}`, marginLeft, yPosition);
        
        doc.setFont('times', 'normal');
        if (disc.professor?.nome) {
          yPosition += lineHeight;
          doc.text(`   Professor responsável: ${disc.professor.nome}`, marginLeft + 5, yPosition);
        }
        
        if (disc.carga_horaria) {
          yPosition += lineHeight;
          doc.text(`   Carga horária: ${disc.carga_horaria} horas`, marginLeft + 5, yPosition);
        }
        
        yPosition += lineHeight * 1.5;
      });
    } else {
      doc.text('Não há dados de disciplinas cadastradas.', marginLeft, yPosition);
      yPosition += lineHeight * 2;
    }
    
    yPosition += 10;
    checkNewPage();
    
    // SEÇÃO 5: INDICADORES DE FREQUÊNCIA
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('5. INDICADORES DE FREQUÊNCIA', marginLeft, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    
    if (data?.alunos && data.alunos.length > 0) {
      const totalAlunos = data.alunos.length;
      const alunosAcima90 = data.alunos.filter((a: any) => a.frequenciaMedia >= 90).length;
      const alunos75a90 = data.alunos.filter((a: any) => a.frequenciaMedia >= 75 && a.frequenciaMedia < 90).length;
      const alunosAbaixo75 = data.alunos.filter((a: any) => a.frequenciaMedia < 75).length;
      
      const percentage90 = ((alunosAcima90 / totalAlunos) * 100).toFixed(1).replace('.', ',');
      const percentage75_90 = ((alunos75a90 / totalAlunos) * 100).toFixed(1).replace('.', ',');
      const percentageBelow75 = ((alunosAbaixo75 / totalAlunos) * 100).toFixed(1).replace('.', ',');
      
      const frequencyData = [
        `Total de alunos analisados: ${totalAlunos}`,
        `Alunos com frequência igual ou superior a 90%: ${alunosAcima90} (${percentage90}%)`,
        `Alunos com frequência entre 75% e 89%: ${alunos75a90} (${percentage75_90}%)`,
        `Alunos com frequência abaixo de 75%: ${alunosAbaixo75} (${percentageBelow75}%)`
      ];
      
      frequencyData.forEach((item, index) => {
        doc.text(item, marginLeft, yPosition + (index * lineHeight * 1.2));
      });
      
      yPosition += (frequencyData.length * lineHeight * 1.2) + 15;
      
      // Adicionar interpretação dos dados
      doc.setFont('times', 'italic');
      doc.text('Interpretação:', marginLeft, yPosition);
      yPosition += lineHeight;
      
      doc.setFont('times', 'normal');
      const interpretation = [
        `- ${percentageBelow75}% dos alunos apresentam frequência abaixo do mínimo recomendado (75%).`,
        `- ${percentage75_90}% dos alunos apresentam frequência regular.`,
        `- ${percentage90}% dos alunos apresentam excelente frequência.`
      ];
      
      interpretation.forEach((item, index) => {
        doc.text(item, marginLeft + 5, yPosition + (index * lineHeight));
      });
      
      yPosition += (interpretation.length * lineHeight) + 20;
    } else {
      doc.text('Não há dados de frequência disponíveis.', marginLeft, yPosition);
      yPosition += lineHeight * 3;
    }
    
    checkNewPage();
    
    // SEÇÃO 6: CONSIDERAÇÕES FINAIS
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('6. CONSIDERAÇÕES FINAIS', marginLeft, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    
    const considerations = [
      'Este relatório apresenta um panorama geral da instituição de ensino, com base nos dados',
      'disponíveis no sistema de gestão acadêmica.',
      '',
      'Recomenda-se:',
      '1. Acompanhamento regular da frequência dos alunos com indicadores abaixo de 75%;',
      '2. Revisão periódica da alocação de professores por disciplina;',
      '3. Atualização constante dos cadastros de alunos, professores e turmas;',
      '4. Realização de relatórios trimestrais para monitoramento contínuo.',
      '',
      'O presente relatório foi gerado automaticamente pelo sistema de gestão e reflete a',
      'situação cadastral na data de sua emissão.'
    ];
    
    considerations.forEach((line, index) => {
      if (line === '') {
        yPosition += lineHeight;
      } else {
        doc.text(line, marginLeft, yPosition + (index * lineHeight));
      }
    });
    
    yPosition += (considerations.length * lineHeight) + 20;
    
    // ASSINATURA
    doc.setFont('times', 'italic');
    doc.text('___________________________________', marginLeft + 40, yPosition);
    yPosition += lineHeight * 2;
    doc.text('Diretor(a) da Instituição', marginLeft + 55, yPosition);
    
    // Adicionar rodapé na última página
    addFooter(pageNumber);
    
    // Salva o PDF
    doc.save(`relatorio_escolar_${currentDate.getFullYear()}_${String(currentDate.getMonth() + 1).padStart(2, '0')}_${String(currentDate.getDate()).padStart(2, '0')}.pdf`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Gestão Escolar</h2>
        <div className={styles.navGrid}>
          <Link href="/diretor/gerenciar-disciplinas" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconGerenciarDisciplinas /></div>
            <h3>Gerenciar Disciplinas</h3>
            <p>Visualizar e excluir todas as disciplinas</p>
          </Link>

          <Link href="/diretor/cadastrar-disciplina" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconCadastrarDisciplina /></div>
            <h3>Cadastrar Disciplina</h3>
            <p>Criar uma nova matéria no sistema</p>
          </Link>
          
          <Link href="/diretor/gerenciar-turmas" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconGerenciarTurmas /></div>
            <h3>Gerenciar Turmas</h3>
            <p>Visualizar e excluir todas as turmas</p>
          </Link>

          <Link href="/diretor/gerenciar-professores" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconGerenciarProfessores /></div>
            <h3>Gerenciar Professores</h3>
            <p>Visualizar e excluir corpo docente</p>
          </Link>
          
          <Link href="/diretor/gerenciar-alunos" className={styles.navCard}>
            <div className={styles.iconWrapper}><IconGerenciarAlunos /></div>
            <h3>Gerenciar Alunos</h3>
            <p>Visualizar e excluir alunos</p>
          </Link>

          {/* Card para gerar relatório */}
          <div 
            className={styles.navCard} 
            style={{ cursor: 'pointer', border: '2px dashed #10b981', background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)' }}
            onClick={() => setShowRelatorioCard(true)}
          >
            <div className={styles.iconWrapper}><IconRelatorio /></div>
            <h3 style={{ color: '#059669' }}>Gerar Relatório</h3>
            <p style={{ color: '#047857' }}>Exportar relatório completo em PDF</p>
          </div>
        </div>
      </div>

      {/* Modal para gerar relatório */}
      {showRelatorioCard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2.5rem',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            border: '1px solid #e5e7eb',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
              <h3 style={{ marginTop: 0, color: '#1f2937', fontSize: '1.5rem' }}>Gerar Relatório Completo</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Esta ação irá gerar um PDF com todos os dados disponíveis.
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: '#f9fafb', 
              padding: '1.5rem', 
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ marginTop: 0, color: '#374151', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                Estrutura do relatório:
              </h4>
              <ul style={{ 
                listStyleType: 'none', 
                padding: 0,
                margin: 0,
                color: '#4b5563'
              }}>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem' }}>•</span>
                  <strong>Capa</strong> com identificação da instituição
                </li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem' }}>•</span>
                  <strong>Sumário</strong> numerado
                </li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem' }}>•</span>
                  <strong>Dados institucionais</strong> gerais
                </li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem' }}>•</span>
                  <strong>Corpo docente</strong> detalhado
                </li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem' }}>•</span>
                  <strong>Turmas e disciplinas</strong> em funcionamento
                </li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem' }}>•</span>
                  <strong>Indicadores</strong> de frequência
                </li>
                <li style={{ padding: '0.5rem 0' }}>
                  <span style={{ color: '#10b981', marginRight: '0.5rem' }}>•</span>
                  <strong>Considerações finais</strong> e assinatura
                </li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowRelatorioCard(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleGerarRelatorio}
                disabled={isGeneratingPdf}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isGeneratingPdf ? '#9ca3af' : '#10b981',
                  color: 'white',
                  cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!isGeneratingPdf) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isGeneratingPdf) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }
                }}
              >
                {isGeneratingPdf ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                    Gerando...
                  </>
                ) : (
                  'Gerar Relatório'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}