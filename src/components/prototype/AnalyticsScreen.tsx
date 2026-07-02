import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Bot, Pencil, Check, Plus, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function AnalyticsScreen() {
  const { pockets, updatePocketBudget, addPocket } = useAppContext();
  const [editingPocketId, setEditingPocketId] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<string>('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newColor, setNewColor] = useState('#10B981');
  
  const data = pockets.map(p => ({
    name: p.name,
    value: p.spent,
    color: p.color
  })).filter(p => p.value > 0);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const handleSaveBudget = (id: string) => {
    updatePocketBudget(id, parseFloat(tempBudget) || 0);
    setEditingPocketId(null);
  };

  const handleAddPocket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBudget) return;
    addPocket({
      name: newName,
      budget: parseFloat(newBudget),
      color: newColor
    });
    setShowAddForm(false);
    setNewName('');
    setNewBudget('');
    setNewColor('#10B981');
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300 pb-24">
      
      <div className="space-y-1">
        <h2 className="text-3xl font-serif italic text-[#1A1A1A]">Tus Bolsillos</h2>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Distribución Mensual</p>
      </div>

      <div className="bg-[#F9F7F2] border border-[#E5E5E5] p-6 flex flex-col items-center justify-center">
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={65}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `S/ ${value}`}
                contentStyle={{ borderRadius: '0px', border: '1px solid #1A1A1A', boxShadow: 'none', backgroundColor: '#FCFAF7', fontSize: '12px' }}
                itemStyle={{ color: '#1A1A1A', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold opacity-40">Total</span>
            <span className="text-2xl font-serif italic text-[#1A1A1A]">S/ {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Semáforo Financiero y Presupuestos</h3>
          <button onClick={() => setShowAddForm(true)} className="text-[9px] uppercase tracking-widest font-bold text-[#7B2CBF] hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Nuevo Bolsillo
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddPocket} className="bg-white p-4 border border-[#1A1A1A] space-y-4 relative animate-in fade-in">
            <button type="button" onClick={() => setShowAddForm(false)} className="absolute top-2 right-2 text-gray-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-xs font-bold uppercase tracking-widest">Nuevo Bolsillo</h4>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Nombre (ej. Viajes)" value={newName} onChange={e => setNewName(e.target.value)} className="p-2 border border-[#E5E5E5] text-sm focus:border-[#7B2CBF] outline-none" required />
              <input type="number" placeholder="Presupuesto" step="0.1" value={newBudget} onChange={e => setNewBudget(e.target.value)} className="p-2 border border-[#E5E5E5] text-sm focus:border-[#7B2CBF] outline-none" required />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-bold opacity-70">Color:</span>
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-8 h-8 border-none cursor-pointer" />
            </div>
            <button type="submit" className="w-full bg-[#1A1A1A] text-white py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-[#7B2CBF]">
              Crear Bolsillo
            </button>
          </form>
        )}

        {pockets.map((item) => (
          <div key={item.name} className="flex flex-col gap-2 border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-none" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm font-serif italic text-[#1A1A1A]">S/ {item.spent}</span>
                  <span className="text-[10px] opacity-40 font-bold ml-1">gastado</span>
                </div>
                {item.budget > 0 && (
                  <span className="text-[10px] opacity-40 font-bold w-8 text-right">
                    {Math.round((item.spent / item.budget) * 100)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pl-5">
              {editingPocketId === item.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#1A1A1A]">Presupuesto: S/</span>
                  <input 
                    type="number" 
                    value={tempBudget} 
                    onChange={e => setTempBudget(e.target.value)} 
                    className="border-b border-[#1A1A1A] w-16 text-xs outline-none bg-transparent" 
                    autoFocus 
                  />
                  <button onClick={() => handleSaveBudget(item.id)} className="text-[#10B981]"><Check className="w-3 h-3" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#1A1A1A] opacity-60">
                    Presupuesto: S/ {item.budget}
                  </span>
                  <button onClick={() => { setEditingPocketId(item.id); setTempBudget(item.budget.toString()); }} className="text-[#1A1A1A] opacity-40 hover:opacity-100">
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Insight Card */}
      <div className="bg-[#FCFAF7] border border-[#1A1A1A] p-4 flex gap-4 mt-6 items-start">
        <div className="w-8 h-8 flex items-center justify-center border border-[#7B2CBF] rounded-none bg-white text-[#7B2CBF] shrink-0">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-[10px] uppercase font-bold text-[#1A1A1A] mb-1 tracking-widest">Asistente Chero</h4>
          <p className="text-xs font-serif italic text-[#1A1A1A] leading-relaxed">
            El mes pasado el pollo estaba 2 soles menos. Estás gastando más en el bolsillo de 'Comida' esta semana.
          </p>
        </div>
      </div>

    </div>
  );
}
