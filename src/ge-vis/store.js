export class DataStore {
    nodes = []
    links = []
    linkGraphicsArray = [];
    linkLabelGraphicsArray = [];

}

export default class GraphStore {


    hoveredNodeGfxOriginalChildren = undefined;
    hoveredNodeLabelGfxOriginalChildren = undefined;

    nodeDataToNodeGfx = new WeakMap();
    nodeGfxToNodeData = new WeakMap();
    nodeDataToLabelGfx = new WeakMap();
    labelGfxToNodeData = new WeakMap();


    addNode(node) {

    }

    addEdge(edge) {

    }

    addData(nodes, edges) {

    }

    update(nodeDataGfxPairs) {
        this.nodeDataGfxPairs = nodeDataGfxPairs

        // create lookup tables
        this.nodeDataToNodeGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, nodeGfx]));
        this.nodeGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeGfx, nodeData]));
        this.nodeDataToLabelGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, labelGfx]));
        this.labelGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [labelGfx, nodeData]));


        // add Neighbours map also.
    }

}