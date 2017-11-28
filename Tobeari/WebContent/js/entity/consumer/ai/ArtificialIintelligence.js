/**
 * An artificial intelligence.
 */
var STATE;
(function (STATE) {
    STATE[STATE["SEARCHFOOD"] = 0] = "SEARCHFOOD";
    STATE[STATE["COMETOFOOD"] = 1] = "COMETOFOOD";
    STATE[STATE["EATFOOD"] = 2] = "EATFOOD";
    STATE[STATE["FLEE"] = 3] = "FLEE";
})(STATE || (STATE = {}));
var MOVETYPE;
(function (MOVETYPE) {
    MOVETYPE[MOVETYPE["SEARCH"] = 0] = "SEARCH";
    MOVETYPE[MOVETYPE["COME"] = 1] = "COME";
    MOVETYPE[MOVETYPE["FLEE"] = 2] = "FLEE";
})(MOVETYPE || (MOVETYPE = {}));
var ArtificialIntelligence = (function () {
    function ArtificialIntelligence(level, map, consumerManager, growerManager, prey, pathfinder) {
        this.level = level;
        this.map = map;
        this.consumerManager = consumerManager;
        this.growerManager = growerManager;
        this.prey = prey;
        this.pathfinder = pathfinder;
        this.state = STATE["SEARCHFOOD"];
        this.moveType = -1;
        this.plantToEat = null;
        this.thinking = false;
        //Init
        this.init();
        //Carateristics
        this.threatenedDist = conf["artificialintelligence"]["threateneddist"];
        this.fleeDistanceMin = conf["artificialintelligence"]["fleedistance_min"];
        this.fleeDistanceMax = conf["artificialintelligence"]["fleedistance_max"];
    }
    //Reset all variables
    ArtificialIntelligence.prototype.init = function () {
        this.state = STATE["SEARCHFOOD"];
        this.plantToEat = null;
        this.thinking = false;
        this.moveType = -1;
    };
    //Think different ;-)
    ArtificialIntelligence.prototype.think = function () {
        if (!this.thinking && this.prey != null && this.prey.isAlive()) {
            this.thinking = true;
            this.assess();
            this.act();
            this.thinking = false;
        }
    };
    //Assess the situation and refresh the states
    ArtificialIntelligence.prototype.assess = function () {
        //Plante à manger plus vivante
        if (this.plantToEat != null && !this.plantToEat.isAlive())
            this.plantToEat = null;
        //If threatened, flee to safe distance
        if (this.state != STATE["FLEE"] && this.isThreatened()) {
            this.state = STATE["FLEE"]; //S'enfuir loin du prédateur
            this.prey.flee(); //Sound
        }
        //States
        switch (this.state) {
            case STATE["SEARCHFOOD"]:
                this.plantToEat = this.growerManager.getClosestEatablePlant(this.prey);
                if (this.plantToEat != null)
                    this.state = STATE["COMETOFOOD"];
                break;
            case STATE["COMETOFOOD"]:
                if (this.plantToEat == null)
                    this.state = STATE["SEARCHFOOD"]; //donc recherche
                else if (this.prey.isOnPlant(this.plantToEat))
                    this.state = STATE["EATFOOD"];
                break;
            case STATE["EATFOOD"]:
                if (this.plantToEat == null) {
                    this.state = STATE["SEARCHFOOD"]; //donc recherche
                    //Stop eating
                    this.prey.stopEating();
                }
                break;
            case STATE["FLEE"]:
                var predatorDist = this.prey.cell.hex.distance(this.consumerManager.predator.cell.hex);
                if (predatorDist >= this.fleeDistance)
                    this.state = STATE["SEARCHFOOD"]; //donc recherche
                break;
        }
    };
    //Define if a threat is here
    ArtificialIntelligence.prototype.isThreatened = function () {
        var predator = this.consumerManager.predator.group;
        var angleFromPredToPrey = Tools.getAngle(predator, this.prey.group);
        var sightAngleToPrey = Tools.getClosestAngle(predator.rotation, angleFromPredToPrey); //Positive radian
        var predatorLooking = sightAngleToPrey < this.consumerManager.predator.sightfog.halfWidth; //regarde si angle de vue faible
        var cellOrNextCell = this.prey.isMoving ? this.prey.nextCell : this.prey.cell;
        var predatorDist = cellOrNextCell.hex.distance(this.consumerManager.predator.cell.hex);
        //si vivant, regardé et trop proche
        return this.consumerManager.predator.isAlive() && predatorLooking && predatorDist <= this.threatenedDist;
    };
    //Act
    ArtificialIntelligence.prototype.act = function () {
        var target;
        switch (this.state) {
            case STATE["SEARCHFOOD"]:
                if (!this.prey.isMoving || this.moveType != MOVETYPE["SEARCH"]) {
                    //Move to a random Cell on the map
                    target = this.level.map.getRandomWalkableCell();
                    this.move(target, false);
                    this.moveType = MOVETYPE["SEARCH"];
                }
                break;
            case STATE["COMETOFOOD"]:
                if (!this.prey.isMoving || this.moveType != MOVETYPE["COME"]) {
                    if (this.plantToEat != null) {
                        //Move to the plant to eat
                        target = this.plantToEat.cell;
                        this.move(target, false);
                        this.moveType = MOVETYPE["COME"];
                    }
                }
                break;
            case STATE["EATFOOD"]:
                if (this.plantToEat != null && this.plantToEat.isAlive() && !this.prey.eating && this.prey.isOnPlant(this.plantToEat)) {
                    //Eat the plant
                    this.prey.eat(this.plantToEat);
                }
                break;
            case STATE["FLEE"]:
                if (!this.prey.isMoving || this.moveType != MOVETYPE["FLEE"]) {
                    //Flee to approximately the opposite way of the predator
                    this.fleeDistance = Tools.getRandomArbitrary(this.fleeDistanceMin, this.fleeDistanceMax + 1, true);
                    var cells = this.level.map.getRingCells(this.prey.cell, this.fleeDistance, true);
                    var cellsOK = [];
                    var distancePredatorCell = void 0, distanceMax = -1;
                    for (var i in cells) {
                        distancePredatorCell = cells[i].hex.distance(this.consumerManager.predator.cell.hex);
                        if (distancePredatorCell > distanceMax) {
                            cellsOK = [];
                            distanceMax = distancePredatorCell;
                        }
                        if (distancePredatorCell >= distanceMax)
                            cellsOK.push(cells[i]);
                    }
                    if (cellsOK.length > 0) {
                        target = cellsOK[Tools.getRandomArbitrary(0, cellsOK.length, true)];
                        this.move(target, true);
                        this.moveType = MOVETYPE["FLEE"];
                    }
                }
                break;
        }
    };
    //*** Pathfinding ***
    /**
     * Search a path and then start to follow this one, or do nothing if not reachable
     */
    ArtificialIntelligence.prototype.move = function (target, sprint) {
        //Start Cell depending if it is moving
        var startCell = this.prey.isMoving ? this.prey.nextCell : this.prey.cell;
        //Search a path, allowing this prey to be walked
        var path = this.pathfinder.find(startCell, target, this.prey);
        //Follow the path found
        if (path !== null)
            this.prey.followPath(path, sprint);
    };
    ArtificialIntelligence.STATE = STATE;
    ArtificialIntelligence.MOVETYPE = MOVETYPE;
    return ArtificialIntelligence;
}());
