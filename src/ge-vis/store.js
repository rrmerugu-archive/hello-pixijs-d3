


export default class GraphStore {

    nodes = {}
    links = {}


    addNode(node) {

    }

    addEdge(edge) {

    }

    addData(nodes, edges) {

    }

    update(nodeDataGfxPairs){
        this.nodeDataGfxPairs = nodeDataGfxPairs

        // create lookup tables
        this.nodeDataToNodeGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, nodeGfx]));
        this.nodeGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeGfx, nodeData]));
        this.nodeDataToLabelGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, labelGfx]));
        this.labelGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [labelGfx, nodeData]));


        // add Neighbours map also.
    }

}