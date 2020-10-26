import * as d3 from "d3";
import GraphStore, {DataStore} from "./store";
import GESettings from "./settings";
import * as PIXI from 'pixi.js-legacy'
// import * as PIXI from "pixi.js";
import {Viewport} from 'pixi-viewport'
import {colorToNumber, scale, getColor, getNodeLabel, getLinkLabel} from "./utils";
import FontFaceObserver from "fontfaceobserver";
import EventStore from "./events";
import {prepareLinksDataForCurves} from "../utils";

export default class GraphCanvas {


    renderRequestId = undefined;
    // clickedNodeData = undefined;
    isRendering = undefined;
    nodeMenuEl = undefined;
    isFirstLoaded = false


    loadFont(fontFamily) {
        new FontFaceObserver(fontFamily).load();
    }

    constructor(canvasElem, nodeMenuEl, width, height, onNodeSelected) {
        // let _this = this;
        this.dataStore = new DataStore();
        this.graphStore = new GraphStore(this.dataStore, this);

        this.nodeMenuEl = nodeMenuEl;
        this.eventStore = new EventStore(nodeMenuEl);
        this.onNodeSelected = onNodeSelected; // used to send back any message to react component.

        this.settings = new GESettings(width, height);
        this.loadFont(this.settings.ICON_FONT_FAMILY);

        // new FontFaceObserver(this.settings.ICON_FONT_FAMILY).load();

        // create PIXI application
        this.pixiApp = new PIXI.Application({
            width: width || this.settings.SCREEN_WIDTH,
            height: height || this.settings.SCREEN_HEIGHT,
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
        // this.pixiApp.renderer.on('postrender', () => {
        //     // console.log('render');
        // });
        // this.pixiApp.renderer.view.addEventListener('click', function (e) {
        //     console.log(e);
        //     _this.eventStore.hideMenu();
        //
        // });
        this.forceSimulation = this.generateForceSimulation();
        this.viewport = new Viewport({
            screenWidth: this.settings.SCREEN_WIDTH,
            screenHeight: this.settings.SCREEN_HEIGHT,
            worldWidth: this.settings.WORLD_WIDTH,
            worldHeight: this.settings.WORLD_HEIGHT,
            interaction: this.pixiApp.renderer.plugins.interaction
        });
        this.viewport.clampZoom({
            minScale: this.settings.ZOOM_CLAMP_MIN_SCALE,
            maxScale: this.settings.ZOOM_CLAMP_MAX_SCALE
        })

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
        this.nodeMenuLayer = new PIXI.Container();
        this.viewport.addChild(this.nodeMenuLayer);

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

        if (this.isFirstLoaded === false) {
            // center the view only for the first time.
            graphCanvas.resetViewport();
            this.isFirstLoaded = true;
        }

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

    zoom2Point(x, y) {
        this.viewport.center = new PIXI.Point(x, y);
        this.viewport.fit(true, this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4)
        this.viewport.setZoom(1, true);
        this.eventStore.hideMenu();
    }

    resetViewport() {
        this.zoom2Point(this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4)
        this.viewport.setZoom(0.5, true);
        // this.viewport.center = new PIXI.Point(this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4);
        // this.viewport.fit(true, this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4)
        // this.viewport.setZoom(0.5, true);
        // this.nodeMenuEl.style.display = "none";

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

        nodeContainer.on('mousedown', (event) => _this.eventStore.onNodeClicked(_this, _this.graphStore.nodeGfxToNodeData.get(event.currentTarget), nodeContainer, event));
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
        circleBorder.lineStyle(1.5, this.settings.NODE_DEFAULT_BORDER_COLOR);
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
        nodeLabelText.resolution = this.settings.LABEL_RESOLUTION;

        nodeLabelText.x = LABEL_X_PADDING;
        nodeLabelText.y = NODE_HIT_RADIUS + LABEL_Y_PADDING;
        nodeLabelText.anchor.set(0.5, 0);

        nodeLabelContainer.addChild(nodeLabelText);
        // nodeLabelContainer.alpha = 0.5;
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


    linearDistanceBetweenTwoPoints(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    }

    getPointForArrowAtPointWithPadding(x1, y1, x2, y2, padding) {

        const d = this.linearDistanceBetweenTwoPoints(x1, y1, x2, y2)
        const dt = d - padding;
        //ratio of distances
        let t = dt / d;
        const x = (1 - t) * x1 + t * x2;
        const y = (1 - t) * y1 + t * y2;
        return {x, y};

    }

    getTrianglePointsTan


    getNormalAndTangentForTwoPoints(x1, y1, x2, y2, sameIndex) {
        // x1, y1 is the first point and x2, y2 is the second point.


        let normal = [
            -(y2 - this.settings.NODE_RADIUS),
            x2 - this.settings.NODE_RADIUS,
        ]


        const l = Math.sqrt(normal[0] ** 2 + normal[1] ** 2);
        normal[0] /= l;
        normal[1] /= l;

        const tangent = [
            -normal[1] * 45,
            normal[0] * 45
        ]

        normal[0] *= 30;
        normal[1] *= 30;
        return {normal, tangent,}
    }

    createLink(linkData) {
        const {LINK_DEFAULT_LABEL_FONT_SIZE, LABEL_FONT_FAMILY, LINK_DEFAULT_WIDTH} = this.settings;
        let _this = this;
        let linkGfx = new PIXI.Graphics();
        let linkGfxLabel = new PIXI.Graphics();


        linkGfx.lineStyle(Math.sqrt(LINK_DEFAULT_WIDTH), this.settings.LINK_DEFAULT_COLOR);
        const curvatureConstant = 0.5;
        const sameIndex = linkData.sameIndex;
        let nextPoint = {};
        nextPoint.x = linkData.target.x;
        nextPoint.y = linkData.target.y;
        let {normal, tangent} = this.getNormalAndTangentForTwoPoints(
            linkData.source.x,
            linkData.source.y,
            linkData.target.x,
            linkData.target.y,
            linkData.sameIndex
        )


        if (sameIndex > 1) {
            // for curved links
            nextPoint.y = linkData.target.x - 300 * sameIndex * curvatureConstant;
            nextPoint.y = linkData.target.y - 300 * sameIndex * curvatureConstant;
            normal = [
                -(linkData.target.y - this.settings.NODE_RADIUS - nextPoint.y),
                linkData.target.x - this.settings.NODE_RADIUS - nextPoint.x,
            ]
        }


        console.log("tangent", tangent);


        // for link label
        const linkLabelText = new PIXI.Text(getLinkLabel(linkData), {
            fontFamily: LABEL_FONT_FAMILY,
            fontSize: LINK_DEFAULT_LABEL_FONT_SIZE,
            fill: _this.settings.LINK_DEFAULT_LABEL_COLOR
        });
        linkLabelText.resolution = this.settings.LABEL_RESOLUTION;

        if (sameIndex === 1) {
            linkGfx.moveTo(linkData.source.x, linkData.source.y);

            linkGfx.lineTo(linkData.target.x, linkData.target.y);
            linkGfx.beginFill(this.settings.LINK_DEFAULT_COLOR, 1);
            // triangle for the arrow
            //  The distance between Start and End point is given by
            // xt, yt are the coordinates at a distance dt from source.
            const t2 = this.getPointForArrowAtPointWithPadding(linkData.source.x, linkData.source.y,
                linkData.target.x, linkData.target.y, this.settings.NODE_RADIUS + 1)
            // const d = Math.sqrt((linkData.target.x - linkData.source.x) ** 2 + (linkData.target.y - linkData.source.y) ** 2)

            // points for triangle with points t1, t2(point touching to circle), t3
            const t1 = this.getPointForArrowAtPointWithPadding(
                linkData.target.x + normal[0] + tangent[0],
                linkData.target.y + normal[1] + tangent[1],
                t2.x, t2.y, 6
            )
            const t3 = this.getPointForArrowAtPointWithPadding(
                linkData.target.x - normal[0] + tangent[0],
                linkData.target.y - normal[1] + tangent[1],
                t2.x, t2.y
                , 6
            )

            linkGfx.lineStyle(1, this.settings.LINK_DEFAULT_COLOR, 1, .5)
                .moveTo(t1.x, t1.y)
            linkGfx.lineTo(t2.x, t2.y)
                .lineTo(t3.x, t3.y)
                .lineTo(t1.x, t1.y)
                .closePath()

            // set label in the middle
            linkLabelText.x = (linkData.source.x + linkData.target.x) / 2 - 10 * sameIndex;
            linkLabelText.y = (linkData.source.y + linkData.target.y) / 2 - 10 * sameIndex;

        } else {
            linkGfx.moveTo(linkData.source.x, linkData.source.y);

            console.log("linkData=====", linkData, nextPoint.x, nextPoint.y)



            linkGfx
                .bezierCurveTo(linkData.source.x, linkData.source.y,
                    nextPoint.x + 50, nextPoint.y + 50,
                    linkData.target.x, linkData.target.y)

            // let linkCurveGfx = new PIXI.Graphics()
            // linkCurveGfx.lineStyle(10, 0xff0000, 1)
            //
            // linkCurveGfx.moveTo(linkData.source.x, linkData.source.y);
            //
            // linkCurveGfx.beginFill(this.settings.LINK_DEFAULT_COLOR, 1);
            // linkCurveGfx.arcTo(
            //     linkData.source.x, linkData.source.y, linkData.target.x, linkData.target.y, linkData.sameIndex * 600
            // )
            console.log("+++", linkData.source.x, linkData.source.y, linkData.target.x, linkData.target.y, linkData.sameIndex * 60)
            // linkCurveGfx.lineStyle(10,0xff0000, 0.5)
            // linkCurveGfx.lineTo(200,200)

            //             let linkCurveGfx = new PIXI.Graphics()
            // linkCurveGfx.lineStyle(10,0x000000)
            //
            // linkCurveGfx.moveTo(0,0)
            // linkCurveGfx.arcTo(0,100,200,200, 600)
            // linkCurveGfx.lineStyle(10,0xff0000, 0.5)a
            // linkCurveGfx.lineTo(200,200)

            // linkGfx.addChild(linkCurveGfx)


            //
            // linkGfx.beginFill(this.settings.LINK_DEFAULT_COLOR, 1);
            // // triangle for the arrow
            // linkGfx.lineStyle(1, this.settings.LINK_DEFAULT_COLOR, 1, .5)
            //     .moveTo(t1.x, t1.y)
            // linkGfx.lineTo(t2.x, t2.y)
            //     .lineTo(t3.x, t3.y)
            //     .lineTo(t1.x, t1.y)

            // set label at the next point
            linkLabelText.x = (linkData.source.x + linkData.target.x) / 2 - 10 * sameIndex;
            linkLabelText.y = (linkData.source.y + linkData.target.y) / 2 - 10 * sameIndex;
            // linkLabelText.x = nextPoint.x;
            // linkLabelText.y = nextPoint.y;


        }


        // )
        // linkGfx.buttonMode = true;
        linkGfx.endFill();


        // const sameIndex = 1;
        linkLabelText.anchor.set(0.5, 0);
        linkGfxLabel.addChild(linkLabelText)


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
                    linkGfxLabel.endFill();

                    // linkGfx.click = mouseover;
                    linkGfx.on("mouseover", (mouseData) => _this.eventStore.onLinkMouseOver(_this, linkData, linkGfx, mouseData));
                    linkGfx.on("mouseout", (mouseData) => _this.eventStore.onLinkMouseOut(_this, linkData, linkGfx, mouseData));
                    linkGfx.on('mousedown', event => _this.eventStore.onLinkClicked(_this, linkData, linkGfx, event));

                    clearInterval(interval);
                }
            }
        }, 50);

        linkGfx.alpha = this.settings.LINK_DEFAULT_ALPHA;
        linkGfxLabel.alpha = this.settings.LINK_DEFAULT_ALPHA;
        return {linkGfx, linkGfxLabel};

    }

    updatePositions = () => {
        const {links} = this.dataStore;
        this.clearLinkCanvas();
        const linkDataGfxPairs = [];
        for (let i = 0; i < links.length; i++) {
            let {linkGfx, linkGfxLabel} = this.createLink(links[i])
            this.dataStore.linkGraphicsArray.push(linkGfx);
            this.linksLayer.addChild(linkGfx);

            this.dataStore.linkLabelGraphicsArray.push(linkGfxLabel);
            this.linksLabelsLayer.addChild(linkGfxLabel);
            linkDataGfxPairs.push([links[i], linkGfx, linkGfxLabel])

        }
        this.graphStore.updateLinkPairs(linkDataGfxPairs);

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
        // .id(linkData => linkData.id)
        // .distance(function (d) {
        //     return 100
        // });

        this.forceSimulation.restart();

    }

    render() {

        this.isRendering = true
        const {nodes, links} = this.dataStore;
        console.log("rendering with data:: links ======== ", links.length);
        console.log("rendering with data:: nodes ======== ", nodes.length);


        const nodeDataGfxPairs = this.createNodes(nodes);
        this.graphStore.updateNodePairs(nodeDataGfxPairs);

        // initial draw
        this.requestRender();
    }

    addData(newNodes, newLinks) {
        let _this = this;
        this.dataStore.addData(newNodes, newLinks);
        const {nodes, links} = this.dataStore;
        console.log("=======", nodes.length, links.length);

        const linksCurvesPrepared = prepareLinksDataForCurves(links);

        _this.updateSimulationData(nodes, linksCurvesPrepared);
    }


    preventWheelScrolling() {
        // prevent body scrolling
        this.pixiApp.view.addEventListener('wheel', event => {
            event.preventDefault();
        });
    }

}
