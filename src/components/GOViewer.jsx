import "@geneontology/web-components/go-annotation-ribbon";

export const GOViewer = ({ proteinId }) => {
  const geneId = `UniProtKB:${proteinId}`;
  return (
    <div className="h-auto w-auto bg-slate-50 border-2 border-slate-100 rounded-sm p-[4px]">
      <go-annotation-ribbon 
      subjects={geneId}>
      </go-annotation-ribbon>
      <div className="mt-[4px] pt-[2px] border-t border-slate-200 flex justify-between">
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
          Source: Gene Ontology Consortium
        </span>
        <span className="text-[9px] font-mono text-blue-600 tracking-widest animate-pulse">
          Scroll to the right to see more
        </span>
      </div>
    </div>
  );
};