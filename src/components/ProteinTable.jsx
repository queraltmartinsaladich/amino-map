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
      <div className="rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[16px] font-black text-slate-900 uppercase tracking-[0.1em]">
                <th className="py-[4px] px-[4px]">Variant ID</th>
                <th className="py-[4px] px-[4px] text-center">ESM1b Class</th>
                <th className="py-[4px] px-[4px] text-center">AM Class</th>
                <th className="py-[4px] px-[4px] text-right">Mechanism</th>
              </tr>
            </thead>
            <tbody className="">
              {data.length > 0 ? (
                data.map((row) => (
                  <tr 
                    key={row.variant_id}
                    onClick={() => onRowSelect(row)} 
                    className={`group cursor-pointer transition-all ${
                      selectedVariant?.variant_id === row.variant_id 
                      ? 'bg-[#E2E8E4] text-[#006C84]' 
                      : 'hover:bg-[#6EB5C0] text-[#FFFFFF]'}`}
                  >
                    <td className="py-[3px] px-[4px] text-[15px] font-black uppercase tracking-tighter font-mono">
                      {row.variant_id}
                    </td>
                    <td className="py-[3px] px-[4px] text-center">
                      <span className={`text-[14px] text-slate-400 font-black uppercase tracking-tighter ${
                        selectedVariant?.variant_id === row.variant_id 
                        ? 'text-[#006C84]' 
                        : row.ESM1b_is_pathogenic === 'pathogenic' ? 'text-[#7B1B38]' : 'text-[#2a9723ff]'
                      }`}>
                        {row.ESM1b_is_pathogenic}
                      </span>
                    </td>
                    <td className="py-[3px] px-[4px] text-center">
                      <span className={`text-[14px] text-slate-400 font-black uppercase tracking-tighter ${
                        selectedVariant?.variant_id === row.variant_id 
                        ? 'text-[#006C84]' 
                        : row.am_class === 'pathogenic' ? 'text-[#7B1B38]' : row.am_class === 'benign' ? 'text-[#2a9723ff]' : 'text-[#d8a122ff]'
                      }`}>
                        {row.am_class}
                      </span>
                    </td>
                    <td className="py-[3px] px-[4px] text-right">
                      <span className={`text-[14px] text-slate-400 font-black uppercase tracking-tighter ${
                        selectedVariant?.variant_id === row.variant_id 
                        ? 'bg-[#E2E8E4] text-[#006C84]' 
                      : 'hover:bg-[#6EB5C0] text-[#FFFFFF]'
                      }`}>
                        {row.mechanistic_label || 'Unassigned'}
                      </span>
                    </td>
                  </tr>
                ))
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
        <div className="px-[4px] py-[3px] bg-slate-50 border-slate-100 flex justify-between items-center">
          <label 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-[4px] py-[1px] rounded text-[16px] font-black uppercase tracking-widest disabled:opacity-20 hover:border-slate-900 transition-all cursor-pointer"
          >
            ⏪
          </label>
          
          <div className="text-[12px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
          </div>

          <label 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-[4px] py-[1px] border-slate-200 rounded text-[16px] font-black uppercase tracking-widest disabled:opacity-20 hover:border-slate-900 transition-all cursor-pointer"
          >
            ⏩️
          </label>
        </div>
      </div>
    </div>
  );
};