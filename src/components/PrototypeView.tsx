import React, { useState } from 'react';
import { Home, PieChart, Mic, Camera, Bot, Receipt, Bell, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { PrototypeScreen } from '../types';

// Screens
import DashboardScreen from './prototype/DashboardScreen';
import AnalyticsScreen from './prototype/AnalyticsScreen';
import PaymentsScreen from './prototype/PaymentsScreen';
import AIScreen from './prototype/AIScreen';
import SmartEntryModal from './prototype/SmartEntryModal';

export function PrototypeView() {
  const [activeScreen, setActiveScreen] = useState<PrototypeScreen>('home');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  return (
    <div className="flex justify-center items-center p-4 min-h-[calc(100vh-80px)] bg-[#FCFAF7]">
      {/* Mobile Device Frame */}
      <div className="relative w-full max-w-[400px] h-[800px] bg-[#FCFAF7] rounded-sm shadow-xl overflow-hidden border-[2px] border-[#1A1A1A] flex flex-col">
        
        {/* Status Bar Mock */}
        <div className="h-7 w-full bg-transparent absolute top-0 z-50 flex justify-between items-center px-6 pt-2">
          <span className="text-[11px] font-bold text-[#1A1A1A]">9:41</span>
          <div className="flex gap-1.5">
             <div className="w-3.5 h-3.5 bg-[#1A1A1A] rounded-full opacity-80 scale-50"></div>
             <div className="w-3.5 h-3.5 bg-[#1A1A1A] rounded-full opacity-80 scale-50"></div>
             <div className="w-4 h-3 bg-[#1A1A1A] rounded-sm opacity-80 scale-75"></div>
          </div>
        </div>

        {/* Dynamic Island Mock - Replaced with minimal bar for editorial look */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 border-b border-[#1A1A1A] z-50"></div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#FCFAF7] overflow-y-auto no-scrollbar pt-12 relative flex flex-col">
          {activeScreen === 'home' && <DashboardScreen />}
          {activeScreen === 'analytics' && <AnalyticsScreen />}
          {activeScreen === 'payments' && <PaymentsScreen />}
          {activeScreen === 'ai' && <AIScreen />}
        </div>

        <SmartEntryModal 
          isOpen={isEntryModalOpen} 
          onClose={() => setIsEntryModalOpen(false)} 
        />

        {/* Bottom Navigation Bar */}
        <div className="w-full h-20 bg-[#FCFAF7] border-t border-[#E5E5E5] flex justify-between items-center px-6 pb-2 z-40 relative">
          <NavItem 
            icon={<Home />} 
            label="Inicio" 
            isActive={activeScreen === 'home'} 
            onClick={() => setActiveScreen('home')} 
          />
          <NavItem 
            icon={<PieChart />} 
            label="Gastos" 
            isActive={activeScreen === 'analytics'} 
            onClick={() => setActiveScreen('analytics')} 
          />
          
          {/* FAB - Smart Entry */}
          <div className="relative -top-5">
            <button 
              onClick={() => setIsEntryModalOpen(true)}
              className="w-14 h-14 bg-[#1A1A1A] flex items-center justify-center text-white border border-[#1A1A1A] hover:bg-[#7B2CBF] hover:border-[#7B2CBF] transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <NavItem 
            icon={<Receipt />} 
            label="Pagos" 
            isActive={activeScreen === 'payments'} 
            onClick={() => setActiveScreen('payments')} 
          />
          <NavItem 
            icon={<Bot />} 
            label="Asesor IA" 
            isActive={activeScreen === 'ai'} 
            onClick={() => setActiveScreen('ai')} 
          />
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1A1A1A] rounded-none z-50"></div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 min-w-[50px] transition-colors",
        isActive ? "text-[#7B2CBF]" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
      )}
    >
      <div className={cn("[&>svg]:w-5 [&>svg]:h-5")}>
        {icon}
      </div>
      <span className="text-[9px] uppercase tracking-widest font-bold mt-1">{label}</span>
    </button>
  );
}
