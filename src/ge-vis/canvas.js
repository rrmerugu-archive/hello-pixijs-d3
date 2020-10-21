import * as d3 from "d3";
import GraphStore from "./store";
import GESettings from "./settings";
import * as PIXI from 'pixi.js-legacy'
import {Viewport} from 'pixi-viewport'
import {colorToNumber, scale, getColor, getNodeLabel, getLinkLabel} from "./utils";
import FontFaceObserver from "fontfaceobserver";

export default class GraphCanvas {


    graphStore = new GraphStore();
    renderRequestId = undefined;
    clickedNodeData = undefined;

    loadFont(fontFamily) {
        new FontFaceObserver(fontFamily).load();
    }

    constructor(canvasElem, width, height) {
        this.settings = new GESettings(width, height);
        this.loadFont(this.settings.ICON_FONT_FAMILY);

        // new FontFaceObserver(this.settings.ICON_FONT_FAMILY).load();

        // create PIXI application
        this.pixiApp = new PIXI.Application({
            width: this.settings.SCREEN_WIDTH,
            height: this.settings.SCREEN_HEIGHT,
            resolution: this.settings.RESOLUTION,
            transparent: true,
            // backgroundColor: 0xFFFFFF,
            antialias: true,
            autoStart: false, // disable automatic rendering by ticker, render manually instead, only when needed
            forceCanvas: true,
            autoDensity: true
        });
        // this.pixiApp.view.style.height = this.settings.SCREEN_HEIGHT + "px";
        // this.pixiApp.view.style.width = this.settings.SCREEN_WIDTH + "px";
        canvasElem.appendChild(this.pixiApp.view);

        // manual rendering
        this.pixiApp.renderer.on('postrender', () => {
            // console.log('render');
        });


        // create PIXI viewport
        this.viewport = new Viewport({
            screenWidth: this.settings.SCREEN_WIDTH,
            screenHeight: this.settings.SCREEN_HEIGHT,
            worldWidth: this.settings.WORLD_WIDTH,
            worldHeight: this.settings.WORLD_HEIGHT,
            interaction: this.pixiApp.renderer.plugins.interaction
        });

        this.pixiApp.stage.addChild(this.viewport);
        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate();

        this.viewport.on('frame-end', () => {
            if (this.viewport.dirty) {
                this.requestRender();
                this.viewport.dirty = false;
            }
        });


        // adding nodes layer 


        this.linksLayerContainer = new PIXI.Container();
        this.viewport.addChild(this.linksLayerContainer);

        this.linksLabelsLayer = new PIXI.Container();
        this.viewport.addChild(this.linksLabelsLayer);


        this.nodesLayer = new PIXI.Container();
        this.viewport.addChild(this.nodesLayer);

        this.nodeLabelsLayer = new PIXI.Container();
        this.viewport.addChild(this.nodeLabelsLayer);


    }

    generateForceSimulation(data) {
        const defaultLinkLength = this.settings.DEFAULT_LINK_LENGTH;
        return d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links)
                .id(linkData => linkData.id)
                .distance(function (d) {
                    return d.distance || defaultLinkLength
                })
            )
            .force("charge", d3.forceManyBody().strength(this.settings.FORCE_LAYOUT_NODE_REPULSION_STRENGTH))
            .force("center", d3.forceCenter())
            .stop()
            .tick(this.settings.FORCE_LAYOUT_ITERATIONS);
    }

    requestRender = () => {
        let _this = this;
        if (this.renderRequestId) {
            return;
        }
        this.renderRequestId = window.requestAnimationFrame(() => {
            _this.pixiApp.render();
            _this.renderRequestId = undefined;
        });
    }

    onNodeClicked(nodeData) {
        this.clickedNodeData = nodeData;
        console.log(this.clickedNodeData.id, " clicked");

        // // enable node dragging
        // this.pixiApp.renderer.plugins.interaction.on('mousemove', this.appMouseMove);
        // // disable viewport dragging
        // this.viewport.pause = true;
    }
    onNodeMouseOver(nodeData) {
        this.clickedNodeData = nodeData;
        console.log(this.clickedNodeData.id, " mouseover");

        // // enable node dragging
        // this.pixiApp.renderer.plugins.interaction.on('mousemove', this.appMouseMove);
        // // disable viewport dragging
        // this.viewport.pause = true;
    }

    onLinkClicked(linkData) {
        console.log(linkData.id, " clicked");
    }

    // appMouseMove = event => {
    //     if (!this.clickedNodeData) {
    //         return;
    //     }
    //
    //     this.moveNode(this.clickedNodeData, this.viewport.toWorld(event.data.global));
    // };

    onNodeUnClicked(nodeData) {
        console.log(nodeData.id , " unclicked");
        this.clickedNodeData = undefined;

        // // disable node dragging
        // this.pixiApp.renderer.plugins.interaction.off('mousemove', appMouseMove);
        // // enable viewport dragging
        // this.viewport.pause = false;
    }


    onLinkMouseOver(mouseData, linkData) {
        console.log(linkData.id, "link MouseOver");
        // this.alpha = 1;
    }

    onLinkMouseOut(mouseData, linkData) {
        console.log(linkData.id, "link MouseOut");

        // this.alpha = 0.5;
    }


    // onLinkClicked(link) {
    //
    // }
    //
    // onLinkUnClicked(link) {
    //
    // }


    resetViewport() {
        this.viewport.center = new PIXI.Point(this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4);
        this.viewport.fit(true, this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4)
        this.viewport.setZoom(0.5, true);
    };


    createNode(nodeData) {
        const _this = this;
        const {
            NODE_HIT_RADIUS, NODE_RADIUS, LABEL_FONT_FAMILY, LABEL_FONT_SIZE,
            LABEL_X_PADDING,
            LABEL_Y_PADDING,
            ICON_TEXT,
            ICON_FONT_FAMILY,
            ICON_FONT_SIZE
        } = this.settings;

        // console.log("====nodeData>>>", nodeData)
        const nodeContainer = new PIXI.Container();
        nodeContainer.x = nodeData.x;
        nodeContainer.y = nodeData.y;
        nodeContainer.interactive = true;
        nodeContainer.buttonMode = true;
        nodeContainer.hitArea = new PIXI.Circle(0, 0, NODE_HIT_RADIUS);

        nodeContainer.on('mousedown', event => _this.onNodeClicked(_this.graphStore.nodeGfxToNodeData.get(event.currentTarget)));
        nodeContainer.on('mouseover', (event) => _this.onNodeMouseOver(_this.graphStore.nodeGfxToNodeData.get(event.currentTarget)));
        nodeContainer.on('mouseout', (event) => _this.onNodeUnClicked(_this.graphStore.nodeGfxToNodeData.get(event.currentTarget)));

        const circle = new PIXI.Graphics();
        circle.x = 0;
        circle.y = 0;
        circle.beginFill(colorToNumber(getColor(nodeData)));
        circle.drawCircle(0, 0, NODE_RADIUS);
        nodeContainer.addChild(circle);

        const circleBorder = new PIXI.Graphics();
        circle.x = 0;
        circle.y = 0;
        circleBorder.lineStyle(1.5, 0xff00ff);
        circleBorder.drawCircle(0, 0, NODE_RADIUS);
        nodeContainer.addChild(circleBorder);

        const icon = new PIXI.Text(ICON_TEXT, {
            fontFamily: ICON_FONT_FAMILY,
            fontSize: ICON_FONT_SIZE,
            fill: 0xffffff
        });
        icon.x = 0;
        icon.y = 0;
        icon.anchor.set(0.5);
        nodeContainer.addChild(icon);

        const nodeLabelContainer = new PIXI.Container();
        nodeLabelContainer.x = nodeData.x;
        nodeLabelContainer.y = nodeData.y;
        nodeLabelContainer.interactive = true;
        nodeLabelContainer.buttonMode = true;

        const nodeLabelText = new PIXI.Text(getNodeLabel(nodeData), {
            fontFamily: LABEL_FONT_FAMILY,
            fontSize: LABEL_FONT_SIZE,
            fill: 0x333333
        });
        nodeLabelText.x = LABEL_X_PADDING;
        nodeLabelText.y = NODE_HIT_RADIUS + LABEL_Y_PADDING;
        nodeLabelText.anchor.set(0.5, 0);

        nodeLabelContainer.addChild(nodeLabelText);
        return {nodeContainer, nodeLabelContainer}
    }


    createNodes(nodes) {
        // create node graphics
        return nodes.map(nodeData => {
            const {nodeContainer, nodeLabelContainer} = this.createNode(nodeData);

            this.nodesLayer.addChild(nodeContainer);
            this.nodeLabelsLayer.addChild(nodeLabelContainer);
            return [nodeData, nodeContainer, nodeLabelContainer];
        });

    }

    linkGraphicsArray = [];
    linkLabelGraphicsArray = [];


    clearCanvas() {
        while (this.linkGraphicsArray.length > 0) {
            let linkGraphics = this.linkGraphicsArray.pop();
            linkGraphics.clear();
            this.linksLayerContainer.removeChild(linkGraphics);
            linkGraphics.destroy();
        }
        while (this.linkLabelGraphicsArray.length > 0) {
            let linkLabelGraphics = this.linkLabelGraphicsArray.pop();
            linkLabelGraphics.clear();
            this.linksLabelsLayer.removeChild(linkLabelGraphics);
            linkLabelGraphics.destroy();
        }
    }


    createLink(linkData) {
        const {LINK_DEFAULT_LABEL_FONT_SIZE, LABEL_FONT_FAMILY, LINK_DEFAULT_WIDTH} = this.settings;
        let _this = this;
        let linkGfx = new PIXI.Graphics();

        // link labels
        let linkGfxLabels = new PIXI.Graphics();
        this.linkLabelGraphicsArray.push(linkGfxLabels);
        this.linksLabelsLayer.addChild(linkGfxLabels);

        linkGfx.lineStyle(Math.sqrt(LINK_DEFAULT_WIDTH), 0x999999);
        linkGfx.moveTo(linkData.source.x, linkData.source.y);
        linkGfx.lineTo(linkData.target.x, linkData.target.y);


        // for link label
        const linkLabelText = new PIXI.Text(getLinkLabel(linkData), {
            fontFamily: LABEL_FONT_FAMILY,
            fontSize: LINK_DEFAULT_LABEL_FONT_SIZE,
            fill: 0xd2d2d2
        });
        const sameIndex = 1;
        linkLabelText.x = (linkData.source.x + linkData.target.x) / 2 - 10 * sameIndex;
        linkLabelText.y = (linkData.source.y + linkData.target.y) / 2 - 10 * sameIndex;
        linkLabelText.anchor.set(0.5, 0);
        linkGfxLabels.addChild(linkLabelText)


        let interval = setInterval(() => {
            if (linkGfx.geometry && linkGfx.geometry.graphicsData.length > 0) {
                let points = linkGfx.geometry.graphicsData[0].shape.points;
                console.log("points interval", points.length, points);

                if (points.length > 0) {
                    linkGfx.interactive = true;
                    linkGfx.buttonMode = true;

                    if (points.length === 4) {
                        // this is straight line; so making 2 point into 4 points to create a rectangle
                        // structure to create hitArea around the link connecting the nodes in straight line.
                        // const x1, y1, x2, y2 = points[0], points[1], points[2], points[3];
                        const x1 = points[0];
                        const y1 = points[1];
                        const x2 = points[2];
                        const y2 = points[3];
                        // console.log("x1-y1", x1, y1)
                        points = [x1 + 3, y1 + 3, x2 + 3, y2 + 3, x2 - 3, y2 - 3, x1 - 3, y1 - 3]
                    }

                    linkGfx.hitArea = new PIXI.Polygon(points);
                    // linkGfx.drawPolygon(points);
                    linkGfx.endFill();
                    linkGfxLabels.endFill();

                    // linkGfx.click = mouseover;
                    linkGfx.on("mouseover", (mouseData) => _this.onLinkMouseOver(mouseData, linkData));
                    linkGfx.on("mouseout", (mouseData) => _this.onLinkMouseOut(mouseData, linkData));
                    linkGfx.on('mousedown', event => _this.onLinkClicked(linkData));

                    clearInterval(interval);
                }
            }
        }, 50);
        return linkGfx;

    }

    updatePositions = () => {
        const {links} = this.graphStore;
        this.clearCanvas();

        for (let i = 0; i < links.length; i++) {
            let linkGfx = this.createLink(links[i])
            this.linkGraphicsArray.push(linkGfx);
            this.linksLayerContainer.addChild(linkGfx);
        }

        this.updateNodePositions();
        console.log("log positions updated");
        this.requestRender();
    };

    updateNodePositions() {
        let _this = this;
        const {nodes} = this.graphStore;
        for (const node of nodes) {
            _this.graphStore.nodeDataToNodeGfx.get(node).position = new PIXI.Point(node.x, node.y)
            _this.graphStore.nodeDataToLabelGfx.get(node).position = new PIXI.Point(node.x, node.y)
        }
    }

    addData(nodes, links) {

        this.forceSimulation = this.generateForceSimulation({nodes, links});
        const nodeDataGfxPairs = this.createNodes(nodes);

        // update store
        this.graphStore.links = links;
        this.graphStore.nodes = nodes;
        this.graphStore.update(nodeDataGfxPairs);

        // initial draw
        this.resetViewport();
        // this.requestRender();

        this.updatePositions();
        this.preventWheelScrolling();
    }


    preventWheelScrolling() {
        // prevent body scrolling
        this.pixiApp.view.addEventListener('wheel', event => {
            event.preventDefault();
        });
    }

}