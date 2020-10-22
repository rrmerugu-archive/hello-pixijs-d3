export class DataStore {

    constructor() {
        this.clear();
    }

    clear() {
        this.nodes = []
        this.links = []
        this.linkGraphicsArray = [];
        this.linkLabelGraphicsArray = [];
    }

    checkIfElementExist(elementId, elementsData) {
        elementsData.forEach((elem) => {
            if (elementId === elem.id) {
                return true;
            }
        })
        return false
    }


    addData(nodes, links) {
        // TODO - review this logic again,
        // this where old data will be merged with the new data.
        let _this = this;
        links.forEach((link) => {
            const isElemExist = _this.checkIfElementExist(link.id, _this.links);
            // console.log("isElemExist", isElemExist, link.id);
            if (!isElemExist) {
                _this.links.push(link);
            }
        });
        nodes.forEach((node) => {
            const isElemExist = _this.checkIfElementExist(node.id, _this.nodes);
            if (!isElemExist) {
                _this.nodes.push(node);
            }
        });

        // console.log("after addition", _this.nodes.length, _this.links.length)
    }

}

export default class GraphStore {


    constructor() {
        this.clear();
    }

    clear() {
        this.hoveredNodeGfxOriginalChildren = undefined;
        this.hoveredNodeLabelGfxOriginalChildren = undefined;
        this.nodeDataToNodeGfx = new WeakMap();
        this.nodeGfxToNodeData = new WeakMap();
        this.nodeDataToLabelGfx = new WeakMap();
        this.labelGfxToNodeData = new WeakMap();
        this.nodeDataGfxPairs = [];
    }

    addNode(node) {

    }

    addEdge(edge) {

    }


    update(newNodeDataGfxPairs) {

        newNodeDataGfxPairs.forEach((nodeDataPair)=>{
            this.nodeDataGfxPairs.push(nodeDataPair)
        })



        // create lookup tables
        this.nodeDataToNodeGfx = new WeakMap(this.nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, nodeGfx]));
        this.nodeGfxToNodeData = new WeakMap(this.nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeGfx, nodeData]));
        this.nodeDataToLabelGfx = new WeakMap(this.nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, labelGfx]));
        this.labelGfxToNodeData = new WeakMap(this.nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [labelGfx, nodeData]));
        // add Neighbours map also.
    }

}
