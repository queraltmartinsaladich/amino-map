import React, { useState, useEffect } from 'react';

export const ExpressionChart = ({ proteinId = "Q8IUR5" }) => {
  const [expressionData, setExpressionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!proteinId) return;

    const fetchHPA = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://www.proteinatlas.org/api/search_download.php?search=${proteinId}&columns=t_RNA_adipose_tissue,t_RNA_adrenal_gland,t_RNA_amygdala,t_RNA_appendix,t_RNA_basal_ganglia,t_RNA_blood_vessel,t_RNA_bone_marrow,t_RNA_breast,t_RNA_cerebellum,t_RNA_cerebral_cortex,t_RNA_cervix,t_RNA_choroid_plexus,t_RNA_colon,t_RNA_duodenum,t_RNA_endometrium_1,t_RNA_epididymis,t_RNA_esophagus,t_RNA_fallopian_tube,t_RNA_gallbladder,t_RNA_heart_muscle,t_RNA_hippocampal_formation,t_RNA_hypothalamus,t_RNA_kidney,t_RNA_liver,t_RNA_lung,t_RNA_lymph_node,t_RNA_midbrain,t_RNA_ovary,t_RNA_pancreas,t_RNA_parathyroid_gland,t_RNA_pituitary_gland,t_RNA_placenta,t_RNA_prostate,t_RNA_rectum,t_RNA_retina,t_RNA_salivary_gland,t_RNA_seminal_vesicle,t_RNA_skeletal_muscle,t_RNA_skin_1,t_RNA_small_intestine,t_RNA_smooth_muscle,t_RNA_spinal_cord,t_RNA_spleen,t_RNA_stomach_1,t_RNA_testis,t_RNA_thymus,t_RNA_thyroid_gland,t_RNA_tongue,t_RNA_tonsil,t_RNA_urinary_bladder,t_RNA_vagina&compress=no&format=json`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("HPA Connection Failed");
        
        const result = await response.json();

        // HPA returns [ { "Tissue RNA - ...": "value", ... } ]
        if (result && result.length > 0) {
          const rawData = result[0];
          
          const parsed = Object.keys(rawData)
            .filter(key => key.startsWith("Tissue RNA"))
            .map(key => {
              const cleanName = key
                .replace("Tissue RNA - ", "")
                .replace(" [nTPM]", "")
                .trim();

              return {
                tissue: cleanName,
                nTPM: parseFloat(rawData[key]) || 0
              };
            })
            .sort((a, b) => b.nTPM - a.nTPM)
            .slice(0, 20);

          setExpressionData(parsed);
        } else {
          setError("No data found for this ID");
        }
      } catch (err) {
        console.error("HPA Fetch Error:", err);
        setError("CORS or Network Error");
      } finally {
        setLoading(false);
      }
    };

    fetchHPA();
  }, [proteinId]);

  if (loading) return <div className="py-10 text-center animate-pulse text-[10px] font-mono text-[#94A3B8] uppercase">Querying Protein Atlas...</div>;
  if (error) return <div className="py-6 text-center text-[10px] font-mono text-red-500 border border-red-200 bg-red-50 rounded uppercase">{error}</div>;
  if (!expressionData.length) return null;

  const maxVal = Math.max(...expressionData.map(d => d.nTPM));

  return (
    <div className="mt-2">
      <div className="bg-[#FFFFFF] border-2 border-slate-900 rounded-sm p-[4px]">
    
        <div className="space-y-3">
          {expressionData.map((item, index) => {
            const percentage = ((item.nTPM / (maxVal || 1)) * 100).toFixed(1);
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center text-[14px] font-black uppercase tracking-[0.01em]">
                  <span className="text-slate-700 truncate pr-2">{item.tissue}</span>
                  <span className="text-[#94A3B8] font-mono">{item.nTPM.toFixed(1)}</span>
                </div>
                <div className="w-full bg-[#F1F5F9] h-2 border-[#94A3B8] overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-[4px] pt-[2px] border-t border-[#94A3B8] flex justify-between">
        <span className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest">
          Source: Human Protein Atlas
        </span>
        <span className="text-[9px] font-mono text-[#94A3B8] tracking-widest animate-pulse">
          nTPM
        </span>
      </div>
      </div>
    </div>
  );
};