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
        if (this.renderRequestId) {
            return;
        }
        this.renderRequestId = window.requestAnimationFrame(() => {
            this.pixiApp.render();
            this.renderRequestId = undefined;
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
        // nodeContainer.on('click', event => hoverNode(nodeGfxToNodeData.get(event.currentTarget)));

        // nodeContainer.on('mouseover', event => hoverNode(nodeGfxToNodeData.get(event.currentTarget)));
        // nodeContainer.on('mouseout', event => unhoverNode(nodeGfxToNodeData.get(event.currentTarget)));
        // nodeContainer.on('mousedown', event => clickNode(nodeGfxToNodeData.get(event.currentTarget)));
        // nodeContainer.on('mouseup', () => unclickNode());
        // nodeContainer.on('mouseupoutside', () => unclickNode());

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
        // nodeLabelContainer.on('mouseover', event => hoverNode(labelGfxToNodeData.get(event.currentTarget)));
        // nodeLabelContainer.on('mouseout', event => unhoverNode(labelGfxToNodeData.get(event.currentTarget)));
        // nodeLabelContainer.on('mousedown', event => clickNode(labelGfxToNodeData.get(event.currentTarget)));
        // nodeLabelContainer.on('mouseup', () => unclickNode());
        // nodeLabelContainer.on('mouseupoutside', () => unclickNode());

        const nodeLabelText = new PIXI.Text(getNodeLabel(nodeData), {
            fontFamily: LABEL_FONT_FAMILY,
            fontSize: LABEL_FONT_SIZE,
            fill: 0x333333
        });
        nodeLabelText.x = 0 + LABEL_X_PADDING;
        nodeLabelText.y = NODE_HIT_RADIUS + LABEL_Y_PADDING;
        nodeLabelText.anchor.set(0.5, 0);
        //const labelBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        //labelBackground.x = -(nodeLabelText.width + LABEL_X_PADDING * 2) / 2;
        //labelBackground.y = NODE_HIT_RADIUS;
        //labelBackground.width = nodeLabelText.width + LABEL_X_PADDING * 2;
        //labelBackground.height = nodeLabelText.height + LABEL_Y_PADDING * 2;
        //labelBackground.tint = 0xffffff;
        //labelBackground.alpha = 0.5;
        //nodeLabelContainer.addChild(labelBackground);
        nodeLabelContainer.addChild(nodeLabelText);

        return { nodeContainer, nodeLabelContainer }
    }


    createNodes(nodes) {
        // create node graphics
        // let _this = this

        console.log("===nodes", nodes);

        return nodes.map(nodeData => {

            const { nodeContainer, nodeLabelContainer } = this.createNode(nodeData)
            this.nodesLayer.addChild(nodeContainer);
            this.nodeLabelsLayer.addChild(nodeLabelContainer);

            return [nodeData, nodeContainer, nodeLabelContainer];
        });

    }

    addData(nodes, links) {

        this.forceSimulation = this.generateForceSimulation({ nodes, links });
        const nodeDataGfxPairs = this.createNodes(nodes);

        // update store
        this.graphStore.update(nodeDataGfxPairs);

        // initial draw
        this.resetViewport();
        this.requestRender();

        // updatePositions();
        this.preventWheelScrolling();


    }


    preventWheelScrolling() {
        // prevent body scrolling
        this.pixiApp.view.addEventListener('wheel', event => {
            event.preventDefault();
        });
    }

}