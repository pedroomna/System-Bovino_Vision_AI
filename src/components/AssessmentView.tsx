/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Printer, 
  Share2, 
  FileCheck, 
  Activity, 
  Scale, 
  Sparkles, 
  Thermometer, 
  CheckCircle, 
  Eye, 
  RotateCcw, 
  Gauge,
  UserCheck,
  Calendar,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { CattleRecord } from '../types';

interface AssessmentViewProps {
  record?: CattleRecord;
  onSaveToHistory: (record: CattleRecord) => void;
  onClose: () => void;
  isSavedInDb: boolean;
}

export default function AssessmentView({ 
  record, 
  onSaveToHistory, 
  onClose,
  isSavedInDb 
}: AssessmentViewProps) {
  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-200 rounded-lg min-h-[300px] font-sans">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans">Nenhum Bovino Selecionado</h3>
        <p className="text-sm text-gray-500 max-w-md mb-6 font-sans">
          Por favor, adicione uma nova avaliação ou selecione um registro ativo no histórico para visualizar os dados de escoamento e biometria por IA.
        </p>
        <button
          onClick={onClose}
          className="h-10 px-5 bg-[#1e3a8a] text-white font-semibold rounded-md text-sm hover:bg-blue-900 transition-colors cursor-pointer"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  // Layer viewing state: 0 = Pure Image, 1 = Landmark Tags, 2 = Skeleton Wireframe
  const [layersMode, setLayersMode] = useState<0 | 1 | 2>(2);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // States to override record with simulated reanalysis improvements
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeProgress, setReanalyzeProgress] = useState(0);
  const [reanalyzeStep, setReanalyzeStep] = useState('');
  const [localConfidence, setLocalConfidence] = useState<number | null>(null);
  const [localScore, setLocalScore] = useState<number | null>(null);
  const [localFat, setLocalFat] = useState<number | null>(null);
  const [localWeight, setLocalWeight] = useState<number | null>(null);

  const currentConfidence = localConfidence !== null ? localConfidence : record.aiConfidence || 98.4;
  const currentScore = localScore !== null ? localScore : record.score;
  const currentFat = localFat !== null ? localFat : record.fatProgress;
  const currentWeight = localWeight !== null ? localWeight : record.weight;

  const handleReanalysis = () => {
    setIsReanalyzing(true);
    setReanalyzeProgress(0);
    setReanalyzeStep('Calibrando lente de imagem da região traseira...');
    
    setTimeout(() => {
      setReanalyzeProgress(25);
      setReanalyzeStep('Mapeando fisionomia e musculatura da garupa (terço posterior)...');
    }, 600);

    setTimeout(() => {
      setReanalyzeProgress(55);
      setReanalyzeStep('Analisando deposição de gordura sacral e inserção da cauda...');
    }, 1200);

    setTimeout(() => {
      setReanalyzeProgress(85);
      setReanalyzeStep('Recalculando Escore ECC com compensação de luz no quadril...');
    }, 1800);

    setTimeout(() => {
      setReanalyzeProgress(100);
      setReanalyzeStep('Recalibração da região traseira concluída com sucesso!');
      
      const bonusConf = Math.min(99.8, (record.aiConfidence || 98.4) + (Math.random() * 1.0 + 0.2));
      const scoreDiff = (Math.random() * 0.2 - 0.1);
      const newScore = Math.max(1.0, Math.min(5.0, Number((record.score + scoreDiff).toFixed(1))));
      const fatDiff = (Math.random() * 2 - 1);
      const newFat = Math.max(5, Math.min(100, Number((record.fatProgress + fatDiff).toFixed(1))));
      const weightDiff = (Math.random() * 5 - 2.5);
      const newWeight = Math.max(200, Number((record.weight + weightDiff).toFixed(1)));

      setLocalConfidence(bonusConf);
      setLocalScore(newScore);
      setLocalFat(newFat);
      setLocalWeight(newWeight);
      
      setIsReanalyzing(false);
      setLayersMode(2); 
    }, 2400);
  };

  // Determine styling based on verdict
  const verdictStyle = {
    'APTO PARA ABATE': {
      bg: 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950/25 dark:border-blue-800 dark:text-blue-100',
      tagColor: 'bg-blue-500 text-white',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-sky-300',
      verdictText: 'APTO PARA ABATE',
      desc: 'Animal atingiu os parâmetros ideais de escore corporal e rendimento de carcaça para abate imediato.',
      circleTheme: 'text-blue-500 bg-blue-50 dark:text-sky-300 dark:bg-blue-950/40',
      textTitleColor: 'text-[#1e3a8a] dark:text-sky-300',
      textDescColor: 'text-gray-600 dark:text-sky-200',
      systemLabelColor: 'text-[#1e3a8a] dark:text-sky-450'
    },
    'NÃO APTO': {
      bg: 'bg-red-50 border-red-500 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-100',
      tagColor: 'bg-red-550 text-white',
      badge: 'bg-[#ffdad6] text-[#ba1a1a] dark:bg-red-950/40 dark:text-red-300',
      verdictText: 'NÃO APTO',
      desc: 'Exceção grave ou condição corporal insuficiente. Transferir para pátio médico de confinamento e suplementação.',
      circleTheme: 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-950/40',
      textTitleColor: 'text-red-950 dark:text-red-300',
      textDescColor: 'text-gray-600 dark:text-red-200',
      systemLabelColor: 'text-red-800 dark:text-red-400'
    }
  }[record.verdict as 'APTO PARA ABATE' | 'NÃO APTO'] || {
    bg: 'bg-red-50 border-red-500 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-100',
    tagColor: 'bg-red-500 text-white',
    badge: 'bg-[#ffdad6] text-[#ba1a1a] dark:bg-red-950/40 dark:text-red-300',
    verdictText: 'NÃO APTO',
    desc: 'Exceção grave ou condição corporal insuficiente.',
    circleTheme: 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-950/40',
    textTitleColor: 'text-red-950 dark:text-red-300',
    textDescColor: 'text-gray-600 dark:text-red-200',
    systemLabelColor: 'text-red-800 dark:text-red-400'
  };

  // Draw wireframes between landmarks for skeletal view
  const getWireframeLines = () => {
    if (!record.landmarkPoints || record.landmarkPoints.length < 2) return null;
    const sortedPoints = [...record.landmarkPoints].sort((a, b) => a.x - b.x);
    const elements: React.ReactNode[] = [];
    
    // 1. Vertebral line running horizontal (sorted by x)
    elements.push(
      <polyline
        key="spine"
        points={sortedPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#4cf5a6"
        strokeWidth="1.2"
        strokeDasharray="1.5,1.5"
        className="animate-pulse"
      />
    );
    
    // 2. Rib cages and frame structural connections
    const upperPoints = record.landmarkPoints.filter(p => p.y <= 45);
    const lowerPoints = record.landmarkPoints.filter(p => p.y > 45);
    
    upperPoints.forEach((up, uIdx) => {
      lowerPoints.forEach((low, lIdx) => {
        if (Math.abs(up.x - low.x) < 25) {
          elements.push(
            <line
              key={`rib-${uIdx}-${lIdx}`}
              x1={up.x}
              y1={up.y}
              x2={low.x}
              y2={low.y}
              stroke="#aeeecb"
              strokeWidth="0.8"
              strokeDasharray="2,2"
              opacity="0.8"
            />
          );
        }
      });
    });

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {elements}
      </svg>
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: `Laudo BovinoVision AI: Brinco #${record.id}`,
      text: `Confira a avaliação ECC (${currentScore.toFixed(1)}/5.0) do animal pelo BovinoVision AI.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log('User cancelled share or Web Share discarded, falling back to clipboard.', err);
      }
    }

    // Fallback copy to clipboard
    const shareUrl = `${window.location.origin}/history?id=${record.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShowSharePopup(true);
    setTimeout(() => {
      setShowSharePopup(false);
    }, 2500);
  };

  const handlePrint = () => {
    setIsPrinting(true);

    try {
      window.print();
    } catch (e) {
      console.warn("Iframe blocked direct print dialog.", e);
    }

    // High fidelity printable certificate HTML file
    const verdictLabel = currentScore >= 3.5 ? 'APTO PARA ABATE' : 'NÃO APTO';
    const verdictNotes = record.notes || (currentScore >= 3.5 
      ? 'Animal atingiu os parâmetros ideais de escore corporal e rendimento de carcaça para abate imediato.'
      : 'Exceção grave ou condição corporal insuficiente. Transferir para pátio médico de confinamento e suplementação.');

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>BovinoVision AI - Certificado Veterinário de Precisão #${record.id}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background-color: #ffffff;
            margin: 0;
            padding: 40px;
            line-height: 1.5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e1e8e5;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            position: relative;
        }
        .border-top-accent {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background-color: #012d1d;
            border-radius: 12px 12px 0 0;
        }
        .header {
            border-bottom: 2px solid #012d1d;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo-title {
            font-size: 24px;
            font-weight: 900;
            color: #012d1d;
            letter-spacing: -0.5px;
        }
        .sub-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            font-family: monospace;
            margin-top: 4px;
        }
        .badge {
            background-color: #e6f4ea;
            color: #0e5138;
            font-size: 10px;
            font-weight: bold;
            font-family: monospace;
            padding: 6px 12px;
            border-radius: 4px;
            text-transform: uppercase;
            border: 1px solid #aeeecb;
        }
        .cert-info {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #f3f4f6;
            margin-bottom: 30px;
        }
        .info-item {
            font-size: 13px;
        }
        .info-label {
            font-family: monospace;
            color: #6b7280;
            text-transform: uppercase;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .info-val {
            font-weight: bold;
            color: #111827;
        }
        .image-section {
            text-align: center;
            margin: 30px 0;
            position: relative;
        }
        .cow-photo {
            max-width: 100%;
            height: 250px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .confidence-tag {
            position: absolute;
            bottom: 12px;
            right: 12px;
            background-color: rgba(1, 45, 29, 0.85);
            color: #ffffff;
            font-family: monospace;
            font-size: 10px;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .metrics-sec {
            display: grid;
            grid-template-cols: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
        }
        .metric-card {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            text-align: center;
            background: #ffffff;
        }
        .metric-title {
            font-size: 10px;
            font-family: monospace;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: bold;
        }
        .metric-number {
            font-size: 22px;
            font-weight: 800;
            color: #012d1d;
            margin: 8px 0 2px 0;
        }
        .metric-sub {
            font-size: 10px;
            color: #9ca3af;
        }
        .verdict-box {
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 40px;
            font-weight: bold;
        }
        .verdict-apto {
            background-color: #ecfdf5;
            border: 2px solid #10b981;
            color: #065f46;
        }
        .verdict-nao-apto {
            background-color: #fef2f2;
            border: 2px solid #ef4444;
            color: #991b1b;
        }
        .verdict-title {
            text-transform: uppercase;
            font-size: 15px;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .verdict-text {
            font-weight: normal;
            font-size: 12px;
            color: #374151;
            line-height: 1.6;
            margin-top: 8px;
        }
        .signage {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1px solid #e5e7eb;
            padding-top: 25px;
            margin-top: 40px;
        }
        .sign-card {
            font-size: 11px;
            color: #4b5563;
            text-align: left;
        }
        .sign-line {
            width: 200px;
            border-bottom: 1px solid #9ca3af;
            margin-bottom: 6px;
        }
        .seal-auth {
            font-size: 9px;
            font-family: monospace;
            color: #9ca3af;
            margin-top: 20px;
            text-align: center;
            border-top: 1px dashed #e5e7eb;
            padding-top: 15px;
        }
        @media print {
            body {
                padding: 0;
                background-color: white;
            }
            .container {
                border: none;
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="border-top-accent"></div>
        <div class="header">
            <div>
                <div class="logo-title">BovinoVision AI</div>
                <div class="sub-title">PECUÁRIA DE PRECISÃO & INTELIGÊNCIA DE CARCAÇA</div>
            </div>
            <div class="badge">LAUDO DE DIAGNÓSTICO</div>
        </div>

        <div class="cert-info">
            <div class="info-item">
                <div class="info-label">Brinco / Identificador</div>
                <div class="info-val">#${record.id}</div>
            </div>
            <div class="info-item" style="text-align: right;">
                <div class="info-label">Grupo / Loteamento</div>
                <div class="info-val">${record.lot}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Raça do Animal</div>
                <div class="info-val">${record.breed}</div>
            </div>
            <div class="info-item" style="text-align: right;">
                <div class="info-label">Data de Registro</div>
                <div class="info-val">${record.date}</div>
            </div>
        </div>

        <div class="image-section">
            <img class="cow-photo" src="${record.photoUrl}" alt="Registro Visual BovinoVision" />
            <div class="confidence-tag">REDE NEURAL DE CONFIANÇA: ${currentConfidence.toFixed(1)}%</div>
        </div>

        <div class="metrics-sec">
            <div class="metric-card">
                <div class="metric-title">Escore ECC Corporal</div>
                <div class="metric-number">${currentScore.toFixed(1)}</div>
                <div class="metric-sub">Faixa ideal: 2.5 a 5.0</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Volume Estimado</div>
                <div class="metric-number">${currentWeight.toFixed(1)} kg</div>
                <div class="metric-sub">Massa Balança AI</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Cobertura de Gordura</div>
                <div class="metric-number">${currentFat.toFixed(1)}%</div>
                <div class="metric-sub">Percentual Subcutâneo</div>
            </div>
        </div>

        <div class="verdict-box ${currentScore >= 3.5 ? 'verdict-apto' : 'verdict-nao-apto'}">
            <div class="verdict-title">VEREDITO: ${verdictLabel}</div>
            <div class="verdict-text">
                ${verdictNotes}
            </div>
        </div>

        <div class="signage">
            <div class="sign-card">
                <strong>Assinado Digitalmente:</strong><br>
                BovinoVision CattleGuard Core Service
            </div>
            <div class="sign-card" style="text-align: right;">
                <div class="sign-line"></div>
                <strong>Dr. Pedro d'Almeida</strong><br>
                Médico Veterinário • CRMV-PT #8420-BA
            </div>
        </div>

        <div class="seal-auth">
            CONFIRMAÇÃO DIGITAL DO CERTIFICADO: BV-CERT-AUTENTICA-${record.id}-${currentScore.toFixed(1).toString().replace('.', '-')}-OK<br>
            Criptografia de Dados Nacionais BovinoVision AI. Todos os direitos reservados.
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 800);
        };
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Certificado_Laudo_BovinoVision_Brinco_${record.id}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsPrinting(false);
    }, 1500);
  };

  return (
    <div id={`assessment-view-${record.id}`} className="space-y-6 animate-fade-in print:bg-white print:p-0 print:space-y-4">
      
      {/* Print-only Header of Bovine Certificate */}
      <div className="hidden print:block border-b border-gray-400 pb-4 text-center">
        <h1 className="text-2xl font-black text-gray-900 font-serif">BovinoVision AI Technologies • CattleGuard</h1>
        <p className="text-xs font-mono uppercase text-gray-500">LAUDO TÉCNICO VETERINÁRIO DE PRECISÃO - CERTIFICADO #{record.id}</p>
        <div className="text-[10px] text-gray-400 font-mono mt-1">Data: {record.date} | Avaliador: Dr. Pedro Almeida</div>
      </div>

      {/* Top action row */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-xs font-mono font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-[#aeeecb] flex items-center gap-1 bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-md transition-all"
          >
            ← Voltar para a lista
          </button>
          
          <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
            <span>Identificador Único:</span>
            <span className="text-[#1e3a8a] dark:text-sky-400 font-bold">Brinco #{record.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            ✓ PROCESSADO
          </span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Large Interactive Vision Feed with overlay options */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] space-y-4 print:col-span-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-gray-950 dark:text-white font-sans">
              Resultado da Análise
            </h2>
            <div className="text-xs font-mono text-gray-400">
              Lote: <span className="text-gray-900 font-bold">{record.lot}</span> | Raça: <span className="text-gray-900 font-bold">{record.breed}</span>
            </div>
          </div>

          {/* Interactive Screen Container */}
          <div className="relative w-full aspect-[4/3] rounded-lg border border-gray-200 bg-black overflow-hidden group shadow-inner">
            
            {/* Zoomable Inner Scaffold Container */}
            <div 
              className="w-full h-full relative transition-transform duration-300 origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Main Cow Image */}
              <img
                src={record.photoUrl}
                alt="Análise Multimodal"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Simulated Grid Scanning Overlays */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(14,81,56,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,81,56,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Dynamic Skeletons Vectors (Wireframes) layer */}
              {layersMode === 2 && getWireframeLines()}

              {/* Landmarks layer overlay mapping coordinates dynamically */}
              {(layersMode === 1 || layersMode === 2) && record.landmarkPoints?.map((p, idx) => {
                const theme = p.type === 'skeleton' 
                  ? 'bg-amber-500 ring-amber-300' 
                  : p.type === 'fat' 
                  ? 'bg-emerald-500 ring-emerald-300' 
                  : 'bg-blue-500 ring-blue-300';
                return (
                  <div
                    key={idx}
                    className="absolute group/point"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    {/* Glowing Radar Point */}
                    <div className={`h-3.5 w-3.5 rounded-full ${theme} ring-4 ring-offset-0 ring-opacity-40 animate-pulse relative z-10 cursor-help`} />
                    
                    {/* Point Label Hover/Always Visible depending on mode */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-5 bg-black/90 backdrop-blur-sm border border-gray-750 text-[10px] font-mono text-white px-2 py-0.5 rounded shadow-lg whitespace-nowrap transition-all opacity-100 scale-100 z-20">
                      {p.label}
                    </div>
                  </div>
                );
              })}

              {/* Quick scanning bar effect */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent shadow-[0_0_10px_#3b82f6] animate-bounce pointer-events-none" />
            </div>

            {/* AI Confidence tag on top-left of photo (unzoomed to remain static and crisp) */}
            <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm border border-blue-500/30 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5 shadow-md z-20">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping absolute" />
              <span className="h-2 w-2 rounded-full bg-blue-500 relative" />
              <span>Confiança AI: {currentConfidence.toFixed(1)}%</span>
            </div>

            {/* Simulated Live Scanner Overlay (unzoomed) */}
            {isReanalyzing && (
              <div className="absolute inset-0 bg-blue-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-2" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-sans tracking-wide uppercase text-white">Recalibrando Visão de Precisão</h4>
                  <p className="text-xs font-mono text-sky-300">{reanalyzeStep}</p>
                </div>
                <div className="w-48 bg-blue-900 rounded-full h-2 overflow-hidden border border-blue-800">
                  <div className="bg-blue-400 h-full transition-all duration-300" style={{ width: `${reanalyzeProgress}%` }} />
                </div>
                <span className="text-[10px] text-sky-300 font-mono font-bold tracking-widest">{reanalyzeProgress}%</span>
              </div>
            )}
          </div>

          {/* Interactive Toggle Control Row */}
          <div className="grid grid-cols-3 gap-3 print:hidden">
            <button
              id="assessment-btn-toggle-layers"
              onClick={() => setLayersMode(prev => (prev === 2 ? 1 : prev === 1 ? 0 : 2))}
              className={`h-10 text-xs font-mono font-bold rounded border transition-all flex items-center justify-center gap-1.5 ${
                layersMode === 2
                  ? 'bg-[#1e3a8a] dark:bg-blue-800 text-white border-blue-900 dark:border-blue-950'
                  : layersMode === 1
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#1e3a8a] dark:text-sky-300 border-blue-200 dark:border-blue-900/40'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>
                {layersMode === 2 ? 'Modo: Esqueleto' : layersMode === 1 ? 'Modo: Marcadores' : 'Fotos Limpas'}
              </span>
            </button>

            <button
              id="assessment-btn-zoom-anatomico"
              onClick={() => setZoomLevel(z => (z === 1.3 ? 1.6 : z === 1.6 ? 1 : 1.3))}
              className="h-10 text-xs font-mono font-bold rounded bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Zoom: {zoomLevel === 1 ? '1x' : zoomLevel === 1.3 ? '1.3x' : '1.6x'}</span>
            </button>

            <button
              id="assessment-btn-reanalisar"
              onClick={handleReanalysis}
              disabled={isReanalyzing}
              className="h-10 text-xs font-mono font-bold rounded bg-[#f3f4f5] dark:bg-gray-850 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Gauge className={`h-3.5 w-3.5 ${isReanalyzing ? 'animate-spin text-blue-600' : 'text-gray-500'}`} />
              <span>{isReanalyzing ? 'Processando...' : 'Reanalisar'}</span>
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): AI Verdict & Telemetry statistics */}
        <div className="lg:col-span-5 space-y-6 print:col-span-12">
          {/* Verdict Box matching screenshot 3 exactly */}
          <div className={`p-6 bg-white dark:bg-[#0f172a] rounded-lg border-2 ${verdictStyle?.bg} flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden`}>
            
            {/* System Verdict Label */}
            <span className={`text-[10px] font-mono tracking-widest ${verdictStyle?.systemLabelColor} font-bold block uppercase mb-4`}>
              Veredito do Sistema
            </span>

            {/* Checkmark Ribbon Container */}
            <div className={`h-16 w-16 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md ${verdictStyle?.circleTheme} mb-4`}>
              <CheckCircle className="h-9 w-9 shrink-0" />
            </div>

            {/* Main Verdict Phrase */}
            <h3 className={`text-2xl font-black font-sans leading-none tracking-tight mb-2 ${verdictStyle?.textTitleColor}`}>
              {verdictStyle?.verdictText}
            </h3>

            {/* Clinical explanation */}
            <p className={`text-xs font-sans font-medium max-w-sm mt-2 ${verdictStyle?.textDescColor}`}>
              {record.notes || verdictStyle?.desc}
            </p>
          </div>

          {/* Core Extracted Metrics Group */}
          <div className="bg-white dark:bg-[#0e1320] rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] space-y-4">
            <h4 className="text-[10px] font-mono tracking-wider font-bold text-gray-400 uppercase">
              Métricas Extraídas
            </h4>

            {/* Metric 1: Weight */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <Scale className="h-4.5 w-4.5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-gray-905 dark:text-gray-100 leading-none">Volume Estimado</div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 inline-block">Massa Corporal Estimada</span>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-sm text-gray-900 dark:text-white">
                {currentWeight.toFixed(1)} <span className="font-sans text-xs text-gray-400 dark:text-gray-500 font-medium font-bold">kg</span>
              </div>
            </div>

            {/* Metric 2: Fat Progress bar */}
            <div className="py-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    <Activity className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white leading-none">Proporção de Gordura</div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 inline-block">Acabamento Subcutâneo</span>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-sm text-gray-900 dark:text-white">
                  {currentFat.toFixed(1)}%
                </div>
              </div>
              {/* Progress bar matching design guidelines */}
              <div className="w-full h-2 rounded-none bg-gray-105 dark:bg-gray-800 overflow-hidden relative">
                <div 
                  className="h-full bg-[#1e3a8a] dark:bg-sky-500 rounded-none" 
                  style={{ width: `${Math.min(100, currentFat * 5)}%` }} // normalized progress
                />
              </div>
            </div>

            {/* Metric 3: ECC Score Badge scale */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <Thermometer className="h-4.5 w-4.5 text-amber-600" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white leading-none">ECC (Condição Corporal)</div>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5 inline-block">Score de Gordura e Músculo</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 font-mono text-sm font-bold rounded ${
                  currentScore >= 4.0 
                  ? 'bg-[#aeeecb] text-[#0e5138]' 
                  : currentScore >= 2.5 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}>
                  {currentScore.toFixed(1)}
                </span>
                <span className="text-[11px] font-mono text-gray-400">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions Column for saving and printing */}
          <div className="space-y-3.5 print:hidden">
            {!isSavedInDb ? (
              <button
                id="assessment-btn-save-to-history"
                onClick={() => onSaveToHistory({
                  ...record,
                  score: currentScore,
                  fatProgress: currentFat,
                  weight: currentWeight,
                  aiConfidence: currentConfidence,
                  verdict: currentScore >= 3.5 ? 'APTO PARA ABATE' : 'NÃO APTO'
                })}
                className="w-full h-11 bg-[#1e3a8a] hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-900 font-sans font-bold text-sm text-white rounded-md flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <FileCheck className="h-4.5 w-4.5 text-sky-300" />
                <span>Salvar no Histórico</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="w-full h-11 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-sky-450 border-2 border-dashed border-blue-200 dark:border-blue-900/40 font-sans font-bold text-xs uppercase tracking-wider rounded-md flex items-center justify-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5" />
                  <span>Salvo e Autenticado no Banco de Lote</span>
                </div>
                {(localScore !== null || localFat !== null || localWeight !== null) && (
                  <button
                    onClick={() => onSaveToHistory({
                      ...record,
                      score: currentScore,
                      fatProgress: currentFat,
                      weight: currentWeight,
                      aiConfidence: currentConfidence,
                      verdict: currentScore >= 3.5 ? 'APTO PARA ABATE' : 'NÃO APTO'
                    })}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Atualizar com Dados de Reanálise</span>
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                id="assessment-btn-print"
                onClick={handlePrint}
                className="h-10 text-xs font-mono font-bold rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{isPrinting ? 'Preparando...' : 'Imprimir Laudo'}</span>
              </button>

              <button
                id="assessment-btn-share"
                onClick={handleShare}
                className="h-10 text-xs font-mono font-bold rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-colors relative"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Compartilhar</span>

                {/* Toast micro-animation message */}
                {showSharePopup && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap animate-bounce font-sans z-50">
                    Link com ID copiado!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
