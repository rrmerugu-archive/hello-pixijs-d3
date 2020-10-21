import {getNodeLabel} from "./utils";
import * as PIXI from 'pixi.js-legacy'

export default class EventStore {

    clickedNodeData = undefined;
    hoveredNodeData = undefined;


    onLinkClicked(graphCanvas, linkData, linkGfx, event) {
        console.log(linkData.id, " clicked");

    }

    onLinkMouseOver(graphCanvas, linkData, linkGfx, event) {
        console.log(linkData.id, "link MouseOver");

    }


    onLinkMouseOut(graphCanvas, linkData, linkGfx, event) {
        console.log(linkData.id, "link MouseOut");

    }


    moveNode = (nodeData, point, graphCanvas) => {

        nodeData.x = point.x;
        nodeData.y = point.y;

        graphCanvas.updatePositions();
    };

    appMouseMove(event, graphCanvas) {
        if (!this.clickedNodeData) {
            return;
        }

        this.moveNode(this.clickedNodeData, graphCanvas.viewport.toWorld(event.data.global), graphCanvas);
    };

    onNodeClicked(graphCanvas, nodeData, nodeContainer, event) {
        this.clickedNodeData = nodeData;
        console.log(this.clickedNodeData.id, " clicked");
        let _this = this;
        // enable node dragging
        graphCanvas.pixiApp.renderer.plugins.interaction.on('mousemove', (mouseEvent) => _this.appMouseMove(mouseEvent, graphCanvas));
        // disable viewport dragging
        graphCanvas.viewport.pause = true;
    }

    onNodeMouseOver(graphCanvas, nodeData, nodeContainer, event) {
        console.log(nodeData.id, " mouseover");

        // for drag feature
        if (this.clickedNodeData) {
            return;
        }
        if (this.hoveredNodeData === nodeData) {
            return;
        }

        console.log("HoverNode", nodeData);
        this.hoveredNodeData = nodeData;

        // console.log("====nodeData", nodeData);
        // console.log("====nodeData", nodeData);
        const nodeGfx = graphCanvas.graphStore.nodeDataToNodeGfx.get(nodeData);
        const labelGfx = graphCanvas.graphStore.nodeDataToLabelGfx.get(nodeData);

        // move to front layer
        graphCanvas.nodesLayer.removeChild(nodeGfx);
        graphCanvas.frontLayer.addChild(nodeGfx);
        graphCanvas.nodeLabelsLayer.removeChild(labelGfx);
        graphCanvas.frontLayer.addChild(labelGfx);

        // add hover effect
        graphCanvas.graphStore.hoveredNodeGfxOriginalChildren = [...nodeGfx.children];
        graphCanvas.graphStore.hoveredNodeLabelGfxOriginalChildren = [...labelGfx.children];

        // circle border
        const circleBorder = new PIXI.Graphics();
        circleBorder.x = 0;
        circleBorder.y = 0;
        circleBorder.lineStyle(1.5, 0x000000);
        circleBorder.drawCircle(0, 0, graphCanvas.settings.NODE_RADIUS);
        nodeGfx.addChild(circleBorder);

        // text with background
        const labelText = new PIXI.Text(getNodeLabel(nodeData), {
            fontFamily: graphCanvas.settings.LABEL_FONT_FAMILY,
            fontSize: graphCanvas.settings.LABEL_FONT_SIZE,
            fill: 0x333333
        });
        labelText.x = 0;
        labelText.y = graphCanvas.settings.NODE_HIT_RADIUS + graphCanvas.settings.LABEL_Y_PADDING;
        labelText.anchor.set(0.5, 0);
        //const labelBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        //labelBackground.x = -(labelText.width + LABEL_X_PADDING * 2) / 2;
        //labelBackground.y = NODE_HIT_RADIUS;
        //labelBackground.width = labelText.width + LABEL_X_PADDING * 2;
        //labelBackground.height = labelText.height + LABEL_Y_PADDING * 2;
        //labelBackground.tint = 0xeeeeee;
        //labelGfx.addChild(labelBackground);
        labelGfx.addChild(labelText);

        graphCanvas.requestRender();

    }


    onNodeMouseOut(graphCanvas, nodeData, nodeContainer, event) {
        console.log(nodeData.id, " node mouseout");

        if (this.clickedNodeData) {
            return;
        }
        if (this.hoveredNodeData !== nodeData) {
            return;
        }
        this.clickedNodeData = undefined;
        const nodeGfx = graphCanvas.graphStore.nodeDataToNodeGfx.get(nodeData);
        const labelGfx = graphCanvas.graphStore.nodeDataToLabelGfx.get(nodeData);

        // move back from front layer
        graphCanvas.frontLayer.removeChild(nodeGfx);
        graphCanvas.nodesLayer.addChild(nodeGfx);
        graphCanvas.frontLayer.removeChild(labelGfx);
        graphCanvas.nodeLabelsLayer.addChild(labelGfx);

        // clear hover effect
        const nodeGfxChildren = [...nodeGfx.children];
        for (let child of nodeGfxChildren) {
            if (graphCanvas.graphStore.hoveredNodeGfxOriginalChildren && !graphCanvas.graphStore.hoveredNodeGfxOriginalChildren.includes(child)) {
                nodeGfx.removeChild(child);
            }
        }
        graphCanvas.graphStore.hoveredNodeGfxOriginalChildren = undefined;
        const labelGfxChildren = [...labelGfx.children];
        for (let child of labelGfxChildren) {
            if (graphCanvas.graphStore.hoveredNodeLabelGfxOriginalChildren && !graphCanvas.graphStore.hoveredNodeLabelGfxOriginalChildren.includes(child)) {
                labelGfx.removeChild(child);
            }
        }
        graphCanvas.graphStore.hoveredNodeLabelGfxOriginalChildren = undefined;

        graphCanvas.requestRender();
    }


    onNodeUnClicked(graphCanvas, nodeData, nodeContainer, event) {
        this.clickedNodeData = undefined;

        // disable node dragging
        graphCanvas.pixiApp.renderer.plugins.interaction.off('mousemove', (event) => this.appMouseMove(event, graphCanvas));
        // enable viewport dragging
        graphCanvas.viewport.pause = false;
    }

}