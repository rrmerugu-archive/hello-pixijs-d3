import * as d3 from "d3";
import GraphStore from "./store";
import GESettings from "./settings";
import * as PIXI from 'pixi.js-legacy'
import { Viewport } from 'pixi-viewport'
import { colorToNumber, scale, getColor, getNodeLabel, getLinkLabel } from "./utils";

export default class GraphCanvas {


    graphStore = new GraphStore();
    renderRequestId = undefined;

    constructor(canvasElem, width, height) {
        this.settings = new GESettings(width, height);

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





    createNodes(nodes) {
        // create node graphics
        // let _this = this
        console.log("===nodes", nodes);
        const { NODE_HIT_RADIUS, NODE_RADIUS, LABEL_FONT_FAMILY, LABEL_FONT_SIZE,
            LABEL_X_PADDING,
            LABEL_Y_PADDING
        } = this.settings;

        return nodes.map(nodeData => {

            // console.log("====nodeData>>>", nodeData)
            const nodeGfx = new PIXI.Container();
            nodeGfx.x = nodeData.x;
            nodeGfx.y = nodeData.y;
            nodeGfx.interactive = true;
            nodeGfx.buttonMode = true;
            nodeGfx.hitArea = new PIXI.Circle(0, 0, NODE_HIT_RADIUS);
            // nodeGfx.on('click', event => hoverNode(nodeGfxToNodeData.get(event.currentTarget)));

            // nodeGfx.on('mouseover', event => hoverNode(nodeGfxToNodeData.get(event.currentTarget)));
            // nodeGfx.on('mouseout', event => unhoverNode(nodeGfxToNodeData.get(event.currentTarget)));
            // nodeGfx.on('mousedown', event => clickNode(nodeGfxToNodeData.get(event.currentTarget)));
            // nodeGfx.on('mouseup', () => unclickNode());
            // nodeGfx.on('mouseupoutside', () => unclickNode());

            const circle = new PIXI.Graphics();
            circle.x = 0;
            circle.y = 0;
            circle.beginFill(colorToNumber(getColor(nodeData)));
            circle.drawCircle(0, 0, NODE_RADIUS);
            nodeGfx.addChild(circle);

            const circleBorder = new PIXI.Graphics();
            circle.x = 0;
            circle.y = 0;
            circleBorder.lineStyle(1.5, 0xff00ff);
            circleBorder.drawCircle(0, 0, NODE_RADIUS);
            nodeGfx.addChild(circleBorder);

            // const icon = new PIXI.Text(ICON_TEXT, {
            //     fontFamily: ICON_FONT_FAMILY,
            //     fontSize: ICON_FONT_SIZE,
            //     fill: 0xffffff
            // });
            // icon.x = 0;
            // icon.y = 0;
            // icon.anchor.set(0.5);
            // nodeGfx.addChild(icon);


            this.nodesLayer.addChild(nodeGfx);


            const labelGfx = new PIXI.Container();
            labelGfx.x = nodeData.x;
            labelGfx.y = nodeData.y;
            labelGfx.interactive = true;
            labelGfx.buttonMode = true;
            // labelGfx.on('mouseover', event => hoverNode(labelGfxToNodeData.get(event.currentTarget)));
            // labelGfx.on('mouseout', event => unhoverNode(labelGfxToNodeData.get(event.currentTarget)));
            // labelGfx.on('mousedown', event => clickNode(labelGfxToNodeData.get(event.currentTarget)));
            // labelGfx.on('mouseup', () => unclickNode());
            // labelGfx.on('mouseupoutside', () => unclickNode());

            const labelText = new PIXI.Text(getNodeLabel(nodeData), {
                fontFamily: LABEL_FONT_FAMILY,
                fontSize: LABEL_FONT_SIZE,
                fill: 0x333333
            });
            labelText.x = 0;
            labelText.y = NODE_HIT_RADIUS + LABEL_Y_PADDING;
            labelText.anchor.set(0.5, 0);
            //const labelBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
            //labelBackground.x = -(labelText.width + LABEL_X_PADDING * 2) / 2;
            //labelBackground.y = NODE_HIT_RADIUS;
            //labelBackground.width = labelText.width + LABEL_X_PADDING * 2;
            //labelBackground.height = labelText.height + LABEL_Y_PADDING * 2;
            //labelBackground.tint = 0xffffff;
            //labelBackground.alpha = 0.5;
            //labelGfx.addChild(labelBackground);
            labelGfx.addChild(labelText);


            return [nodeData, nodeGfx, labelGfx];
        });

    }

    addData(nodes, links) {
        this.forceSimulation = this.generateForceSimulation({ nodes, links });

        const nodeDataGfxPairs = this.createNodes(nodes);

        // 
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