import React from "react";
import GraphCanvas from "./canvas";
import Connector from "../connector";
import "./style.css";

const connector = new Connector();

export default class GraphComponent extends React.Component {


    componentDidMount() {
        const canvasElem = document.querySelector(".graphContainer");
        const nodeMenuEl = document.querySelector("#nodeMenu");
        const initData = {
            nodes: [
                {"id": "Myriel", "group": 1},
                {"id": "Napoleon", "group": 1},
            ], links: [
                {"id": "Myriel-Napoleon", "source": "Napoleon", "target": "Myriel", "value": 1},
            ]
        };


        this.graphCanvas = new GraphCanvas(canvasElem, nodeMenuEl,
            900, 600
        )
        this.graphCanvas.addData(initData.nodes, initData.links)

        let _this = this;

        // setTimeout(() => {

        // _this.graphCanvas.addData(connector.getData().nodes, connector.getData().links);

        // }, 3000)

        // const data2 = {
        //     nodes: [
        //         {"id": "Ravi", "group": 1},
        //         // {"id": "Napoleon", "group": 1},
        //
        //     ],
        //     links: [
        //         {"id": "Ravi-Napoleon", "source": "Ravi", "target": "Napoleon", value: 1}
        //     ]
        // }
        // _this.graphCanvas.addData(data2.nodes, data2.links);

        let i = 1;
        // setInterval(() => {
        //     //
        //     let nodeName = "data-" + i;
        //
        //     let data3 = {
        //         nodes: [
        //             {"id": nodeName, "group": 1},
        //         ],
        //         links: [
        //             {"id": nodeName + "-Ravi", "source": nodeName, "target": "Ravi", value: 1}
        //         ]
        //     }
        //     _this.graphCanvas.addData(data3.nodes, data3.links);
        //     i += 1;
        // }, 5000)
    }


    onClickFocus() {
        const nodeData = this.graphCanvas.eventStore.lastSelectedNodeData;
        this.graphCanvas.zoom2Point(nodeData.x, nodeData.y);
    }

    onClickShowInV() {
        alert("onClickShowInv clicked");

    }

    onClickShowOutV() {
        alert("onClickShowOutV clicked");

    }

    hideMenu() {
        this.graphCanvas.nodeMenuEl.style.display = "none";
    }

    render() {
        return (
            <div className={"graphContainer"}>
                <ul id={"nodeMenu"} style={{"display": "none"}}>
                {/*<ul id={"nodeMenu"}>*/}
                    <li onClick={() => this.onClickFocus()}>Focus</li>
                    <li onClick={() => this.onClickShowInV()}>Show InV</li>
                    <li onClick={() => this.onClickShowOutV()}>Show OutV</li>
                    <li onClick={() => this.hideMenu()}>hide menu</li>
                </ul>
            </div>

        )
    }

}
