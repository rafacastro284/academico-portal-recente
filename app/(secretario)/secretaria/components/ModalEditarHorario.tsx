// components/ModalEditarHorario.tsx
"use client";

import { useState } from 'react';
import { mockProfessores, mockMaterias } from '../../../lib/mockData'; // <-- Ajuste o caminho

// --- Tipos das Props ---
interface ModalProps {
  dia: string;
  horario: string;
  onClose: () => void; // Função para fechar o modal
  onSave: (dados: { materiaId: string, professorId: string }) => void; // Função para salvar
}

export default function ModalEditarHorario({ dia, horario, onClose, onSave }: ModalProps) {
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [professorSelecionado, setProfessorSelecionado] = useState("");

  const handleSaveClick = () => {
    if (!materiaSelecionada || !professorSelecionado) {
      alert("Por favor, selecione a matéria e o professor.");
      return;
    }
    
    onSave({
      materiaId: materiaSelecionada,
      professorId: professorSelecionado,
    });
    onClose(); // Fecha o modal após salvar
  };

  // NÃO PRECISAMOS MAIS DAS CONSTANTES overlayStyle e modalStyle

  return (
    // Fundo (Overlay) - Agora com classes do Tailwind
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-10 flex items-center justify-center" // 'inset-0' cobre a tela inteira
    >
      {/* O Modal em si - Agora com classes do Tailwind */}
      <div
        onClick={(e) => e.stopPropagation()} // Impede de fechar ao clicar dentro do modal
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md z-20" // p-6 (24px) e max-w-md (448px)
      >
        <h2 className="text-xl font-bold mb-4">Editar Horário</h2>
        <p className="mb-4">
          Editando: <strong>{dia}</strong> - <strong>{horario}</strong>
        </p>

        {/* Dropdown de Matérias */}
        <div className="mb-4">
          <label htmlFor="materia-select" className="block text-sm font-medium text-gray-700">
            Matéria:
          </label>
          <select
            id="materia-select"
            value={materiaSelecionada}
            onChange={(e) => setMateriaSelecionada(e.target.value)}
            // Usei as classes de formulário que já tínhamos usado
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          >
            <option value="" disabled>Selecione a matéria...</option>
            {mockMaterias.map((materia) => (
              <option key={materia.id} value={materia.id}>{materia.nome}</option>
            ))}
          </select>
        </div>

        {/* Dropdown de Professores */}
        <div className="mb-4">
          <label htmlFor="professor-select" className="block text-sm font-medium text-gray-700">
            Professor:
          </label>
          <select
            id="professor-select"
            value={professorSelecionado}
            onChange={(e) => setProfessorSelecionado(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          >
            <option value="" disabled>Selecione o professor...</option>
            {mockProfessores.map((prof) => (
              <option key={prof.id} value={prof.id}>{prof.nome}</option>
            ))}
          </select>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}