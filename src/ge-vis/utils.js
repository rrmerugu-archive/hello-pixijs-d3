import * as d3 from "d3";


export const colorToNumber = (c) => {
    return parseInt(c.slice(1), 16)
}
export const  scale = d3.scaleOrdinal(d3.schemeCategory10);

export function getColor(nodeData) {
    return scale(nodeData.group);
}

export const getNodeLabel = nodeData => nodeData.id;
export const getLinkLabel = linkData => linkData.source.id + "-" + linkData.target.id;
