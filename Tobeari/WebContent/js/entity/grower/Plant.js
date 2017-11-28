var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The plant.
 */
var RANK;
(function (RANK) {
    RANK[RANK["UNBORN"] = 0] = "UNBORN";
    RANK[RANK["SEED"] = 1] = "SEED";
    RANK[RANK["WATERED"] = 2] = "WATERED";
    RANK[RANK["LEAFY"] = 3] = "LEAFY";
    RANK[RANK["FRUITY"] = 4] = "FRUITY";
    RANK[RANK["SEEDY"] = 5] = "SEEDY";
})(RANK || (RANK = {}));
var Plant = (function (_super) {
    __extends(Plant, _super);
    function Plant(level, map, controller, cell) {
        _super.call(this, map, controller, cell, conf["plant"]["sizecells"], conf["plant"]["sizesprite"], 'plant_green', false, true, true, true);
        this.level = level;
        this.rank = RANK["UNBORN"];
        this.timerLeafing = null;
        this.timerFruiting = null;
        this.timerSeedy = null;
        //Graphismes
        this.group.rotation = Tools.getRandomRadianAngle();
        this.group.alpha = 0;
        //Temps
        this.growToLeafTime = Phaser.Timer.SECOND * conf["plant"]["growtime_leaf"];
        this.growToFruitTime = Phaser.Timer.SECOND * conf["plant"]["growtime_fruit"];
        this.growToSeedTime = Phaser.Timer.SECOND * conf["plant"]["growtime_seed"];
        //Sounds
        this.sounds = new SoundManager("plant");
    }
    //*** Life ***
    //Plant is born
    Plant.prototype.born = function () {
        if (!this.isAlive()) {
            this.spawn();
            this.rank = RANK["SEED"];
            this.group.alpha = 1;
            //Dispatch the events
            this.controller.plantIsBorn(this);
        }
    };
    //Destroy the plant
    Plant.prototype.kill = function () {
        if (this.isAlive()) {
            this.rank = RANK["UNBORN"];
            this.group.alpha = 0;
            this.stopTimers();
            this.destroy();
        }
    };
    //*** Growth ***
    //Water the plant
    Plant.prototype.water = function () {
        if (this.rank == RANK["SEED"]) {
            this.rank = RANK["WATERED"];
            this.sprite.frame = 1;
            //Start the leaf growth
            this.timerLeafing = g.time.events.add(this.growToLeafTime, this.leaf, this);
        }
    };
    //Leaf the plant
    Plant.prototype.leaf = function () {
        if (this.rank == RANK["WATERED"]) {
            this.rank = RANK["LEAFY"];
            this.sprite.frame = 2;
            //Sound
            this.sounds.play("plant_growing");
            //Start the fruit growth
            this.timerFruiting = g.time.events.add(this.growToFruitTime, this.fruit, this);
        }
    };
    //Fruit the plant
    Plant.prototype.fruit = function () {
        if (this.rank == RANK["LEAFY"]) {
            this.rank = RANK["FRUITY"];
            this.sprite.frame = 3;
            //Sound
            this.sounds.play("plant_growing");
            //Start the seed growth
            this.timerSeedy = g.time.events.add(this.growToSeedTime, this.seed, this);
        }
    };
    //Seed the plant
    Plant.prototype.seed = function () {
        if (this.rank == RANK["FRUITY"]) {
            this.rank = RANK["SEEDY"];
            this.sprite.frame = 4;
            //Sound
            this.sounds.play("plant_growing");
        }
    };
    //Plante poussée si feuillue ou fruitée
    Plant.prototype.isGrown = function () {
        return this.rank > RANK["WATERED"];
    };
    //Destroy a part, a downgrade
    Plant.prototype.downgrade = function () {
        //Stop timers
        this.stopTimers();
        //Downgrade
        if (this.rank == RANK["LEAFY"])
            this.rank = RANK["UNBORN"];
        else
            this.rank--;
        if (this.rank <= RANK["UNBORN"])
            this.kill();
        else
            this.sprite.frame = this.rank - 1;
        //Repousse
        switch (this.rank) {
            case RANK["WATERED"]:
                this.timerLeafing = g.time.events.add(this.growToLeafTime, this.leaf, this);
                break;
            case RANK["LEAFY"]:
                this.timerFruiting = g.time.events.add(this.growToFruitTime, this.fruit, this);
                break;
            case RANK["FRUITY"]:
                this.timerSeedy = g.time.events.add(this.growToSeedTime, this.seed, this);
                break;
        }
    };
    //Stop timers
    Plant.prototype.stopTimers = function () {
        if (this.timerLeafing != null) {
            this.timerLeafing.timer.remove(this.timerLeafing);
            this.timerLeafing = null;
        }
        if (this.timerFruiting != null) {
            this.timerFruiting.timer.remove(this.timerFruiting);
            this.timerFruiting = null;
        }
        if (this.timerSeedy != null) {
            this.timerSeedy.timer.remove(this.timerSeedy);
            this.timerSeedy = null;
        }
    };
    Plant.RANK = RANK;
    return Plant;
}(Entity));
