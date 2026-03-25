import React, { useEffect, useRef } from 'react';
import 'molstar/build/viewer/molstar.css';

export const StructureViewer = ({ pdbId, mutationPosition }) => {
  const viewerContainer = useRef(null);
  const viewerInstance = useRef(null);

  useEffect(() => {
    if (!viewerContainer.current || !pdbId) return;

    async function init() {
      const viewer = await window.molstar.Viewer.create(viewerContainer.current, {
        layoutIsExpanded: false,
        layoutShowControls: false,
        layoutShowRemoteState: false,
        layoutShowSequence: false,
        layoutShowLog: false,
        viewportShowExpand: false,
        viewportShowSelectionMode: false,
        backgroundColor: 0xffffff,
      });

      viewerInstance.current = viewer;

      try {

        // Check if local file exists, otherwise fallback to AlphaFold DB
        let pdbUrl = `./structures/${pdbId}.pdb`;
        const response = await fetch(pdbUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`Local model ${pdbId} not found. Fetching from AlphaFold DB...`);
          pdbUrl = `https://alphafold.ebi.ac.uk/files/AF-${pdbId}-F1-model_v4.pdb`;
        }

        // Load structure
        await viewer.loadStructureFromUrl(pdbUrl, 'pdb');

        // Get structure root
        const structure = viewer.managers.structure.hierarchy.current.structures[0];
        const component = structure.cell;

        // Base cartoon
        await viewer.builders.structure.representation.addRepresentation(component, {
          type: 'cartoon',
          color: 'uniform',
          colorParams: { value: 0xcccccc }
        });

        if (mutationPosition) {
          const targetPos = parseInt(mutationPosition, 10);
          const MSB = window.molstar.MolScriptBuilder;

          const query = MSB.struct.generator.atomGroups({
            'residue-test': MSB.core.rel.eq([
              MSB.struct.atomProperty.macromolecular.auth_seq_id(),
              targetPos
            ])
          });

          const loci = viewer.managers.structure.selection.getLociFromQuery(component, query);

          if (loci && !window.molstar.Loci.isEmpty(loci)) {
            const mutSelection = await viewer.builders.structure.tryCreateComponentFromLoci(
                component, 
                loci, 
                'mutation-residue'
            );
            
            if (mutSelection) {
                await viewer.builders.structure.representation.addRepresentation(mutSelection, {
                    type: 'ball-and-stick',
                    color: 'uniform',
                    colorParams: { value: 0xdf3721 }, // Red
                    sizeFactor: 1.5
                });
            }

            viewer.managers.camera.focusLoci(loci, { extraRadius: 5, durationMs: 1200 });
            viewer.managers.structure.selection.fromLoci('add', loci);
          }
        }
        setStatus('ready');
      } catch (err) {
        console.error("Molstar Error:", err);
        setStatus('error');
      }
    }

    init();

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.dispose();
        viewerInstance.current = null;
      }
    };
  }, [pdbId, mutationPosition]);

  return (
    <div className="bg-white border-2 border-[#475569] rounded-sm p-[4px] mt-[8px] relative">
      
      {/* Indicator */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-[2px] pointer-events-none">
        <div className="w-[2px] h-[2px] rounded-full bg-[#FFFFFF] animate-pulse"></div>
      </div>

      {/* Viewer */}
      <div
        ref={viewerContainer}
        className="w-full h-[450px] relative overflow-hidden"
      />

      {/* Footer */}
      <div className="mt-[4px] pt-[4px] border-t border-[#94A3B8] flex justify-between items-center">
        <span className="text-[9px] font-mono text-[#94A3B8] uppercase">
          Source: ALPHAMISSENSE
        </span>

        <span className="text-[10px] font-mono font-bold text-[#94A3B8]">
          {pdbId} · Mutation at {mutationPosition}
        </span>
      </div>
    </div>
  );
};

