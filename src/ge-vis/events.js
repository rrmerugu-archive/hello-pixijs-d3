export default class EventStore {

    clickedNodeData = undefined;


    onLinkClicked(graphCanvas, linkData, linkGfx, event) {
        console.log(linkData.id, " clicked");

    }

    onLinkMouseOver(graphCanvas, linkData, linkGfx, event) {
        console.log(linkData.id, "link MouseOver");

    }


    onLinkMouseOut(graphCanvas, linkData, linkGfx, event) {
        console.log(linkData.id, "link MouseOut");

    }


    onNodeClicked(graphCanvas, nodeData, nodeContainer, event) {
        this.clickedNodeData = nodeData;
        console.log(this.clickedNodeData.id, " clicked");
    }

    onNodeMouseOver(graphCanvas, nodeData, nodeContainer, event) {
        this.clickedNodeData = nodeData;
        console.log(this.clickedNodeData.id, " mouseover");

    }

    onNodeMouseOut(graphCanvas, nodeData, nodeContainer, event) {
        console.log(nodeData.id, " node mouseout");
        this.clickedNodeData = undefined;
    }

}