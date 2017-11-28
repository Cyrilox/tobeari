/**
 * SoundManager.
 */
class SoundManager {
	//Configuration
	static config: any;

	//Sounds
	private sounds:any = {};//Object of keys: soundKey, values: audio

	constructor(private group: string) {
		//let soundsList = JsonTools.get(SoundManager.config, group);
		let soundsList = SoundManager.config[group];
		assert(soundsList instanceof Object, "Sound Group with key '" + group + "' not found");

		let sound: any, key: string, loop: boolean, audio: Phaser.Sound;
		for(let i in soundsList){
			sound = soundsList[i];
			key = sound.key;
			loop = sound.loop;
			if(loop === undefined)
				loop = false;
			this.sounds[key] = g.add.audio(key, sound.volume, loop);
		}
	}

	static init() {
		this.config = g.cache.getJSON("sounds_config");
	}

	public play(key: string) {
		this.getSound(key).play();
	}

	/**
	 * Change the volume to a percent of the original volume (1 for 100%)
	 */
	public volume(key: string, volume: number) {
		this.getSound(key).volume = volume * this.getDefaultVolume(key);
	}

	private getDefaultVolume(key: string): number {
		let soundsList = SoundManager.config[this.group];
		for(let i in soundsList)
			if(soundsList[i].key == key)
				return soundsList[i].volume;
		console.warn("Default volume '" + key + "' in group '" + this.group + "' not found");
		return 1;
	}

	public stop(key: string) {
		this.getSound(key).stop();
	}

	public stopAll() {
		for(let i in this.sounds)
			this.sounds[i].stop();
	}

	private getSound(key: string): Phaser.Sound {
		let sound = this.sounds[key];
		assert(sound instanceof Phaser.Sound, "Sound with key '" + key + "' not found in group '" + this.group + "'");
		return sound;
	}
}