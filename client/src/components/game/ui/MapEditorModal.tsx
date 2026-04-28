import { useState, useEffect } from "react";
import type { Stage, StagePermissions, GraphNodeData, GraphEdgeData } from "../data/types";
import { GAME_COMMANDS } from "../gameConfig";
import styles from "./MapEditorModal.module.css";

// ── Tipos internos ────────────────────────────────────────────────────────────

type CellType = "empty" | "tile" | "button";
interface Cell {
    type: CellType;
    height: number;
}
type Tab = "map" | "player" | "permissions" | "automaton" | "tape";

// ── Helpers de mapa ───────────────────────────────────────────────────────────

function cellToChar(cell: Cell): string {
    if (cell.type === "empty") return "-";
    if (cell.type === "button") return cell.height === 5 ? "0" : String(cell.height + 5);
    return String(cell.height);
}

function charToCell(char: string): Cell {
    if (char === " " || char === "-") return { type: "empty", height: 1 };
    const val = parseInt(char);
    if (isNaN(val)) return { type: "empty", height: 1 };
    if (val === 0) return { type: "button", height: 5 };
    if (val > 5) return { type: "button", height: val - 5 };
    return { type: "tile", height: val };
}

function gridToFloor(grid: Cell[][], cols: number, rows: number): string {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) =>
            cellToChar(grid[r]?.[c] ?? { type: "empty", height: 1 }),
        ).join(""),
    ).join("\n");
}

function floorToGrid(floor: string, cols: number, rows: number): Cell[][] {
    const lines = floor.split("\n");
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => charToCell(lines[r]?.[c] ?? "-")),
    );
}

function cellBg(cell: Cell, isPlayer: boolean): string {
    if (isPlayer) return "#facc15";
    if (cell.type === "empty") return "transparent";
    const brightness = 35 + cell.height * 10;
    return cell.type === "button"
        ? `hsl(211, 80%, ${brightness}%)`
        : `hsl(211, 61%, ${brightness}%)`;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const DIRECTIONS = [
    { index: 2, label: "Norte", icon: "⬆" },
    { index: 0, label: "Sul", icon: "⬇" },
    { index: 1, label: "Leste", icon: "➡" },
    { index: 3, label: "Oeste", icon: "⬅" },
];

const NONE_OPTION = "— nenhuma —";

/** Dropdown de ação reutilizável */
function ActionSelect({
    value,
    onChange,
    allowedCommands,
}: {
    value: string | undefined;
    onChange: (v: string | undefined) => void;
    allowedCommands?: string[];
}) {
    const commands = allowedCommands
        ? GAME_COMMANDS.filter((c) => allowedCommands.includes(c.key))
        : GAME_COMMANDS;

    return (
        <select
            className={styles.fieldSelect}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
        >
            <option value="">{NONE_OPTION}</option>
            {commands.map((cmd) => (
                <option key={cmd.key} value={cmd.key}>
                    {cmd.display} ({cmd.key})
                </option>
            ))}
        </select>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface MapEditorModalProps {
    stage?: Stage;
    onSave: (stage: Stage) => void;
    onClose: () => void;
}

const MIN_SIZE = 1;
const MAX_SIZE = 12;

export default function MapEditorModal({ stage, onSave, onClose }: MapEditorModalProps) {
    const isEditing = stage !== undefined;
    const [activeTab, setActiveTab] = useState<Tab>("map");
    const [error, setError] = useState("");

    // ── Nome ──
    const [name, setName] = useState(stage?.name ?? "Novo Mapa");

    // ── Grid ──
    const [size, setSize] = useState(() => {
        if (!stage) return { cols: 5, rows: 5 };
        const lines = stage.floor.split("\n");
        return { rows: lines.length, cols: Math.max(...lines.map((l) => l.length)) };
    });
    const [grid, setGrid] = useState<Cell[][]>(() =>
        floorToGrid(stage?.floor ?? "", size.cols, size.rows),
    );
    const [selectedHeight, setSelectedHeight] = useState(1);
    const [selectedType, setSelectedType] = useState<CellType>("tile");
    const [placingPlayer, setPlacingPlayer] = useState(false);

    // ── Jogador ──
    const [playerPos, setPlayerPos] = useState<[number, number]>(stage?.playerPosition ?? [0, 0]);
    const [initialRotation, setInitialRotation] = useState(stage?.initialRotation ?? 0);

    // ── Permissões ──
    const existingPerms = stage?.permissions;
    const [allowLoops, setAllowLoops] = useState(existingPerms?.allowLoops !== false);
    const [allowMultipleOutgoing, setAllowMultipleOutgoing] = useState(
        existingPerms?.allowMultipleOutgoing !== false,
    );
    const [stateActionsAllowed, setStateActionsAllowed] = useState(
        existingPerms?.stateActionsAllowed !== false,
    );
    const [edgeActionsAllowed, setEdgeActionsAllowed] = useState(
        existingPerms?.edgeActionsAllowed !== false,
    );
    const [maxNodesInput, setMaxNodesInput] = useState(existingPerms?.maxNodes?.toString() ?? "");
    const [allowedSymbolsInput, setAllowedSymbolsInput] = useState(
        existingPerms?.allowedSymbols?.join(", ") ?? "",
    );
    // Comandos permitidos: undefined = todos; array = lista
    const [allowedCommands, setAllowedCommands] = useState<string[] | undefined>(
        existingPerms?.allowedCommands,
    );

    // ── Fita ──
    const [useFixedTape, setUseFixedTape] = useState(existingPerms?.fixedTape !== undefined);
    const [tapeValue, setTapeValue] = useState(existingPerms?.fixedTape ?? "");

    // ── Autômato ──
    const [autoNodes, setAutoNodes] = useState<GraphNodeData[]>(stage?.initialGraph?.nodes ?? []);
    const [autoEdges, setAutoEdges] = useState<GraphEdgeData[]>(stage?.initialGraph?.edges ?? []);

    const [newNode, setNewNode] = useState<GraphNodeData>({
        id: "",
        label: "",
        isInitial: false,
        isFinal: false,
        action: undefined,
    });
    const [newEdge, setNewEdge] = useState<GraphEdgeData>({
        source: "",
        target: "",
        label: "",
        action: undefined,
    });

    // Redimensiona o grid quando o tamanho muda
    useEffect(() => {
        setGrid((prev) =>
            Array.from({ length: size.rows }, (_, r) =>
                Array.from(
                    { length: size.cols },
                    (_, c) => prev[r]?.[c] ?? { type: "empty", height: 1 },
                ),
            ),
        );
        setPlayerPos(([px, pz]) => [Math.min(px, size.cols - 1), Math.min(pz, size.rows - 1)]);
    }, [size.cols, size.rows]);

    // ── Handlers mapa ─────────────────────────────────────────────────────────

    const handleCellClick = (col: number, row: number) => {
        if (placingPlayer) {
            if (grid[row][col].type === "empty") return;
            setPlayerPos([col, row]);
            setPlacingPlayer(false);
            return;
        }
        setGrid((prev) => {
            const next = prev.map((r) => [...r]);
            next[row][col] =
                selectedType === "empty"
                    ? { type: "empty", height: 1 }
                    : { type: selectedType, height: selectedHeight };
            return next;
        });
    };

    const changeSize = (axis: "cols" | "rows", delta: number) =>
        setSize((prev) => ({
            ...prev,
            [axis]: Math.max(MIN_SIZE, Math.min(MAX_SIZE, prev[axis] + delta)),
        }));

    // ── Handlers autômato ─────────────────────────────────────────────────────

    const addNode = () => {
        if (!newNode.id.trim() || !newNode.label.trim()) {
            setError("ID e label são obrigatórios.");
            return;
        }
        if (autoNodes.find((n) => n.id === newNode.id)) {
            setError("ID de estado já existe.");
            return;
        }
        setAutoNodes((prev) => [...prev, { ...newNode }]);
        setNewNode({ id: "", label: "", isInitial: false, isFinal: false, action: undefined });
        setError("");
    };

    const removeNode = (id: string) => {
        setAutoNodes((prev) => prev.filter((n) => n.id !== id));
        setAutoEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    };

    const addEdge = () => {
        if (!newEdge.source || !newEdge.target || !newEdge.label) {
            setError("Preencha os campos da transição.");
            return;
        }
        setAutoEdges((prev) => [...prev, { ...newEdge }]);
        setNewEdge({ source: "", target: "", label: "", action: undefined });
        setError("");
    };

    const removeEdge = (i: number) => setAutoEdges((prev) => prev.filter((_, idx) => idx !== i));

    // ── Salvar ────────────────────────────────────────────────────────────────

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("O mapa precisa de um nome.");
            return;
        }

        const startCell = grid[playerPos[1]]?.[playerPos[0]];
        if (!startCell || startCell.type === "empty") {
            setError("A posição inicial do jogador deve estar em um tile válido.");
            return;
        }

        // Constrói as permissões a partir dos estados individuais
        const parsedMaxNodes = maxNodesInput ? parseInt(maxNodesInput) : undefined;
        const parsedSymbols = allowedSymbolsInput
            ? allowedSymbolsInput
                  .split(",")
                  .map((s) => s.trim().toLowerCase())
                  .filter(Boolean)
            : undefined;

        // Só inclui permissões no Stage se alguma restrição foi configurada
        const hasRestrictions =
            !allowLoops ||
            !allowMultipleOutgoing ||
            !stateActionsAllowed ||
            !edgeActionsAllowed ||
            parsedMaxNodes !== undefined ||
            (parsedSymbols && parsedSymbols.length > 0) ||
            allowedCommands !== undefined ||
            useFixedTape;

        const permissions: StagePermissions | undefined = hasRestrictions
            ? {
                  allowLoops: allowLoops || undefined,
                  allowMultipleOutgoing: allowMultipleOutgoing || undefined,
                  stateActionsAllowed: stateActionsAllowed || undefined,
                  edgeActionsAllowed: edgeActionsAllowed || undefined,
                  maxNodes: parsedMaxNodes,
                  allowedSymbols: parsedSymbols,
                  allowedCommands: allowedCommands,
                  fixedTape: useFixedTape ? tapeValue.toUpperCase() || undefined : undefined,
              }
            : undefined;

        onSave({
            id: stage?.id ?? -Date.now(),
            name: trimmedName,
            floor: gridToFloor(grid, size.cols, size.rows),
            playerPosition: playerPos,
            initialRotation: initialRotation !== 0 ? initialRotation : undefined,
            permissions,
            initialGraph: autoNodes.length > 0 ? { nodes: autoNodes, edges: autoEdges } : undefined,
        });
    };

    // ── Abas ──────────────────────────────────────────────────────────────────

    const tabs: { id: Tab; label: string }[] = [
        { id: "map", label: "🗺 Mapa" },
        { id: "player", label: "🧍 Jogador" },
        { id: "permissions", label: "🔒 Permissões" },
        { id: "automaton", label: "⚙ Autômato" },
        { id: "tape", label: "📼 Fita" },
    ];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <input
                        className={styles.nameInput}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nome do mapa"
                        maxLength={40}
                    />
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Abas */}
                <div className={styles.tabs}>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className={styles.body}>
                    {/* ══ Mapa ══ */}
                    {activeTab === "map" && (
                        <div className={styles.tabContent}>
                            <div className={styles.toolbar}>
                                <span className={styles.toolLabel}>Tipo de tile</span>
                                <div className={styles.typeRow}>
                                    {(["tile", "button", "empty"] as CellType[]).map((t) => (
                                        <button
                                            key={t}
                                            className={`${styles.typeBtn} ${selectedType === t ? styles.typeBtnActive : ""}`}
                                            onClick={() => setSelectedType(t)}
                                        >
                                            {t === "tile"
                                                ? "🟦 Tile"
                                                : t === "button"
                                                  ? "🔘 Botão"
                                                  : "✕ Apagar"}
                                        </button>
                                    ))}
                                </div>

                                {selectedType !== "empty" && (
                                    <>
                                        <span className={styles.toolLabel}>
                                            Altura: {selectedHeight}
                                        </span>
                                        <div className={styles.heightRow}>
                                            {[1, 2, 3, 4, 5].map((h) => (
                                                <button
                                                    key={h}
                                                    className={`${styles.heightBtn} ${selectedHeight === h ? styles.heightBtnActive : ""}`}
                                                    onClick={() => setSelectedHeight(h)}
                                                >
                                                    {h}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <span className={styles.toolLabel}>Tamanho</span>
                                <div className={styles.sizeRow}>
                                    <span className={styles.sizeLabel}>Cols: {size.cols}</span>
                                    <button
                                        className={styles.sizeBtn}
                                        onClick={() => changeSize("cols", -1)}
                                    >
                                        −
                                    </button>
                                    <button
                                        className={styles.sizeBtn}
                                        onClick={() => changeSize("cols", +1)}
                                    >
                                        +
                                    </button>
                                    <span className={styles.sizeLabel}>Rows: {size.rows}</span>
                                    <button
                                        className={styles.sizeBtn}
                                        onClick={() => changeSize("rows", -1)}
                                    >
                                        −
                                    </button>
                                    <button
                                        className={styles.sizeBtn}
                                        onClick={() => changeSize("rows", +1)}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className={`${styles.playerBtn} ${placingPlayer ? styles.playerBtnActive : ""}`}
                                    onClick={() => setPlacingPlayer((p) => !p)}
                                >
                                    🧍 {placingPlayer ? "Clique em um tile…" : "Posição do jogador"}
                                </button>

                                <div className={styles.legend}>
                                    <span>🟨 posição inicial</span>
                                    <span>◉ botão</span>
                                    <span>Claro = maior altura</span>
                                </div>
                            </div>

                            <div className={styles.gridWrapper}>
                                <div
                                    className={styles.grid}
                                    style={{ gridTemplateColumns: `repeat(${size.cols}, 28px)` }}
                                >
                                    {Array.from({ length: size.rows }, (_, r) =>
                                        Array.from({ length: size.cols }, (_, c) => {
                                            const cell = grid[r]?.[c] ?? {
                                                type: "empty",
                                                height: 1,
                                            };
                                            const isPlayer =
                                                playerPos[0] === c && playerPos[1] === r;
                                            return (
                                                <div
                                                    key={`${r}-${c}`}
                                                    className={`${styles.cell} ${cell.type === "empty" ? styles.cellEmpty : ""}`}
                                                    style={{
                                                        backgroundColor: cellBg(cell, isPlayer),
                                                    }}
                                                    onClick={() => handleCellClick(c, r)}
                                                >
                                                    {isPlayer && (
                                                        <span className={styles.playerDot}>●</span>
                                                    )}
                                                    {cell.type === "button" && !isPlayer && (
                                                        <span className={styles.buttonDot}>◉</span>
                                                    )}
                                                </div>
                                            );
                                        }),
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ Jogador ══ */}
                    {activeTab === "player" && (
                        <div className={styles.scrollContent}>
                            <section className={styles.section}>
                                <h4 className={styles.sectionTitle}>Direção inicial do jogador</h4>
                                <div className={styles.dirGrid}>
                                    {DIRECTIONS.map((d) => (
                                        <button
                                            key={d.index}
                                            className={`${styles.dirBtn} ${initialRotation === d.index ? styles.dirBtnActive : ""}`}
                                            onClick={() => setInitialRotation(d.index)}
                                        >
                                            <span className={styles.dirIcon}>{d.icon}</span>
                                            <span className={styles.dirLabel}>{d.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ══ Permissões ══ */}
                    {activeTab === "permissions" && (
                        <div className={styles.scrollContent}>
                            <section className={styles.section}>
                                <h4 className={styles.sectionTitle}>Restrições do autômato</h4>
                                <p className={styles.hint}>
                                    Defina o que o aluno pode ou não fazer ao construir o autômato
                                    para esta fase. Restrições não configuradas ficam liberadas.
                                </p>

                                <div className={styles.permGrid}>
                                    <label className={styles.permRow}>
                                        <input
                                            type="checkbox"
                                            checked={allowLoops}
                                            onChange={(e) => setAllowLoops(e.target.checked)}
                                        />
                                        Permitir self-loops (aresta de um estado para ele mesmo)
                                    </label>
                                    <label className={styles.permRow}>
                                        <input
                                            type="checkbox"
                                            checked={allowMultipleOutgoing}
                                            onChange={(e) =>
                                                setAllowMultipleOutgoing(e.target.checked)
                                            }
                                        />
                                        Permitir múltiplas arestas saindo do mesmo estado
                                    </label>
                                    <label className={styles.permRow}>
                                        <input
                                            type="checkbox"
                                            checked={stateActionsAllowed}
                                            onChange={(e) =>
                                                setStateActionsAllowed(e.target.checked)
                                            }
                                        />
                                        Permitir ações nos estados
                                    </label>
                                    <label className={styles.permRow}>
                                        <input
                                            type="checkbox"
                                            checked={edgeActionsAllowed}
                                            onChange={(e) =>
                                                setEdgeActionsAllowed(e.target.checked)
                                            }
                                        />
                                        Permitir ações nas transições
                                    </label>

                                    <div className={styles.permField}>
                                        <label className={styles.fieldLabel}>
                                            Máximo de estados (vazio = sem limite)
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            className={styles.fieldInput}
                                            value={maxNodesInput}
                                            onChange={(e) => setMaxNodesInput(e.target.value)}
                                            placeholder="ex: 3"
                                        />
                                    </div>

                                    <div className={styles.permField}>
                                        <label className={styles.fieldLabel}>
                                            Símbolos permitidos nas transições (vazio = todos,
                                            separe por vírgula)
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.fieldInput}
                                            value={allowedSymbolsInput}
                                            onChange={(e) => setAllowedSymbolsInput(e.target.value)}
                                            placeholder="ex: f, n, b"
                                        />
                                    </div>

                                    <div className={styles.permField}>
                                        <label className={styles.fieldLabel}>
                                            Comandos de jogo disponíveis nos modais
                                        </label>
                                        <div className={styles.commandCheckGrid}>
                                            {GAME_COMMANDS.map((cmd) => {
                                                const isChecked =
                                                    !allowedCommands ||
                                                    allowedCommands.includes(cmd.key);
                                                return (
                                                    <label key={cmd.key} className={styles.permRow}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                const current =
                                                                    allowedCommands ??
                                                                    GAME_COMMANDS.map((c) => c.key);
                                                                const next = e.target.checked
                                                                    ? [...current, cmd.key]
                                                                    : current.filter(
                                                                          (k) => k !== cmd.key,
                                                                      );
                                                                setAllowedCommands(
                                                                    next.length ===
                                                                        GAME_COMMANDS.length
                                                                        ? undefined
                                                                        : next,
                                                                );
                                                            }}
                                                        />
                                                        {cmd.display} <em>({cmd.key})</em>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ══ Autômato ══ */}
                    {activeTab === "automaton" && (
                        <div className={styles.scrollContent}>
                            <p className={styles.hint}>
                                Defina estados e transições que já estarão no canvas ao entrar na
                                fase. Deixe vazio para o aluno construir do zero.
                            </p>

                            {/* Estados */}
                            <section className={styles.section}>
                                <h4 className={styles.sectionTitle}>Estados</h4>

                                {autoNodes.length > 0 && (
                                    <div className={styles.itemList}>
                                        {autoNodes.map((n) => (
                                            <div key={n.id} className={styles.item}>
                                                <span className={styles.itemBadge}>
                                                    {n.isInitial ? "▶ " : ""}
                                                    {n.isFinal ? "◎" : "○"}
                                                </span>
                                                <span className={styles.itemMain}>
                                                    <b>{n.label}</b> (id: {n.id})
                                                    {n.action && (
                                                        <em>
                                                            {" "}
                                                            →{" "}
                                                            {GAME_COMMANDS.find(
                                                                (c) => c.key === n.action,
                                                            )?.display ?? n.action}
                                                        </em>
                                                    )}
                                                </span>
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={() => removeNode(n.id)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={styles.addForm}>
                                    <div className={styles.formRow}>
                                        <input
                                            className={styles.fieldInput}
                                            placeholder="ID (ex: 0)"
                                            value={newNode.id}
                                            onChange={(e) =>
                                                setNewNode((p) => ({
                                                    ...p,
                                                    id: e.target.value.trim(),
                                                }))
                                            }
                                        />
                                        <input
                                            className={styles.fieldInput}
                                            placeholder="Label (ex: q0)"
                                            value={newNode.label}
                                            onChange={(e) =>
                                                setNewNode((p) => ({ ...p, label: e.target.value }))
                                            }
                                        />
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>
                                                Ação ao entrar
                                            </label>
                                            <ActionSelect
                                                value={newNode.action}
                                                onChange={(v) =>
                                                    setNewNode((p) => ({ ...p, action: v }))
                                                }
                                                allowedCommands={allowedCommands}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <label className={styles.permRow}>
                                            <input
                                                type="checkbox"
                                                checked={newNode.isInitial ?? false}
                                                onChange={(e) =>
                                                    setNewNode((p) => ({
                                                        ...p,
                                                        isInitial: e.target.checked,
                                                    }))
                                                }
                                            />
                                            Inicial
                                        </label>
                                        <label className={styles.permRow}>
                                            <input
                                                type="checkbox"
                                                checked={newNode.isFinal ?? false}
                                                onChange={(e) =>
                                                    setNewNode((p) => ({
                                                        ...p,
                                                        isFinal: e.target.checked,
                                                    }))
                                                }
                                            />
                                            Final
                                        </label>
                                        <button className={styles.addBtn} onClick={addNode}>
                                            ＋ Adicionar estado
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Transições */}
                            <section className={styles.section}>
                                <h4 className={styles.sectionTitle}>Transições</h4>

                                {autoEdges.length > 0 && (
                                    <div className={styles.itemList}>
                                        {autoEdges.map((e, i) => (
                                            <div key={i} className={styles.item}>
                                                <span className={styles.itemMain}>
                                                    {e.source} <b>–{e.label.toUpperCase()}→</b>{" "}
                                                    {e.target}
                                                    {e.action && (
                                                        <em>
                                                            {" "}
                                                            (
                                                            {GAME_COMMANDS.find(
                                                                (c) => c.key === e.action,
                                                            )?.display ?? e.action}
                                                            )
                                                        </em>
                                                    )}
                                                </span>
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={() => removeEdge(i)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={styles.addForm}>
                                    <div className={styles.formRow}>
                                        <input
                                            className={styles.fieldInput}
                                            placeholder="De (id)"
                                            value={newEdge.source}
                                            onChange={(e) =>
                                                setNewEdge((p) => ({
                                                    ...p,
                                                    source: e.target.value.trim(),
                                                }))
                                            }
                                        />
                                        <input
                                            className={styles.fieldInput}
                                            placeholder="Para (id)"
                                            value={newEdge.target}
                                            onChange={(e) =>
                                                setNewEdge((p) => ({
                                                    ...p,
                                                    target: e.target.value.trim(),
                                                }))
                                            }
                                        />
                                        <input
                                            className={styles.fieldInput}
                                            placeholder="Símbolo"
                                            maxLength={1}
                                            value={newEdge.label}
                                            onChange={(e) =>
                                                setNewEdge((p) => ({
                                                    ...p,
                                                    label: e.target.value.toLowerCase().slice(0, 1),
                                                }))
                                            }
                                        />
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.fieldLabel}>Ação</label>
                                            <ActionSelect
                                                value={newEdge.action}
                                                onChange={(v) =>
                                                    setNewEdge((p) => ({ ...p, action: v }))
                                                }
                                                allowedCommands={allowedCommands}
                                            />
                                        </div>
                                    </div>
                                    <button className={styles.addBtn} onClick={addEdge}>
                                        ＋ Adicionar transição
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ══ Fita ══ */}
                    {activeTab === "tape" && (
                        <div className={styles.scrollContent}>
                            <section className={styles.section}>
                                <h4 className={styles.sectionTitle}>Fita de entrada</h4>
                                <p className={styles.hint}>
                                    Configure se a fita vem pré-preenchida e travada, ou apenas como
                                    sugestão editável.
                                </p>

                                <label className={styles.toggleLabel}>
                                    <input
                                        type="checkbox"
                                        checked={useFixedTape}
                                        onChange={(e) => setUseFixedTape(e.target.checked)}
                                    />
                                    Fixar a fita (aluno não pode editar)
                                </label>

                                <div className={styles.permField}>
                                    <label className={styles.fieldLabel}>
                                        {useFixedTape
                                            ? "Valor fixo da fita"
                                            : "Sugestão inicial (aluno pode alterar)"}
                                    </label>
                                    <input
                                        type="text"
                                        className={`${styles.fieldInput} ${styles.tapeInput}`}
                                        value={tapeValue}
                                        onChange={(e) =>
                                            setTapeValue(
                                                e.target.value.toUpperCase().replace(/[^A-Z]/g, ""),
                                            )
                                        }
                                        placeholder="ex: FNFB"
                                    />
                                    <span className={styles.hint}>
                                        Apenas letras A–Z (símbolos do alfabeto do autômato).
                                    </span>
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Cancelar
                    </button>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        {isEditing ? "💾 Salvar alterações" : "✅ Criar mapa"}
                    </button>
                </div>
            </div>
        </div>
    );
}
