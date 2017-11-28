/**
 * SoundManager.
 */
var SoundManager = (function () {
    function SoundManager(group) {
        this.group = group;
        //Sounds
        this.sounds = {}; //Object of keys: soundKey, values: audio
        //let soundsList = JsonTools.get(SoundManager.config, group);
        var soundsList = SoundManager.config[group];
        assert(soundsList instanceof Object, "Sound Group with key '" + group + "' not found");
        var sound, key, loop, audio;
        for (var i in soundsList) {
            sound = soundsList[i];
            key = sound.key;
            loop = sound.loop;
            if (loop === undefined)
                loop = false;
            this.sounds[key] = g.add.audio(key, sound.volume, loop);
        }
    }
    SoundManager.init = function () {
        this.config = g.cache.getJSON("sounds_config");
    };
    SoundManager.prototype.play = function (key) {
        this.getSound(key).play();
    };
    /**
     * Change the volume to a percent of the original volume (1 for 100%)
     */
    SoundManager.prototype.volume = function (key, volume) {
        this.getSound(key).volume = volume * this.getDefaultVolume(key);
    };
    SoundManager.prototype.getDefaultVolume = function (key) {
        var soundsList = SoundManager.config[this.group];
        for (var i in soundsList)
            if (soundsList[i].key == key)
                return soundsList[i].volume;
        console.warn("Default volume '" + key + "' in group '" + this.group + "' not found");
        return 1;
    };
    SoundManager.prototype.stop = function (key) {
        this.getSound(key).stop();
    };
    SoundManager.prototype.stopAll = function () {
        for (var i in this.sounds)
            this.sounds[i].stop();
    };
    SoundManager.prototype.getSound = function (key) {
        var sound = this.sounds[key];
        assert(sound instanceof Phaser.Sound, "Sound with key '" + key + "' not found in group '" + this.group + "'");
        return sound;
    };
    return SoundManager;
}());
