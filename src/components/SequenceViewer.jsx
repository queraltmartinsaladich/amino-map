import React, { useEffect, useRef } from 'react';

export const SequenceViewer = ({ sequence, mutationPosition }) => {
  const targetRef = useRef(null);
  const containerRef = useRef(null);

  if (!sequence) return null;

  const chunks = sequence.match(/.{1,50}/g) || [];

  return (
    <div className="mt-[8px] pt-[6px]">
      <div 
      ref={containerRef}
      className="w-full relative h-auto bg-slate-50 border-2 border-slate-200 rounded-sm shadow-inner overflow-y-auto h-auto scrollbar-thin scrollbar-thumb-slate-300">
      <div className="font-mono text-[13px] flex flex-col gap-y-[6px] gap-x-[10px] p-[10px] pl-[35px] pt-[10px] pb-[3px]">
        {chunks.map((chunk, chunkIdx) => (
          <div key={chunkIdx} className="flex gap-[2px] relative">
            
            {/* ROW INDEX: Now positioned in the left gutter, no longer overlapping */}
            <span className="absolute -left-[30px] top-[0px] w-[25px] text-right text-[9px] font-bold text-slate-300 tabular-nums">
              {(chunkIdx * 50) + 1}
            </span>
            
            {chunk.split('').map((aa, aaIdx) => {
              const absoluteIdx = (chunkIdx * 50) + aaIdx + 1;
              const isTarget = absoluteIdx === Number(mutationPosition);
              
              return (
                <span
                  key={aaIdx}
                  ref={isTarget ? targetRef : null}
                  className={`w-[14px] text-center transition-all cursor-default
                    ${isTarget 
                      ? 'bg-red-600 text-white font-black rounded-sm ring-[2px] ring-red-200 scale-125 z-10 shadow-sm' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-100'}
                  `}
                  title={`Index: ${absoluteIdx} | Residue: ${aa}`}
                >
                  {aa}
                </span>
              );
            })}
          </div>
        ))}
      </div>
        <div className="bg-slate-50 rounded-sm p-[4px]">
            <div className="mt-[4px] pt-[2px] border-t border-slate-200 flex justify-between">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                Source: UniProt
                </span>
                <span className="text-[9px] font-mono text-blue-600 tracking-widest animate-pulse">
                Position: {mutationPosition}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};