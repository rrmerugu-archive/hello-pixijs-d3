
/*

*/



export default class GESettings {

    RESOLUTION = window.devicePixelRatio ;
    FORCE_LAYOUT_NODE_REPULSION_STRENGTH = -2000;
    FORCE_LAYOUT_ITERATIONS = 150;
    DEFAULT_LINK_LENGTH = 220;
    NODE_RADIUS = 10;
    NODE_HIT_RADIUS = this.NODE_RADIUS + 5;
    LABEL_FONT_FAMILY = 'Helvetica';
    LABEL_FONT_SIZE = 12;
    LABEL_X_PADDING = 5;
    LABEL_Y_PADDING = -5;

    LINK_DEFAULT_LABEL_FONT_SIZE = 10;
    LINK_DEFAULT_WIDTH= 5;

    ICON_FONT_FAMILY = 'Material Icons';
    ICON_FONT_SIZE = this.NODE_RADIUS / Math.SQRT2 * 2;
    ICON_TEXT = 'person';


    constructor(screenWidth, screenHeight) {
        if (screenWidth) {
            this.SCREEN_WIDTH = screenWidth;
        }
        if (screenHeight) {
            this.SCREEN_HEIGHT = screenHeight;
        }
        this.WORLD_WIDTH = this.SCREEN_WIDTH / 4;
        this.WORLD_HEIGHT = this.SCREEN_HEIGHT / 4;

        console.log(this.SCREEN_WIDTH, this.SCREEN_HEIGHT, this.WORLD_WIDTH, this.WORLD_HEIGHT)
    }


}
