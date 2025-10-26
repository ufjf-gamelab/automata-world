// src/components/ControlPanel.tsx
import React from "react";
import styles from "./ControlPanel.module.css"; // Import the CSS Module

// Define the props the component expects (callback functions)
interface ControlPanelProps {
    onRelayout: () => void;
    onImportClick: () => void;
    onExport: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onRelayout, onImportClick, onExport }) => {
    return (
        // Apply the main panel style from the CSS Module
        <div className={styles.controlPanel}>
            {/* Reorganize Button */}
            <button
                onClick={onRelayout}
                // Apply the specific button style from the CSS Module
                className={styles.recenterButton}
                title="Reorganizar & Centralizar" // Tooltip for clarity
            >
                Reorganizar
            </button>

            {/* Import Button */}
            <button
                onClick={onImportClick} // Triggers the hidden file input click
                className={styles.importButton} // Apply specific style
                title="Importar JSON"
            >
                Importar
            </button>

            {/* Export Button */}
            <button
                onClick={onExport}
                className={styles.exportButton} // Apply specific style
                title="Exportar JSON"
            >
                Exportar
            </button>
        </div>
    );
};

export default ControlPanel;
