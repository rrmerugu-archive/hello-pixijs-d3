// config
const SCREEN_WIDTH = 1000;
const SCREEN_HEIGHT = 720;
//const WORLD_WIDTH = SCREEN_WIDTH * 2;
//const WORLD_HEIGHT = SCREEN_HEIGHT * 2;
//const RESOLUTION = window.devicePixelRatio * 2;
const WORLD_WIDTH = SCREEN_WIDTH;
const WORLD_HEIGHT = SCREEN_HEIGHT;
const RESOLUTION = window.devicePixelRatio;
const FORCE_LAYOUT_NODE_REPULSION_STRENGTH = 250;
const FORCE_LAYOUT_ITERATIONS = 300;
const NODE_RADIUS = 15;
const NODE_HIT_RADIUS = NODE_RADIUS + 5;
const ICON_FONT_FAMILY = 'Material Icons';
const ICON_FONT_SIZE = NODE_RADIUS / Math.SQRT2 * 2;
const ICON_TEXT = 'person';
const LABEL_FONT_FAMILY = 'Helvetica';
const LABEL_FONT_SIZE = 12;
const LABEL_TEXT = nodeData => nodeData.id;
const LABEL_X_PADDING = 2;
const LABEL_Y_PADDING = 1;


//
// let {
//     nodes_pre,
//     links_pre
// } = d3.json("https://gist.githubusercontent.com/mbostock/4062045/raw/5916d145c8c048a6e3086915a6be464467391c62/miserables.json")

// d3.json("https://gist.githubusercontent.com/mbostock/4062045/raw/5916d145c8c048a6e3086915a6be464467391c62/miserables.json",
//     function (data) {
// console.log("====data", data);
//     })

// const mydata = getData()
  const { nodes_pre, links_pre }  = {
  "nodes_pre": [
    {"id": "Myriel", "group": 1},
    {"id": "Napoleon", "group": 1},
    {"id": "Mlle.Baptistine", "group": 1},
    {"id": "Mme.Magloire", "group": 1},
    {"id": "CountessdeLo", "group": 1},
    {"id": "Geborand", "group": 1},
    {"id": "Champtercier", "group": 1},
    {"id": "Cravatte", "group": 1},
    {"id": "Count", "group": 1},
    {"id": "OldMan", "group": 1},
    {"id": "Labarre", "group": 2},
    {"id": "Valjean", "group": 2},
    {"id": "Marguerite", "group": 3},
    {"id": "Mme.deR", "group": 2},
    {"id": "Isabeau", "group": 2},
    {"id": "Gervais", "group": 2},
    {"id": "Tholomyes", "group": 3},
    {"id": "Listolier", "group": 3},
    {"id": "Fameuil", "group": 3},
    {"id": "Blacheville", "group": 3},
    {"id": "Favourite", "group": 3},
    {"id": "Dahlia", "group": 3},
    {"id": "Zephine", "group": 3},
    {"id": "Fantine", "group": 3},
    {"id": "Mme.Thenardier", "group": 4},
    {"id": "Thenardier", "group": 4},
    {"id": "Cosette", "group": 5},
    {"id": "Javert", "group": 4},
    {"id": "Fauchelevent", "group": 0},
    {"id": "Bamatabois", "group": 2},
    {"id": "Perpetue", "group": 3},
    {"id": "Simplice", "group": 2},
    {"id": "Scaufflaire", "group": 2},
    {"id": "Woman1", "group": 2},
    {"id": "Judge", "group": 2},
    {"id": "Champmathieu", "group": 2},
    {"id": "Brevet", "group": 2},
    {"id": "Chenildieu", "group": 2},
    {"id": "Cochepaille", "group": 2},
    {"id": "Pontmercy", "group": 4},
    {"id": "Boulatruelle", "group": 6},
    {"id": "Eponine", "group": 4},
    {"id": "Anzelma", "group": 4},
    {"id": "Woman2", "group": 5},
    {"id": "MotherInnocent", "group": 0},
    {"id": "Gribier", "group": 0},
    {"id": "Jondrette", "group": 7},
    {"id": "Mme.Burgon", "group": 7},
    {"id": "Gavroche", "group": 8},
    {"id": "Gillenormand", "group": 5},
    {"id": "Magnon", "group": 5},
    {"id": "Mlle.Gillenormand", "group": 5},
    {"id": "Mme.Pontmercy", "group": 5},
    {"id": "Mlle.Vaubois", "group": 5},
    {"id": "Lt.Gillenormand", "group": 5},
    {"id": "Marius", "group": 8},
    {"id": "BaronessT", "group": 5},
    {"id": "Mabeuf", "group": 8},
    {"id": "Enjolras", "group": 8},
    {"id": "Combeferre", "group": 8},
    {"id": "Prouvaire", "group": 8},
    {"id": "Feuilly", "group": 8},
    {"id": "Courfeyrac", "group": 8},
    {"id": "Bahorel", "group": 8},
    {"id": "Bossuet", "group": 8},
    {"id": "Joly", "group": 8},
    {"id": "Grantaire", "group": 8},
    {"id": "MotherPlutarch", "group": 9},
    {"id": "Gueulemer", "group": 4},
    {"id": "Babet", "group": 4},
    {"id": "Claquesous", "group": 4},
    {"id": "Montparnasse", "group": 4},
    {"id": "Toussaint", "group": 5},
    {"id": "Child1", "group": 10},
    {"id": "Child2", "group": 10},
    {"id": "Brujon", "group": 4},
    {"id": "Mme.Hucheloup", "group": 8}
  ],
  "links_pre": [
    {"source": "Napoleon", "target": "Myriel", "value": 1},
    {"source": "Mlle.Baptistine", "target": "Myriel", "value": 8},
    {"source": "Mme.Magloire", "target": "Myriel", "value": 10},
    {"source": "Mme.Magloire", "target": "Mlle.Baptistine", "value": 6},
    {"source": "CountessdeLo", "target": "Myriel", "value": 1},
    {"source": "Geborand", "target": "Myriel", "value": 1},
    {"source": "Champtercier", "target": "Myriel", "value": 1},
    {"source": "Cravatte", "target": "Myriel", "value": 1},
    {"source": "Count", "target": "Myriel", "value": 2},
    {"source": "OldMan", "target": "Myriel", "value": 1},
    {"source": "Valjean", "target": "Labarre", "value": 1},
    {"source": "Valjean", "target": "Mme.Magloire", "value": 3},
    {"source": "Valjean", "target": "Mlle.Baptistine", "value": 3},
    {"source": "Valjean", "target": "Myriel", "value": 5},
    {"source": "Marguerite", "target": "Valjean", "value": 1},
    {"source": "Mme.deR", "target": "Valjean", "value": 1},
    {"source": "Isabeau", "target": "Valjean", "value": 1},
    {"source": "Gervais", "target": "Valjean", "value": 1},
    {"source": "Listolier", "target": "Tholomyes", "value": 4},
    {"source": "Fameuil", "target": "Tholomyes", "value": 4},
    {"source": "Fameuil", "target": "Listolier", "value": 4},
    {"source": "Blacheville", "target": "Tholomyes", "value": 4},
    {"source": "Blacheville", "target": "Listolier", "value": 4},
    {"source": "Blacheville", "target": "Fameuil", "value": 4},
    {"source": "Favourite", "target": "Tholomyes", "value": 3},
    {"source": "Favourite", "target": "Listolier", "value": 3},
    {"source": "Favourite", "target": "Fameuil", "value": 3},
    {"source": "Favourite", "target": "Blacheville", "value": 4},
    {"source": "Dahlia", "target": "Tholomyes", "value": 3},
    {"source": "Dahlia", "target": "Listolier", "value": 3},
    {"source": "Dahlia", "target": "Fameuil", "value": 3},
    {"source": "Dahlia", "target": "Blacheville", "value": 3},
    {"source": "Dahlia", "target": "Favourite", "value": 5},
    {"source": "Zephine", "target": "Tholomyes", "value": 3},
    {"source": "Zephine", "target": "Listolier", "value": 3},
    {"source": "Zephine", "target": "Fameuil", "value": 3},
    {"source": "Zephine", "target": "Blacheville", "value": 3},
    {"source": "Zephine", "target": "Favourite", "value": 4},
    {"source": "Zephine", "target": "Dahlia", "value": 4},
    {"source": "Fantine", "target": "Tholomyes", "value": 3},
    {"source": "Fantine", "target": "Listolier", "value": 3},
    {"source": "Fantine", "target": "Fameuil", "value": 3},
    {"source": "Fantine", "target": "Blacheville", "value": 3},
    {"source": "Fantine", "target": "Favourite", "value": 4},
    {"source": "Fantine", "target": "Dahlia", "value": 4},
    {"source": "Fantine", "target": "Zephine", "value": 4},
    {"source": "Fantine", "target": "Marguerite", "value": 2},
    {"source": "Fantine", "target": "Valjean", "value": 9},
    {"source": "Mme.Thenardier", "target": "Fantine", "value": 2},
    {"source": "Mme.Thenardier", "target": "Valjean", "value": 7},
    {"source": "Thenardier", "target": "Mme.Thenardier", "value": 13},
    {"source": "Thenardier", "target": "Fantine", "value": 1},
    {"source": "Thenardier", "target": "Valjean", "value": 12},
    {"source": "Cosette", "target": "Mme.Thenardier", "value": 4},
    {"source": "Cosette", "target": "Valjean", "value": 31},
    {"source": "Cosette", "target": "Tholomyes", "value": 1},
    {"source": "Cosette", "target": "Thenardier", "value": 1},
    {"source": "Javert", "target": "Valjean", "value": 17},
    {"source": "Javert", "target": "Fantine", "value": 5},
    {"source": "Javert", "target": "Thenardier", "value": 5},
    {"source": "Javert", "target": "Mme.Thenardier", "value": 1},
    {"source": "Javert", "target": "Cosette", "value": 1},
    {"source": "Fauchelevent", "target": "Valjean", "value": 8},
    {"source": "Fauchelevent", "target": "Javert", "value": 1},
    {"source": "Bamatabois", "target": "Fantine", "value": 1},
    {"source": "Bamatabois", "target": "Javert", "value": 1},
    {"source": "Bamatabois", "target": "Valjean", "value": 2},
    {"source": "Perpetue", "target": "Fantine", "value": 1},
    {"source": "Simplice", "target": "Perpetue", "value": 2},
    {"source": "Simplice", "target": "Valjean", "value": 3},
    {"source": "Simplice", "target": "Fantine", "value": 2},
    {"source": "Simplice", "target": "Javert", "value": 1},
    {"source": "Scaufflaire", "target": "Valjean", "value": 1},
    {"source": "Woman1", "target": "Valjean", "value": 2},
    {"source": "Woman1", "target": "Javert", "value": 1},
    {"source": "Judge", "target": "Valjean", "value": 3},
    {"source": "Judge", "target": "Bamatabois", "value": 2},
    {"source": "Champmathieu", "target": "Valjean", "value": 3},
    {"source": "Champmathieu", "target": "Judge", "value": 3},
    {"source": "Champmathieu", "target": "Bamatabois", "value": 2},
    {"source": "Brevet", "target": "Judge", "value": 2},
    {"source": "Brevet", "target": "Champmathieu", "value": 2},
    {"source": "Brevet", "target": "Valjean", "value": 2},
    {"source": "Brevet", "target": "Bamatabois", "value": 1},
    {"source": "Chenildieu", "target": "Judge", "value": 2},
    {"source": "Chenildieu", "target": "Champmathieu", "value": 2},
    {"source": "Chenildieu", "target": "Brevet", "value": 2},
    {"source": "Chenildieu", "target": "Valjean", "value": 2},
    {"source": "Chenildieu", "target": "Bamatabois", "value": 1},
    {"source": "Cochepaille", "target": "Judge", "value": 2},
    {"source": "Cochepaille", "target": "Champmathieu", "value": 2},
    {"source": "Cochepaille", "target": "Brevet", "value": 2},
    {"source": "Cochepaille", "target": "Chenildieu", "value": 2},
    {"source": "Cochepaille", "target": "Valjean", "value": 2},
    {"source": "Cochepaille", "target": "Bamatabois", "value": 1},
    {"source": "Pontmercy", "target": "Thenardier", "value": 1},
    {"source": "Boulatruelle", "target": "Thenardier", "value": 1},
    {"source": "Eponine", "target": "Mme.Thenardier", "value": 2},
    {"source": "Eponine", "target": "Thenardier", "value": 3},
    {"source": "Anzelma", "target": "Eponine", "value": 2},
    {"source": "Anzelma", "target": "Thenardier", "value": 2},
    {"source": "Anzelma", "target": "Mme.Thenardier", "value": 1},
    {"source": "Woman2", "target": "Valjean", "value": 3},
    {"source": "Woman2", "target": "Cosette", "value": 1},
    {"source": "Woman2", "target": "Javert", "value": 1},
    {"source": "MotherInnocent", "target": "Fauchelevent", "value": 3},
    {"source": "MotherInnocent", "target": "Valjean", "value": 1},
    {"source": "Gribier", "target": "Fauchelevent", "value": 2},
    {"source": "Mme.Burgon", "target": "Jondrette", "value": 1},
    {"source": "Gavroche", "target": "Mme.Burgon", "value": 2},
    {"source": "Gavroche", "target": "Thenardier", "value": 1},
    {"source": "Gavroche", "target": "Javert", "value": 1},
    {"source": "Gavroche", "target": "Valjean", "value": 1},
    {"source": "Gillenormand", "target": "Cosette", "value": 3},
    {"source": "Gillenormand", "target": "Valjean", "value": 2},
    {"source": "Magnon", "target": "Gillenormand", "value": 1},
    {"source": "Magnon", "target": "Mme.Thenardier", "value": 1},
    {"source": "Mlle.Gillenormand", "target": "Gillenormand", "value": 9},
    {"source": "Mlle.Gillenormand", "target": "Cosette", "value": 2},
    {"source": "Mlle.Gillenormand", "target": "Valjean", "value": 2},
    {"source": "Mme.Pontmercy", "target": "Mlle.Gillenormand", "value": 1},
    {"source": "Mme.Pontmercy", "target": "Pontmercy", "value": 1},
    {"source": "Mlle.Vaubois", "target": "Mlle.Gillenormand", "value": 1},
    {"source": "Lt.Gillenormand", "target": "Mlle.Gillenormand", "value": 2},
    {"source": "Lt.Gillenormand", "target": "Gillenormand", "value": 1},
    {"source": "Lt.Gillenormand", "target": "Cosette", "value": 1},
    {"source": "Marius", "target": "Mlle.Gillenormand", "value": 6},
    {"source": "Marius", "target": "Gillenormand", "value": 12},
    {"source": "Marius", "target": "Pontmercy", "value": 1},
    {"source": "Marius", "target": "Lt.Gillenormand", "value": 1},
    {"source": "Marius", "target": "Cosette", "value": 21},
    {"source": "Marius", "target": "Valjean", "value": 19},
    {"source": "Marius", "target": "Tholomyes", "value": 1},
    {"source": "Marius", "target": "Thenardier", "value": 2},
    {"source": "Marius", "target": "Eponine", "value": 5},
    {"source": "Marius", "target": "Gavroche", "value": 4},
    {"source": "BaronessT", "target": "Gillenormand", "value": 1},
    {"source": "BaronessT", "target": "Marius", "value": 1},
    {"source": "Mabeuf", "target": "Marius", "value": 1},
    {"source": "Mabeuf", "target": "Eponine", "value": 1},
    {"source": "Mabeuf", "target": "Gavroche", "value": 1},
    {"source": "Enjolras", "target": "Marius", "value": 7},
    {"source": "Enjolras", "target": "Gavroche", "value": 7},
    {"source": "Enjolras", "target": "Javert", "value": 6},
    {"source": "Enjolras", "target": "Mabeuf", "value": 1},
    {"source": "Enjolras", "target": "Valjean", "value": 4},
    {"source": "Combeferre", "target": "Enjolras", "value": 15},
    {"source": "Combeferre", "target": "Marius", "value": 5},
    {"source": "Combeferre", "target": "Gavroche", "value": 6},
    {"source": "Combeferre", "target": "Mabeuf", "value": 2},
    {"source": "Prouvaire", "target": "Gavroche", "value": 1},
    {"source": "Prouvaire", "target": "Enjolras", "value": 4},
    {"source": "Prouvaire", "target": "Combeferre", "value": 2},
    {"source": "Feuilly", "target": "Gavroche", "value": 2},
    {"source": "Feuilly", "target": "Enjolras", "value": 6},
    {"source": "Feuilly", "target": "Prouvaire", "value": 2},
    {"source": "Feuilly", "target": "Combeferre", "value": 5},
    {"source": "Feuilly", "target": "Mabeuf", "value": 1},
    {"source": "Feuilly", "target": "Marius", "value": 1},
    {"source": "Courfeyrac", "target": "Marius", "value": 9},
    {"source": "Courfeyrac", "target": "Enjolras", "value": 17},
    {"source": "Courfeyrac", "target": "Combeferre", "value": 13},
    {"source": "Courfeyrac", "target": "Gavroche", "value": 7},
    {"source": "Courfeyrac", "target": "Mabeuf", "value": 2},
    {"source": "Courfeyrac", "target": "Eponine", "value": 1},
    {"source": "Courfeyrac", "target": "Feuilly", "value": 6},
    {"source": "Courfeyrac", "target": "Prouvaire", "value": 3},
    {"source": "Bahorel", "target": "Combeferre", "value": 5},
    {"source": "Bahorel", "target": "Gavroche", "value": 5},
    {"source": "Bahorel", "target": "Courfeyrac", "value": 6},
    {"source": "Bahorel", "target": "Mabeuf", "value": 2},
    {"source": "Bahorel", "target": "Enjolras", "value": 4},
    {"source": "Bahorel", "target": "Feuilly", "value": 3},
    {"source": "Bahorel", "target": "Prouvaire", "value": 2},
    {"source": "Bahorel", "target": "Marius", "value": 1},
    {"source": "Bossuet", "target": "Marius", "value": 5},
    {"source": "Bossuet", "target": "Courfeyrac", "value": 12},
    {"source": "Bossuet", "target": "Gavroche", "value": 5},
    {"source": "Bossuet", "target": "Bahorel", "value": 4},
    {"source": "Bossuet", "target": "Enjolras", "value": 10},
    {"source": "Bossuet", "target": "Feuilly", "value": 6},
    {"source": "Bossuet", "target": "Prouvaire", "value": 2},
    {"source": "Bossuet", "target": "Combeferre", "value": 9},
    {"source": "Bossuet", "target": "Mabeuf", "value": 1},
    {"source": "Bossuet", "target": "Valjean", "value": 1},
    {"source": "Joly", "target": "Bahorel", "value": 5},
    {"source": "Joly", "target": "Bossuet", "value": 7},
    {"source": "Joly", "target": "Gavroche", "value": 3},
    {"source": "Joly", "target": "Courfeyrac", "value": 5},
    {"source": "Joly", "target": "Enjolras", "value": 5},
    {"source": "Joly", "target": "Feuilly", "value": 5},
    {"source": "Joly", "target": "Prouvaire", "value": 2},
    {"source": "Joly", "target": "Combeferre", "value": 5},
    {"source": "Joly", "target": "Mabeuf", "value": 1},
    {"source": "Joly", "target": "Marius", "value": 2},
    {"source": "Grantaire", "target": "Bossuet", "value": 3},
    {"source": "Grantaire", "target": "Enjolras", "value": 3},
    {"source": "Grantaire", "target": "Combeferre", "value": 1},
    {"source": "Grantaire", "target": "Courfeyrac", "value": 2},
    {"source": "Grantaire", "target": "Joly", "value": 2},
    {"source": "Grantaire", "target": "Gavroche", "value": 1},
    {"source": "Grantaire", "target": "Bahorel", "value": 1},
    {"source": "Grantaire", "target": "Feuilly", "value": 1},
    {"source": "Grantaire", "target": "Prouvaire", "value": 1},
    {"source": "MotherPlutarch", "target": "Mabeuf", "value": 3},
    {"source": "Gueulemer", "target": "Thenardier", "value": 5},
    {"source": "Gueulemer", "target": "Valjean", "value": 1},
    {"source": "Gueulemer", "target": "Mme.Thenardier", "value": 1},
    {"source": "Gueulemer", "target": "Javert", "value": 1},
    {"source": "Gueulemer", "target": "Gavroche", "value": 1},
    {"source": "Gueulemer", "target": "Eponine", "value": 1},
    {"source": "Babet", "target": "Thenardier", "value": 6},
    {"source": "Babet", "target": "Gueulemer", "value": 6},
    {"source": "Babet", "target": "Valjean", "value": 1},
    {"source": "Babet", "target": "Mme.Thenardier", "value": 1},
    {"source": "Babet", "target": "Javert", "value": 2},
    {"source": "Babet", "target": "Gavroche", "value": 1},
    {"source": "Babet", "target": "Eponine", "value": 1},
    {"source": "Claquesous", "target": "Thenardier", "value": 4},
    {"source": "Claquesous", "target": "Babet", "value": 4},
    {"source": "Claquesous", "target": "Gueulemer", "value": 4},
    {"source": "Claquesous", "target": "Valjean", "value": 1},
    {"source": "Claquesous", "target": "Mme.Thenardier", "value": 1},
    {"source": "Claquesous", "target": "Javert", "value": 1},
    {"source": "Claquesous", "target": "Eponine", "value": 1},
    {"source": "Claquesous", "target": "Enjolras", "value": 1},
    {"source": "Montparnasse", "target": "Javert", "value": 1},
    {"source": "Montparnasse", "target": "Babet", "value": 2},
    {"source": "Montparnasse", "target": "Gueulemer", "value": 2},
    {"source": "Montparnasse", "target": "Claquesous", "value": 2},
    {"source": "Montparnasse", "target": "Valjean", "value": 1},
    {"source": "Montparnasse", "target": "Gavroche", "value": 1},
    {"source": "Montparnasse", "target": "Eponine", "value": 1},
    {"source": "Montparnasse", "target": "Thenardier", "value": 1},
    {"source": "Toussaint", "target": "Cosette", "value": 2},
    {"source": "Toussaint", "target": "Javert", "value": 1},
    {"source": "Toussaint", "target": "Valjean", "value": 1},
    {"source": "Child1", "target": "Gavroche", "value": 2},
    {"source": "Child2", "target": "Gavroche", "value": 2},
    {"source": "Child2", "target": "Child1", "value": 3},
    {"source": "Brujon", "target": "Babet", "value": 3},
    {"source": "Brujon", "target": "Gueulemer", "value": 3},
    {"source": "Brujon", "target": "Thenardier", "value": 3},
    {"source": "Brujon", "target": "Gavroche", "value": 1},
    {"source": "Brujon", "target": "Eponine", "value": 1},
    {"source": "Brujon", "target": "Claquesous", "value": 1},
    {"source": "Brujon", "target": "Montparnasse", "value": 1},
    {"source": "Mme.Hucheloup", "target": "Bossuet", "value": 1},
    {"source": "Mme.Hucheloup", "target": "Joly", "value": 1},
    {"source": "Mme.Hucheloup", "target": "Grantaire", "value": 1},
    {"source": "Mme.Hucheloup", "target": "Bahorel", "value": 1},
    {"source": "Mme.Hucheloup", "target": "Courfeyrac", "value": 1},
    {"source": "Mme.Hucheloup", "target": "Gavroche", "value": 1},
    {"source": "Mme.Hucheloup", "target": "Enjolras", "value": 1}
  ]
}


let data = {
    nodes: nodes_pre
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '1'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '2'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '3'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '4'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '5'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '6'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '7'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '8'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '9'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '10'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '11'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '12'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '13'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '14'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '15'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '16'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '17'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '18'})))
        .concat(nodes_pre.map((node) => ({...node, id: node.id + '19'}))),
    links: links_pre
        .concat(links_pre.map((link) => ({...link, source: link.source + '', target: link.target + '1'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '1', target: link.target + '2'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '2', target: link.target + '3'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '3', target: link.target + '4'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '4', target: link.target + '5'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '5', target: link.target + '6'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '6', target: link.target + '7'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '7', target: link.target + '8'})))
        // .concat(links_pre.map((link) => ({ ...link, source: link.source + '8', target: link.target + '9' })))
        .concat(links_pre.map((link) => ({...link, source: link.source + '9', target: link.target + '10'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '10', target: link.target + '11'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '11', target: link.target + '12'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '12', target: link.target + '13'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '13', target: link.target + '14'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '14', target: link.target + '15'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '15', target: link.target + '16'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '16', target: link.target + '17'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '17', target: link.target + '18'})))
        .concat(links_pre.map((link) => ({...link, source: link.source + '18', target: link.target + '19'})))

}


// static force-directed layout, running in WebWorker thread
let {nodes, links} =  forceLayout(data, {
    iterations: FORCE_LAYOUT_ITERATIONS,
    nodeRepulsionStrength: FORCE_LAYOUT_NODE_REPULSION_STRENGTH,
});
  console.log("=====nodes", nodes);
nodes.forEach(nodeData => {
    nodeData.x += WORLD_WIDTH / 2;
    nodeData.y += WORLD_HEIGHT / 2;
});

// preload font
new FontFaceObserver(ICON_FONT_FAMILY).load();

// create PIXI application
const app = new PIXI.Application({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resolution: RESOLUTION,
    transparent: true,
    antialias: true,
    autoStart: false // disable automatic rendering by ticker, render manually instead, only when needed
});
app.view.style.width = `${SCREEN_WIDTH}px`;

// manual rendering
// app.renderer.on('postrender', () => { console.log('render'); });
let renderRequestId = undefined;
const requestRender = () => {
    if (renderRequestId) {
        return;
    }
    renderRequestId = window.requestAnimationFrame(() => {
        app.render();
        renderRequestId = undefined;
    });
}
// create PIXI viewport
const viewport = new pixiViewport.Viewport({
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    interaction: app.renderer.plugins.interaction
});
const resetViewport = () => {
    viewport.center = new PIXI.Point(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    viewport.setZoom(0.5, true);
};
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
const linksLayer = new PIXI.Graphics();
viewport.addChild(linksLayer);
const nodesLayer = new PIXI.Container();
viewport.addChild(nodesLayer);
const labelsLayer = new PIXI.Container();
viewport.addChild(labelsLayer);
const frontLayer = new PIXI.Container();
viewport.addChild(frontLayer);

// state
let nodeDataToNodeGfx = new WeakMap();
let nodeGfxToNodeData = new WeakMap();
let nodeDataToLabelGfx = new WeakMap();
let labelGfxToNodeData = new WeakMap();
let hoveredNodeData = undefined;
let hoveredNodeGfxOriginalChildren = undefined;
let hoveredNodeLabelGfxOriginalChildren = undefined;
let clickedNodeData = undefined;

const updatePositions = () => {
    linksLayer.clear();
    linksLayer.alpha = 0.6;
    for (const link of links) {
        linksLayer.lineStyle(Math.sqrt(link.value), 0x999999);
        linksLayer.moveTo(link.source.x, link.source.y);
        linksLayer.lineTo(link.target.x, link.target.y);
    }
    linksLayer.endFill();

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
    hoveredNodeLabelGfxOriginalChildren = [...labelGfx.children];

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
    const labelBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
    labelBackground.x = -(labelText.width + LABEL_X_PADDING * 2) / 2;
    labelBackground.y = NODE_HIT_RADIUS;
    labelBackground.width = labelText.width + LABEL_X_PADDING * 2;
    labelBackground.height = labelText.height + LABEL_Y_PADDING * 2;
    labelBackground.tint = 0xeeeeee;
    labelGfx.addChild(labelBackground);
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
        if (!hoveredNodeLabelGfxOriginalChildren.includes(child)) {
            labelGfx.removeChild(child);
        }
    }
    hoveredNodeLabelGfxOriginalChildren = undefined;

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
const colorToNumber = (color) => parseInt(color.slice(1), 16)

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
    circleBorder.lineStyle(1.5, 0xffffff);
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
    const labelBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
    labelBackground.x = -(labelText.width + LABEL_X_PADDING * 2) / 2;
    labelBackground.y = NODE_HIT_RADIUS;
    labelBackground.width = labelText.width + LABEL_X_PADDING * 2;
    labelBackground.height = labelText.height + LABEL_Y_PADDING * 2;
    labelBackground.tint = 0xffffff;
    labelBackground.alpha = 0.5;
    labelGfx.addChild(labelBackground);
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

// destroy PIXI application on Observable cell invalidation
invalidation.then(() => {
    app.destroy(true, true);
});

// prevent body scrolling
app.view.addEventListener('wheel', event => {
    event.preventDefault();
});

// create container with toolbar
// const resetButton = html`<button>Reset</button>`;
// resetButton.addEventListener('click', () => resetViewport());
// const toolbar = html`<div style="position: absolute; top: 5px; left: 10px"></div>`;
// toolbar.appendChild(resetButton);
const container = document.getElementById("container");
// container.appendChild(toolbar);
container.appendChild(app.view);


const scale = d3.scaleOrdinal(d3.schemeCategory10);

function color() {
    return nodeData => scale(nodeData.group);
}


function forceLayout(...args) {
//   return new Promise(resolve => {
//     const workerCode = `
//       importScripts('https://unpkg.com/d3@5.12.0/dist/d3.min.js');

//       function forceLayout(data, options = {}) {
//         const nodes = data.nodes;
//         const links = data.links;

//         const iterations = options.iterations;
//         const nodeRepulsionStrength = options.nodeRepulsionStrength;

//         d3.forceSimulation(nodes)
//           .force("link", d3.forceLink(links).id(linkData => linkData.id))
//           .force("charge", d3.forceManyBody().strength(-nodeRepulsionStrength))
//           .force("center", d3.forceCenter())
//           .stop()
//           .tick(iterations);

//         return { nodes, links };
//       };

//       self.onmessage = event => {
//         const result = forceLayout.apply(undefined, event.data);
//         postMessage(result);
//       }
//     `;

//     const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
//     const workerUrl = URL.createObjectURL(workerBlob)
//     const worker = new Worker(workerUrl);

//     worker.onmessage = event => {
//       resolve(event.data);
//       worker.terminate();
//       URL.revokeObjectURL(workerUrl);
//     };
//     worker.postMessage(args);
//   });

    // return new Promise((resolve) => {
        const [data, {iterations, nodeRepulsionStrength}] = args
         d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(linkData => linkData.id))
            .force("charge", d3.forceManyBody().strength(-nodeRepulsionStrength))
            .force("center", d3.forceCenter())
            .stop()
            .tick(iterations);
        return data;
    // })
}
