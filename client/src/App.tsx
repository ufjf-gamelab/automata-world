import { useCallback } from "react";
import { GraphProvider, Paper, createElements, createLinks, GraphElement, GraphLink } from "@joint/react";

const initialElements = createElements([
    { id: "q0", label: "q0", x: 100, y: 150, initial: true, width: 60, height: 60 },
    { id: "q1", label: "q1", x: 200, y: 300, width: 60, height: 60 },
    { id: "q2", label: "q2", x: 300, y: 150, final: true, width: 60, height: 60 },
    { id: "q3", label: "q3", x: 500, y: 150, final: true, width: 60, height: 60 },
]);

function gerarLoopVertices(x: number, y: number, raio: number = 40, numVertices: number = 10) {
    const vertices: { x: number; y: number }[] = [];
    x += 30;

    const angInicio = Math.PI;
    const angFim = 2 * Math.PI;

    for (let i = 0; i <= numVertices; i++) {
        const t = angInicio + (i / numVertices) * (angFim - angInicio);
        const vx = x + Math.cos(t) * raio;
        const vy = y + Math.sin(t) * raio;
        vertices.push({ x: vx, y: vy });
    }

    return vertices;
}

const initialLinks = createLinks([
    { id: "t1", source: "q0", target: "q1", labels: [{ attrs: { text: { text: "a" } } }] },
    { id: "t2", source: "q1", target: "q2", labels: [{ attrs: { text: { text: "b" } } }] },
    { id: "t3", source: "q0", target: "q2", labels: [{ attrs: { text: { text: "b" } } }] },
    {
        id: "t4",
        source: "q2",
        target: "q2",
        vertices: gerarLoopVertices(initialElements[2].x, initialElements[2].y),
        smooth: true,
        labels: [{ attrs: { text: { text: "a", fill: "#000" } } }],
    },
    { id: "t5", source: "q2", target: "q3", labels: [{ attrs: { text: { text: "b" } } }] },
    { id: "t6", source: "q3", target: "q2", labels: [{ attrs: { text: { text: "a" } } }] },
]);

function DiagramExample() {
    // Renderização de cada nó
    const renderElement = useCallback((element: GraphElement) => {
        const final = element.final === true;
        return (
            <div
                style={{
                    padding: "15px",
                    border: final ? "5px double #000000" : "2px solid #000000",
                    borderRadius: "30px",
                    background: "white",
                    textAlign: "center",
                    position: "relative",
                }}
            >
                {element.initial && (
                    <span
                        style={{
                            position: "absolute",
                            left: "-50px",
                            top: "-5px",
                            fontSize: "50px",
                            color: "#e74c3c",
                        }}
                    >
                        →
                    </span>
                )}
                {String(element.label)}
            </div>
        );
    }, []);

    return (
        <div
            style={{
                height: "400px",
                width: "90%",
                border: "1px solid #96fff6d9",
                background: "#7a91a5",
            }}
        >
            <svg style={{ position: "absolute", width: 0, height: 0 }}>
                <defs>
                    <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
                    </marker>
                </defs>
            </svg>

            <Paper width={800} height={400} renderElement={renderElement} useHTMLOverlay />
        </div>
    );
}

// App com GraphProvider
export default function App() {
    return (
        <GraphProvider initialElements={initialElements} initialLinks={initialLinks}>
            <DiagramExample />
        </GraphProvider>
    );
}
