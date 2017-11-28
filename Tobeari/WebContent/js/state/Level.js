var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Level state.
 */
var Level = (function (_super) {
    __extends(Level, _super);
    function Level() {
        _super.apply(this, arguments);
        this.isCreated = false;
        //Selection
        this.selection = null;
    }
    Level.prototype.create = function () {
        //Physics engine
        g.physics.startSystem(Phaser.Physics.ARCADE);
        //Controlleur
        this.controller = new Controller(this);
        //Map
        this.map = new Map();
        //Managers
        this.gameManager = new GameManager(this.controller);
        this.consumerManager = new ConsumerManager(this, this.map, this.controller);
        this.inertManager = new InertManager(this.map, this.controller, this.consumerManager.predator);
        this.growerManager = new GrowerManager(this, this.map, this.controller, this.inertManager.waterpoint);
        this.recyclerManager = new RecyclerManager();
        //Interfaces
        this.gameInterface = new GameInterface(this, this.gameManager);
        this.gameStateInterface = new GameStateInterface(this, this.gameManager, this.consumerManager.predator);
        this.commandInterface = new CommandInterface(this, this.controller, this.gameManager, this.consumerManager.predator);
        //Manager
        this.gestureManager = new GestureManager(this, this.controller, this.map, this.gameManager, this.gameInterface, this.commandInterface);
        //Variables sharing
        this.controller.init(this.gameManager, this.growerManager, this.consumerManager, this.gameStateInterface);
        this.gameManager.init(this.gameStateInterface);
        this.consumerManager.init(this.growerManager);
        //Sounds
        this.sounds = new SoundManager("level");
        //Creation finished
        this.isCreated = true;
        //Loading screen
        LoadingScreen.hide();
        //Start
        this.start();
    };
    //*** Level States ***
    /**
     * Start the level
     */
    Level.prototype.start = function () {
        //Start managers
        this.consumerManager.start();
        this.gameManager.start();
        //Update UI
        this.commandInterface.update();
        //Ordre d'affichage
        this.refreshDisplayOrder();
        //Sound
        this.sounds.play("startgame");
    };
    /**
     * Restart the level
     */
    Level.prototype.restart = function () {
        //Endings
        this.gameManager.end();
        this.consumerManager.end();
        //Restart
        Tools.startState("Level", true);
    };
    /**
     * Quit level to Menu
     */
    Level.prototype.quit = function () {
        this.gameManager.end();
        this.consumerManager.end();
        Tools.startState("Menu");
    };
    //*** Loops ***
    /**
     * Update loop
     */
    Level.prototype.update = function () {
        if (!this.gameManager.isPaused) {
            //Touch outside the interfaces
            if (g.input.activePointer.isDown && !this.gestureManager.interfaceDowned && this.gestureManager.onDownDone) {
                //Look the pointer
                if (this.consumerManager.predator.isAlive())
                    this.consumerManager.predator.rotation = g.physics.arcade.angleToPointer(this.consumerManager.predator.group);
                //Unselect if dragging or first onDown position out of selection
                if (this.selection != null && (this.gestureManager.isDragging || !this.gestureManager.onDownOnSelection))
                    this.controller.unselect();
            }
            else {
                //Look the selected target
                if (this.selection != null && this.consumerManager.predator.isAlive()) {
                    var lookedPosition = this.selection instanceof Entity ? (this.selection).group.position : (this.selection).coordinates.center;
                    this.consumerManager.predator.rotation = Tools.getAngle(this.consumerManager.predator.group, lookedPosition);
                }
            }
            //Mises à jour
            this.consumerManager.update();
            //Interface
            this.commandInterface.update();
        }
    };
    /**
     * Render loop
     */
    Level.prototype.render = function () {
        if (isTestMode) {
            //Messages
            d.clear();
            d.addText("FPS", String(g.time.fps));
            d.addText("PREY", String(this.consumerManager.preysAlive()));
            //d.addText("", );
            //d.addText("", );
            d.show();
        }
    };
    //*** Various ***
    /**
     * Refresh the Z order of all elements
     */
    Level.prototype.refreshDisplayOrder = function () {
        if (this.isCreated) {
            var displayElements = [];
            displayElements.push(this.map.elements); //Carte
            displayElements.push(this.inertManager.waterpoint.group); //Point d'eau
            for (var i in this.growerManager.plants)
                displayElements.push(this.growerManager.plants[i].group);
            for (var i in this.consumerManager.preys)
                displayElements.push(this.consumerManager.preys[i].group);
            displayElements.push(this.growerManager.palmtree.group); //Arbre
            if (this.consumerManager.predator.sightfog.activated)
                displayElements.push(this.consumerManager.predator.sightfog.fog); //Brouillard
            displayElements.push(this.consumerManager.predator.waterjet); //Brouillard
            displayElements.push(this.consumerManager.predator.seed); //Graines prédateur
            displayElements.push(this.consumerManager.predator.group); //Prédateur
            displayElements.push(this.gameInterface.elements); //Menu
            displayElements.push(this.gameStateInterface.elements); //Informations
            displayElements.push(this.commandInterface.elements); //Aptitudes
            displayElements.push(this.gameManager.objective); //Objectif
            displayElements.push(this.gameManager.scoreText); //Objectif
            displayElements.push(this.gameManager.endgameText); //Fin de jeu
            displayElements.push(this.gameManager.bestScoreText); //Record battu
            displayElements.push(this.gameInterface.elementsDialogs); //Menu Dialogs
            //Display refresh
            for (var i in displayElements)
                g.world.bringToTop(displayElements[i]);
        }
    };
    /**
     * Select or unselect with null
     */
    Level.prototype.select = function (selection) {
        //Si une cellule non vide est sélectionné
        if (selection instanceof Cell && !selection.isEmpty()) {
            //On change la séléction pour l'entité de celle ci
            selection.setSelected(false);
            this.select(selection.getMostAliveEntity());
            return;
        }
        else if (this.selection != selection) {
            //Unselect previous
            if (this.selection != null)
                this.selection.setSelected(false);
            //Select new one
            if (selection != null) {
                selection.setSelected(true);
                this.sounds.play("select_entity");
            }
            this.consumerManager.predator.setSelection(selection);
            this.selection = selection;
        }
        //Update
        this.commandInterface.update();
        //Ordre d'affichage
        this.refreshDisplayOrder();
    };
    return Level;
}(Phaser.State));
