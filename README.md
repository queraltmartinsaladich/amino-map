```markdown
# 🧬 Amino-Mapp
### An Interactive Protein Mutation Browser

**Amino-Mapp** is a specialized React-based dashboard designed for the exploration and analysis of protein variants. Developed by Queralt Martín-Saladich as an interview test for the **Beltrao Group (ETH Zürich)**, it bridges the gap between raw mutation data and biological context by integrating sequence visualization, 3D structural modeling, and functional annotations into a single, cohesive research tool.

---

## 📂 Project Structure

```text
amino-map/
├── public/
│   ├── data/               # Master TSV datasets (missense_human_subset.tsv)
│   └── structures/         # AlphaFold PDB models (AF-P12235-F1-model_v6.pdb)
├── src/
│   ├── components/         # UI modules (StructureViewer, GOViewer, etc.)
│   ├── hooks/              # Custom logic for fetching & filtering data
│   ├── App.jsx             # Main application logic and layout
│   └── main.jsx            # Entry point (Vite/React)
├── references.md           # Academic and data source citations
├── tutorial.pdf            # User guide for researchers
└── vite.config.js          # Project configuration
```

---

## ✨ Features

* **Multi-Model Pathogenicity Scoring:** Side-by-side comparison of **AlphaMissense (AM)** and **ESM1b** predictions.
* **Interactive 3D Visualization:** Integrated **Molstar (Mol*)** viewer for mapping mutations directly onto AlphaFold structural models.
* **Bio-Data Integration:**
    * **UniProt:** Automated fetching of protein functions, gene names, and organism data via REST API.
    * **Gene Ontology (GO):** Functional classification viewer for biological processes and molecular functions.
    * **Protein Atlas:** Tissue-specific RNA expression charts (`ExpressionChart`).
* **Smart Mutation Analysis:** * Calculates **Property Shifts** (e.g., *Small Hydrophobic → Large Polar*).
    * Detects **Charge Reversals** and local geometry context (Alpha Helix vs. Beta Strand).
* **Research Workflow Tools:**
    * **Bulk Load:** Process lists of variants from `.txt` or `.csv` files.
    * **Session Persistence:** `LocalStorage` support to save and resume your search history.
    * **Professional Reporting:** One-click "Print to PDF" for clean, research-ready mutation reports.

---

## 🛠️ Technical Implementation

### Core Components
| Component | Description |
| :--- | :--- |
| `StructureViewer` | Renders `.pdb` files from the local directory using WebGL. |
| `ProteinTable` | A high-performance filtered list for navigating thousands of variants. |
| `SequenceViewer` | Maps UniProt sequence data and highlights specific residue changes. |
| `ExpressionChart` | Visualizes RNA-seq data from the Human Protein Atlas. |
| `GOViewer` | Displays Gene Ontology terms related to the selected protein. |

### Data Management (Custom Hooks)
* `useMutationData`: Loads and parses the master `missense_human_subset.tsv` file.
* `useUniProt`: Fetches biological metadata in real-time.
* `useProteinData`: Handles complex searching, pagination, and multi-tier filtering logic.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0 or higher)
* `npm` or `yarn`

### Installation
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/queraltmartinsaladich/amino-map.git](https://github.com/queraltmartinsaladich/amino-map.git)
    cd amino-map
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run in Development Mode:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## 📖 Usage Guide

1.  **Search:** Enter a Variant ID (e.g., `P12235/A126C`) in the search bar.
2.  **Filter:** Use the toggle buttons to isolate "Pathogenic" or "Benign" variants as predicted by ESM1b or AlphaMissense.
3.  **Analyze:** Click a row to load the 3D structure, local sequence context, and expression profile.
4.  **Export:** Use the "Export" button to save your current session history as a CSV for use in external tools.

---

## 🤝 Contributing
This project is an open-source tool for the bioinformatics community.
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/NewAnalysis`).
3. Commit your Changes (`git commit -m 'Add new analysis metric'`).
4. Push to the Branch (`git push origin feature/NewAnalysis`).
5. Open a Pull Request.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**This was developed as an interview test for:** [Beltrao Group - ETH Zürich](https://imsb.ethz.ch/research/beltrao.html)  
**Project Link:** [https://github.com/queraltmartinsaladich/amino-map](https://github.com/queraltmartinsaladich/amino-map)
```