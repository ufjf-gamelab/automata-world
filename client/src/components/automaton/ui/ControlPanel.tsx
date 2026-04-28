import React from "react";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
    onRelayout: () => void;
    onCenter: () => void;
    onImportClick: () => void;
    onExport: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onRelayout, onCenter }) => {
    return (
        <div className={styles.controlPanel}>
            <button
                onClick={onRelayout}
                className={styles.relayoutButton}
                title="Reorganizar layout"
            >
                Reorganizar
            </button>
            <button
                onClick={onCenter}
                className={styles.centerButton}
                title="Centralizar grafo na tela"
            >
                Centralizar
            </button>
        </div>
    );
};

export default ControlPanel;
