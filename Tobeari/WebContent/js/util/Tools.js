/**
 * Tools.
 */
var Tools = (function () {
    function Tools() {
    }
    //*** Phaser Interface ***
    /**
     * Start a Phaser state, with LoadingScreen optionnally, LoadingScreen.hide() to hide it
     */
    Tools.startState = function (state, withLoadingScreen) {
        if (withLoadingScreen === void 0) { withLoadingScreen = false; }
        //Loading screen
        if (withLoadingScreen) {
            LoadingScreen.init();
            LoadingScreen.show();
        }
        //Delayed start state to let Phaser redraw
        g.time.events.add(withLoadingScreen ? 100 : 0, function (state) {
            g.state.start(state);
        }, this, state);
    };
    /**
     * Return the JSON object of strings from Phaser, for current language
     */
    Tools.getStringsJSON = function () {
        var language = window["navigator"]["userLanguage"] || window["navigator"]["language"];
        var stringsFile = "strings_en";
        if (Tools.stringStartWith(language, "fr"))
            stringsFile = "strings_fr";
        return g.cache.getJSON(stringsFile);
    };
    /**
     * Add a Phaser Sprite and return it, from atlas by default
     */
    Tools.addSprite = function (x, y, key, fromAtlas) {
        if (fromAtlas === void 0) { fromAtlas = true; }
        var sprite;
        if (fromAtlas)
            sprite = g.add.sprite(x, y, "images-atlas", key);
        else
            sprite = g.add.sprite(x, y, key);
        return sprite;
    };
    //*** Graphics ***
    /**
     * Return the game size with a 16/9 ratio of visible page
     * Ratio params examples : 16/9
     */
    Tools.getGameSize = function (ratioWidth, ratioHeight) {
        var innerHeight = window.innerHeight;
        var width = window.innerWidth;
        var height = width * ratioHeight / ratioWidth;
        if (height > innerHeight) {
            height = innerHeight;
            width = height * ratioWidth / ratioHeight;
        }
        return { "width": width, "height": height };
    };
    Tools.stringStartWith = function (str, substr) {
        var strUP = str.substring(0, substr.length).toUpperCase();
        var substrUP = substr.toUpperCase();
        return strUP === substrUP;
    };
    /**
     * Return the actual time in millisecond
     */
    Tools.currentTimeMillis = function () {
        return new Date().getTime();
    };
    /*
    * Return the positive radian, from 0 to 2PI, clockwize
    */
    Tools.positiveRadian = function (radian) {
        return radian < 0 ? Math.PI * 2 + radian : radian;
    };
    /*
    * Return the regular radian, -0 to -PI counter-clockwize, or 0 to PI clockwize
    */
    Tools.regularRadian = function (radian) {
        return radian > Math.PI ? radian - Math.PI * 2 : radian;
    };
    /*
    * Return a random angle in radian
    */
    Tools.getRandomRadianAngle = function () {
        return this.getRandomArbitrary(-Math.PI, Math.PI);
    };
    /*
    * Return the distance between 2 target
    */
    Tools.getDistance = function (targetA, targetB) {
        return g.physics.arcade.distanceBetween(targetA, targetB);
    };
    /*
    * Return the angle between 2 target in radian
    */
    Tools.getAngle = function (targetA, targetB) {
        return g.physics.arcade.angleBetween(targetA, targetB);
    };
    /*
    * Return the closest angle between 2 radian angle in positive radian
    */
    Tools.getClosestAngle = function (angleA, angleB) {
        var posAngleA, posAngleB;
        posAngleA = this.positiveRadian(angleA);
        posAngleB = this.positiveRadian(angleB);
        var angle = Math.abs(posAngleA - posAngleB);
        var angleReverse = Math.PI * 2 - angle;
        return Math.min(angle, angleReverse);
    };
    /*
    * Calculate a trigonometric position around a point
    * @param {Phaser.Point} origin Central point
    * @param {number} radius Radius from the central point
    * @param {number} angle Angle in radian from the central point
    * Return the new position into a Phaser.Point
    */
    Tools.getTrigPosition = function (origin, radius, angle) {
        var x, y;
        x = origin.x + radius * Math.cos(angle);
        y = origin.y + radius * Math.sin(angle);
        return new Phaser.Point(x, y);
    };
    /**
     * Return true if the point is in the polygon
     */
    Tools.isPointInPolygon = function (point, polygon) {
        return polygon.contains(point.x, point.y);
    };
    //*** Number ***
    /*
    * Return a random float number between min(included) and max(exluded)
    * integer True for integer value
    */
    Tools.getRandomArbitrary = function (min, max, integer) {
        var random = Math.random() * (max - min) + min;
        if (integer == undefined)
            integer = false;
        if (integer) {
            random = Math.round(random);
            if (random == max)
                random--;
        }
        return random;
    };
    /**
     * Return the given value with min and max applied
     */
    Tools.minMax = function (val, min, max) {
        return Math.max(min, Math.min(max, val));
    };
    //*** Array ***
    /**
     * Return a 2D array with null or given default value
     */
    Tools.newArray = function (width, height, value) {
        if (value === void 0) { value = null; }
        var array2D = [];
        var array;
        for (var y = 0; y < height; y++) {
            array = [];
            for (var x = 0; x < width; x++)
                array.push(value);
            array2D.push(array);
        }
        return array2D;
    };
    /**
     * Return the shuffled array inputed
     */
    Tools.shuffle = function (array) {
        var randomIndex;
        var itemAtIndex;
        for (var n = 0; n < 10; n++)
            for (var i = 0; i < array.length; i++) {
                randomIndex = Tools.getRandomArbitrary(0, array.length, true);
                itemAtIndex = array[randomIndex];
                array[randomIndex] = array[i];
                array[i] = itemAtIndex;
            }
        return array;
    };
    /**
     * Return true if the contain the given element
     */
    Tools.inArray = function (array, element) {
        for (var i in array)
            if (array[i] == element)
                return true;
        return false;
    };
    /**
     * Return the cloned array inputed
     */
    Tools.clone = function (array) {
        return array.slice();
    };
    return Tools;
}());
