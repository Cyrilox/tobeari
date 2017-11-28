/**
 * The ability.
 */
class Ability {
	private abilityOngoing: boolean;
	private globalCooldown: number;
	private lastAbilityTime: number;
	
	constructor(private level: Level) {
		this.abilityOngoing = false;
		//Global cooldown, minimum time between 2 abilities
		this.globalCooldown = conf["ability"]["global_cooldown"];
		this.lastAbilityTime = 0;
	}
	
	/**
	 * Return true if a new ability can be used
	 */
	public canUseAbility(): boolean {
		return !this.abilityOngoing;
	}
	
	/**
	 * An ability start is used
	 */
	public useAbility() {
		if(!this.abilityOngoing) {
			this.abilityOngoing = true;
			this.level.commandInterface.oncooldown = true;
			this.lastAbilityTime = Tools.currentTimeMillis();
			g.time.events.add(this.globalCooldown, this.abilityFinished, this);
		}
	}
	
	/**
	 * An ability is ended
	 */
	private abilityFinished() {
		this.abilityOngoing = false;
		this.lastAbilityTime = 0;
		this.level.commandInterface.oncooldown = false;
	}
}