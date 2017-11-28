/**
 * The ability.
 */
var Ability = (function () {
    function Ability(level) {
        this.level = level;
        this.abilityOngoing = false;
        //Global cooldown, minimum time between 2 abilities
        this.globalCooldown = conf["ability"]["global_cooldown"];
        this.lastAbilityTime = 0;
    }
    /**
     * Return true if a new ability can be used
     */
    Ability.prototype.canUseAbility = function () {
        return !this.abilityOngoing;
    };
    /**
     * An ability start is used
     */
    Ability.prototype.useAbility = function () {
        if (!this.abilityOngoing) {
            this.abilityOngoing = true;
            this.level.commandInterface.oncooldown = true;
            this.lastAbilityTime = Tools.currentTimeMillis();
            g.time.events.add(this.globalCooldown, this.abilityFinished, this);
        }
    };
    /**
     * An ability is ended
     */
    Ability.prototype.abilityFinished = function () {
        this.abilityOngoing = false;
        this.lastAbilityTime = 0;
        this.level.commandInterface.oncooldown = false;
    };
    return Ability;
}());
