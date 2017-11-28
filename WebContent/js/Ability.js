/*
	* The abilities.
 * @class Ability
 * @contructor
 */
function Ability(level){
	
	/**
	 * Return true if a new ability can be used
	 */
	this.canUseAbility = function() {
		return !this.abilityOngoing;
	};
	
	/**
	 * An ability start is used
	 */
	this.useAbility = function() {
		if(!this.abilityOngoing){
			this.abilityOngoing = true;
			this.level.commandInterface.oncooldown = true;
			this.lastAbilityTime = Tools.currentTimeMillis();
			g.time.events.add(this.globalCooldown, this.abilityFinished, this);
		}
	};
	
	/**
	 * An ability is ended
	 */
	this.abilityFinished = function() {
		this.abilityOngoing = false;
		this.lastAbilityTime = 0;
		this.level.commandInterface.oncooldown = false;
	};
	
	this.level = level;
	
	this.abilityOngoing = false;
	//Global cooldown, minimum time between 2 abilities
	this.globalCooldown = config.ability.global_cooldown;
	this.lastAbilityTime = 0;
}