import React from 'react';

export const ProteinTable = ({ 
  data, 
  selectedVariant, 
  onRowSelect, 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  return (
    <div className="flex flex-col gap-[4px]">
      {/* TABLE BOX */}
      <div className="rounded-xl overflow-hidden bg-[#FFFFFF] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b-2 border-[#474469]">
              <tr className="text-[16px] font-black text-[#474469] uppercase tracking-[0.1em]">
                <th className="py-[4px] px-[4px]">Variant ID</th>
                <th className="py-[4px] px-[4px] text-center">ESM1b Class</th>
                <th className="py-[4px] px-[4px] text-center">AM Class</th>
                <th className="py-[4px] px-[4px] text-right">Mechanism</th>
              </tr>
            </thead>
            <tbody className="">
              {data.length > 0 ? (
                data.map((row) => {
                  const isSelected = selectedVariant?.variant_id === row.variant_id;
                  
                  return (
                    <tr 
                      key={row.variant_id}
                      onClick={() => onRowSelect(row)} 
                      className={`
                        group cursor-pointer transition-all duration-200
                        /* Baseline (Default) */
                        bg-[#FFFFFF] text-[#474469] 
                        /* Hover State */
                        hover:bg-[#6EB5C0] hover:text-[#FFFFFF]
                        /* Selected State */
                        ${isSelected ? '!bg-[#E2E8E4] !text-[#006C84]' : ''}
                      `}
                    >
                      <td className="py-[3px] px-[4px] text-[15px] font-black uppercase tracking-tighter font-mono">
                        {row.variant_id}
                      </td>
                      <td className="py-[3px] px-[4px] text-center font-black uppercase text-[14px]">
                        <span className={isSelected ? 'text-[#006C84]' : 'group-hover:text-[#FFFFFF]'}>
                          {row.ESM1b_is_pathogenic}
                        </span>
                      </td>
                      <td className="py-[3px] px-[4px] text-center font-black uppercase text-[14px]">
                        <span className={isSelected ? 'text-[#006C84]' : 'group-hover:text-[#FFFFFF]'}>
                          {row.am_class}
                        </span>
                      </td>
                      <td className="py-[3px] px-[4px] text-right font-black uppercase text-[14px]">
                        <span className={isSelected ? 'text-[#006C84]' : 'group-hover:text-[#FFFFFF]'}>
                          {row.mechanistic_label || 'Unassigned'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="py-[20px] text-center text-[#FFCCBB] font-mono uppercase tracking-widest">
                    No matching variants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="mt-[8px] px-[4px] py-[3px] flex justify-between items-center">
          <label 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-[4px] py-[1px] rounded text-[16px] font-black uppercase tracking-widest disabled:opacity-20 hover:border-[#0F172A] transition-all cursor-pointer"
          >
            ⏪
          </label>
          
          <div className="text-[12px] font-mono font-bold uppercase tracking-widest text-[#94A3B8]">
            Page {currentPage} of {totalPages}
          </div>

          <label 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-[4px] py-[1px] border-[#94A3B8] rounded text-[16px] font-black uppercase tracking-widest disabled:opacity-20 hover:border-[#0F172A] transition-all cursor-pointer"
          >
            ⏩️
          </label>
        </div>
      </div>
    </div>
  );
};