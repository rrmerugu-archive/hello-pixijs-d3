import {colorToNumber, getColor, getNodeLabel} from "./utils";
import * as PIXI from 'pixi.js-legacy'

export default class EventStore {

    clickedNodeData = undefined;//
    lastSelectedNodeData = undefined;// used to get the last selected data for menu.
    hoveredNodeData = undefined;

    nodeMenuEl = undefined;

    constructor(nodeMenuEl) {
        this.nodeMenuEl = nodeMenuEl;
    }

    showMenu() {
        this.nodeMenuEl.style.display = "block";
    }

    hideMenu() {
        this.nodeMenuEl.style.display = "none";
    }

    onLinkClicked(graphCanvas, linkData, linkGfx, event) {
        console.log(linkData.id, " clicked");

    }

    onLinkMouseOver(graphCanvas, linkData, linkGfx, event) {
        console.log(linkData.id, "link MouseOver");

    }

    onLinkMouseOut(graphCanvas, linkData, linkGfx, event) {
        console.log(linkData.id, "link MouseOut");

    }

    createNodeMenu(graphCanvas, nodeData, event) {
        console.log("createNode Menu", nodeData, event);
        // https://www.programmersought.com/article/2722368758/
        // while (graphCanvas.nodeMenuLayer.children[0]) {
        //     graphCanvas.nodeMenuLayer.removeChild(graphCanvas.nodeMenuLayer.children[0]);
        // }
        //
        // const menuList = ["item1", "item2", "item3",];
        // // const scale = graphCanvas.nodeMenuLayer.state.scale;
        // const scale = 1;
        // menuList.forEach((menuItem, currentItemNo) => {
        //
        //     const menuItemContainer = new PIXI.Container();
        //
        //
        //     const bg = new PIXI.Graphics();
        //     bg.beginFill(0x131227, .8);
        //     bg.drawRect(0, 0, 100 * scale, 25* scale);
        //     bg.endFill();
        //     bg.y = currentItemNo * 25 *  scale;
        //     menuItemContainer.addChild(bg);
        //     const stylecoin = {
        //         fontSize: 12 * scale,
        //         fill: "0xeade1a",
        //         // fontFamily: ["Young Round", "Microsoft YaHei", "Black Body", "sans-serif",],
        //         // fontWeight: 'bold',
        //         letterSpacing: 2
        //     };
        //     const _txt = new PIXI.Text("Item " + currentItemNo, stylecoin);
        //     _txt.x = (100** scale - _txt.width) / 2;
        //     _txt.y = currentItemNo * 25 *  scale;
        //     //return context;
        //     menuItemContainer.addChild(_txt)
        //     menuItemContainer.interactive = true;
        //     menuItemContainer.buttonMode = true;
        //     // graphCanvas.nodeMenuLayer.visible = that.curr==0?true:that.show;
        //
        //     menuItemContainer.on('mousedown', event => {
        //         alert("Clicked " + currentItemNo)
        //     });
        //
        //
        //     graphCanvas.nodeMenuLayer.addChild(menuItemContainer);
        // })
        //
        // graphCanvas.nodeMenuLayer.x = nodeData.x;
        // graphCanvas.nodeMenuLayer.y = nodeData.y;
        this.nodeMenuEl.style.left = event.data.global.x + +graphCanvas.settings.NODE_MENU_X_PADDING + "px";
        this.nodeMenuEl.style.top = event.data.global.y + "px";
    }

    moveNodeMenu(graphCanvas, point, event) {
        console.log("moveNodeMenu Menu", point, event);
        console.log("move=====", event.data.global.x, event.data.global.y)
        graphCanvas.nodeMenuLayer.x = point.x;
        graphCanvas.nodeMenuLayer.y = point.y;
        this.nodeMenuEl.style.left = event.data.global.x + graphCanvas.settings.NODE_MENU_X_PADDING + "px";
        this.nodeMenuEl.style.top = event.data.global.y + "px";
    }

    moveNode = (nodeData, point, graphCanvas, event) => {
        nodeData.x = point.x;
        nodeData.y = point.y;
        graphCanvas.updatePositions();
        this.moveNodeMenu(graphCanvas, point, event);
    };

    appMouseMove(event, graphCanvas) {
        if (!this.clickedNodeData) {
            return;
        }

        this.moveNode(this.clickedNodeData, graphCanvas.viewport.toWorld(event.data.global), graphCanvas, event);
    };

    onNodeClicked(graphCanvas, nodeData, nodeContainer, event) {

        this.showMenu();
        this.clickedNodeData = nodeData;
        this.lastSelectedNodeData = nodeData;
        console.log(this.clickedNodeData.id, " clicked");
        let _this = this;
        // enable node dragging
        graphCanvas.pixiApp.renderer.plugins.interaction.on('mousemove', (mouseEvent) => _this.appMouseMove(mouseEvent, graphCanvas));
        // disable viewport dragging
        graphCanvas.viewport.pause = true;
        console.log("clicked", event);
        this.createNodeMenu(graphCanvas, nodeData, event)

    }

    highlightNode(graphCanvas, nodeData) {
        console.log("highlightNode", nodeData.id);
        // add hover effect


        const neighborsData = graphCanvas.dataStore.getNeighborNodesAndLinks(nodeData)
        let nodes2Highlight = neighborsData.nodes;
        nodes2Highlight.push(nodeData);
        const links2Highlight = neighborsData.links;
        console.log("====nodes2Highlight, links2Highlight", nodes2Highlight, links2Highlight)

        graphCanvas.graphStore.hoveredNodeGfxOriginalChildren = []
        graphCanvas.graphStore.hoveredNodeLabelGfxOriginalChildren = []
        nodes2Highlight.forEach((node2Highlight) => {
            let nodeContainer = graphCanvas.graphStore.nodeDataToNodeGfx.get(node2Highlight);
            console.log("==nodeContainer", node2Highlight, nodeContainer);
            const labelGfx = graphCanvas.graphStore.nodeDataToLabelGfx.get(node2Highlight);

            graphCanvas.graphStore.hoveredNodeGfxOriginalChildren.push(...nodeContainer.children);
            graphCanvas.graphStore.hoveredNodeLabelGfxOriginalChildren.push(...labelGfx.children);

            // circle border
            const circleBorder = new PIXI.Graphics();
            circleBorder.x = 0;
            circleBorder.y = 0;
            circleBorder.lineStyle(1.5, 0x000000);
            circleBorder.drawCircle(0, 0, graphCanvas.settings.NODE_RADIUS);
            nodeContainer.addChild(circleBorder);


            // move to front layer
            graphCanvas.nodesLayer.removeChild(nodeContainer);
            graphCanvas.frontLayer.addChild(nodeContainer);
            graphCanvas.nodeLabelsLayer.removeChild(labelGfx);
            graphCanvas.frontLayer.addChild(labelGfx);


        });


        // TODO - improve this performance ; move this to something like nodeDataToNodeGfx storage method
        graphCanvas.dataStore.linkGraphicsArray.forEach((linkGfx) => {
            links2Highlight.forEach((link) => {
                if (linkGfx.id === link.id) {
                    linkGfx.tint = 0xeeeeee;
                }
            })

        });
        graphCanvas.dataStore.linkLabelGraphicsArray.forEach((linkGfx) => {


        });


    }

    unHighlightNode(graphCanvas, nodeData, nodeContainer) {

        const neighborsData = graphCanvas.dataStore.getNeighborNodesAndLinks(nodeData)
        let nodes2Highlight = neighborsData.nodes;
        nodes2Highlight.push(nodeData);
        // const links2Highlight = neighborsData.links;

        nodes2Highlight.forEach((node2Highlight) => {
            const nodeGfx = graphCanvas.graphStore.nodeDataToNodeGfx.get(node2Highlight);
            const labelGfx = graphCanvas.graphStore.nodeDataToLabelGfx.get(node2Highlight);

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
        })


        graphCanvas.graphStore.hoveredNodeLabelGfxOriginalChildren = undefined;

        graphCanvas.requestRender();
    }

    onNodeMouseOver(graphCanvas, nodeData, nodeContainer, event) {
        console.log(nodeData.id, " mouseover");
        if (nodeData) {

            this.highlightNode(graphCanvas, nodeData)

            // for drag feature
            if (this.clickedNodeData) {
                return;
            }
            // if (this.hoveredNodeData === nodeData) {
            //     return;
            // }
            this.hoveredNodeData = nodeData;


            graphCanvas.requestRender();

        }

    }

    onNodeMouseOut(graphCanvas, nodeData, nodeContainer, event) {
        console.log(nodeData.id, " mouseout");
        // this.hideMenu();
        this.unHighlightNode(graphCanvas, nodeData, nodeContainer)
        if (this.clickedNodeData) {
            return;
        }
        // if (this.hoveredNodeData !== nodeData) {
        //     return;
        // }
        // this.unsetSelectedNodeData();

    }

    unsetSelectedNodeData() {
        this.clickedNodeData = undefined;
    }


    onNodeUnClicked(graphCanvas, nodeData, nodeContainer, event) {
        console.log("===onNodeUnClicked", nodeData);
        this.unsetSelectedNodeData();

        // disable node dragging
        graphCanvas.pixiApp.renderer.plugins.interaction.off('mousemove', (event) => this.appMouseMove(event, graphCanvas));
        // enable viewport dragging
        graphCanvas.viewport.pause = false;
    }

}
