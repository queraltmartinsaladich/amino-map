import "@geneontology/web-components/go-annotation-ribbon";

export const GOViewer = ({ proteinId }) => {
  const geneId = `UniProtKB:${proteinId}`;
  return (
    <div className="h-auto w-auto bg-[#F8FAFC] mt-[8px] border-2 border-[#94A3B8] rounded-sm p-[4px]">
      <go-annotation-ribbon 
      subjects={geneId}>
      </go-annotation-ribbon>
      <div className="mt-[4px] pt-[2px] border-t border-[#94A3B8] flex justify-between">
        <span className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest">
          Source: Gene Ontology Consortium
        </span>
        <span className="text-[9px] font-mono text-[#94A3B8] tracking-widest animate-pulse">
          Scroll to the right to see more
        </span>
      </div>
    </div>
  );
};