
/*

*/



export default class GESettings {

    RESOLUTION = window.devicePixelRatio * 2;
    FORCE_LAYOUT_NODE_REPULSION_STRENGTH = -500;
    FORCE_LAYOUT_ITERATIONS = 650;
    DEFAULT_LINK_LENGTH = 120;
    NODE_RADIUS = 10;
    NODE_HIT_RADIUS = this.NODE_RADIUS + 5;
    LABEL_FONT_FAMILY = 'Helvetica';
    LABEL_FONT_SIZE = 12;
    LABEL_X_PADDING = -12;
    LABEL_Y_PADDING = -15;


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
