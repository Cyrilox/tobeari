var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The predator.
 */
var Predator = (function (_super) {
    __extends(Predator, _super);
    function Predator(level, map, controller, cell) {
        _super.call(this, map, controller, cell, conf["predator"]["sizecells"], conf["predator"]["sizesprite"], 'predator', false, false, false);
        this.level = level;
        this.deteriorating = false;
        this.drinking = false;
        this.rotation = 0;
        this.cellSelected = null;
        this.entitySelected = null;
        this.previousEntitySelected = null;
        this.entityGrabbed = null;
        this.isEntityGrabbed = false;
        this.mouthOpened = false;
        this.mouthClosing = false;
        this.wateredPlant = null;
        this.selfhealLoop = null; //Soin
        this.deteriorateLoop = null; //Détérioration
        this.drinkTimer = null; //Boire
        this.spawn();
        //Characteristics
        this.range = conf["predator"]["range"];
        this.waterneeded = conf["predator"]["waterneeded"];
        //Ability
        this.ability = new Ability(level);
        this.plantRange = conf["predator"]["plantrange"];
        this.map.setSelectableCellsAround(cell.hex, 2, this.plantRange);
        //Brouillard de la vue du joueur
        this.sightfog = new Sightfog(this);
        //Vitals
        this.health = conf["predator"]["health"];
        this.hydration = conf["predator"]["hydration"];
        this.hunger = conf["predator"]["hunger"];
        this.energy = conf["predator"]["energy"];
        this.seeds = conf["predator"]["seeds"];
        this.thorn = conf["predator"]["thorn"];
        //Mouth
        var nbrFrame = 6, fpsOpenMouth, fpsCloseMouth;
        fpsOpenMouth = Math.ceil(1000 / (conf["predator"]["openmouthtime"] / nbrFrame));
        fpsCloseMouth = Math.ceil(1000 / (conf["predator"]["closemouthtime"] / nbrFrame));
        this.sprite.animations.add('open_mouth', [0, 1, 2, 3, 4, 5], fpsOpenMouth, false);
        this.sprite.animations.add('close_mouth', [5, 4, 3, 2, 1, 0], fpsCloseMouth, false);
        //Water jet
        this.waterjet = Tools.addSprite(0, 0, "waterjet");
        g.physics.enable(this.waterjet, Phaser.Physics.ARCADE);
        this.waterjet.anchor.setTo(1, 0.5);
        GraphicInterface.scaleByHeightWithSize(this.waterjet, Cell.EDGE_SIZE * conf["predator"]["sizewaterjet"]);
        this.waterjet.visible = false;
        this.waterjetTime = conf["predator"]["waterjettime"];
        //Langue
        this.tongue = Tools.addSprite(0, 0, "tongue"); //Extensible
        g.physics.enable(this.tongue, Phaser.Physics.ARCADE);
        this.tongue.anchor.setTo(0, 0.5);
        this.tongueWidthOriginal = this.tongue.width;
        GraphicInterface.scaleByHeightWithSize(this.tongue, Cell.EDGE_SIZE * conf["predator"]["sizetongue"]);
        this.tongue.width = 0;
        4;
        this.tongueGrabTime = conf["predator"]["tonguegrabtime"];
        //Graine lancée
        this.seed = Tools.addSprite(0, 0, "seed_green");
        this.seed.anchor.setTo(0.5, 0.5);
        GraphicInterface.scaleByHeightWithSize(this.seed, Cell.EDGE_SIZE * conf["predator"]["sizeseed"]);
        this.seed.alpha = 0;
        this.seedLaunchTime = conf["predator"]["seedlaunchtime"];
        //The group
        this.group.addAt(this.tongue, 0);
        //Vitals loops
        var hungerTime, energyTime, seedsTime;
        this.dehydrateTime = Phaser.Timer.SECOND * conf["predator"]["time_dehydrate"];
        hungerTime = Phaser.Timer.SECOND * conf["predator"]["time_hunger"];
        energyTime = Phaser.Timer.SECOND * conf["predator"]["time_energy"];
        seedsTime = Phaser.Timer.SECOND * conf["predator"]["time_seeds"];
        this.selfhealTime = Phaser.Timer.SECOND * conf["predator"]["time_selfheal"];
        this.deteriorateTime = Phaser.Timer.SECOND * conf["predator"]["time_deteriorate"];
        this.drinkTime = Phaser.Timer.SECOND * conf["predator"]["time_drinking"];
        this.dehydrateTimer = g.time.events.loop(this.dehydrateTime, this.dehydrate, this);
        this.hungerTimer = g.time.events.loop(hungerTime, this.decreaseHunger, this);
        this.energyTimer = g.time.events.loop(energyTime, this.decreaseEnergy, this);
        this.seedsTimer = g.time.events.loop(seedsTime, this.produceSeed, this);
        this.updateDeterioration();
        //Sounds
        this.sounds = new SoundManager("predator");
    }
    //*** Level States ***
    //Update
    Predator.prototype.update = function () {
        //Rotation
        this.group.rotation = this.rotation;
    };
    //*** Life ***
    //Mort
    Predator.prototype.kill = function () {
        //Sounds
        this.sounds.stopAll();
        this.sounds.play("death");
        //Interruption des vitales
        if (this.dehydrateTimer != null) {
            this.dehydrateTimer.timer.remove(this.dehydrateTimer);
            this.dehydrateTimer = null;
        }
        this.hungerTimer.timer.remove(this.hungerTimer);
        this.energyTimer.timer.remove(this.energyTimer);
        //Visuel mort
        this.sprite.loadTexture("images-atlas", "predator_dead");
        this.tongue.alpha = 0;
        //Champ de vision
        this.sightfog.closed = true;
        //Tremblement de caméra
        g.camera.shake(0.01, 200);
        //Status mort, fin de partie
        this.destroy();
    };
    //*** Selection ***
    /**
     * Select a Cell or Entity, or unselect with null
     */
    Predator.prototype.setSelection = function (selection) {
        this.previousEntitySelected = this.entitySelected;
        if (selection instanceof Cell)
            this.cellSelected = (selection);
        else if (selection instanceof Entity)
            this.entitySelected = (selection);
        else {
            this.cellSelected = null;
            this.entitySelected = null;
        }
        if (!this.mouthClosing)
            this.closeMouth();
    };
    //*** Eat ***
    /**
     * Return true if the selected entity can be grabbed
     */
    Predator.prototype.canGrab = function () {
        return this.entitySelected != null && this.cell.hex.distance(this.entitySelected.cell.hex) <= this.range;
    };
    //Eat
    Predator.prototype.eat = function () {
        if (this.ability.canUseAbility() && this.entitySelected != null) {
            var eatable = false;
            //Plante comestible
            if (this.entitySelected instanceof Plant) {
                var plant = (this.entitySelected);
                if (plant.rank > Plant.RANK["WATERED"])
                    eatable = true;
            }
            else if ((this.entitySelected instanceof Prey && this.canGrab()) //Proie à portée
                || (this.entitySelected instanceof Waterpoint && this.canGrab() && !this.drinking))
                eatable = true;
            //Eat
            if (eatable) {
                //Start the ability
                this.ability.useAbility();
                //Stretch the tongue and drink
                this.tongueGrab();
            }
        }
    };
    //Grab something by stretching out the tongue to a position
    Predator.prototype.tongueGrab = function () {
        if (this.entitySelected != null) {
            //Prey
            if (this.entitySelected instanceof Prey) {
                var prey = (this.entitySelected);
                prey.freeze = true;
            }
            //Open mouth
            this.openMouth();
            //Stretch tongue
            var tongueWidth = Tools.getDistance(this.tongue.world, this.entitySelected.group.position);
            this.tongueStretch = g.add.tween(this.tongue).to({ width: tongueWidth }, this.tongueGrabTime);
            this.tongueStretch.onComplete.add(this.tongueGrabReached, this);
            this.tongueStretch.start();
            //Sound
            this.sounds.play("tongue_launch");
        }
    };
    //Tongue has reached the selection
    Predator.prototype.tongueGrabReached = function () {
        //Sound
        this.sounds.stop("tongue_launch");
        //For Waterpoint, drink the water continuously
        if (this.entitySelected != null) {
            if (this.entitySelected instanceof Waterpoint && this.drinkTimer == null) {
                this.drinking = true;
                this.drinkTimer = g.time.events.loop(this.drinkTime, this.drink, this);
                //Sound
                this.sounds.play("drop_inwater");
                this.sounds.play("swallowing_water");
            }
            else if (this.entitySelected instanceof Plant || this.entitySelected instanceof Prey) {
                if (this.entitySelected instanceof Prey) {
                    var prey = (this.entitySelected);
                    prey.stopMoving(true);
                    prey.stopEating();
                }
                this.tongue.addChild(this.entitySelected.group);
                this.entitySelected.group.position.x = this.tongueWidthOriginal;
                this.entitySelected.group.position.y = 0;
                this.isEntityGrabbed = true;
                this.entityGrabbed = this.entitySelected;
                this.level.select(null); //Trigger this.setSelection thus this.closeMouth
                //Sound
                this.sounds.play("tongue_stick");
            }
        }
    };
    //*** Drink ***
    //Drink the waterpoint
    Predator.prototype.drink = function () {
        //Stop dehydration while drinking
        if (this.dehydrateTimer != null) {
            this.dehydrateTimer.timer.remove(this.dehydrateTimer);
            this.dehydrateTimer = null;
        }
        //Hydration increase
        this.changeHydration(1);
    };
    //Stop drinking
    Predator.prototype.stopDrink = function () {
        if (this.drinkTimer != null) {
            this.drinkTimer.timer.remove(this.drinkTimer);
            this.drinkTimer = null;
            //Sound
            this.sounds.stop("swallowing_water");
        }
        this.drinking = false;
        this.closeMouth();
        //Reactivate dehydration
        if (this.dehydrateTimer == null)
            this.dehydrateTimer = g.time.events.loop(this.dehydrateTime, this.dehydrate, this); //Déshydratation
    };
    //*** Mouth ***
    //Open the mouth
    Predator.prototype.openMouth = function () {
        if (!this.mouthOpened) {
            this.animateMouth(true);
            this.mouthOpened = true;
        }
    };
    //Animation
    Predator.prototype.animateMouth = function (open) {
        var animations, currentAnim, animated;
        animations = this.sprite.animations;
        currentAnim = animations.currentAnim;
        animated = currentAnim != null && currentAnim.isPlaying;
        if (animated)
            currentAnim.onComplete.addOnce(function () { animations.play(open ? 'open_mouth' : 'close_mouth'); });
        else
            animations.play(open ? 'open_mouth' : 'close_mouth');
    };
    //Close the mouth while returning the tongue
    Predator.prototype.closeMouth = function () {
        if (!this.mouthClosing && this.mouthOpened) {
            this.mouthClosing = true;
            if (this.drinking)
                this.stopDrink();
            //Stop tongue stretching
            if (this.tongueStretch != null) {
                this.tongueStretch.stop();
                this.tongueStretch = null;
            }
            //Start tongue returning
            if (this.tongueReturn == null) {
                this.tongueReturn = g.add.tween(this.tongue).to({ width: 1 }, this.tongueGrabTime);
                this.tongueReturn.onComplete.add(this.tongueReturned, this);
                this.tongueReturn.start();
                //Sound
                if (this.previousEntitySelected != null && this.previousEntitySelected instanceof Waterpoint)
                    this.sounds.play("water_drop");
            }
            this.mouthOpened = false;
        }
    };
    //Tongue returned
    Predator.prototype.tongueReturned = function () {
        this.tongueReturn = null;
        //Close the mouth animation
        this.animateMouth(false);
        //Digest the grabbed selection
        if (this.isEntityGrabbed && this.entityGrabbed != null && !(this.entityGrabbed instanceof Waterpoint)) {
            //Digestion
            this.digest();
            //Sound
            this.sounds.play("monster_bite");
        }
        this.mouthClosing = false;
    };
    //*** Digest ***
    //Digest the swallowed thing
    Predator.prototype.digest = function () {
        if (this.entityGrabbed != null) {
            if (this.entityGrabbed instanceof Prey) {
                //Convert to vitals
                this.changeHunger(conf["predator"]["eat_prey_hunger"]);
                //Kill the prey
                var prey = (this.entityGrabbed);
                this.tongue.removeChild(prey.group);
                g.world.addChild(prey.group);
                prey.kill();
            }
            else if (this.entityGrabbed instanceof Plant) {
                var plant = (this.entityGrabbed);
                //Convert to vitals
                if (plant.rank == Plant.RANK["LEAFY"]) {
                    this.changeHunger(conf["predator"]["eat_plantleafy_hunger"]);
                    this.changeSeeds(conf["predator"]["eat_plantleafy_seeds"]);
                }
                else if (plant.rank == Plant.RANK["FRUITY"]) {
                    this.changeHunger(conf["predator"]["eat_plantfruity_hunger"]);
                    this.changeEnergy(conf["predator"]["eat_plantfruity_energy"]);
                    this.changeSeeds(conf["predator"]["eat_plantfruity_seeds"]);
                }
                else if (plant.rank == Plant.RANK["SEEDY"]) {
                    this.changeHunger(conf["predator"]["eat_plantseedy_hunger"]);
                    this.changeEnergy(conf["predator"]["eat_plantseedy_energy"]);
                    this.changeSeeds(conf["predator"]["eat_plantseedy_seeds"]);
                }
                //Destroy the plant
                this.tongue.removeChild(plant.group);
                g.world.addChild(plant.group);
                plant.kill();
            }
            this.isEntityGrabbed = false;
            this.entityGrabbed = null;
        }
    };
    //*** Plant ***
    //Can plant is enough seeds, empty cell and alive
    Predator.prototype.canPlant = function () {
        return this.isAlive() && this.seeds > 0 && this.cellSelected != null && this.cellSelected.isEmpty();
    };
    //Plant
    Predator.prototype.plant = function () {
        if (this.ability.canUseAbility() && this.canPlant()) {
            //Start the ability
            this.ability.useAbility();
            //Open mouth
            this.openMouth();
            //Plante posée instantanément invisible
            this.newPlant = this.controller.createPlant(this.cellSelected);
            //Lancement de graine
            this.seed.position = this.group.position.clone();
            this.seed.alpha = 1;
            this.seed.rotation = Tools.getRandomRadianAngle();
            var seedPos = this.newPlant.group.position.clone();
            this.seedLaunch = g.add.tween(this.seed).to({ x: seedPos.x, y: seedPos.y }, this.seedLaunchTime);
            this.seedLaunch.onComplete.add(this.seedPlantArrived, this);
            this.seedLaunch.start();
            //Sound
            this.sounds.play("spit");
            //Seeds decrease
            this.changeSeeds(-1);
            //Close mouth
            this.closeMouth();
        }
    };
    //Seed plant arrived
    Predator.prototype.seedPlantArrived = function () {
        //Sound
        this.sounds.play("dirt_hit");
        //Close the mouth
        this.closeMouth();
        this.seed.alpha = 0;
        this.newPlant.born();
    };
    //*** Watering ***
    //Arroser
    Predator.prototype.water = function () {
        if (this.ability.canUseAbility() && this.entitySelected != null && this.entitySelected instanceof Plant) {
            var plant = (this.entitySelected);
            if (this.hydration >= this.waterneeded && plant.rank == Plant.RANK["SEED"]) {
                //Start the ability
                this.ability.useAbility();
                //Open mouth
                this.openMouth();
                //Hydration
                this.changeHydration(-this.waterneeded);
                //Jet d'eau
                this.waterjet.position = this.group.position.clone();
                this.waterjet.rotation = this.group.rotation;
                this.waterjet.visible = true;
                this.wateredPlant = plant;
                var waterjetPos = plant.group.position.clone();
                var waterjeting = g.add.tween(this.waterjet).to({ x: waterjetPos.x, y: waterjetPos.y }, this.waterjetTime);
                waterjeting.onComplete.add(this.waterjeted, this);
                waterjeting.start();
                //Sound
                this.sounds.play("water_throw");
            }
        }
    };
    //Waterjeting finished
    Predator.prototype.waterjeted = function () {
        //Watering of the plant
        if (this.wateredPlant != null) {
            //Close the mouth
            this.closeMouth();
            this.wateredPlant.water();
            this.wateredPlant = null;
            this.waterjet.visible = false;
        }
    };
    //Peut arroser ?
    Predator.prototype.canWater = function () {
        return this.hydration >= this.waterneeded;
    };
    //*** Passive abilities
    //Heal
    Predator.prototype.heal = function (amount) {
        this.changeHealth(1);
    };
    Predator.prototype.changeHealth = function (variation) {
        var val = Math.max(0, Math.min(conf["predator"]["health"], this.health + variation));
        if (val != this.health) {
            this.health = val;
            this.controller.gameStateHasChanged(GameStateInterface.INFOS["HEALTH"], this.health, variation);
        }
    };
    //Dehydrate
    Predator.prototype.dehydrate = function () {
        this.changeHydration(-1);
    };
    Predator.prototype.changeHydration = function (variation) {
        var val = Math.max(0, Math.min(conf["predator"]["hydration"], this.hydration + variation));
        if (val != this.hydration) {
            this.hydration = val;
            this.controller.gameStateHasChanged(GameStateInterface.INFOS["HYDRATION"], this.hydration, variation);
            this.updateDeterioration(); //Deterioation check
        }
    };
    //Hunger
    Predator.prototype.decreaseHunger = function () {
        this.changeHunger(-1);
    };
    Predator.prototype.changeHunger = function (variation) {
        var val = Math.max(0, Math.min(conf["predator"]["hunger"], this.hunger + variation));
        if (val != this.hunger) {
            this.hunger = val;
            this.controller.gameStateHasChanged(GameStateInterface.INFOS["HUNGER"], this.hunger, variation);
            this.updateDeterioration(); //Deterioation check
        }
    };
    //Energy
    Predator.prototype.decreaseEnergy = function () {
        this.changeEnergy(-1);
    };
    Predator.prototype.changeEnergy = function (variation) {
        var val = Math.max(0, Math.min(conf["predator"]["energy"], this.energy + variation));
        if (val != this.energy) {
            this.energy = val;
            this.controller.gameStateHasChanged(GameStateInterface.INFOS["ENERGY"], this.energy, variation);
        }
    };
    //Production de graine
    Predator.prototype.produceSeed = function () {
        //Si en vie, hydraté, pas affamé et avec de l'énergie
        if (this.isAlive() && this.hydration > 0 && this.hunger > 0 && this.energy > 0)
            this.changeSeeds(1);
    };
    Predator.prototype.changeSeeds = function (variation) {
        var val = Math.max(0, this.seeds + variation);
        if (val != this.seeds) {
            //Gain
            if (val > this.seeds)
                this.sounds.play("seed_gained"); //Sound
            this.seeds = val;
            this.controller.gameStateHasChanged(GameStateInterface.INFOS["SEEDS"], this.seeds, variation);
        }
    };
    //Deterioration
    Predator.prototype.updateDeterioration = function () {
        // si l'hydratation ou la faim est à 0
        this.deteriorating = this.hydration <= 0 || this.hunger <= 0;
        //Arret ou démarrage des boucles de soins ou détérioration
        if (this.deteriorating) {
            if (this.deteriorateLoop == null) {
                this.deteriorateLoop = g.time.events.loop(this.deteriorateTime, this.deteriorate, this);
            }
            if (this.selfhealLoop != null) {
                this.selfhealLoop.timer.remove(this.selfhealLoop);
                this.selfhealLoop = null;
            }
        }
        else {
            if (this.deteriorateLoop != null) {
                this.deteriorateLoop.timer.remove(this.deteriorateLoop);
                this.deteriorateLoop = null;
                //Sound
                this.sounds.stop("predator_pain");
            }
            if (this.selfhealLoop == null)
                this.selfhealLoop = g.time.events.loop(this.selfhealTime, this.heal, this);
        }
    };
    Predator.prototype.deteriorate = function () {
        //If alive and dehydrated or hungry
        if (this.isAlive() && this.deteriorating) {
            if (this.health > 0) {
                this.changeHealth(-1);
                //Sound of pain with various volume and frequency
                g.time.events.add(Tools.getRandomArbitrary(0, 300, true), function (state) {
                    this.sounds.stop("predator_pain");
                    this.sounds.volume("predator_pain", Tools.getRandomArbitrary(0.5, 1.5, false));
                    this.sounds.play("predator_pain");
                }, this);
                if (this.health <= 0)
                    this.kill();
            }
        }
    };
    return Predator;
}(Entity));
