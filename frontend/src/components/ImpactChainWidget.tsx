import React, { useState } from 'react';
import { GitCommit, ArrowRight, ArrowDown, AlertOctagon } from 'lucide-react';
import { ImpactChain } from '../types';

interface ImpactChainWidgetProps {
  chains: {
    heat: ImpactChain;
    drought: ImpactChain;
    flood: ImpactChain;
  };
}

export const ImpactChainWidget: React.FC<ImpactChainWidgetProps> = ({ chains }) => {
  const [selectedChain, setSelectedChain] = useState<'heat' | 'drought' | 'flood'>('heat');

  const activeChain = chains[selectedChain] || chains.heat;

  return (
    <div className="rounded-3xl bg-white border border-[#c5e6db] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#156550]">
            <GitCommit className="w-3.5 h-3.5" />
            <span>Cascade Modeling</span>
          </div>
          <h3 className="text-xl font-black text-[#092c24] mt-1">Potential Environmental Impact Chain</h3>
          <p className="text-xs text-[#375249] mt-0.5">
            Sequential progression of environmental stress from primary trigger to downstream socio-economic impacts.
          </p>
        </div>

        {/* Hazard Selector */}
        <div className="flex items-center gap-1 bg-[#eef8f4] p-1 rounded-full border border-[#c5e6db] text-xs">
          {(
            [
              { id: 'heat', label: '🔥 Heat Cascade' },
              { id: 'drought', label: '💧 Drought Cascade' },
              { id: 'flood', label: '🌧️ Flood Cascade' }
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChain(c.id)}
              className={`px-3.5 py-1.5 rounded-full transition-all font-bold ${
                selectedChain === c.id
                  ? 'bg-[#092c24] text-white shadow-xs'
                  : 'text-[#156550] hover:text-[#092c24]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Step-by-Step Flow */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-3 relative">
        {activeChain.nodes.map((node, idx) => {
          const isLast = idx === activeChain.nodes.length - 1;
          const statusStyle =
            node.status === 'active'
              ? 'bg-red-50 border-red-300 text-red-900'
              : node.status === 'projected'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-[#f7fcf9] border-[#c5e6db] text-[#1e3a34]';

          return (
            <React.Fragment key={node.id}>
              <div
                className={`flex-1 p-5 rounded-2xl border ${statusStyle} flex flex-col justify-between hover:shadow-md transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase mb-1.5">
                    <span className="text-[#479b89]">Step {node.step}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        node.status === 'active'
                          ? 'bg-red-600 text-white'
                          : node.status === 'projected'
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-[#e1f2ec] text-[#156550]'
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#092c24] mb-1.5">{node.title}</h4>
                  <p className="text-xs text-[#375249] leading-relaxed">{node.description}</p>
                </div>
              </div>

              {!isLast && (
                <div className="hidden lg:flex items-center justify-center text-[#156550] px-1">
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </div>
              )}
              {!isLast && (
                <div className="flex lg:hidden items-center justify-center text-[#156550] py-1">
                  <ArrowDown className="w-5 h-5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-[#eef8f4] border border-[#c5e6db] text-xs text-[#092c24] flex items-center gap-2.5">
        <AlertOctagon className="w-4 h-4 text-[#156550] flex-shrink-0" />
        <span>
          Assessment Framework: Impact chains depict physical cause-and-effect paths under prevailing environmental forces.
        </span>
      </div>
    </div>
  );
};
