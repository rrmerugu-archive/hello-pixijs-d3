import React from "react";
import GraphCanvas from "./canvas";

export default class GraphComponent extends React.Component{


    componentDidMount(){
        const canvasElem = document.querySelector(".graphContainer");
        const initData = {nodes: [
            {"id": "Myriel", "group": 1},
            {"id": "Napoleon", "group": 1},
        ], links: [
            {"id": "Myriel-Napoleon", "source": "Napoleon", "target": "Myriel", "value": 1},
        ]};
        this.graphCanvas = new GraphCanvas(canvasElem, 800, 500)
        this.graphCanvas.addData(initData.nodes, initData.links)
    }

    render(){
        return (
            <div className={"graphContainer"} 
            // style={{"height":500}}
             />
        )
    }

}