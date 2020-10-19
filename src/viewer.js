import React from "react";
// import * as PIXI from 'pixi.js'
import * as PIXI from 'pixi.js-legacy'
import * as d3 from "d3";
import {Viewport} from 'pixi-viewport'
import Connector from "./connector";
import FontFaceObserver from "fontfaceobserver";

const connector = new Connector();

export function prepareLinksDataForCurves(links) {
    /*
    This method will set attributes on to the links that will
    help us controls the curves of the links.
     */
    links.forEach(function (link) {

        // find other links with same target+source or source+target
        let same = links.filter(function (v) {
            return ((v.source === link.source && v.target === link.target));
        })
        let sameAlt = links.filter(function (v) {
            return ((v.source === link.target && v.target === link.source));
        })

        let sameAll = same.concat(sameAlt);
        sameAll.forEach(function (s, i) {
            s.sameIndex = (i + 1);
            s.sameTotal = sameAll.length;
            s.sameTotalHalf = (s.sameTotal / 2);
            s.sameUneven = ((s.sameTotal % 2) !== 0);
            s.sameMiddleLink = ((s.sameUneven === true) && (Math.ceil(s.sameTotalHalf) === s.sameIndex));
            s.sameLowerHalf = (s.sameIndex <= s.sameTotalHalf);
            s.sameArcDirection = s.sameLowerHalf ? 0 : 1;
            s.sameIndexCorrected = s.sameLowerHalf ? s.sameIndex : (s.sameIndex - Math.ceil(s.sameTotalHalf));

            // if (s.sameIndexCorrected === 2) {
            //     s.sameArcDirection = 1;
            // }
            // if (s.sameIndexCorrected === 1) {
            //     s.sameArcDirection = 0;
            // }
        });
    });

    links.sort(function (a, b) {
        if (a.sameTotal < b.sameTotal) return -1;
        if (a.sameTotal > b.sameTotal) return 1;
        return 0;
    });

    if (links.length > 0) {
        const maxSame = links[links.length - 1].sameTotal;

        links.forEach(function (link, i) {
            links[i].maxSameHalf = Math.round(maxSame / 3);
        });

    }


    return links.map(link => {
        let obj = link;
        obj.source = link.source;
        obj.target = link.target;
        return obj;
    })
}


export default class Viewer extends React.Component {

    forceLayout(...args) {
        const [data, {iterations, nodeRepulsionStrength, defaultLinkLength}] = args
        d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links)
                .id(linkData => linkData.id)
                .distance(function (d) {
                    return d.distance || defaultLinkLength
                })
            )
            .force("charge", d3.forceManyBody().strength(-nodeRepulsionStrength))
            .force("center", d3.forceCenter())
            .stop()
            .tick(iterations);
        return data;

    }


    componentDidMount() {
        // let data = connector.getGraphData();
       let data = connector.getData();

        let c = 1;
        // setInterval(() => {
        //     data.links.push(
        //         {
        //             id: "1-3-" + c,
        //             source: 1, target: 3,
        //             linkStyleConfig: {
        //                 lineStyle: 1,
        //             },
        //             properties: {"title": "Edge-1-3-"+ c}
        //         }
        //     )
        //     this.drawGraph(data);
        //     c += 1;
        //
        // }, 3000);
        //
        //
        this.drawGraph(data);

    }

    drawGraph(data) {
        // config
        const SCREEN_WIDTH = window.innerWidth;
        const SCREEN_HEIGHT = window.innerHeight;
        //const WORLD_WIDTH = SCREEN_WIDTH * 2;
        //const WORLD_HEIGHT = SCREEN_HEIGHT * 2;
        // const RESOLUTION = window.devicePixelRatio * 2;
        const WORLD_WIDTH = SCREEN_WIDTH / 4;
        const WORLD_HEIGHT = SCREEN_HEIGHT / 4;
        const RESOLUTION = window.devicePixelRatio * 2;
        const FORCE_LAYOUT_NODE_REPULSION_STRENGTH = 300;
        const FORCE_LAYOUT_ITERATIONS = 650;
        const DEFAULT_LINK_LENGTH = 120;
        const NODE_RADIUS = 10;
        const NODE_HIT_RADIUS = NODE_RADIUS + 15;
        const ICON_FONT_FAMILY = 'Material Icons';
        const ICON_FONT_SIZE = NODE_RADIUS / Math.SQRT2 * 2;
        const ICON_TEXT = 'person';
        const LABEL_FONT_FAMILY = 'Helvetica';
        const LABEL_FONT_SIZE = 12;
        const LABEL_TEXT = nodeData => nodeData.id;
        const LABEL_X_PADDING = -12;
        const LABEL_Y_PADDING = -15;
        const defaultLineWidth = 1;

        data.links = prepareLinksDataForCurves(data.links);

        const colorToNumber = (c) => {
            return parseInt(c.slice(1), 16)
        }
        const scale = d3.scaleOrdinal(d3.schemeCategory10);

        function color(nodeData) {
            return scale(nodeData.group);
        }


        // static force-directed layout, running in WebWorker thread
        const {nodes, links} = this.forceLayout(data, {
            iterations: FORCE_LAYOUT_ITERATIONS,
            nodeRepulsionStrength: FORCE_LAYOUT_NODE_REPULSION_STRENGTH,
            defaultLinkLength: DEFAULT_LINK_LENGTH
        });


        // preload font
        new FontFaceObserver(ICON_FONT_FAMILY).load();

        // create PIXI application
        const app = new PIXI.Application({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            resolution: RESOLUTION,
            transparent: true,
            // backgroundColor: 0xFFFFFF,
            antialias: true,
            autoStart: false, // disable automatic rendering by ticker, render manually instead, only when needed
            forceCanvas: true,
            autoDensity: true

        });
        // app.view.style.width = `${SCREEN_WIDTH}px`;
        app.view.style.width = SCREEN_WIDTH + "px";
        // app.view.style.height = SCREEN_HEIGHT + "px";
        // app.view.style.position = "absolute";


        const container = document.getElementById("container");
        container.appendChild(app.view);


        // manual rendering
        app.renderer.on('postrender', () => {
            console.log('render');
        });
        let renderRequestId = undefined;
        let requestRender = () => {
            if (renderRequestId) {
                return;
            }
            renderRequestId = window.requestAnimationFrame(() => {
                app.render();
                renderRequestId = undefined;
            });
        }

        // create PIXI viewport
        const viewport = new Viewport({
            screenWidth: SCREEN_WIDTH,
            screenHeight: SCREEN_HEIGHT,
            worldWidth: WORLD_WIDTH,
            worldHeight: WORLD_HEIGHT,
            interaction: app.renderer.plugins.interaction
        });

        app.stage.addChild(viewport);
        viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate();
        viewport.on('frame-end', () => {
            if (viewport.dirty) {
                requestRender();
                viewport.dirty = false;
            }
        });

        // create 4 layers: links, nodes, labels, front

        const linksLayer = new PIXI.Container();
        viewport.addChild(linksLayer);
        const linksLabelsLayer = new PIXI.Container();
        viewport.addChild(linksLabelsLayer);
        const nodesLayer = new PIXI.Container();
        viewport.addChild(nodesLayer);
        const labelsLayer = new PIXI.Container();
        viewport.addChild(labelsLayer);
        const frontLayer = new PIXI.Container();
        viewport.addChild(frontLayer);


        const resetViewport = () => {
            viewport.center = new PIXI.Point(WORLD_WIDTH / 4, WORLD_HEIGHT / 4);
            // viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
            viewport.fit(true, WORLD_WIDTH / 4, WORLD_HEIGHT / 4)
            viewport.setZoom(0.5, true);


            // app.stage.x = WORLD_WIDTH / 2;
            // app.stage.y = WORLD_HEIGHT / 2;

            // app.stage.

            // linksLayer.x = WORLD_WIDTH / 2;
            // linksLayer.y = WORLD_HEIGHT / 2;
            //
            // nodesLayer.x = WORLD_WIDTH / 2;
            // nodesLayer.y = WORLD_HEIGHT / 2;
            //
            // linksLabelsLayer.x = WORLD_WIDTH / 2;
            // linksLabelsLayer.y = WORLD_HEIGHT / 2;
            //
            // labelsLayer.x = WORLD_WIDTH / 2;
            // labelsLayer.y = WORLD_HEIGHT / 2;
            //
            // frontLayer.x = WORLD_WIDTH / 2;
            // frontLayer.y = WORLD_HEIGHT / 2;


        };


        // state
        let nodeDataToNodeGfx = new WeakMap();
        let nodeGfxToNodeData = new WeakMap();
        let nodeDataToLabelGfx = new WeakMap();
        let labelGfxToNodeData = new WeakMap();
        let hoveredNodeData = undefined;
        let hoveredNodeGfxOriginalChildren = undefined;
        let hoveredLabelGfxOriginalChildren = undefined;
        let clickedNodeData = undefined;
        let linkGraphicsArray = [];
        let linkLabelGraphicsArray = [];


        const updatePositions = () => {
            console.log("=====linkGraphicsArray", linkGraphicsArray);
            console.log("=====linkLabelGraphicsArray", linkLabelGraphicsArray);

            while (linkGraphicsArray.length > 0) {
                let linkGraphics = linkGraphicsArray.pop();
                linkGraphics.clear();
                linksLayer.removeChild(linkGraphics);
                linkGraphics.destroy();
            }
            while (linkLabelGraphicsArray.length > 0) {
                let linkLabelGraphics = linkLabelGraphicsArray.pop();
                linkLabelGraphics.clear();
                linksLabelsLayer.removeChild(linkLabelGraphics);
                linkLabelGraphics.destroy();
            }

            let limitedLinks = new PIXI.Graphics();
            // limitedLinks.alpha = 0.6;
            linkGraphicsArray.push(limitedLinks);
            linksLayer.addChild(limitedLinks);


            // links labels
            let limitedLinksLabels = new PIXI.Graphics();
            // limitedLinksLabels.alpha = 0.6;
            linkLabelGraphicsArray.push(limitedLinksLabels);
            linksLabelsLayer.addChild(limitedLinksLabels);


            //
            // const labelBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
            // labelBackground.x = -(labelText.width + LABEL_X_PADDING * 2) / 2;
            // labelBackground.y = NODE_HIT_RADIUS;
            // labelBackground.width = labelText.width + LABEL_X_PADDING * 2;
            // labelBackground.height = labelText.height + LABEL_Y_PADDING * 2;
            // labelBackground.tint = 0xeeeeee;
            // labelGfx.addChild(labelBackground);
            // labelGfx.addChild(labelText);


            let count = 2500;
            for (let i = 0; i < links.length; i++) {
                if (count === 0) {
                    count = 2500;
                    limitedLinks.endFill();
                    limitedLinks = new PIXI.Graphics();
                    linkGraphicsArray.push(limitedLinks);
                    linksLayer.addChild(limitedLinks);
                    // limitedLinks.alpha = 0.6;


                    // link labels
                    limitedLinksLabels.endFill();
                    limitedLinksLabels = new PIXI.Graphics();
                    linkLabelGraphicsArray.push(limitedLinksLabels);
                    linksLabelsLayer.addChild(limitedLinksLabels);
                    // limitedLinksLabels.alpha = 0.6;


                }


                const curvatureConstant = 0.5;
                const sameIndex = links[i].sameIndex;

                let nextPointX = links[i].target.x;
                let nextPointY = links[i].target.y;
                let normal = [
                    -(links[i].target.y - NODE_RADIUS),
                    links[i].target.x - NODE_RADIUS,
                ]
                if (sameIndex > 1) {
                    // for curved links
                    nextPointX = links[i].target.x - 50 * sameIndex * curvatureConstant;
                    nextPointY = links[i].target.y - 100 * sameIndex * curvatureConstant;
                    normal = [
                        -(links[i].target.y - NODE_RADIUS - nextPointY),
                        links[i].target.x - NODE_RADIUS - nextPointX,
                    ]
                }


                const l = Math.sqrt(normal[0] ** 2 + normal[1] ** 2) * 2;
                console.log("=====l", l, normal);
                console.log("=====link", links[i])
                normal[0] /= l;
                normal[1] /= l;

                const tangent = [
                    -normal[1] * 30,
                    normal[0] * 30
                ]

                normal[0] *= 20;
                normal[1] *= 20;

                // limitedLinks.lineStyle(Math.sqrt(links[i].linkStyleConfig.lineStyle? links[i].linkStyleConfig: 1), 0x999999);
                limitedLinks.lineStyle(Math.sqrt(defaultLineWidth), 0x999999);
                limitedLinks.moveTo(links[i].source.x, links[i].source.y);
                // limitedLinks.lineTo(links[i].target.x, links[i].target.y);

                if (sameIndex === 1) {
                    // limitedLinks.lineStyle(2, 0xAA0000, 1);
                    limitedLinks.lineTo(links[i].target.x, links[i].target.y);

                } else {
                    limitedLinks
                        .bezierCurveTo(links[i].source.x, links[i].source.y,
                            nextPointX, nextPointY, links[i].target.x, links[i].target.y)

                }
                limitedLinks.lineStyle(2, 0xAA0000, 1, .5)
                    .moveTo(links[i].target.x + normal[0] + tangent[0], links[i].target.y + normal[1] + tangent[1])
                    .lineTo(links[i].target.x, links[i].target.y)
                    .lineTo(links[i].target.x - normal[0] + tangent[0], links[i].target.y - normal[1] + tangent[1])


                // for link label
                const linkLabelText = new PIXI.Text(LABEL_TEXT(links[i]), {
                    // fontFamily: LABEL_FONT_FAMILY,
                    fontSize: LABEL_FONT_SIZE,
                    // fill: 0x343434
                });
                linkLabelText.x = (links[i].source.x + links[i].target.x) / 2 - 10 * sameIndex;
                linkLabelText.y = (links[i].source.y + links[i].target.y) / 2 - 10 * sameIndex;
                linkLabelText.anchor.set(0.5, 0);
                limitedLinksLabels.addChild(linkLabelText)


                count--;
            }
            //linksLayer.removeChildren();
            //for(const linkGraphics in linkGraphicsArray){
            //  linksLayer.addChild(linkGraphics);
            //}

            //for (const link of links) {
            //  limitedLinks.lineStyle(Math.sqrt(link.value), 0x999999);
            //  limitedLinks.moveTo(link.source.x, link.source.y);
            //  limitedLinks.lineTo(link.target.x, link.target.y);
            //}
            //limitedLinks.endFill();
            //linksLayer.addChild(limitedLinks);

            for (const node of nodes) {
                nodeDataToNodeGfx.get(node).position = new PIXI.Point(node.x, node.y)
                nodeDataToLabelGfx.get(node).position = new PIXI.Point(node.x, node.y)
            }

            requestRender();
        };

        // event handlers
        const hoverNode = nodeData => {
            if (clickedNodeData) {
                return;
            }
            if (hoveredNodeData === nodeData) {
                return;
            }

            hoveredNodeData = nodeData;

            const nodeGfx = nodeDataToNodeGfx.get(nodeData);
            const labelGfx = nodeDataToLabelGfx.get(nodeData);

            // move to front layer
            nodesLayer.removeChild(nodeGfx);
            frontLayer.addChild(nodeGfx);
            labelsLayer.removeChild(labelGfx);
            frontLayer.addChild(labelGfx);

            // add hover effect
            hoveredNodeGfxOriginalChildren = [...nodeGfx.children];
            hoveredLabelGfxOriginalChildren = [...labelGfx.children];

            // circle border
            const circleBorder = new PIXI.Graphics();
            circleBorder.x = 0;
            circleBorder.y = 0;
            circleBorder.lineStyle(1.5, 0x000000);
            circleBorder.drawCircle(0, 0, NODE_RADIUS);
            nodeGfx.addChild(circleBorder);

            // text with background
            const labelText = new PIXI.Text(LABEL_TEXT(nodeData), {
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
            //labelBackground.tint = 0xeeeeee;
            //labelGfx.addChild(labelBackground);
            labelGfx.addChild(labelText);

            requestRender();
        };
        const unhoverNode = nodeData => {
            if (clickedNodeData) {
                return;
            }
            if (hoveredNodeData !== nodeData) {
                return;
            }

            hoveredNodeData = undefined;

            const nodeGfx = nodeDataToNodeGfx.get(nodeData);
            const labelGfx = nodeDataToLabelGfx.get(nodeData);

            // move back from front layer
            frontLayer.removeChild(nodeGfx);
            nodesLayer.addChild(nodeGfx);
            frontLayer.removeChild(labelGfx);
            labelsLayer.addChild(labelGfx);

            // clear hover effect
            const nodeGfxChildren = [...nodeGfx.children];
            for (let child of nodeGfxChildren) {
                if (!hoveredNodeGfxOriginalChildren.includes(child)) {
                    nodeGfx.removeChild(child);
                }
            }
            hoveredNodeGfxOriginalChildren = undefined;
            const labelGfxChildren = [...labelGfx.children];
            for (let child of labelGfxChildren) {
                if (!hoveredLabelGfxOriginalChildren.includes(child)) {
                    labelGfx.removeChild(child);
                }
            }
            hoveredLabelGfxOriginalChildren = undefined;

            requestRender();
        };
        const moveNode = (nodeData, point) => {
            const nodeGfx = nodeDataToNodeGfx.get(nodeData);

            nodeData.x = point.x;
            nodeData.y = point.y;

            updatePositions();
        };
        const appMouseMove = event => {
            if (!clickedNodeData) {
                return;
            }

            moveNode(clickedNodeData, viewport.toWorld(event.data.global));
        };
        const clickNode = nodeData => {
            clickedNodeData = nodeData;

            // enable node dragging
            app.renderer.plugins.interaction.on('mousemove', appMouseMove);
            // disable viewport dragging
            viewport.pause = true;
        };
        const unclickNode = () => {
            clickedNodeData = undefined;

            // disable node dragging
            app.renderer.plugins.interaction.off('mousemove', appMouseMove);
            // enable viewport dragging
            viewport.pause = false;
        };

        // create node graphics
        const nodeDataGfxPairs = nodes.map(nodeData => {
            const nodeGfx = new PIXI.Container();
            nodeGfx.x = nodeData.x;
            nodeGfx.y = nodeData.y;
            nodeGfx.interactive = true;
            nodeGfx.buttonMode = true;
            nodeGfx.hitArea = new PIXI.Circle(0, 0, NODE_HIT_RADIUS);
            nodeGfx.on('mouseover', event => hoverNode(nodeGfxToNodeData.get(event.currentTarget)));
            nodeGfx.on('mouseout', event => unhoverNode(nodeGfxToNodeData.get(event.currentTarget)));
            nodeGfx.on('mousedown', event => clickNode(nodeGfxToNodeData.get(event.currentTarget)));
            nodeGfx.on('mouseup', () => unclickNode());
            nodeGfx.on('mouseupoutside', () => unclickNode());

            const circle = new PIXI.Graphics();
            circle.x = 0;
            circle.y = 0;
            circle.beginFill(colorToNumber(color(nodeData)));
            circle.drawCircle(0, 0, NODE_RADIUS);
            nodeGfx.addChild(circle);

            const circleBorder = new PIXI.Graphics();
            circle.x = 0;
            circle.y = 0;
            circleBorder.lineStyle(1.5, 0xff00ff);
            circleBorder.drawCircle(0, 0, NODE_RADIUS);
            nodeGfx.addChild(circleBorder);

            const icon = new PIXI.Text(ICON_TEXT, {
                fontFamily: ICON_FONT_FAMILY,
                fontSize: ICON_FONT_SIZE,
                fill: 0xffffff
            });
            icon.x = 0;
            icon.y = 0;
            icon.anchor.set(0.5);
            nodeGfx.addChild(icon);

            const labelGfx = new PIXI.Container();
            labelGfx.x = nodeData.x;
            labelGfx.y = nodeData.y;
            labelGfx.interactive = true;
            labelGfx.buttonMode = true;
            labelGfx.on('mouseover', event => hoverNode(labelGfxToNodeData.get(event.currentTarget)));
            labelGfx.on('mouseout', event => unhoverNode(labelGfxToNodeData.get(event.currentTarget)));
            labelGfx.on('mousedown', event => clickNode(labelGfxToNodeData.get(event.currentTarget)));
            labelGfx.on('mouseup', () => unclickNode());
            labelGfx.on('mouseupoutside', () => unclickNode());

            const labelText = new PIXI.Text(LABEL_TEXT(nodeData), {
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

            nodesLayer.addChild(nodeGfx);
            labelsLayer.addChild(labelGfx);

            return [nodeData, nodeGfx, labelGfx];
        });

        // create lookup tables
        nodeDataToNodeGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, nodeGfx]));
        nodeGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeGfx, nodeData]));
        nodeDataToLabelGfx = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [nodeData, labelGfx]));
        labelGfxToNodeData = new WeakMap(nodeDataGfxPairs.map(([nodeData, nodeGfx, labelGfx]) => [labelGfx, nodeData]));

        // initial draw
        resetViewport();
        updatePositions();

        // // destroy PIXI application on Observable cell invalidation
        // invalidation.then(() => {
        //     app.destroy(true, true);
        // });

        // prevent body scrolling
        app.view.addEventListener('wheel', event => {
            event.preventDefault();
        });

    }

    render() {
        return (
            <div>
                <div id="container"/>
            </div>
        )
    }
}
