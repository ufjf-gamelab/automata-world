import React from "react";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
    onRelayout: () => void;
    onImportClick: () => void;
    onExport: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onRelayout, onImportClick, onExport }) => {
    return (
        <div className={styles.controlPanel}>
            {/* Reorganize Button */}
            <button
                onClick={onRelayout}
                className={styles.recenterButton}
                title="Reorganizar & Centralizar"
            >
                Reorganizar
            </button>

            {/* Import Button */}
            <button onClick={onImportClick} className={styles.importButton} title="Importar JSON">
                Importar
            </button>

            {/* Export Button */}
            <button onClick={onExport} className={styles.exportButton} title="Exportar JSON">
                Exportar
            </button>
        </div>
    );
};

export default ControlPanel;
