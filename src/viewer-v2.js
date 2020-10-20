import React from "react";


export default class ViewerV2 extends React.Component{


    generateSimulation(){
        // g
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

    render(){
        return (
            <div className={"container"}></div>
        )
    }
}