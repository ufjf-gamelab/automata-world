import { useCallback } from "react";
import { GraphProvider, Paper, createElements, createLinks, GraphElement } from "@joint/react";

const initialElements = createElements([
    { id: "q0", label: "q0", x: 100, y: 100, initial: true, width: 60, height: 60 },
    { id: "q1", label: "q1", x: 200, y: 100,  width: 60, height: 60 },
    { id: "q2", label: "q2", x: 300, y: 100, final: true, width: 60, height: 60 },
]);
const initialLinks = createLinks([
    { id: "t1", source: "q0", target: "q1", label: "a" },
    { id: "t2", source: "q1", target: "q2", label: "up" },
]);

function DiagramExample() {
    // Renderização de cada nó
    const renderElement = useCallback((element: GraphElement) => {
        const final = element.accepting === true;
        return (
            <div
                style={{
                    padding: "15px",
                    border: final ? "5px double #000000" : "2px solid #3498db",
                    borderRadius: "30px",
                    background: "white",
                    textAlign: "center",
                }}
            >
                {element.initial && (
                    <span
                        style={{
                            position: "absolute",
                            left: "-50px",
                            top: "-5px",
                            fontSize: "50px",
                            color: "#e74c3c"

                        }}
                    >
                        →
                    </span>
                )}{" "}
                {String(element.label)}
            </div>
        );
    }, []);

    return (
        <div style={{ height: "400px", width: "90%", border: "1px solid #96fff6d9", background: "#7a91a5" }}>
            <Paper width={8000} height={400} renderElement={renderElement} useHTMLOverlay />
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
