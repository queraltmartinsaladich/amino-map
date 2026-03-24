import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export const useMutationData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse('./public/data/missense_human_subset.tsv', {
      download: true,
      header: true,
      delimiter: "\t",
      skipEmptyLines: true,
      complete: (results) => {
        const truncatedData = results.data.map(row => ({
          ...row,
          variant_id: row.variant_id?.trim() || 'Unknown'
        }));
        setData(truncatedData);
        setLoading(false);
      }
    });
  }, []);

  return { data, loading };
};