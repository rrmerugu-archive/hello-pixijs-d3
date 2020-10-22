export class DataStore {

    constructor() {
        this.clear();
    }

    clear() {
        this.nodes = []
        this.links = []
        this.linkGraphicsArray = [];
        this.linkLabelGraphicsArray = [];
        this.focusedNodes = [];
    }

    checkIfNodeExistInFocused(nodeData) {
        this.focusedNodes.forEach((node) => {
            if (nodeData.id === node.id) {
                return true;
            }
        })
        return false;
    }

    addNode2Focus(nodeData) {
        if (!this.checkIfNodeExistInFocused(nodeData)) {
            this.focusedNodes.push(nodeData);
        }
    }


    getNotNeighborLinks(nodeData) {
        let notNeighborLinks = [];
        let notNeighborNodes = [];
        const {nodes, links} = this.getNeighborNodesAndLinks(nodeData);

        nodes.push(nodeData);

        this.nodes.forEach((node) => {
            if (!nodes.includes(node)) {
                notNeighborNodes.push(node);
            }
        })

        this.links.forEach((link) => {
            if (!links.includes(link)) {
                notNeighborLinks.push(link);
            }
        })

        console.log("=====notNeighborNodes", notNeighborNodes, notNeighborLinks)
        return {notNeighborLinks, notNeighborNodes};
    }

    getNeighborNodesAndLinks(nodeData) {

        let neighborNodes = [];
        let neighborLinks = [];
        // get the links attached to nodeId
        this.links.forEach((link) => {
            if (link.target.id === nodeData.id) {
                neighborLinks.push(link);
                neighborNodes.push(link.source);

            } else if (link.source.id === nodeData.id) {
                neighborLinks.push(link);
                neighborNodes.push(link.target);

            }
        })


        return {
            nodes: neighborNodes,
            links: neighborLinks
        }
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

        this.hoveredlinkGfxOriginalChildren = undefined;
        this.hoveredlinkLabelOriginalChildren = undefined;
        this.nodeDataToNodeGfx = new WeakMap();
        this.nodeGfxToNodeData = new WeakMap();
        this.nodeDataToLabelGfx = new WeakMap();
        this.labelGfxToNodeData = new WeakMap();


        this.linkDataToLinkGfx = new WeakMap();
        this.linkGfxToLinkData = new WeakMap();
        this.linkDataToLabelGfx = new WeakMap();
        this.labelGfxToLinkData = new WeakMap();

        this.nodeDataGfxPairs = [];
        this.linkDataGfxPairs = [];
    }

    addNode(node) {

    }

    addEdge(edge) {

    }


    updateNodePairs(newNodeDataGfxPairs) {

        newNodeDataGfxPairs.forEach((nodeDataPair) => {
            this.nodeDataGfxPairs.push(nodeDataPair)
        })


        // create lookup tables
        this.nodeDataToNodeGfx = new WeakMap(this.nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, nodeGfx]));
        this.nodeGfxToNodeData = new WeakMap(this.nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeGfx, nodeData]));
        this.nodeDataToLabelGfx = new WeakMap(this.nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, labelGfx]));
        this.labelGfxToNodeData = new WeakMap(this.nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [labelGfx, nodeData]));
        // add Neighbours map also.
    }

    updateLinkPairs(newLinkDataGfxPairs) {

        newLinkDataGfxPairs.forEach((linkDataPair) => {
            this.linkDataGfxPairs.push(linkDataPair)
        })


        // create lookup tables
        this.linkDataToLinkGfx = new WeakMap(this.linkDataGfxPairs.map(([linkData, linkGfx, labelGfx]) => [linkData, linkGfx]));
        this.linkGfxToLinkData = new WeakMap(this.linkDataGfxPairs.map(([linkData, linkGfx, labelGfx]) => [linkGfx, linkData]));
        this.linkDataToLabelGfx = new WeakMap(this.linkDataGfxPairs.map(([linkData, linkGfx, labelGfx]) => [linkData, labelGfx]));
        this.labelGfxToLinkData = new WeakMap(this.linkDataGfxPairs.map(([linkData, linkGfx, labelGfx]) => [labelGfx, linkData]));
        // add Neighbours map also.
    }

}
