/**
 * Tools. 
 */
class Tools {

    //*** Phaser Interface ***

    /**
     * Start a Phaser state, with LoadingScreen optionnally, LoadingScreen.hide() to hide it
     */
    static startState(state: string, withLoadingScreen = false) {
		//Loading screen
        if(withLoadingScreen) {
            LoadingScreen.init();
            LoadingScreen.show();
        }

        //Delayed start state to let Phaser redraw
        g.time.events.add(withLoadingScreen ? 100 : 0, function(state: string) {
            g.state.start(state);
		}, this, state);
    }

    /**
     * Return the JSON object of strings from Phaser, for current language
     */
    static getStringsJSON(): any {
        let language = window["navigator"]["userLanguage"] || window["navigator"]["language"];
		let stringsFile = "strings_en";
		if(Tools.stringStartWith(language, "fr"))
			stringsFile = "strings_fr";
		return g.cache.getJSON(stringsFile);
    }

    /**
     * Add a Phaser Sprite and return it, from atlas by default
     */
    static addSprite(x: number, y: number, key: string, fromAtlas = true): Phaser.Sprite {
        let sprite: Phaser.Sprite;
        if(fromAtlas)
		    sprite = g.add.sprite(x, y, "images-atlas", key);
        else
            sprite = g.add.sprite(x, y, key);
        
        return sprite;
    }

    //*** Graphics ***

    /**
     * Return the game size with a 16/9 ratio of visible page
     * Ratio params examples : 16/9
     */
    static getGameSize(ratioWidth: number, ratioHeight: number): {width: number, height: number} {
        let innerHeight = window.innerHeight;
        let width = window.innerWidth;
        let height = width * ratioHeight / ratioWidth;
        if(height > innerHeight){
            height = innerHeight;
            width = height * ratioWidth / ratioHeight;
        }
        return {"width": width, "height": height};
    }

    static stringStartWith(str: string, substr: string): boolean {
        let strUP = str.substring(0, substr.length).toUpperCase();
        let substrUP = substr.toUpperCase();
        return strUP === substrUP;
    }

    /**
     * Return the actual time in millisecond
     */
    static currentTimeMillis(): number {
        return new Date().getTime();
    }
    /*
    * Return the positive radian, from 0 to 2PI, clockwize
    */
    static positiveRadian(radian: number): number {
        return radian < 0 ? Math.PI * 2 + radian : radian;
    }
    /*
    * Return the regular radian, -0 to -PI counter-clockwize, or 0 to PI clockwize
    */
    static regularRadian(radian: number): number {
        return radian > Math.PI ? radian - Math.PI * 2 : radian;
    }
    /*
    * Return a random angle in radian
    */
    static getRandomRadianAngle(): number {
        return this.getRandomArbitrary(-Math.PI, Math.PI);
    }
    /*
    * Return the distance between 2 target
    */
    static getDistance(targetA: Phaser.Sprite|Phaser.Point|Phaser.Group, targetB: Phaser.Sprite|Phaser.Point|Phaser.Group): number {
        return g.physics.arcade.distanceBetween(targetA, targetB);
    }
    /*
    * Return the angle between 2 target in radian
    */
    static getAngle(targetA: Phaser.Sprite|Phaser.Point|Phaser.Group, targetB: Phaser.Sprite|Phaser.Point|Phaser.Group): number {
        return g.physics.arcade.angleBetween(targetA, targetB);
    }
    /*
    * Return the closest angle between 2 radian angle in positive radian
    */
    static getClosestAngle(angleA: number, angleB: number): number {
        let posAngleA: number, posAngleB: number;
        posAngleA = this.positiveRadian(angleA);
        posAngleB = this.positiveRadian(angleB);
        let angle = Math.abs(posAngleA - posAngleB);
        let angleReverse = Math.PI * 2 - angle;

        return Math.min(angle, angleReverse);
    }
    /*
    * Calculate a trigonometric position around a point
    * @param {Phaser.Point} origin Central point
    * @param {number} radius Radius from the central point
    * @param {number} angle Angle in radian from the central point
    * Return the new position into a Phaser.Point
    */
    static getTrigPosition(origin: Phaser.Point, radius: number, angle: number): Phaser.Point {
        let x: number, y: number;
        x = origin.x + radius * Math.cos(angle);
        y = origin.y + radius * Math.sin(angle);

        return new Phaser.Point(x, y);
    }
    /**
     * Return true if the point is in the polygon
     */
    static isPointInPolygon(point: Phaser.Point, polygon: Phaser.Rectangle|Phaser.Polygon): boolean {
        return polygon.contains(point.x, point.y);
    }

    //*** Number ***

    /*
    * Return a random float number between min(included) and max(exluded)
    * integer True for integer value
    */
    static getRandomArbitrary(min: number, max: number, integer?: boolean): number {
        let random = Math.random() * (max - min) + min;
        if (integer == undefined)
            integer = false;
        if (integer) {
            random = Math.round(random);
            if (random == max)
                random--;
        }
		
        return random;
    }
    /**
     * Return the given value with min and max applied
     */
    static minMax(val: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, val));
    }

    //*** Array ***

    /**
     * Return a 2D array with null or given default value
     */
    static newArray(width: number, height: number, value: any = null): any[][] {
        let array2D: any[][] = [];
        let array: any[];
        for(let y=0; y<height; y++){
            array = [];
            for(let x=0; x<width; x++)
                array.push(value);
            array2D.push(array);
        }
        return array2D;
    }

    /**
     * Return the shuffled array inputed
     */
    static shuffle(array: any[]): any[] {
        let randomIndex: number;
        let itemAtIndex: any;
        for(let n=0; n<10; n++)
            for(let i=0; i<array.length; i++) {
                randomIndex = Tools.getRandomArbitrary(0, array.length, true);
                itemAtIndex = array[randomIndex]; 
                array[randomIndex] = array[i]; 
                array[i] = itemAtIndex;
            }
        return array;
    }

    /**
     * Return true if the contain the given element
     */
    static inArray(array: any[], element: any): boolean {
        for(let i in array)
            if(array[i] == element)
                return true;
        
        return false;
    }

    /**
     * Return the cloned array inputed
     */
    static clone(array: any[]) {
        return array.slice();
    }
}