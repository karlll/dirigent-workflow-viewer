import dagre from 'dagre'
import type { Node, Edge } from './graphConverter'

/**
 * Layout direction for the graph
 */
export type LayoutDirection = 'TB' | 'LR'

/**
 * Default node dimensions
 */
const NODE_WIDTH = 180
const NODE_HEIGHT = 80

/**
 * Apply dagre layout algorithm to position nodes
 * @param nodes - Nodes to layout (positions will be updated)
 * @param edges - Edges defining connections
 * @param direction - Layout direction (TB=top-to-bottom, LR=left-to-right)
 * @returns Nodes with calculated positions
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = 'LR'
): Node[] {
  // Create a new directed graph
  const graph = new dagre.graphlib.Graph()

  // Set default edge label
  graph.setDefaultEdgeLabel(() => ({}))

  // Configure graph layout
  graph.setGraph({
    rankdir: direction,
    nodesep: 80,      // Horizontal spacing between nodes
    ranksep: 120,     // Vertical spacing between ranks
    marginx: 20,
    marginy: 20
  })

  // Add nodes to the graph
  nodes.forEach(node => {
    graph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    })
  })

  // Add edges to the graph
  edges.forEach(edge => {
    graph.setEdge(edge.source, edge.target)
  })

  // Run the layout algorithm
  dagre.layout(graph)

  // Apply calculated positions to nodes
  return nodes.map(node => {
    const nodeWithPosition = graph.node(node.id)

    return {
      ...node,
      position: {
        // Center the node at the calculated position
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2
      }
    }
  })
}
