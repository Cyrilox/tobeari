/*
 * A game state information.
 * @class GameStateInformation
 * @contructor
 */
function GameStateInformation(level, elements, textValue, percent, textGraphic){
	
	/**
	 * Create texts
	 */
	this.createTexts = function(amount) {
		for(var i=0; i<amount; i++){
			var text = g.add.text(0, 0, "");
			text.anchor.setTo(0.0, 0.5);
			this.availableTexts.push(text);
			this.elements.add(text);
		}
		
		//Ordre d'affichage
		this.level.refreshDisplayOrder();
	};
	
	/**
	 * 
	 */
	this.changeVariation = function(variation) {
		//Save the variation
		this.variationToShow += variation;
		
		//Show
		this.show();
	};
	
	/**
	 * Show the variation of the information with a slide
	 */
	this.show = function() {
		if(this.variationToShow != 0 && !this.showing){
			this.showing = true;
			
			//Anti flood
			var time = Date.now();
			if((time - this.lastShowTime) > this.showMinIntervalTime){
				//Create texts if needed
				if(this.availableTexts.length == 0)
					this.createTexts(3);
				
				//Variation text
				var text = this.availableTexts.pop();
				text.text = this.variationToShow < 0 ? this.variationToShow : "+" + this.variationToShow;
				text.setStyle(this.variationToShow < 0 ? GameStateInformation.STYLE_NEGVAR : GameStateInformation.STYLE_POSVAR);
				text.x = this.variationStartPos.x;
				text.y = this.variationStartPos.y;
				text.position.x = this.variationStartPos.x;
				text.position.y = this.variationStartPos.y;
				
				//Translation from text to the right
				var tweenTo = g.add.tween(text).to( { x: this.variationEndPos.x, y: this.variationEndPos.y }, 2000, Phaser.Easing.Exponential.InOut);
				tweenTo.onStart.addOnce(function(text){text.alpha = 1;}, this, 0, text);
				
				//Fade out 1 second before translation finished
				var tweenAlpha = g.add.tween(text).to( { alpha: 0 }, 300, Phaser.Easing.Linear.None);
				tweenAlpha.onComplete.addOnce(this.setAvailable, this, 0, text);
				
				tweenTo.chain(tweenAlpha);
				tweenTo.start();
				
				this.variationToShow = 0;
				this.lastShowTime = time;
			}
			
			this.showing = false;
		}
	};
	
	/**
	 * Put text to available list
	 */
	this.setAvailable = function(text) {
		text.alpha = 0;
		this.availableTexts.push(text);
	};
	
	this.refresh = function() {
		var variationSlideLength = 80;
		var variationY = textGraphic.position.y + textGraphic.height / 2;
		var width = textGraphic.width;
		
		this.variationStartPos = new Phaser.Point(textGraphic.position.x + width, variationY);
		this.variationEndPos = new Phaser.Point(this.variationStartPos.x + variationSlideLength, variationY);
	};
	
	GameStateInformation.STYLE_POSVAR = { font: "bold 21px Arial", fill: "#00a600" };
	GameStateInformation.STYLE_NEGVAR = { font: "bold 21px Arial", fill: "#ff7800" };

	this.level = level;
	this.elements = elements;
	
	this.showing = false;
	this.lastShowTime = 0;
	this.showMinIntervalTime = 700;
	this.variationToShow = 0;
	
	this.textValue = textValue;
	this.percent = percent;
	this.textGraphic = textGraphic;
	textGraphic.text = textValue;
	
	this.variationStartPos = null;
	this.variationEndPos = null;
	this.refresh();
	
	this.availableTexts = [];
	this.createTexts(4);
	
	//Show timer
	this.showTimer = g.time.events.loop(this.showMinIntervalTime+5, this.show, this);
}
