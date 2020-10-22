import * as d3 from "d3";
import GraphStore, {DataStore} from "./store";
import GESettings from "./settings";
import * as PIXI from 'pixi.js-legacy'
import {Viewport} from 'pixi-viewport'
import {colorToNumber, scale, getColor, getNodeLabel, getLinkLabel} from "./utils";
import FontFaceObserver from "fontfaceobserver";
import EventStore from "./events";

export default class GraphCanvas {


    graphStore = new GraphStore();
    dataStore = new DataStore();
    eventStore = new EventStore();
    renderRequestId = undefined;
    clickedNodeData = undefined;
    isRendering = undefined;


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
        this.forceSimulation = this.generateForceSimulation();
        this.viewport = new Viewport({
            screenWidth: this.settings.SCREEN_WIDTH,
            screenHeight: this.settings.SCREEN_HEIGHT,
            worldWidth: this.settings.WORLD_WIDTH,
            worldHeight: this.settings.WORLD_HEIGHT,
            interaction: this.pixiApp.renderer.plugins.interaction
        });
        this.viewport.on('frame-end', () => {
            if (this.viewport.dirty) {
                this.requestRender();
                this.viewport.dirty = false;
            }
        });

        this.setupCanvas();
        this.preventWheelScrolling();

    }

    setupCanvas() {
        // create PIXI viewport

        this.pixiApp.stage.addChild(this.viewport);
        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate();


        // adding layers for nodes and links
        this.linksLayer = new PIXI.Container();
        this.viewport.addChild(this.linksLayer);

        this.linksLabelsLayer = new PIXI.Container();
        this.viewport.addChild(this.linksLabelsLayer);


        this.nodesLayer = new PIXI.Container();
        this.viewport.addChild(this.nodesLayer);

        this.nodeLabelsLayer = new PIXI.Container();
        this.viewport.addChild(this.nodeLabelsLayer);

        this.frontLayer = new PIXI.Container();
        this.viewport.addChild(this.frontLayer);

    }

    generateForceSimulation() {
        const defaultLinkLength = this.settings.DEFAULT_LINK_LENGTH;
        // return d3.forceSimulation()
        //     .force("link", d3.forceLink()
        //         .id(linkData => linkData.id)
        //         .distance(function (d) {
        //             return d.distance || defaultLinkLength
        //         })
        //     )
        //     .force("charge", d3.forceManyBody().strength(this.settings.FORCE_LAYOUT_NODE_REPULSION_STRENGTH))
        //     // .force("center", d3.forceCenter())
        //     .force("x", d3.forceX())
        //     .force("y", d3.forceY())
        //
        //     .tick(this.settings.FORCE_LAYOUT_ITERATIONS)
        //     // .on("tick", () => this.onForceSimulationEnd(this))
        //     .on("end", () => this.onForceSimulationEnd(this))
        //     // .stop();

        return d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(this.settings.FORCE_LAYOUT_NODE_REPULSION_STRENGTH))
            .force("link", d3.forceLink().id(d => d.id).distance(200))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            // .on("tick", () => this.onForceSimulationEnd(this))
            .on("end", () => this.onForceSimulationEnd(this));

    }

    onForceSimulationEnd(graphCanvas) {
        console.log("onForceSimulationEnd")
        graphCanvas.render();

        graphCanvas.updatePositions();
        graphCanvas.isRendering = false;


        // graphCanvas.updatePositions();
        // graphCanvas.upd

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


    resetViewport() {
        this.viewport.center = new PIXI.Point(this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4);
        this.viewport.fit(true, this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4)
        this.viewport.setZoom(0.5, true);
    };


    destroyEverything(func) {
        // while (this.nodesLayer.children[0]) {
        //     this.nodesLayer.removeChild(this.nodesLayer.children[0]);
        // }
        // this.nodesLayer.destroy(true, true, true);
        // this.nodeLabelsLayer.destroy(true, true, true);
        // this.linksLayer.destroy(true, true, true);
        // this.linksLabelsLayer.destroy(true, true, true);
        // this.frontLayer.destroy(true, true, true);
        // this.graphStore.clear();
        // this.dataStore.clear();

        let _this = this;
        // while (this.pixiApp.stage.children[0]) {
        //     console.log("removing t", this.pixiApp.stage.children[0]);
        //     _this.pixiApp.stage.removeChild(_this.pixiApp.stage.children[0])
        // }
        // this.setupCanvas();
        // return
        // setTimeout(() => func(), 500);

        func()

    }


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

        nodeContainer.on('mousedown', event => _this.eventStore.onNodeClicked(_this, _this.graphStore.nodeGfxToNodeData.get(event.currentTarget), nodeContainer));
        nodeContainer.on('mouseover', (event) => _this.eventStore.onNodeMouseOver(_this, _this.graphStore.nodeGfxToNodeData.get(event.currentTarget), nodeContainer));
        nodeContainer.on('mouseout', (event) => _this.eventStore.onNodeMouseOut(_this, _this.graphStore.nodeGfxToNodeData.get(event.currentTarget), nodeContainer));
        nodeContainer.on('mouseup', (event) => this.eventStore.onNodeUnClicked(_this, _this.graphStore.nodeGfxToNodeData.get(event.currentTarget), nodeContainer));
        nodeContainer.on('mouseupoutside', (event) => this.eventStore.onNodeUnClicked(_this, _this.graphStore.nodeGfxToNodeData.get(event.currentTarget), nodeContainer));


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
            fill: 0xefefef
        });
        nodeLabelText.x = LABEL_X_PADDING;
        nodeLabelText.y = NODE_HIT_RADIUS + LABEL_Y_PADDING;
        nodeLabelText.anchor.set(0.5, 0);

        nodeLabelContainer.addChild(nodeLabelText);
        return {nodeContainer, nodeLabelContainer}
    }


    createNodes(nodes) {
        // create node graphics
        let _this = this;


        let newNodes = [];

        nodes.forEach(nodeData => {
            const nodeGfx = _this.graphStore.nodeDataToNodeGfx.get(nodeData);
            if (!nodeGfx) {
               newNodes.push(nodeData);
            }
        })
        console.log("======newNodes", newNodes.length, newNodes);

        return newNodes.map(nodeData => {

            const nodeGfx = _this.graphStore.nodeDataToNodeGfx.get(nodeData);
            if (!nodeGfx) {
                const {nodeContainer, nodeLabelContainer} = this.createNode(nodeData);

                this.nodesLayer.addChild(nodeContainer);
                this.nodeLabelsLayer.addChild(nodeLabelContainer);
                return [nodeData, nodeContainer, nodeLabelContainer];
            }


        });

    }


    clearLinkCanvas() {
        // console.log("this.dataStore.linkGraphicsArray.", this.dataStore.linkGraphicsArray.length)
        while (this.dataStore.linkGraphicsArray.length > 0) {
            let linkGraphics = this.dataStore.linkGraphicsArray.pop();
            try {
                linkGraphics.clear();
                this.linksLayer.removeChild(linkGraphics);
                linkGraphics.destroy();
            } catch (e) {

            }

        }
        while (this.dataStore.linkLabelGraphicsArray.length > 0) {
            let linkLabelGraphics = this.dataStore.linkLabelGraphicsArray.pop();
            try {
                linkLabelGraphics.clear();
                this.linksLabelsLayer.removeChild(linkLabelGraphics);
                linkLabelGraphics.destroy();
            } catch (e) {

            }
        }
    }


    createLink(linkData) {
        const {LINK_DEFAULT_LABEL_FONT_SIZE, LABEL_FONT_FAMILY, LINK_DEFAULT_WIDTH} = this.settings;
        let _this = this;
        let linkGfx = new PIXI.Graphics();

        // link labels
        let linkGfxLabels = new PIXI.Graphics();
        this.dataStore.linkLabelGraphicsArray.push(linkGfxLabels);
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
                // console.log("points interval", points.length, points);
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
                    linkGfx.on("mouseover", (mouseData) => _this.eventStore.onLinkMouseOver(_this, linkData, linkGfx, mouseData));
                    linkGfx.on("mouseout", (mouseData) => _this.eventStore.onLinkMouseOut(_this, linkData, linkGfx, mouseData));
                    linkGfx.on('mousedown', event => _this.eventStore.onLinkClicked(_this, linkData, linkGfx, event));

                    clearInterval(interval);
                }
            }
        }, 50);
        return linkGfx;

    }

    updatePositions = () => {
        const {links} = this.dataStore;
        this.clearLinkCanvas();

        for (let i = 0; i < links.length; i++) {
            let linkGfx = this.createLink(links[i])
            this.dataStore.linkGraphicsArray.push(linkGfx);
            this.linksLayer.addChild(linkGfx);
        }

        this.updateNodePositions();
        console.log("log positions updated");
        this.requestRender();
    };

    updateNodePositions() {
        let _this = this;
        const {nodes} = this.dataStore;
        for (const node of nodes) {
            if (!!_this.graphStore.nodeDataToNodeGfx.get(node)) {
                _this.graphStore.nodeDataToNodeGfx.get(node).position = new PIXI.Point(node.x, node.y)
            }
            if (!!_this.graphStore.nodeDataToLabelGfx.get(node)) {
                _this.graphStore.nodeDataToLabelGfx.get(node).position = new PIXI.Point(node.x, node.y)
            }
        }
    }

    updateSimulationData(nodes, links) {
        this.forceSimulation.nodes(nodes);
        this.forceSimulation.force("link").links(links)
        this.forceSimulation.restart();

    }

    render() {

        this.isRendering = true
        const {nodes, links} = this.dataStore;
        console.log("rendering with data:: links ======== ", links.length);
        console.log("rendering with data:: nodes ======== ", nodes.length);


        // .id(linkData => linkData.id)
        // .distance(function (d) {
        //     return 100
        // });
        const nodeDataGfxPairs = this.createNodes(nodes);
        this.graphStore.update(nodeDataGfxPairs);

        // initial draw
        this.requestRender();
        // this.updatePositions();
    }

    addData(newNodes, newLinks) {
        let _this = this;
        this.dataStore.addData(newNodes, newLinks);
        const {nodes, links} = this.dataStore;
        console.log("=======", nodes.length, links.length);
        this.destroyEverything(() => {


            _this.updateSimulationData(nodes, links);

            // _this.render(nodes, links);
            // _this.updateNodePositions()

        });

    }


    preventWheelScrolling() {
        // prevent body scrolling
        this.pixiApp.view.addEventListener('wheel', event => {
            event.preventDefault();
        });
    }

}
