import React, { useState, useMemo, useEffect} from 'react';
import { useMutationData } from './hooks/useMutationData';
import { useUniProt } from './hooks/useUniProt';
import { useProteinData } from './hooks/useProteinData';
import { GOViewer} from './components/GOViewer';
import { StructureViewer } from './components/StructureViewer';
import { SequenceViewer } from './components/SequenceViewer';
import { ExpressionChart } from './components/ExpressionChart';
import { ProteinTable } from './components/ProteinTable';

const parseUniProtTxt = (txt) => {
  const lines = txt.split('\n');
  let sequence = "";
  let inSequence = false;

  for (const line of lines) {
    if (line.startsWith('SQ   ')) {
      inSequence = true;
      continue;
    }
    if (line.startsWith('//')) {
      break;
    }
    if (inSequence) {
      sequence += line.replace(/\s+/g, '');
    }
  }
  return sequence;
};

function App() {

  const { data, loading } = useMutationData();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [history, setHistory] = useState([]);
  const [sequence, setSequence] = useState("");
  const [loadingSeq, setLoadingSeq] = useState(false);
  
  const navLinks = [
    { name: 'Documentation', url: 'https://github.com/queraltmartinsaladich/amino-map/blob/main/README.md' },
    { name: 'Beltrao Group', url: 'https://imsb.ethz.ch/research/beltrao.html' },
    { name: 'Tutorial', url: 'https://github.com/queraltmartinsaladich/amino-map/blob/main/tutorial.pdf' },
    { name: 'GitHub repository', url: 'https://github.com/queraltmartinsaladich/amino-map/tree/main' },
    { name: 'References', url: 'https://github.com/queraltmartinsaladich/amino-map/blob/main/references.md' },
  ];

  const {
    paginatedData,
    filteredData,
    searchTerm,
    activeESM1b,
    activeClass,
    activeMech,
    currentPage,
    totalPages,
    updateFilter,
    setCurrentPage
  } = useProteinData(data); // "data" is your raw JSON array

  useEffect(() => {
    const savedHistory = localStorage.getItem('amino_map_session');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse saved session");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('amino_map_session', JSON.stringify(history));
  }, [history]);

  const handleImportSession = (event) => {
    const file = event.target.files[0];
    if (!file || !data) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').slice(1);
      
      const importedIds = rows
        .map(row => row.split(',')[0]?.replace(/"/g, '').trim())
        .filter(id => id);

      const matchedHistory = data.filter(item => 
        importedIds.includes(String(item.variant_id))
      );

      if (matchedHistory.length > 0) {
        setHistory(prev => {
          const existingIds = new Set(prev.map(item => item.variant_id));
          const newItems = matchedHistory.filter(item => !existingIds.has(item.variant_id));
          return [...prev, ...newItems];
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset
  };

  const handleRowSelect = (row) => {
    setSelectedVariant(row);
    setHistory((prevHistory) => {
      const isAlreadyInHistory = prevHistory.some(
        (item) => item.variant_id === row.variant_id
      );
      if (isAlreadyInHistory) return prevHistory;
      return [row, ...prevHistory];
    });};

  const selectedUniprotId = useMemo(() => {
      return selectedVariant?.variant_id?.split('/')[0] || null;
    }, [selectedVariant]);
    
  const { bioData, loading: uniProtLoading } = useUniProt(selectedUniprotId);

  const clearHistory = () => {
    console.log("History cleared"); 
    setHistory([]);};

  const DataPoint = ({ label, value, color = "text-[#94A3B8]", decimals = 3 }) => {
    let displayValue;
    if (typeof value === 'number') {
      displayValue = value.toFixed(decimals);
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'YES' : 'NO';
    } else {
      displayValue = value ?? 'N/A';
    }
    return (
      <div className="mb-[-10px] mt-[-10px] flex justify-between items-baseline">
        <p className="text-[14px] font-['Elephant',_'Playfair_Display',_serif] text-[#94A3B8] tracking-widest leading-none">
          {label}
        </p>
        <p className={`text-[14px] font-['Elephant',_'Playfair_Display',_serif] font-bold uppercase leading-none ${color}`}>
          {displayValue}
        </p>
      </div>
    );};

  const loadCSV = (event) => {
    const file = event.target.files[0];
    if (!file || !data) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Supports IDs separated by newlines, commas, or tabs
      const uploadedIds = text.split(/[\n,\t]+/).map(id => id.trim().toLowerCase()).filter(id => id);
      
      const matchedData = data.filter(item => 
        uploadedIds.includes(String(item.variant_id).toLowerCase()));

      if (matchedData.length > 0) {
        const headers = ["variant_id", "am_class", "am_pathogenicity", "am_label", "pred_ddg", "pred_ddg_label", "ESM1b_LLR", "ESM1b_is_pathogenic",	"interface_label",	"pocket_label", "mechanistic_label"];
        const csvContent = [
          headers.join(','),
          ...matchedData.map(row => headers.map(field => `"${row[field] ?? 'N/A'}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `bulk_export_${matchedData.length}_variants.csv`;
        link.click();
      } else {
        alert("No matching variants found in the uploaded file.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';};

  const downloadCSV = () => {
    if (history.length === 0) return alert("No search history to export.");
    const headers = ["variant_id", "am_class", "am_pathogenicity", "am_label", "pred_ddg", "pred_ddg_label", "ESM1b_LLR", "ESM1b_is_pathogenic",	"interface_label",	"pocket_label", "mechanistic_label"];
    const csvRows = [
      headers.join(','),
      ...history.map(row => headers.map(fieldName => {
        const value = row[fieldName] ?? "N/A";
        return `"${value}"`;
      }).join(','))];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `amino_map_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);};

  const mutationPos = useMemo(() => {
    if (!selectedVariant || !selectedVariant.variant_id) return null;
    // 1. Split the string: ["Q7Z4H8", "A126C"]
    const parts = selectedVariant.variant_id.split('/');
    // 2. Take the second part: "A126C"
    const mutationPart = parts[1]; 
    if (!mutationPart) return null;
    // 3. Extract numbers from "A126C" -> 126
    const match = mutationPart.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }, [selectedVariant]);

  const proteinID = useMemo(() => {
    if (!selectedVariant || !selectedVariant.variant_id) return null;
    // 1. Split the string: ["Q7Z4H8", "A126C"]
    const parts = selectedVariant.variant_id.split('/');
    // 2. Take the first part: "Q7Z4H8"
    const proteinPart = parts[0]; 
    return proteinPart || null;
  }, [selectedVariant]);

  useEffect(() => {
  if (!proteinID) {
    setSequence("");
    return;
  };

  let isMounted = true;
  setLoadingSeq(true);

  fetch(`https://rest.uniprot.org/uniprotkb/${proteinID}.txt`)
    .then(res => {
      if (!res.ok) throw new Error("Entry not found");
      return res.text();
    })
    .then(data => {
      if (isMounted) {
        const cleanedSequence = parseUniProtTxt(data);
        setSequence(cleanedSequence);
        setLoadingSeq(false);
      }
    })
    .catch(err => {
      console.error("Sequence fetch failed:", err);
      if (isMounted) setLoadingSeq(false);
    });

  return () => { isMounted = false; }; // Cleanup
  }, [proteinID]);

  const AA_PROPERTIES = {
    'A': 'Small hydrophobic',  'R': 'Large positive (basic)', 
    'N': 'Polar uncharged',     'D': 'Small negative (acidic)',
    'C': 'Sulfur-containing (nucleophilic)', 'E': 'Large negative (acidic)',
    'Q': 'Large polar',         'G': 'Tiny (flexible)',
    'H': 'Positive (aromatic)', 'I': 'Large hydrophobic',
    'L': 'Large hydrophobic',   'K': 'Large positive (basic)',
    'M': 'Hydrophobic (thioether)', 'F': 'Large aromatic',
    'P': 'Rigid (cyclic)',      'S': 'Small polar (hydroxyl)',
    'T': 'Small Polar (hydroxyl)', 'W': 'Bulky aromatic',
    'Y': 'Aromatic (hydroxyl)', 'V': 'Medium hydrophobic'};

  // IMPORTANT!!!! Change this for whatever proteins want to be included in the scoring. In this case I did it for the ones provided.
  const proteinNature = useMemo(() => {
    const mapping = {
      'P12235': { label: 'Rigid / Structural Lock', isRigid: true, flexScore: '1/10' },
      'Q7Z4H8': { label: 'Moderate / Enzymatic Hinge', isRigid: false, flexScore: '5/10' },
      'Q8IUR5': { label: 'Highly Flexible / Scaffold', isRigid: false, flexScore: '9/10' }};
    return mapping[selectedUniprotId] || { label: "Globular / Standard", isRigid: false, flexScore: '4/10' };
  }, [selectedUniprotId]);

  const propertyShift = useMemo(() => {
    if (!selectedVariant) return null;
    
    const mutationPart = selectedVariant.variant_id.split('/')[1]; // "A126C"
    const fromAA = mutationPart.charAt(0); // "A"
    const toAA = mutationPart.slice(-1);   // "C"

    const fromProp = AA_PROPERTIES[fromAA] || "Unknown";
    const toProp = AA_PROPERTIES[toAA] || "Unknown";

    return `${fromProp} → ${toProp}`;
  }, [selectedVariant]);

  const mutationAnalysis = useMemo(() => {
    if (!selectedVariant) return { shift: null, isChargeReversal: false };
    
    const mutationPart = selectedVariant.variant_id.split('/')[1];
    const fromAA = mutationPart.charAt(0);
    const toAA = mutationPart.slice(-1);

    const pos = ['R', 'K', 'H']; 
    const neg = ['D', 'E'];

    const isChargeReversal = 
      (pos.includes(fromAA) && neg.includes(toAA)) || 
      (neg.includes(fromAA) && pos.includes(toAA));

    return {
      shift: `${AA_PROPERTIES[fromAA]} → ${AA_PROPERTIES[toAA]}`,
      isChargeReversal
    };
  }, [selectedVariant]);

  const structuralContext = useMemo(() => {
    if (!bioData?.features || !mutationPos) return "Loop / Unstructured";

    // Find if the mutation position is inside a Helix or Beta Strand
    const feature = bioData.features.find(f => 
      (f.type === 'Helix' || f.type === 'Strand') && 
      mutationPos >= f.location.start.offset && 
      mutationPos <= f.location.end.offset
    );

    if (!feature) return "Loop / Flexible";
    return feature.type === 'Strand' ? "Beta Sheet (Rigid)" : "Alpha Helix (Coil)";
  }, [bioData, mutationPos]);

  const handleDownload = () => {
    if (!selectedVariant) return;
    // 1. Clean the ID for a filename (replace / with -)
    const safeId = selectedVariant.variant_id.replace('/', '-');
    const originalTitle = document.title;
    // 2. Set temporary title for the browser's PDF engine
    document.title = `Report_${safeId}`;
    // 3. Trigger Print
    window.print();
    // 4. Restore original title after a tiny delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);};

  // LOADING APPEARANCE
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="text-[#94A3B8] font-black tracking-[0.5em] animate-pulse">BUILDING YOUR PROTEIN🏋🏼‍♀️</div>
      </div>
    );
  }
  
  return (
    <>
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F172A] p-10 text-center md:hidden">
      <div className="mb-6 text-[#6EB5C0]">
        <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="font-mono text-xl font-black uppercase tracking-[0.2em] text-[#FFFFFF]">
        Only Desktop Available
      </h1>
      <p className="mt-4 font-mono text-sm tracking-widest text-[#94A3B8]">
        AMINO-MAP requires a larger screen to render 3D structures and complex protein data. 
        Please switch to a desktop browser.
      </p>
    </div>
      
    // MAIN FUNCTION ·········································
    <div className="hidden md:block bg-[#FFFFFF] ml-[40px] mr-[40px] mt-[20px] mb-[30px] pl-[10px] pr-[10px] text-[#0F172A]"> 
      
      {/* Opens GLOBAL */}
      <div className="mx-auto"> 

        {/* MAIN TITLE SECTION -------------------------------------------------------------------------------------------------------- */}
        <header id="header" className="flex flex-col items-center w-full py-[8px]">
          <div className="flex items-center justify-between w-full overflow-hidden">
            <div className="mt-[-30px] w-1/2 max-w-2xl flex-shrink min-w-[50px]">
              <svg 
                viewBox="0 0 240 40" 
                className="w-full h-auto" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 25C30 5 50 35 70 25C90 15 110 35 130 25C150 15 170 35 190 25C210 15 230 25 230 25" 
                      stroke="#006C84" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 25C30 45 50 15 70 25C90 35 110 15 130 25C150 35 170 15 190 25C210 35 230 25 230 25" 
                      stroke="#6EB5C0" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 className="text-[36px] md:text-[16px] max-w-2xl text-center text-[#006C84] font-black tracking-[0.2em] whitespace-nowrap">
              AMINO-MAP
            </h1>

            <div className="mt-[-30px] w-1/2 max-w-2xl flex-shrink min-w-[50px] scale-x-[-1]">
              <svg 
                viewBox="0 0 240 40" 
                className="w-full h-auto" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 25C30 5 50 35 70 25C90 15 110 35 130 25C150 15 170 35 190 25C210 15 230 25 230 25" 
                      stroke="#006C84" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 25C30 45 50 15 70 25C90 35 110 15 130 25C150 35 170 15 190 25C210 35 230 25 230 25" 
                      stroke="#6EB5C0" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <h2 className="text-[18px] mt-[-20px] font-mono uppercase text-center tracking-[0.4em] text-[#6EB5C0] max-w-2xl">
            An open-source protein mutation browser
          </h2>
          <h3 className="text-[12px] mt-[0px] font-['Elephant',_'Playfair_Display',_serif] text-center tracking-[0.1em] text-[#94A3B8] max-w-2xl">
            beta version, 2026
          </h3>
        </header>
        {/* MAIN TITLE SECTION -------------------------------------------------------------------------------------------------------- */}

        {/* EXTERNAL RESOURCE NAVIGATION -------------------------------------------------------------------------------------------------------- */}
        <div id="nav" className="w-full mb-[20px]">
          <nav className="border-y-2 border-[#F1F5F9] mb-[4px] py-[10px]">
            <div className="flex justify-between items-center w-full">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative text-[12px] font-bold uppercase tracking-[0.25em] text-[#94A3B8] no-underline hover:text-[#b4ccd1] transition-all duration-300"
                >
                  <span>{link.name}</span>                  
                  <span className="absolute -bottom-[4px] left-1/2 w-0 h-[1px] bg-[#b4ccd1] transition-all duration-300 origin-center group-hover:w-full group-hover:left-0 group-hover:translate-x-0 -translate-x-1/2"></span>                </a>
              ))}
            </div>
          </nav>
        </div>
        {/* EXTERNAL RESOURCE NAVIGATION -------------------------------------------------------------------------------------------------------- */}

        {/* MAIN BODY ------------------------------------------------------------------------------------------------------------------------- */}
        <div className="flex items-start gap-[40px]">
          
          {/* LEFT HALF ------------------------------------------------------------------------------------------------------------------------- */}
          <div className="w-1/2 table-container flex-grow-0 flex-col">

            {/* TOP CONTROL BAR: MODERN AESTHETIC --------------------------------------------------------------------------- */}
            <div className="w-full mb-[8px] flex justify-between items-center">

              {/* 1. BULK LOAD */}
              <label 
                title="Load multiple IDs inside a .txt or .csv file"
                className="flex items-center text-center px-[20px] py-[4px] border-2 border-[#6EB5C0] bg-[#6EB5C0] text-[#FFFFFF] rounded-[8px] cursor-pointer hover:border-[#0F172A] hover:bg-[#FFFFFF] hover:text-[#0F172A] transition-all duration-300 group">
                <input 
                  type="file" 
                  accept=".txt,.csv" 
                  className="hidden" 
                  onChange={loadCSV} 
                />
                <span className="text-[12px] font-bold uppercase tracking-[0.1em]">Bulk Load</span>
              </label>

              {/* 2. IMPORT SESSION */}
              <label 
                title="Import session history"
                className="flex items-center text-center px-[20px] py-[4px] border-2 border-[#6EB5C0] bg-[#6EB5C0] text-[#FFFFFF] rounded-[8px] cursor-pointer hover:border-[#0F172A] hover:bg-[#FFFFFF] hover:text-[#0F172A] transition-all duration-300 group">
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleImportSession} 
                />
                <span className="text-[12px] font-bold uppercase tracking-[0.1em]">Import Session</span>
              </label>

              {/* 3. EXPORT BUTTON */}
              <label 
                onClick={downloadCSV}
                disabled={history.length === 0}
                title="Export session history"
                className="flex items-center text-center px-[20px] py-[4px] border-2 border-[#6EB5C0] bg-[#6EB5C0] text-[#FFFFFF] rounded-[8px] cursor-pointer hover:border-[#0F172A] hover:bg-[#FFFFFF] hover:text-[#0F172A] transition-all duration-300 group"
              >
                <span className="text-[12px] font-bold uppercase tracking-[0.1em]">Export ({history.length})</span>
              </label>

              {/* 4. CLEAR HISTORY BUTTON */}
              <label 
                onClick={clearHistory}
                disabled={history.length === 0}
                title="Clear session history"
                className="flex items-center text-center px-[20px] py-[4px] border-2 border-[#6EB5C0] bg-[#6EB5C0] text-[#FFFFFF] rounded-[8px] cursor-pointer hover:border-[#0F172A] hover:bg-[#FFFFFF] hover:text-[#0F172A] transition-all duration-300 group"              >
                <span className="text-[12px] font-bold uppercase tracking-[0.1em]">Clear ({history.length})</span>
              </label>
                          
            </div>

            {/* SEARCH INPUT CONTAINER -------------------------------------------------------------------------------------- */}
            <div className="w-full mb-[2px] mt-[14px] text-[#94A3B8] flex justify-between items-center gap-[6px]">
              <svg 
                className="w-[20px] h-[20px]" 
                fill="none" 
                stroke="#94A3B8" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                placeholder="Search Variant ID..."
                className="
                  border-0
                  text-[#94A3B8]
                  w-full pl-[10px] py-[5px]
                  text-[18px] font-mono font-bold uppercase tracking-[0.1em] 
                "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* FILTER ROW -------------------------------------------------------------------------------------------------- */}
            <div className="mb-[4px] flex flex-col gap-[2px] px-[1px]">
              
              {/* 1. ESM1b Filters */}
              <div className="flex items-center gap-[2px]">
                <span className="mt-[10px] text-[16px] font-['Roboto',sans-serif] font-bold text-[#475569] tracking-widest">ESM1b class:</span>
                <div className="flex gap-[3px]">
                  {['ALL', 'pathogenic', 'benign'].map(cat => (
                    <label
                      key={cat}
                      onClick={() => updateFilter('esm', cat)} // Use hook function
                      className={`mt-[10px] mb-[1px] ml-[2px] px-[8px] py-[3px] text-[12px] font-['Glacial_Indifference',_sans-serif] rounded-[5px] uppercase tracking-wider cursor-pointer ${
                        activeESM1b === cat ? 'bg-[#006C84] text-[#FFFFFF]' : 'bg-[#F1F5F9] text-[#94A3B8]'
                      }`}
                    >
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. AM Class Filters */}
              <div className="flex items-center gap-[2px]">
                <span className="text-[16px] font-['Roboto',sans-serif] font-bold text-[#475569] tracking-widest">AlphaMissense class:</span>
                <div className="flex gap-[3px]">
                  {['ALL', 'pathogenic', 'benign', 'ambiguous'].map(cat => (
                    <label
                      key={cat}
                      onClick={() => updateFilter('class', cat)} // Use hook function
                      className={`mb-[2px] ml-[2px] px-[8px] py-[3px] text-[12px] font-['Glacial_Indifference',_sans-serif] uppercase rounded-[5px] tracking-wider cursor-pointer ${
                        activeClass === cat ? 'bg-[#006C84] text-[#FFFFFF]' : 'bg-[#F1F5F9] text-[#94A3B8]'
                      }`}
                    >
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Mechanism Filters */}
              <div className="flex items-center gap-[2px]">
                <span className="text-[16px] font-['Roboto',sans-serif] font-bold text-[#475569] tracking-widest">Mechanism:</span>
                <div className="flex gap-[3px]">
                  {['ALL', 'Unassigned', 'Stability', 'Pockets', 'Interface'].map(cat => (
                    <label
                      key={cat}
                      onClick={() => updateFilter('mech', cat)} // Use hook function
                      className={`mb-[2px] ml-[2px] px-[8px] py-[3px] text-[12px] font-['Glacial_Indifference',_sans-serif] rounded-[5px] uppercase tracking-wider cursor-pointer ${
                        activeMech === cat ? 'bg-[#006C84] text-[#FFFFFF]' : 'bg-[#F1F5F9] text-[#94A3B8]'
                      }`}
                    >
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* COUNT SUMMARY */}
            <div className="flex items-left">
              <div className="rounded-full bg-[#3B82F6] animate-pulse"></div>
              <p className="text-[14px] font-medium text-[#94A3B8] tracking-tight italic">
                {filteredData.length} entries matching filters
              </p>
            </div>

            {/* PROTEIN TABLE */}
            <ProteinTable 
              data={paginatedData}
              selectedVariant={selectedVariant}
              onRowSelect={handleRowSelect}
              filteredCount={filteredData.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

          </div>
          {/* LEFT HALF ------------------------------------------------------------------------------------------------------------------------- */}

          {/* RIGHT HALF:  ---------------------------------------------------------------------------------------------------------------------- */}
          <div id="analysis-panel-container" className="flex-shrink-0 flex-col w-1/2 gap-[10px]">
            {selectedVariant ? (
            <div id='char'>
              <div key={selectedVariant.variant_id} className="mt-[-1px] sticky bg-[#FFFFFF] animate-in fade-in duration-300">
                
                {/* CHOSEN PROTEIN ID ------------------------------------------------------------------------------------- */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[#94A3B8] text-[18px] font-black uppercase tracking-[0.4em]">Analysis of</span>
                    <h2 className="text-[30px] font-black text-[#0F172A] font-['Elephant',_'Playfair_Display',_serif] uppercase tracking-tighter mb-[20px]">
                      {selectedVariant.variant_id}
                    </h2>
                  </div>
                  <div>
                  <button 
                    onClick={handleDownload} // Use the new function here 
                    title="Print or download analysis as PDF"
                    className="text-[#475569] hover:text-[#94A3B8] transition-colors group p-[2px] cursor-pointer action-icon-group"
                  >
                    <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setSelectedVariant(null)}
                    title="Close analysis"
                    className="text-[#475569] hover:text-[#94A3B8] transition-colors group p-[1px] cursor-pointer action-icon-group"
                  >
                    <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  </div>
                </div>
                {/* CHOSEN PROTEIN ID ------------------------------------------------------------------------------------- */}

                {/* UNIPROT DATA ------------------------------------------------------------------------------------------ */}
                <div className="mb-[20px] bg-slate-50">
                  {uniProtLoading ? (
                  <p className="text-[14px] font-mono animate-pulse uppercase tracking-widest">
                    Syncing UniProt...
                  </p>
                  ) : bioData ? (
                  <>
                  <h3 className="text-[14px] font-black text-[#64748B] uppercase mb-[-10px]">
                    {bioData.fullName}
                  </h3>
                  <p className="text-[14px] font-mono text-[#94A3B8] uppercase mb-[3px] tracking-tighter">
                    Gene: {bioData.geneName} | Organism: {bioData.organism}
                  </p>
                  
                  <div>
                    <p className="text-[13px] font-mono text-[#6EB5C0] leading-relaxed italic lowercase first-letter:uppercase">
                      {bioData.function.length > 200 
                        ? `${bioData.function.substring(0, 200)}...` 
                        : bioData.function}
                    </p>
                  </div>

                  {/* EXTERNAL LINK BUTTON */}
                  <div className="pt-[4px]">
                    <a 
                      href={`https://www.uniprot.org/uniprotkb/${selectedUniprotId}/entry`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[15px] font-black text-[#b4ccd1] hover:text-[#FFCCBB] transition-colors group"
                    >
                      <span>View full UniProt.org entry</span>
                      <svg 
                        className="w-[20px] h-[20px] ml-[10px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  </>
                  ) : (
                  <p className="text-[12px] font-mono text-[#475569] uppercase tracking-[0.2em]">
                    Biological metadata restricted or unavailable
                  </p>
                )}
                </div>
                {/* UNIPROT DATA ------------------------------------------------------------------------------------------ */}

                {/* MUTATION CONTEXT: COORDINATE, CHEMISTRY & PROPERTY SHIFT -------------------------------------------------- */}
                <div className="flex flex-col gap-[8px] animate-in fade-in duration-500">

                  {/* ROW 1: THE COORDINATE */}
                  <div className="flex items-center justify-between max-w-xs h-[20px]">
                    <span className="text-[14px] font-black uppercase tracking-[0.3em] text-[#475569]">
                      Position
                    </span>
                    <span className="text-[14px] font-mono font-bold text-[#475569]">
                      {mutationPos || '—'} <span className="text-[#475569] text-[14px] ml-1"></span>
                    </span>
                  </div>

                  {/* ROW 2: THE SUBSTITUTION (Identity Swap) */}
                  <div className="flex items-center justify-between max-w-xs h-[20px]">
                    <span className="text-[14px] font-black uppercase tracking-[0.3em] text-[#475569]">
                      Substitution
                    </span>
                    <div className="flex items-center gap-[8px]">
                      <span className="px-[6px] py-[2px] bg-slate-50 border border-[#475569] rounded text-[12px] font-mono font-bold text-[#475569]">
                        {selectedVariant.variant_id.split('/')[1].charAt(0)}
                      </span>
                      <svg className="w-[10px] h-[10px] text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="px-[6px] py-[2px] !bg-[#475569] border border-[#475569] rounded text-[12px] font-mono font-bold !text-[#FFFFFF]">
                        {selectedVariant.variant_id.slice(-1)}
                      </span>
                    </div>
                  </div>

                  {/* ROWs 3/4: SHIFTs (The "Why it matters" logic) */}
                  <div className="flex items-center justify-between max-w-xs h-[20px]">
                    <span className="text-[14px] font-black uppercase tracking-[0.3em] text-[#475569]">
                      Property Shift
                    </span>
                    <p className="text-[14px] font-mono text-[#64748B] leading-tight">
                      {propertyShift}
                    </p>
                  </div>

                  <div className="flex items-center justify-between h-[20px]">
                    <span className="text-[14px] font-black uppercase tracking-[0.3em] text-[#475569]">
                      Charge Shift
                    </span>
                    <p className="text-[14px] font-mono text-[#64748B] leading-tight">
                      {mutationAnalysis?.isChargeReversal ? 'Charge shift' : 'No charge shift'}
                    </p>
                  </div>

                  {/* ROWS 5/6: STRUCTURAL CONTEXT (Alpha Helix / Beta Sheet) */}
                  <div className="flex items-center justify-between max-w-xs h-[20px]">
                    <span className="text-[14px] font-black uppercase tracking-[0.3em] text-[#475569]">
                      Local geometry
                    </span>
                    <p className="text-[14px] font-mono text-[#64748B] leading-tight">
                      {structuralContext}
                    </p>
                  </div>
                  <div className="flex items-center justify-between max-w-xs h-[20px]">
                    <span className="text-[14px] font-black uppercase tracking-[0.3em] text-[#475569]">
                      Structural flexibility
                    </span>
                    <p className="text-[14px] font-mono text-[#64748B] leading-tight">
                      {proteinNature.label}                    
                    </p>
                  </div>
                </div>
                {/* MUTATION CONTEXT: COORDINATE, CHEMISTRY & PROPERTY SHIFT -------------------------------------------------- */}

                {/* CHARACTERISTICS ----------------------------------------------------------------------------------------- */}
                <div className='mt-[30px]'>
                  <p className="text-[20px] border-b-2 border-[#0F172A] pb-[8px] font-black text-[#475569] uppercase tracking-[0.2em] leading-none">
                    📌 Characteristics
                  </p>
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] mt-[20px] mb-[10px]">
                    Pathogenic labels
                  </p>
                </div>
                {/* ESM1b - Pathogenic? */}
                <div className="flex items-center group max-w-xs h-[30px]">
                  <div className="flex items-center gap-[8px]">
                    <svg className={`w-[30px] h-[30px] transition-colors ${
                      selectedVariant.ESM1b_is_pathogenic === 'pathogenic' ? 'text-[#df3721ff] animate-pulse' : 
                      selectedVariant.ESM1b_is_pathogenic === 'benign' ? 'text-[#2a9723ff]' : 'text-[#0F172A]'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {selectedVariant.ESM1b_is_pathogenic === 'pathogenic' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      ) : selectedVariant.ESM1b_is_pathogenic === 'benign' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    <p className={`text-[14px] font-mono font-bold uppercase leading-none ${
                      selectedVariant.ESM1b_is_pathogenic === 'pathogenic' ? 'text-[#df3721ff]' : 
                      selectedVariant.ESM1b_is_pathogenic === 'benign' ? 'text-[#2a9723ff]' : 'text-[#0F172A]'
                    }`}>
                      {selectedVariant.ESM1b_is_pathogenic || "Unspecified"}
                    </p>
                    <div> 
                      <a 
                        href={`https://www.pnas.org/doi/10.1073/pnas.2016239118`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[12px] font-black text-[#b4ccd1] hover:text-[#FFCCBB] transition-colors group"
                      >
                        <span>ESM1b model</span>
                        <svg 
                          className="w-[20px] h-[20px] ml-[10px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                {/* AM - Pathogenic? */}
                <div className="flex items-center group max-w-xs mt-[-5px] mb-[10px]">
                  <div className="flex items-center gap-[8px]">
                    <svg className={`w-[30px] h-[30px] transition-all duration-300 ${
                      selectedVariant.am_class?.toLowerCase() === 'pathogenic' ? 'text-[#df3721ff] animate-pulse' : 
                      selectedVariant.am_class?.toLowerCase() === 'benign' ? 'text-[#2a9723ff]' : 
                      selectedVariant.am_class?.toLowerCase() === 'ambiguous' ? 'text-[#d8a122ff]' : 
                      'text-[#94A3B8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {selectedVariant.am_class?.toLowerCase() === 'pathogenic' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      ) : selectedVariant.am_class?.toLowerCase() === 'benign' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    <p className={`text-[14px] font-mono font-bold uppercase leading-none ${
                      selectedVariant.am_class?.toLowerCase() === 'pathogenic' ? 'text-[#df3721ff]' : 
                      selectedVariant.am_class?.toLowerCase() === 'benign' ? 'text-[#2a9723ff]' : 
                      selectedVariant.am_class?.toLowerCase() === 'ambiguous' ? 'text-[#d8a122ff]' : 
                      'text-[#0F172A]'
                    }`}>
                      {selectedVariant.am_class || "ambiguous"}
                    </p>
                    <div>
                    <a 
                      href={`https://www.science.org/doi/10.1126/science.adg7492`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[12px] font-black text-[#b4ccd1] hover:text-[#FFCCBB] transition-colors group"
                    >
                      <span>AlphaMissense model</span>
                      <svg 
                        className="w-[20px] h-[20px] ml-[10px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    </div>
                  </div>
                </div>

                <div className="px-[10px] py-[10px] border-2 border-[#F1F5F9] flex flex-col gap-[2px]">
                  {/* ESM1b LLR */}
                  <DataPoint 
                    className="mt-[-30px]"
                    label="ESM1b likelihood ratio" 
                    value={selectedVariant.ESM1b_LLR} 
                    color={selectedVariant.ESM1b_LLR < 7.5 ? "text-[#91142d]" : "text-[#0c701b]"}
                  />
                  {/* AM Pathogenicity */}
                  <DataPoint 
                    className="mt-[-30px]"
                    label="AM pathogenicity score" 
                    value={selectedVariant.am_pathogenicity} 
                    color={selectedVariant.am_pathogenicity > 0.564 ? "text-[#91142d]" : "text-[#0c701b]"}
                  />
                  {/* Stability */}
                  <DataPoint 
                    className="mt-[-30px]"
                    label="Stability (ΔΔG)" 
                    value={selectedVariant.pred_ddg} 
                    color={Math.abs(selectedVariant.pred_ddg) > 0 ? "text-[#91142d]" : "text-[#0c701b]"}
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] mt-[20px] mb-[2px]">
                    Scores
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between items-baseline max-w-xs h-[30px]">
                    <p className="text-[14px] font-black text-[#475569] tracking-widest leading-none">Destabilizing?</p>
                    <p className="text-[14px] font-mono font-bold text-[#475569] leading-none">
                      {selectedVariant.pred_ddg_label || "Unspecified"}
                    </p>
                  </div>
                  <div className="flex justify-between items-baseline max-w-xs h-[30px]">
                    <p className="text-[14px] font-black text-[#475569] tracking-widest leading-none">Interface score?</p>
                    <p className="text-[14px] font-mono font-bold text-[#475569] leading-none">
                      {selectedVariant.interface_pdockq || "Unspecified"}
                    </p>
                  </div>
                  <div className="flex justify-between items-baseline max-w-xs h-[30px]">
                    <p className="text-[14px] font-black text-[#475569] tracking-widest leading-none">Interface?</p>
                    <p className="text-[14px] font-mono font-bold text-[#475569] leading-none">
                      {selectedVariant.interface_label || "Unspecified"}
                    </p>
                  </div>
                  <div className="flex justify-between items-baseline max-w-xs h-[30px]">
                    <p className="text-[14px] font-black text-[#475569] tracking-widest leading-none">Protein pockets?</p>
                    <p className="text-[14px] font-mono font-bold text-[#475569] leading-none">
                      {selectedVariant.pocket_label || "Unspecified"}
                    </p>
                  </div>
                  <div className="flex justify-between items-baseline max-w-xs h-[30px]">
                    <p className="text-[14px] font-black text-[#475569] tracking-widest leading-none">Mechanism</p>
                    <p className="text-[14px] font-mono font-bold text-[#475569] leading-none">
                      {selectedVariant.mechanistic_label || "Unspecified"}
                    </p>
                  </div>
                </div>
                </div>
                {/* CHARACTERISTICS ----------------------------------------------------------------------------------------- */}

                {/* 3D STRUCTURE SECTION ------------------------------------------------------------------------------------ */}
                <div id="str">
                  <p className="text-[20px] border-b-2 mt-[30px] border-[#0F172A] pb-[8px] font-black text-[#475569] uppercase tracking-[0.2em] leading-none">
                    ⚙️ 3D Structure
                  </p>
                  <a
                    href="https://molstar.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-[#6EB5C0] uppercase tracking-[0.4em] hover:underline hover:text-[#FFCCBB]"
                  >
                    molstar.org
                  </a>
                  {(() => {
                    return (
                      <StructureViewer 
                        pdbId={`AF-${proteinID}-F1-model_v6`}
                        mutationPosition={mutationPos} 
                        />);
                  })()}
                </div>
                {/* 3D STRUCTURE SECTION ------------------------------------------------------------------------------------ */}

                {/* SEQUENCE SECTION ------------------------------------------------------------------------------------ */}
                <div id="seq">
                  <p className="text-[20px] mt-[30px] border-b-2 border-[#0F172A] pb-[8px] font-black text-[#475569] uppercase tracking-[0.2em] leading-none">
                    🔍 SEQUENCING
                  </p>
                  <a
                    href="https://uniprot.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-[#6EB5C0] uppercase tracking-[0.4em] hover:underline hover:text-[#FFCCBB]"
                  >
                    uniprot.org
                  </a>
                  {(() => {
                    return (
                      <SequenceViewer 
                      sequence={sequence} 
                      mutationPosition={mutationPos}
                        />);
                  })()}
                </div> 
                {/* SEQUENCE SECTION ------------------------------------------------------------------------------------ */}

                {/* GEX SECTION ------------------------------------------------------------------------------------------ */}
                <div id="gex">
                  <p className="text-[20px] mt-[30px] border-b-2 border-[#0F172A] pb-[8px] font-black text-[#475569] uppercase tracking-[0.2em] leading-none">
                    🔬 RNA EXPRESSION
                  </p>
                  <a
                    href="https://proteinatlas.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-[#6EB5C0] uppercase tracking-[0.4em] hover:underline hover:text-[#FFCCBB]"
                  >
                    proteinatlas.org
                  </a>
                  {(() => {
                    const rawId = selectedVariant?.variant_id || "";
                    const proteinId = rawId.split('/')[0];
                    return (
                        <ExpressionChart proteinId={proteinId} />);
                  })()}
                </div> 
                {/* GEX SECTION ------------------------------------------------------------------------------------------ */}

                {/* Gene Ontology SECTION ------------------------------------------------------------------------------------ */}
                <div id="go">
                  <p className="text-[20px] mt-[30px] border-b-2 border-[#0F172A] pb-[8px] font-black text-[#475569] uppercase tracking-[0.2em] leading-none">
                    🧬 GENE ONTOLOGY
                  </p>
                  <a
                    href="https://geneontology.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-[#6EB5C0] uppercase tracking-[0.4em] hover:underline hover:text-[#FFCCBB]"
                  >
                    geneontology.org
                  </a>
                  {(() => {
                    const rawId = selectedVariant?.variant_id || "";
                    const proteinId = rawId.split('/')[0];
                    return (
                      <GOViewer proteinId={proteinId} />);
                  })()}
                </div> 
                {/* Gene Ontology SECTION ------------------------------------------------------------------------------------ */}

              </div>
            ) : (
              <div className="w-full mt-[-10px] text-center">
                <p className="text-[#94A3B8] font-mono uppercase tracking-[0.4em] text-[16px]">Select or type in the variant ID</p>
              </div>
            )}

          </div> 
          {/* RIGHT HALF:  ---------------------------------------------------------------------------------------------------------------------- */}

        </div>
        {/* MAIN BODY ------------------------------------------------------------------------------------------------------------------------- */}

      </div>
      {/* closes GLOBAL */}

    </div>
    </>
  );
}

export default App;