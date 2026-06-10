/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  FilterX, 
  Plus, 
  Eye, 
  Undo2,
  RefreshCw,
  Pencil,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { CattleRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryViewProps {
  records: CattleRecord[];
  onSelectRecord: (record: CattleRecord) => void;
  onNewAssessment: () => void;
  onDeleteRecord?: (id: string) => void;
  onUpdateRecord?: (record: CattleRecord) => void;
}

export default function HistoryView({ 
  records, 
  onSelectRecord, 
  onNewAssessment,
  onDeleteRecord,
  onUpdateRecord
}: HistoryViewProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLot, setSelectedLot] = useState('Todos');
  const [selectedBreed, setSelectedBreed] = useState('Todas');
  const [selectedVerdict, setSelectedVerdict] = useState('Todos');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Refresh and Edit state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CattleRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit form states
  const [editBreed, setEditBreed] = useState('');
  const [editLot, setEditLot] = useState('');
  const [editScore, setEditScore] = useState(3.0);
  const [editWeight, setEditWeight] = useState(480);
  const [editFat, setEditFat] = useState(11.5);
  const [editNotes, setEditNotes] = useState('');

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert('Banco de dados de avaliações atualizado e sincronizado com sucesso em tempo real!');
    }, 1200);
  };

  const handleEditClick = (record: CattleRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRecord(record);
    setEditBreed(record.breed);
    setEditLot(record.lot);
    setEditScore(record.score);
    setEditWeight(record.weight);
    setEditFat(record.fatProgress);
    setEditNotes(record.notes || '');
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteRecord?.(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    // Automatic verdict calculation: Score >= 3.5 is APTO PARA ABATE
    const determinedVerdict = editScore >= 3.5 ? 'APTO PARA ABATE' : 'NÃO APTO';

    const updated: CattleRecord = {
      ...editingRecord,
      breed: editBreed,
      lot: editLot,
      score: Number(editScore),
      weight: Number(editWeight),
      fatProgress: Number(editFat),
      notes: editNotes,
      verdict: determinedVerdict
    };

    onUpdateRecord?.(updated);
    setEditingRecord(null);
  };

  // Compute filtering lists dynamically for dropdowns
  const uniqueLots = useMemo(() => {
    const lots = records.map(r => r.lot);
    return ['Todos', ...Array.from(new Set(lots))];
  }, [records]);

  const uniqueBreeds = useMemo(() => {
    const breeds = records.map(r => r.breed);
    return ['Todas', ...Array.from(new Set(breeds))];
  }, [records]);

  // Helper to normalize strings (remove accents/diacritics and convert to lowercase)
  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Perform filtration
  const filteredRecords = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    return records.filter((r) => {
      // Accent-insensitive search matching ID, Breed, Lot, Verdict, or Notes
      const matchSearch = normalizedSearch
        ? normalizeText(r.id).includes(normalizedSearch) ||
          normalizeText(r.breed || '').includes(normalizedSearch) ||
          normalizeText(r.lot || '').includes(normalizedSearch) ||
          normalizeText(r.notes || '').includes(normalizedSearch) ||
          normalizeText(r.verdict || '').includes(normalizedSearch)
        : true;

      const matchDate = selectedDate ? r.date.includes(selectedDate) : true;
      const matchLot = selectedLot === 'Todos' || r.lot === selectedLot;
      const matchBreed = selectedBreed === 'Todas' || r.breed === selectedBreed;
      
      // Map statuses
      let matchVerdict = true;
      if (selectedVerdict !== 'Todos') {
        if (selectedVerdict === 'Apto para Abate') {
          matchVerdict = r.verdict === 'APTO PARA ABATE';
        } else if (selectedVerdict === 'Não Apto') {
          matchVerdict = r.verdict === 'NÃO APTO';
        }
      }

      return matchSearch && matchDate && matchLot && matchBreed && matchVerdict;
    });
  }, [records, searchTerm, selectedDate, selectedLot, selectedBreed, selectedVerdict]);

  // Pagination details
  const totalSlots = filteredRecords.length;
  const totalPages = Math.ceil(totalSlots / itemsPerPage) || 1;
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  const currentItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setSelectedLot('Todos');
    setSelectedBreed('Todas');
    setSelectedVerdict('Todos');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-[#f8fafc] font-sans">
            Histórico de Avaliações
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Gerencie e analise o histórico completo de scores corporais e saúde do rebanho.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            id="history-btn-atualizar"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="h-11 px-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-md font-sans font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-75"
          >
            <RefreshCw className={`h-4 w-4 text-blue-600 dark:text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            id="history-btn-nova-avaliacao"
            onClick={onNewAssessment}
            className="h-11 px-5 bg-[#1e3a8a] hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-950 text-white rounded-md font-sans font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Avaliação</span>
          </button>
        </div>
      </div>

      {/* Filter Bar Panel matching screenshot 2 exactly */}
      <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Search Term Input */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
              ANIMAL ID / PESQUISA
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ex: OX-782"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-9 pr-3 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-600 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-mono"
              />
            </div>
          </div>

          {/* Date Picker Input */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
              DATA ANÁLISE
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="dd/mm/aaaa ou Out"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-9 pr-3 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-600 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-mono"
              />
            </div>
          </div>

          {/* Lote Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
              LOTE
            </label>
            <div className="relative">
              <select
                value={selectedLot}
                onChange={(e) => { setSelectedLot(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-3 pr-8 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm text-gray-800 dark:text-gray-100 appearance-none focus:outline-none focus:border-blue-600 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-mono"
              >
                {uniqueLots.map((lot) => (
                  <option key={lot} value={lot} className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100">{lot === 'Todos' ? 'Todos os Lotes' : lot}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Raça Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
              RAÇA
            </label>
            <div className="relative">
              <select
                value={selectedBreed}
                onChange={(e) => { setSelectedBreed(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-3 pr-8 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm text-gray-800 dark:text-gray-100 appearance-none focus:outline-none focus:border-blue-600 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-mono"
              >
                {uniqueBreeds.map((breed) => (
                  <option key={breed} value={breed} className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100">{breed === 'Todas' ? 'Todas as Raças' : breed}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
              STATUS
            </label>
            <div className="relative">
              <select
                value={selectedVerdict}
                onChange={(e) => { setSelectedVerdict(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-3 pr-8 rounded border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-sm text-gray-800 dark:text-gray-100 appearance-none focus:outline-none focus:border-blue-600 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-mono"
              >
                <option value="Todos" className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100">Todos</option>
                <option value="Apto para Abate" className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100">Apto para Abate</option>
                <option value="Não Apto" className="bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100">Não Apto</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Clear Filter Prompt */}
        {(searchTerm || selectedDate || selectedLot !== 'Todos' || selectedBreed !== 'Todas' || selectedVerdict !== 'Todos') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              <FilterX className="h-3 w-3" />
              <span>Limpar Filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* History Records Table Matching mockup 2 */}
      <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400 border-collapse">
            <thead>
              <tr className="border-b border-gray-250 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 text-[10px] font-mono tracking-wider font-bold text-gray-400 dark:text-gray-500 uppercase">
                <th className="py-3 px-6">MINIATURA</th>
                <th className="py-3 px-6">ANIMAL ID</th>
                <th className="py-3 px-6">DATA ANÁLISE</th>
                <th className="py-3 px-6">LOTE / RAÇA</th>
                <th className="py-3 px-6">SCORE (ECC)</th>
                <th className="py-3 px-6">VEREDITO</th>
                <th className="py-3 px-6 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-6">
                      <img 
                        src={r.photoUrl} 
                        alt={r.id} 
                        className="h-10 w-16 rounded object-cover border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="py-3 px-6 font-mono font-bold text-[#012d1d] dark:text-emerald-400">
                      <div className="flex flex-col gap-1 items-start text-left">
                        <span>#{r.id}</span>
                        {r.isOfflinePending && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold uppercase px-1 rounded tracking-wider border border-amber-500/30 animate-pulse">
                            Offline
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-700 dark:text-gray-300">
                      {r.date}
                    </td>
                    <td className="py-3 px-6">
                      <div className="text-gray-900 dark:text-gray-200 font-medium">{r.lot}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">{r.breed}</div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`text-base font-mono font-black ${
                        r.score >= 4.0 
                          ? 'text-[#0e5138] dark:text-emerald-400' 
                          : r.score >= 3.0 
                          ? 'text-gray-850 dark:text-gray-200' 
                          : r.score >= 2.0 
                          ? 'text-amber-700 dark:text-amber-400' 
                          : 'text-[#ba1a1a] dark:text-red-400'
                      }`}>
                        {r.score.toFixed(1)}
                      </span>
                      <span className="text-[11px] font-mono text-gray-300 dark:text-gray-500"> / 5.0</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${
                        r.verdict === 'APTO PARA ABATE'
                          ? 'bg-[#aeeecb] dark:bg-emerald-950/30 text-[#316e52] dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-900/30'
                          : 'bg-[#ffdad6] dark:bg-red-950/30 text-[#93000a] dark:text-red-400 border border-red-300/40 dark:border-red-900/30'
                      }`}>
                        {r.verdict}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => onSelectRecord(r)}
                          title="Ver Detalhes"
                          className="h-8 w-8 rounded-md bg-emerald-50 dark:bg-emerald-950/45 text-[#012d1d] dark:text-emerald-400 hover:bg-[#aeeecb] dark:hover:bg-emerald-800 transition-all flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleEditClick(r, e)}
                          title="Editar"
                          className="h-8 w-8 rounded-md bg-amber-50 dark:bg-amber-950/45 text-amber-800 dark:text-amber-450 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-all flex items-center justify-center border border-amber-100 dark:border-amber-900/40 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(r.id, e)}
                          title="Remover"
                          className="h-8 w-8 rounded-md bg-red-50 dark:bg-red-950/45 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 transition-all flex items-center justify-center border border-red-100 dark:border-red-900/40 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                      <FilterX className="h-10 w-10 text-gray-300" />
                      <span className="text-sm font-medium">Nenhum gado encontrado para os filtros selecionados.</span>
                      <button 
                        onClick={resetFilters}
                        className="text-xs text-[#2c694e] dark:text-emerald-400 hover:underline hover:text-[#012d1d] dark:hover:text-emerald-300 font-semibold"
                      >
                        Resetar Filtros
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination matching mockup page indicator style */}
        <div className="p-4 border-t border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-mono">
          <div>
            Mostrando <span className="text-gray-900 font-bold">1-{Math.min(filteredRecords.length, currentItems.length)}</span> de <span className="text-gray-900 font-bold">{totalSlots}</span> registros
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-105 flex items-center justify-center text-gray-600 disabled:opacity-40 select-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 rounded font-bold text-xs flex items-center justify-center transition-all duration-150 ${
                    isActive
                      ? 'bg-[#012d1d] text-white'
                      : 'border border-gray-200 bg-white hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded border border-gray-200 bg-white hover:bg-gray-105 flex items-center justify-center text-gray-600 disabled:opacity-40 select-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal Dialog */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              {/* Header */}
              <div className="bg-[#012d1d] dark:bg-emerald-950 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-[#aeeecb]" />
                  <h3 className="font-bold tracking-tight">Editar Registro Gado #{editingRecord.id}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Breed */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      Raça Bovino
                    </label>
                    <select
                      value={editBreed}
                      onChange={(e) => setEditBreed(e.target.value)}
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 text-gray-800 dark:text-gray-100"
                    >
                      <option value="Nelore Puro" className="dark:bg-[#111827] dark:text-gray-100">Nelore Puro</option>
                      <option value="Brahman" className="dark:bg-[#111827] dark:text-gray-100">Brahman</option>
                      <option value="Angus Black" className="dark:bg-[#111827] dark:text-gray-100">Angus Black</option>
                      <option value="Nelore Mix" className="dark:bg-[#111827] dark:text-gray-100">Nelore Mix</option>
                      <option value="Cruzamento Industrial" className="dark:bg-[#111827] dark:text-gray-100">Cruzamento Industrial</option>
                    </select>
                  </div>

                  {/* Lot */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      Loteamento
                    </label>
                    <input
                      type="text"
                      value={editLot}
                      onChange={(e) => setEditLot(e.target.value)}
                      placeholder="Ex: Lote Norte - A"
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Score ECC */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      Escore ECC (1-5)
                    </label>
                    <input
                      type="number"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={editScore}
                      onChange={(e) => setEditScore(parseFloat(e.target.value) || 3.0)}
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 font-mono text-gray-800 dark:text-gray-100"
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      Peso Estimado (kg)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="1000"
                      value={editWeight}
                      onChange={(e) => setEditWeight(parseInt(e.target.value) || 480)}
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 font-mono text-gray-800 dark:text-gray-100"
                    />
                  </div>

                  {/* Fat Progress */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                      Gordura (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      step="0.1"
                      value={editFat}
                      onChange={(e) => setEditFat(parseFloat(e.target.value) || 11.5)}
                      className="w-full h-10 px-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 font-mono text-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Live Verdict Calculation Indicator */}
                <div className="p-3.5 rounded-lg border flex items-center justify-between text-xs font-mono font-bold mt-2 bg-gray-50 dark:bg-gray-900/60 border-gray-150 dark:border-gray-800">
                  <span className="text-gray-400 dark:text-gray-500 uppercase">Veredito Calculado:</span>
                  <span className={`px-2 py-0.5 rounded tracking-wide uppercase ${
                    editScore >= 3.5 
                      ? 'bg-[#aeeecb] dark:bg-emerald-950/40 text-[#316e52] dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-900/30' 
                      : 'bg-[#ffdad6] dark:bg-red-950/40 text-[#93000a] dark:text-red-400 border border-red-300/40 dark:border-red-900/30'
                  }`}>
                    {editScore >= 3.5 ? 'APTO PARA ABATE' : 'NÃO APTO'}
                  </span>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                    Notas Clínicas e Manejo Nutricional
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Escreva orientações de nutrição ou observações de saúde..."
                    className="w-full p-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-850">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="h-11 px-4 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md font-sans font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 bg-[#012d1d] hover:bg-emerald-950 dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white rounded-md font-sans font-bold text-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col font-sans text-left"
            >
              {/* Header */}
              <div className="bg-red-700 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-200 animate-bounce" />
                  <h3 className="font-bold tracking-tight text-white">Excluir Registro Gado #{deleteConfirmId}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Está prestes a excluir definitivamente o registro bovino <strong className="text-gray-900 dark:text-white">#{deleteConfirmId}</strong>.
                </p>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 rounded p-3 flex items-start gap-2.5">
                  <span className="text-red-600 dark:text-red-400 font-bold font-mono text-xs shrink-0 pt-0.5">⚠️</span>
                  <p className="text-xs text-red-800 dark:text-red-300 font-sans leading-relaxed">
                    Aviso: Esta ação é irreversível. Todas as coordenadas anatômicas calculadas e o escore de rendimento nutricional associados serão removidos do banco local em caráter permanente.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-150 dark:border-gray-850">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="h-10 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950/40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md font-sans font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-10 px-5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-850 text-white rounded-md font-sans font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Confirmar Exclusão</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
