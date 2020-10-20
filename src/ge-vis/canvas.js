import * as d3 from "d3";
import GraphStore from "./store";
import GESettings from "./settings";
import * as PIXI from 'pixi.js-legacy'
import { Viewport } from 'pixi-viewport'
import { colorToNumber, scale, getColor, getNodeLabel, getLinkLabel } from "./utils";
import FontFaceObserver from "fontfaceobserver";

export default class GraphCanvas {


    graphStore = new GraphStore();
    renderRequestId = undefined;

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

    onNodeClick(node) {

    }

    onNodeUnClicked(node) {

    }

    onLinkClicked(link) {

    }

    onLinkUnClicked(link) {

    }


    resetViewport() {
        this.viewport.center = new PIXI.Point(this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4);
        this.viewport.fit(true, this.settings.WORLD_WIDTH / 4, this.settings.WORLD_HEIGHT / 4)
        this.viewport.setZoom(0.5, true);
    };



    createNode(nodeData) {
        const { NODE_HIT_RADIUS, NODE_RADIUS, LABEL_FONT_FAMILY, LABEL_FONT_SIZE,
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
        nodeLabelText.x = 0 + LABEL_X_PADDING;
        nodeLabelText.y = NODE_HIT_RADIUS + LABEL_Y_PADDING;
        nodeLabelText.anchor.set(0.5, 0);
        
        nodeLabelContainer.addChild(nodeLabelText);

        return { nodeContainer, nodeLabelContainer }
    }


    createNodes(nodes) {
        // create node graphics
        return nodes.map(nodeData => {
            const { nodeContainer, nodeLabelContainer } = this.createNode(nodeData);

            this.nodesLayer.addChild(nodeContainer);
            this.nodeLabelsLayer.addChild(nodeLabelContainer);
            return [nodeData, nodeContainer, nodeLabelContainer];
        });

    }
    linkGraphicsArray = [];
    linkLabelGraphicsArray = [];


    clearCanvas(){
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


    createLink(linkData){
        const { NODE_RADIUS, LINK_DEFAULT_LABEL_FONT_SIZE, LABEL_FONT_FAMILY, LINK_DEFAULT_WIDTH } = this.settings;

        let linkGfx = new PIXI.Graphics();

        // link labels
        let linkGfxLabels = new PIXI.Graphics();
        this.linkLabelGraphicsArray.push(linkGfxLabels);
        this.linksLabelsLayer.addChild(linkGfxLabels);
        // linkGfxLabels.alpha = .5;


        const curvatureConstant = 0.5;
        const sameIndex = linkData.sameIndex;

        let nextPointX = linkData.target.x;
        let nextPointY = linkData.target.y;
        let normal = [
            -(linkData.target.y - NODE_RADIUS),
            linkData.target.x - NODE_RADIUS,
        ]
        if (sameIndex > 1) {
            // for curved links
            nextPointX = linkData.target.x - 50 * sameIndex * curvatureConstant;
            nextPointY = linkData.target.y - 100 * sameIndex * curvatureConstant;
            normal = [
                -(linkData.target.y - NODE_RADIUS - nextPointY),
                linkData.target.x - NODE_RADIUS - nextPointX,
            ]
        }

        const l = Math.sqrt(normal[0] ** 2 + normal[1] ** 2) * 2;
        normal[0] /= l;
        normal[1] /= l;

        const tangent = [
            -normal[1] * 30,
            normal[0] * 30
        ]

        normal[0] *= 20;
        normal[1] *= 20;

        linkGfx.lineStyle(Math.sqrt(LINK_DEFAULT_WIDTH), 0x999999);
        linkGfx.moveTo(linkData.source.x, linkData.source.y);

        if (sameIndex === 1) {
            linkGfx.lineTo(linkData.target.x, linkData.target.y);
            // linkGfx.lineTo(linkData.source.x + 2, linkData.source.y + 2);
            // linkGfx.lineTo(linkData.target.x + 2, linkData.target.y + 2);
            // linkGfx.lineTo(linkData.target.x - 2, linkData.target.y - 2);
            // linkGfx.lineTo(linkData.source.x - 2, linkData.source.y - 2);

        } else {
            linkGfx
                .bezierCurveTo(linkData.source.x, linkData.source.y,
                    nextPointX, nextPointY, linkData.target.x, linkData.target.y)

        }
        // this is the arrow head
        // linkGfx.lineStyle(5, 0xAA0000, 1, .5)
        //     .moveTo(linkData.target.x + normal[0] + tangent[0], linkData.target.y + normal[1] + tangent[1])
        //     .lineTo(linkData.target.x, linkData.target.y)
        //     .lineTo(linkData.target.x - normal[0] + tangent[0], linkData.target.y - normal[1] + tangent[1])
        //

        // for link label
        const linkLabelText = new PIXI.Text(getLinkLabel(linkData), {
            fontFamily: LABEL_FONT_FAMILY,
            fontSize: LINK_DEFAULT_LABEL_FONT_SIZE,
            fill: 0xd2d2d2
        });
        linkLabelText.x = (linkData.source.x + linkData.target.x) / 2 - 10 * sameIndex;
        linkLabelText.y = (linkData.source.y + linkData.target.y) / 2 - 10 * sameIndex;
        linkLabelText.anchor.set(0.5, 0);
        linkGfxLabels.addChild(linkLabelText)

        // console.log("==point", points);
        // console.log("======points", linkGfx)
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

                    function mouseover(mouseData, linkData) {
                        console.log("link MouseOver", mouseData, linkData);
                        // this.alpha = 1;
                    }

                    function mouseout(mouseData, linkData) {
                        console.log("link MouseOut", mouseData, linkData);

                        // this.alpha = 0.5;
                    }


                    // linkGfx.click = mouseover;
                    linkGfx.on("mouseover", (mouseData) => mouseover(mouseData, linkData));
                    linkGfx.on("mouseout", (mouseData) => mouseout(mouseData, linkData));
                    clearInterval(interval);
                }
            }
        }, 50);
        return linkGfx;

    }

    updatePositions = () => {

        let _this = this;
        const { links, nodes } = this.graphStore;

        this.clearCanvas();

        for (let i = 0; i < links.length; i++) {
 
  
            let linkGfx = this.createLink(links[i])
            // linkGfx.hitArea = linkGfx.getBounds();
            // linkGfx.interactive = true;


            this.linkGraphicsArray.push(linkGfx);
            this.linksLayerContainer.addChild(linkGfx);
        }

 


        for (const node of nodes) {
            _this.graphStore.nodeDataToNodeGfx.get(node).position = new PIXI.Point(node.x, node.y)
            _this.graphStore.nodeDataToLabelGfx.get(node).position = new PIXI.Point(node.x, node.y)
        }
        console.log("log positions updated");
        this.requestRender();
    };



    addData(nodes, links) {

        this.forceSimulation = this.generateForceSimulation({ nodes, links });


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