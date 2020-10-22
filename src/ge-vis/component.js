import React from "react";
import GraphCanvas from "./canvas";
import Connector from "../connector";

const connector = new Connector();

export default class GraphComponent extends React.Component {


    componentDidMount() {
        const canvasElem = document.querySelector(".graphContainer");
        const initData = {
            nodes: [
                {"id": "Myriel", "group": 1},
                {"id": "Napoleon", "group": 1},
            ], links: [
                {"id": "Myriel-Napoleon", "source": "Napoleon", "target": "Myriel", "value": 1},
            ]
        };

        const data2 = {
            nodes: [
                {"id": "Ravi", "group": 1},
                // {"id": "Napoleon", "group": 1},

            ],
            links: [
                {"id": "Ravi-Napoleon", "source": "Ravi", "target": "Napoleon", value: 1}
            ]
        }
        this.graphCanvas = new GraphCanvas(canvasElem, 800, 500)
        this.graphCanvas.addData(initData.nodes, initData.links)
        let _this = this;
        // setTimeout(() => {
        // document.querySelector('.graphContainer').innerHTML = "";
        // this.graphCanvas = new GraphCanvas(canvasElem, 800, 500)
        _this.graphCanvas.addData(data2.nodes, data2.links);
        _this.graphCanvas.addData(connector.getData().nodes, connector.getData().links);

        // }, 1000)
    }

    render() {
        return (
            <div className={"graphContainer"}
                // style={{"height":500}}
            />
        )
    }

}
