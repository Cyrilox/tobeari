/**
 * ConsumerManager
 */
var ConsumerManager = (function () {
    function ConsumerManager(level, map, controller) {
        this.level = level;
        this.map = map;
        this.controller = controller;
        //Prey
        this.preys = [];
        this.addPreyTimer = null;
        this.decPreyTimer = null;
        //Predator
        this.predator = new Predator(level, map, controller, map.center);
        //Preys
        this.preyAddingGapMin = conf["consumermanager"]["preys_adding_min"];
        this.preyAddingGapInit = conf["consumermanager"]["preys_adding_init"];
        this.preyAddingGap = this.preyAddingGapInit;
        this.preyAddingGapDec = conf["consumermanager"]["preys_adding_dec"];
        this.preyAddingGapDecEach = conf["consumermanager"]["preys_adding_deceach"];
        //Pathfinding
        this.pathfinder = new Pathfinder(this.map);
    }
    ConsumerManager.prototype.init = function (growerManager) {
        this.growerManager = growerManager;
        for (var i = 0; i < conf["consumermanager"]["preys_max"]; i++)
            this.createPrey();
    };
    //*** Level States ***
    /**
     * Start the level
     */
    ConsumerManager.prototype.start = function () {
        //Réinitialisation des timers
        this.preyAddingGap = this.preyAddingGapInit;
        this.addPreyTimer = g.time.events.loop(this.preyAddingGap, this.addPrey, this);
        this.addPrey(); //Instant add, timer will tick after
        //Decrease add prey gap
        this.decPreyTimer = g.time.events.loop(this.preyAddingGapDecEach, this.decreaseAddingPreyTimer, this);
    };
    /**
     * Stop the level
     */
    ConsumerManager.prototype.end = function () {
        //Kill preys
        for (var i in this.preys)
            this.preys[i].kill();
    };
    /**
     * Update loop
     */
    ConsumerManager.prototype.update = function () {
        this.predator.update();
        for (var i in this.preys)
            this.preys[i].update();
        this.predator.sightfog.update();
    };
    //*** Prey ***
    //Create a reusable prey
    ConsumerManager.prototype.createPrey = function () {
        this.preys.push(new Prey(this.level, this.map, this.controller, this, this.growerManager, null, this.pathfinder));
    };
    //Add a prey and move it
    ConsumerManager.prototype.addPrey = function () {
        var alivePrey = null;
        //Search one into the stockpile
        for (var i = 0; i < this.preys.length; i++) {
            var prey = this.preys[i];
            if (!prey.isAlive()) {
                alivePrey = prey;
                break;
            }
        }
        if (alivePrey != null) {
            //Respawn in the perimeter
            var cell = this.map.getRandomPerimeterCell();
            alivePrey.displace(cell);
            alivePrey.reborn();
        }
    };
    /**
     * Return the amount of Prey alived, on the map
     */
    ConsumerManager.prototype.preysAlive = function () {
        var amount = 0;
        for (var i in this.preys)
            if (this.preys[i].isAlive())
                amount++;
        return amount;
    };
    //Decrease the timer for prey adding
    ConsumerManager.prototype.decreaseAddingPreyTimer = function () {
        //Decrease the timer
        this.preyAddingGap = Math.max(this.preyAddingGapMin, this.preyAddingGap - this.preyAddingGapDec);
        this.addPreyTimer.delay = this.preyAddingGap;
        //Remove the timer
        if (this.preyAddingGap <= this.preyAddingGapMin)
            this.decPreyTimer.timer.remove(this.decPreyTimer);
    };
    return ConsumerManager;
}());
