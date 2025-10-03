import { dia, shapes } from "@joint/core";
// import { createElements, createLinks } from "@joint/react";
import "./App.css";

function App() {
    const namespace = shapes;

    const graph = new dia.Graph({}, { cellNamespace: namespace });

    const paper = new dia.Paper({
        el: document.getElementById("paper"),
        model: graph,
        width: "90vw",
        height: "90vh",
        background: { color: "#F5F5F5" },
        cellViewNamespace: namespace,
    });

    // /* --- estado inicial (já com createElements/createLinks) --- */
    // const initialStates = createElements([
    //     { id: "q0", label: "q0", x: 100, y: 100, initial: true, width: 60, height: 60 },
    //     { id: "q1", label: "q1", x: 200, y: 100, accepting: false, width: 60, height: 60 },
    //     { id: "q2", label: "q2", x: 300, y: 100, accepting: true, width: 60, height: 60 },
    // ]);
    // const initialLinks = createLinks([
    //     { id: "t1", source: "q0", target: "q1", label: "a" },
    //     { id: "t2", source: "q1", target: "q2", label: "a" },
    // ]);

    const state = new shapes.standard.Circle();
    state.position(200, 200); // posição
    state.resize(80, 80); // tamanho
    state.attr({
        body: {
            fill: "#ffffff",
            stroke: "#000000",
            strokeWidth: 2,
        },
        label: {
            text: "q0", // Nome do estado
            fill: "#000000",
            fontSize: 16,
        },
    });
    graph.addCell(state);

    const finalState = new shapes.standard.Circle();
    finalState.position(400, 200);
    finalState.resize(80, 80);
    finalState.attr({
        body: {
            fill: "#ffffff",
            stroke: "#000000",
            strokeWidth: 5,
        },
        label: {
            text: "q1",
            fill: "#000000",
            fontSize: 16,
        },
    });
    graph.addCell(finalState);

    
    // Exemplo: criar transição (seta)
    const link = new shapes.standard.Link();
    link.source(state);
    link.target(finalState);
    link.attr({
        line: {
            stroke: "#000000",
            strokeWidth: 2,
            targetMarker: {
                type: "path",
                d: "M 10 -5 0 0 10 5 Z", // seta
            },
        },
    });
    graph.addCell(link);

    return <div id="paper"></div>;
}

export default App;
