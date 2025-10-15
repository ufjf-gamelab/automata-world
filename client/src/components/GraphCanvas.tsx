import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Declara a variável 'dagre' como global para o TypeScript
declare const dagre: any;

export interface Node {
  id: string;
  label: string;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface Point {
    x: number;
    y: number;
}

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  onEdgeDoubleClick: (edgeId: string) => void;
  recenterTrigger: number;
}

const NODE_WIDTH = 60;
const NODE_HEIGHT = 60;

const GraphCanvas: React.FC<GraphCanvasProps> = ({ nodes, edges, selectedNodeId, selectedEdgeId, onNodeClick, onEdgeClick, onEdgeDoubleClick, recenterTrigger }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    // Adicionado um bloco try-catch para capturar erros de renderização
    try {
      if (typeof dagre === 'undefined') {
        console.error('Dagre.js não foi carregado. Verifique a tag <script> no seu index.html.');
        return;
      }

      if (!svgRef.current || !gRef.current) return;

      const g = new dagre.graphlib.Graph({ multigraph: true });
      g.setGraph({ rankdir: 'LR', nodesep: 70, ranksep: 120 });
      g.setDefaultEdgeLabel(() => ({}));

      nodes.forEach((node) => g.setNode(node.id, { label: node.label, width: NODE_WIDTH, height: NODE_HEIGHT }));
      edges.forEach((edge) => g.setEdge(edge.source, edge.target, { label: edge.label }, edge.id));
      dagre.layout(g);

      const mainGroup = d3.select(gRef.current);
      mainGroup.selectAll('*').remove();
      
      const defs = mainGroup.append('defs');
      defs.append('marker').attr('id', 'arrowhead').attr('viewBox', '-0 -5 10 10').attr('refX', 30).attr('refY', 0).attr('orient', 'auto').attr('markerWidth', 6).attr('markerHeight', 6).append('svg:path').attr('d', 'M 0,-5 L 10 ,0 L 0,5').attr('fill', '#999');
      defs.append('marker').attr('id', 'arrowhead-selected').attr('viewBox', '-0 -5 10 10').attr('refX', 30).attr('refY', 0).attr('orient', 'auto').attr('markerWidth', 6).attr('markerHeight', 6).append('svg:path').attr('d', 'M 0,-5 L 10 ,0 L 0,5').attr('fill', '#007bff');
      defs.append('marker').attr('viewBox', '-0 -5 10 10').attr('refX', 0).attr('refY', 0).attr('orient', 'auto').attr('markerWidth', 6).attr('markerHeight', 6).append('svg:path').attr('d', 'M 0,-5 L 10 ,0 L 0,5').attr('fill', '#28a745');

      const initialNodeData = nodes.find(n => n.isInitial);
      if (initialNodeData) {
          const initialNodeCoords = g.node(initialNodeData.id);
          if (initialNodeCoords) {
              mainGroup.append('path').attr('d', `M ${initialNodeCoords.x - 60},${initialNodeCoords.y} L ${initialNodeCoords.x - 32},${initialNodeCoords.y}`).attr('marker-end', 'url(#arrowhead-initial)');
          }
      }
        
      const edgeGroup = mainGroup.append('g').attr('class', 'edges');
      edges.forEach(edgeData => {
          const dagreEdge = g.edge({ v: edgeData.source, w: edgeData.target, name: edgeData.id });
          if (!dagreEdge) return;
          
          const lineGenerator = d3.line<Point>().x(d => d.x).y(d => d.y).curve(d3.curveBasis);
          const edgeElement = edgeGroup.append('g').attr('class', 'edge')
            .on('click', (event) => { event.stopPropagation(); onEdgeClick(edgeData.id); })
            .on('dblclick', (event) => { event.stopPropagation(); onEdgeDoubleClick(edgeData.id); });
            
          edgeElement.append('path')
            .attr('id', `path-${edgeData.id}`)
            .attr('d', lineGenerator(dagreEdge.points))
            .attr('fill', 'none')
            .attr('stroke', edgeData.id === selectedEdgeId ? '#007bff' : '#999')
            .attr('stroke-width', edgeData.id === selectedEdgeId ? 3 : 2)
            .attr('marker-end', `url(#${edgeData.id === selectedEdgeId ? 'arrowhead-selected' : 'arrowhead'})`);

          edgeElement.append('text').append('textPath').attr('xlink:href', `#path-${edgeData.id}`).attr('startOffset', '50%').attr('text-anchor', 'middle').text(edgeData.label);
      });

      const nodeGroup = mainGroup.append('g').attr('class', 'nodes');
      nodes.forEach((nodeData) => {
        const node = g.node(nodeData.id);
        if (!node) return;
        const singleNodeGroup = nodeGroup.append('g').attr('class', 'node').attr('transform', `translate(${node.x}, ${node.y})`).on('click', (event) => { event.stopPropagation(); onNodeClick(nodeData.id); });
        singleNodeGroup.append('circle').attr('r', 30).attr('class', () => { let cls = 'outer'; if (nodeData.id === selectedNodeId) cls += ' selected'; if (nodeData.isInitial) cls += ' initial'; return cls; });
        if (nodeData.isFinal) { singleNodeGroup.append('circle').attr('r', 24).attr('class', 'inner'); }
        singleNodeGroup.append('text').attr('text-anchor', 'middle').attr('dy', '0.3em').text(node.label ?? '');
      });

      if (!zoomRef.current) {
          const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
            d3.select(gRef.current).attr('transform', event.transform.toString());
          });
          zoomRef.current = zoom;
          
          const svg = d3.select(svgRef.current);
          svg.call(zoom).on("dblclick.zoom", null);
          svg.on('click', () => { onNodeClick(''); onEdgeClick(''); });
      }
    } catch (error) {
        console.error("Ocorreu um erro ao renderizar o grafo. Verifique os dados e a biblioteca Dagre.", error);
    }
    
  }, [nodes, edges, selectedNodeId, selectedEdgeId, onNodeClick, onEdgeClick, onEdgeDoubleClick]);

  useEffect(() => {
    if (recenterTrigger === 0 && nodes.length <= 2) return; // Não recentraliza no início se já estiver visível
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const zoom = zoomRef.current;
    
    const svgNode = svg.node();
    if (!svgNode || !g.node() || !zoom) return;

    const gNode = g.node() as SVGGElement;
    const { x, y, width: gWidth, height: gHeight } = gNode.getBBox();

    if (gWidth === 0 || gHeight === 0) {
        const transform = d3.zoomIdentity.translate(svgNode.clientWidth / 2, svgNode.clientHeight / 2).scale(1);
        svg.transition().duration(750).call(zoom.transform as any, transform);
        return;
    };

    const width = svgNode.clientWidth;
    const height = svgNode.clientHeight;
    const scale = Math.min(width / gWidth, height / gHeight) * 0.65;
    const translateX = width / 2 - (x + gWidth / 2) * scale;
    const translateY = height / 2 - (y + gHeight / 2) * scale;
    const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
    svg.transition().duration(750).call(zoom.transform as any, transform);

  }, [recenterTrigger, nodes, edges]); // Adicionado nodes e edges para re-centralizar ao importar

  return (
    <div className="canvas-wrapper">
      <svg ref={svgRef} width="100%" height="100%">
        <g ref={gRef} />
      </svg>
    </div>
  );
};
export default GraphCanvas;

