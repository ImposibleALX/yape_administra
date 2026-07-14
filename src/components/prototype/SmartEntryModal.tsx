import React, { useState, useEffect, useRef } from 'react';
import { Mic, Camera, X, Check, Calculator } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function SmartEntryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addTransaction, pockets } = useAppContext();

  const [mode, setMode] = useState<'select' | 'voice' | 'camera' | 'manual' | 'success'>('select');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>(pockets[0]?.id || '1');
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  
  const [voiceInput, setVoiceInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setMode('select');
      setAmount(0);
      setDescription('');
      setCategory(pockets[0]?.id || '1');
      setTransactionType('expense');
      setVoiceInput('');
    }
  }, [isOpen, pockets]);

  if (!isOpen) return null;

  const handleSimulateCamera = () => {
    setMode('camera');
    setTimeout(() => {
      setAmount(45.50);
      setDescription('Compra Supermercado');
      const pocketId = pockets.find(p => p.name.toLowerCase().includes('comida'))?.id || pockets[0]?.id || '1';
      setCategory(pocketId);
      setMode('success');
      setTimeout(() => {
        addTransaction({
          title: 'Compra Supermercado',
          amount: 45.50,
          category: pocketId,
          type: 'expense'
        });
        onClose();
      }, 1500);
    }, 2000);
  };

  const processVoiceCommand = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse');
      }
      
      const data = await response.json();
      
      let pocketId = pockets[0]?.id || '1';
      if (data.category === 'food') pocketId = pockets.find(p => p.name.toLowerCase().includes('comida'))?.id || pocketId;
      if (data.category === 'services') pocketId = pockets.find(p => p.name.toLowerCase().includes('servicio'))?.id || pocketId;
      if (data.category === 'emergency') pocketId = pockets.find(p => p.name.toLowerCase().includes('emergencia'))?.id || pocketId;
      if (data.category === 'other' || data.category === 'investment') pocketId = pockets.find(p => p.name.toLowerCase().includes('gustito'))?.id || pocketId;

      setAmount(data.amount || 0);
      setDescription(data.title || text);
      setCategory(pocketId);
      setTransactionType(data.type as any);
      
      setMode('success');
      setTimeout(() => {
        addTransaction({
          title: data.title || text,
          amount: data.amount > 0 ? data.amount : 10,
          category: pocketId,
          type: data.type || 'expense'
        });
        onClose();
      }, 1500);
    } catch (error) {
      console.error("API error, falling back to local parsing:", error);
      
      // Fallback local regex parsing (For GitHub Pages / Static hosting)
      const amountMatches = text.match(/(\d+(?:\.\d{1,2})?)/g);
      let parsedAmount = 10;
      if (amountMatches) {
        parsedAmount = amountMatches.reduce((acc, curr) => acc + parseFloat(curr), 0);
      }
      
      let parsedCategory = pockets[0]?.id || '1';
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('pollo') || lowerText.includes('papa') || lowerText.includes('menú') || lowerText.includes('comida') || lowerText.includes('mercado') || lowerText.includes('bodega')) {
        parsedCategory = pockets.find(p => p.name.toLowerCase().includes('comida'))?.id || parsedCategory;
      } else if (lowerText.includes('luz') || lowerText.includes('agua') || lowerText.includes('internet') || lowerText.includes('recibo') || lowerText.includes('pasaje')) {
        parsedCategory = pockets.find(p => p.name.toLowerCase().includes('servicio'))?.id || parsedCategory;
      } else if (lowerText.includes('emergencia') || lowerText.includes('pastilla') || lowerText.includes('doctor')) {
        parsedCategory = pockets.find(p => p.name.toLowerCase().includes('emergencia'))?.id || parsedCategory;
      } else {
        parsedCategory = pockets.find(p => p.name.toLowerCase().includes('gustito'))?.id || parsedCategory;
      }
      
      let txType: 'expense'|'income' = 'expense';
      if (lowerText.includes('sueldo') || lowerText.includes('ingreso') || lowerText.includes('venta') || lowerText.includes('pago me')) {
        txType = 'income';
      }

      setAmount(parsedAmount);
      setDescription(text);
      setCategory(parsedCategory);
      setTransactionType(txType);

      setMode('success');
      setTimeout(() => {
        addTransaction({
          title: text || 'Registro por Voz',
          amount: parsedAmount > 0 ? parsedAmount : 10,
          category: parsedCategory,
          type: txType
        });
        onClose();
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMode('success');
    setTimeout(() => {
      addTransaction({
        title: description || (transactionType === 'expense' ? 'Gasto Manual' : 'Ingreso Manual'),
        amount: amount,
        category: category,
        type: transactionType
      });
      onClose();
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#FCFAF7] border-t-[4px] border-[#1A1A1A] rounded-none w-full p-6 pt-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 border border-[#1A1A1A] bg-white rounded-none flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {mode === 'select' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif italic text-[#1A1A1A] font-bold">Registro Inteligente</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">¿Cómo quieres ingresar el dato?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setMode('voice')}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-none border border-[#1A1A1A] hover:bg-[#F9F7F2] active:scale-95 touch-manipulation transition-all"
              >
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-none flex items-center justify-center text-white">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Voz / Texto Libre</span>
                <span className="text-xs font-serif italic opacity-50 text-center leading-tight">"Caserito, 20 soles de pollo y 5 de papa"</span>
              </button>

              <button 
                onClick={handleSimulateCamera}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-none border border-[#1A1A1A] hover:bg-[#F9F7F2] active:scale-95 touch-manipulation transition-all"
              >
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-none flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Cámara OCR</span>
                <span className="text-xs font-serif italic opacity-50 text-center leading-tight">Escanear boleta / ticket (Simulado)</span>
              </button>
            </div>

            <button 
              onClick={() => setMode('manual')}
              className="w-full py-4 bg-[#1A1A1A] text-white border border-[#1A1A1A] rounded-none flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#7B2CBF] hover:border-[#7B2CBF] active:scale-95 touch-manipulation transition-all"
            >
              <Calculator className="w-4 h-4" /> Ingreso Manual
            </button>
          </div>
        )}

        {mode === 'voice' && (
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-serif italic text-[#1A1A1A] font-bold">Asistente de Registro</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Escribe o dicta tu gasto</p>
            </div>
            
            <div className="w-full">
              <textarea 
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                placeholder="Ej: Caserito, 20 soles de pollo y 5 de papa"
                className="w-full h-24 p-4 border border-[#1A1A1A] bg-white rounded-none text-sm font-serif italic resize-none focus:outline-none focus:border-[#7B2CBF]"
              />
            </div>

            <button 
              onClick={() => processVoiceCommand(voiceInput)}
              disabled={!voiceInput.trim() || isProcessing}
              className="w-full py-4 bg-[#1A1A1A] text-white border border-[#1A1A1A] rounded-none flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#7B2CBF] active:scale-95 touch-manipulation transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando Inteligencia...' : 'Procesar Texto/Voz'}
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-xl font-serif italic text-[#1A1A1A] font-bold">Registro Manual</h3>
            </div>

            <div className="flex bg-[#E5E5E5] p-1 mb-4">
              <button 
                type="button"
                onClick={() => setTransactionType('expense')}
                className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${transactionType === 'expense' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-white/50'}`}
              >
                Gasto
              </button>
              <button 
                type="button"
                onClick={() => setTransactionType('income')}
                className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${transactionType === 'income' ? 'bg-[#10B981] text-white' : 'text-[#1A1A1A] hover:bg-white/50'}`}
              >
                Ingreso
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">Monto (S/)</label>
                <input 
                  type="number" 
                  step="0.10"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="w-full p-3 border border-[#1A1A1A] bg-white rounded-none text-xl font-serif italic focus:outline-none focus:border-[#7B2CBF]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">Descripción</label>
                <input 
                  type="text" 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-[#1A1A1A] bg-white rounded-none text-sm font-serif focus:outline-none focus:border-[#7B2CBF]"
                  placeholder={transactionType === 'expense' ? "Ej: Menú del día" : "Ej: Sueldo, Venta"}
                />
              </div>

              {transactionType === 'expense' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">Bolsillo</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-[#1A1A1A] bg-white rounded-none text-sm font-serif focus:outline-none focus:border-[#7B2CBF]"
                  >
                    {pockets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-4 bg-[#1A1A1A] text-white border border-[#1A1A1A] rounded-none flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#7B2CBF] active:scale-95 touch-manipulation transition-all"
            >
              Guardar {transactionType === 'expense' ? 'Gasto' : 'Ingreso'}
            </button>
          </form>
        )}

        {mode === 'camera' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className="w-full h-40 bg-white rounded-none border border-[#1A1A1A] flex flex-col items-center justify-center text-[#1A1A1A] relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-[2px] bg-[#7B2CBF] animate-[scan_2s_ease-in-out_infinite]" />
               <Camera className="w-10 h-10 mb-2 opacity-50" />
               <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Procesando imagen (OCR)...</span>
            </div>
          </div>
        )}

        {mode === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
            <div className={`w-16 h-16 ${transactionType === 'income' ? 'bg-[#10B981] border-[#10B981]' : 'bg-[#1A1A1A] border-[#1A1A1A]'} rounded-none flex items-center justify-center text-white animate-in zoom-in duration-300`}>
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-serif italic text-[#1A1A1A] font-bold">S/ {amount.toFixed(2)}</h3>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${transactionType === 'income' ? 'text-[#10B981]' : 'text-[#7B2CBF]'}`}>
                {transactionType === 'income' 
                  ? 'Ingreso Registrado' 
                  : `Registrado en '${pockets.find(p => p.id === category)?.name || 'Bolsillo'}'`}
                <br/><span className="text-xs opacity-70">({description})</span>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
