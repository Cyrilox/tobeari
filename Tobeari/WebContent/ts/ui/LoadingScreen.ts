/**
 * LoadingScreen
 */
class LoadingScreen {
    static group: Phaser.Group;

    static init() {
        //background
        let background = g.add.graphics(0, 0);
        background.beginFill(0x000000, 1);
        background.drawRect(0, 0, g.world.width, g.world.height);
        background.endFill();

        //Title
        let titleStyle = { font: "bold "+GraphicInterface.sizeOfHeight(20)+"px Arial", fill: "#FFFFFF" }
        let title = g.add.text(g.world.centerX, g.world.centerY, strings["loadingscreen"]["title"], titleStyle);
        title.anchor.setTo(0.5, 0.5);
        GraphicInterface.scaleByHeight(title, 20);

        //Group
        LoadingScreen.group = g.add.group();
        LoadingScreen.group.add(background);
        LoadingScreen.group.add(title);

        //Hide
        LoadingScreen.hide();
    }

    /**
     * Hide all
     */
    static hide() {
        LoadingScreen.group.visible = false;
    }

    /**
     * Show all and bring to top
     */
    static show() {
        LoadingScreen.group.visible = true;
        g.world.bringToTop(LoadingScreen.group);
    }
}