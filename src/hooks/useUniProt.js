import { useState, useEffect } from 'react';

export const useUniProt = (uniprotId) => {
  const [bioData, setBioData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. If ID is missing, wipe data and exit
    if (!uniprotId) {
      setBioData(null);
      return;
    }

    // 2. CRITICAL: Reset state immediately so the OLD data disappears 
    // while the NEW data fetches.
    setBioData(null); 
    setLoading(true);

    const controller = new AbortController();

    const fetchUniProt = async () => {
      try {
        const response = await fetch(
          `https://rest.uniprot.org/uniprotkb/${uniprotId}.txt`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error('Not Found');
        const text = await response.text();

        // 3. Regex Parsing
        const nameMatch = text.match(/DE   RecName: Full=([^;]+);/);
        const geneMatch = text.match(/GN   Name=([^; ]+)/);
        const organismMatch = text.match(/OS   ([^.]+)\./);
        const functionMatch = text.match(/CC   -!- FUNCTION: ([\s\S]*?)(?=CC   -!-|CC   -------|\n\n)/);

        const parsedData = {
          fullName: nameMatch ? nameMatch[1].trim() : "Unknown Protein",
          geneName: geneMatch ? geneMatch[1].trim() : "N/A",
          organism: organismMatch ? organismMatch[1].trim() : "Unknown Organism",
          function: functionMatch 
            ? functionMatch[1].replace(/\nCC\s+/g, ' ').trim() 
            : "No functional description available."
        };

        // 4. Only update if the user hasn't clicked something else already
        if (!controller.signal.aborted) {
          setBioData(parsedData);
          setLoading(false);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("UniProt Fetch Error:", error);
          setLoading(false);
        }
      }
    };

    fetchUniProt();

    return () => controller.abort();
  }, [uniprotId]); // Hook MUST depend on uniprotId

  return { bioData, loading };
};