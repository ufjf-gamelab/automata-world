import { useState } from "react";
import type { StagePermissions } from "../../game/data/types";
import { GAME_COMMANDS } from "../../game/gameConfig";
import styles from "./StageRestrictionsInfo.module.css";

interface StageRestrictionsInfoProps {
    permissions: StagePermissions;
    stageName: string;
}

/** Gera a lista de textos descritivos das restrições ativas */
function buildRestrictions(p: StagePermissions): string[] {
    const items: string[] = [];

    if (p.allowLoops === false) items.push("❌ Self-loops não são permitidos");
    if (p.allowMultipleOutgoing === false)
        items.push("❌ Cada estado pode ter no máximo uma aresta saindo");
    if (p.stateActionsAllowed === false) items.push("❌ Ações em estados desabilitadas");
    if (p.edgeActionsAllowed === false) items.push("❌ Ações nas transições desabilitadas");
    if (p.maxNodes !== undefined) items.push(`🔢 Máximo de ${p.maxNodes} estados`);
    if (p.allowedSymbols && p.allowedSymbols.length > 0)
        items.push(
            `🔤 Símbolos permitidos: ${p.allowedSymbols.map((s) => s.toUpperCase()).join(", ")}`,
        );
    if (p.allowedCommands && p.allowedCommands.length > 0) {
        const names = p.allowedCommands
            .map((k) => GAME_COMMANDS.find((c) => c.key === k)?.display ?? k)
            .join(", ");
        items.push(`🎮 Comandos disponíveis: ${names}`);
    }
    if (p.fixedTape) items.push(`📼 Fita fixada: "${p.fixedTape}"`);

    return items;
}

export default function StageRestrictionsInfo({
    permissions,
    stageName,
}: StageRestrictionsInfoProps) {
    const [isOpen, setIsOpen] = useState(false);
    const restrictions = buildRestrictions(permissions);

    if (restrictions.length === 0) return null;

    return (
        <div className={styles.wrapper}>
            <button
                className={`${styles.infoBtn} ${isOpen ? styles.infoBtnActive : ""}`}
                onClick={() => setIsOpen((o) => !o)}
                title="Ver restrições desta fase"
            >
                ℹ
            </button>

            {isOpen && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelTitle}>Restrições — {stageName}</span>
                        <button className={styles.panelClose} onClick={() => setIsOpen(false)}>
                            ✕
                        </button>
                    </div>
                    <ul className={styles.list}>
                        {restrictions.map((r, i) => (
                            <li key={i} className={styles.listItem}>
                                {r}
                            </li>
                        ))}
                    </ul>
                    <p className={styles.footer}>
                        Estas restrições foram definidas pelo criador da fase.
                    </p>
                </div>
            )}
        </div>
    );
}
