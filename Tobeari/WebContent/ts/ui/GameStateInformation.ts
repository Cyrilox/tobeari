/**
 * A game state information.
 */
class GameStateInformation {
	static STYLE_POSVAR = {};
	static STYLE_NEGVAR = {};

	private showing: boolean;
	private lastShowTime: number;
	private showMinIntervalTime: number;
	private variationToShow: number;
	private variationSlideLength: number;

	private variationStartPos: Phaser.Point;
	private variationEndPos: Phaser.Point;

	private availableTexts: Phaser.Text[];

	private showTimer: Phaser.TimerEvent;
	
	constructor(private level: Level, private elements: Phaser.Group, public textValue: string, public percent: boolean, private textGraphic: Phaser.Text) {
		this.showing = false;
		this.lastShowTime = 0;
		this.showMinIntervalTime = 700;
		this.variationToShow = 0;
		this.variationSlideLength = GraphicInterface.sizeOfWidth(8);
		
		textGraphic.text = textValue;
		
		this.variationStartPos = null;
		this.variationEndPos = null;
		this.refresh();
		
		this.availableTexts = [];
		this.createTexts(4);
		
		//Show timer
		this.showTimer = g.time.events.loop(this.showMinIntervalTime, this.show, this);
	}
	
	static init() {
		let size = GraphicInterface.sizeOfHeight(5);
		GameStateInformation.STYLE_POSVAR = { font: "bold "+size+"px Arial", fill: "#00a600" };
		GameStateInformation.STYLE_NEGVAR = { font: "bold "+size+"px Arial", fill: "#ff7800" };
	}
	
	public refresh() {
		let variationY = this.textGraphic.position.y - this.textGraphic.height / 2;
		let width = this.textGraphic.width;
		
		this.variationStartPos = new Phaser.Point(this.textGraphic.position.x + width, variationY);
		this.variationEndPos = new Phaser.Point(this.variationStartPos.x + this.variationSlideLength, variationY);
	}

	public changeVariation(variation: number) {
		//Save the variation then show
		this.variationToShow += variation;
		this.show();
	}

	/**
	 * Create texts
	 */
	private createTexts(amount: number) {
		for(let i=0; i<amount; i++) {
			let text = g.add.text(0, 0, "", GameStateInformation.STYLE_POSVAR);
			text.anchor.setTo(0, 0.5);
			this.availableTexts.push(text);
			this.elements.add(text);
		}
		
		//Ordre d'affichage
		this.level.refreshDisplayOrder();
	}
	
	/**
	 * Show the variation of the information with a slide
	 */
	private show() {
		if(this.variationToShow != 0 && !this.showing) {
			this.showing = true;
			
			//Anti flood
			let time = Date.now();
			if((time - this.lastShowTime) > this.showMinIntervalTime) {
				//Create texts if needed
				if(this.availableTexts.length == 0)
					this.createTexts(3);
				
				//Variation text
				let text = this.availableTexts.pop();
				text.text = "" + (this.variationToShow < 0 ? this.variationToShow : "+" + this.variationToShow);
				text.setStyle(this.variationToShow < 0 ? GameStateInformation.STYLE_NEGVAR : GameStateInformation.STYLE_POSVAR);
				text.x = this.variationStartPos.x;
				text.y = this.variationStartPos.y;
				text.position.x = this.variationStartPos.x;
				text.position.y = this.variationStartPos.y;
				
				//Translation from text to the right
				let tweenTo = g.add.tween(text).to( { x: this.variationEndPos.x, y: this.variationEndPos.y }, 2000, Phaser.Easing.Exponential.InOut);
				tweenTo.onStart.addOnce(function(text: Phaser.Text) {text.alpha = 1;}, this, 0, text);
				
				//Fade out 1 second before translation finished
				let tweenAlpha = g.add.tween(text).to( { alpha: 0 }, 300, Phaser.Easing.Linear.None);
				tweenAlpha.onComplete.addOnce(this.setAvailable, this, 0, text);
				
				tweenTo.chain(tweenAlpha);
				tweenTo.start();
				
				this.variationToShow = 0;
				this.lastShowTime = time;
			}
			
			this.showing = false;
		}
	}
	
	/**
	 * Put text to available list
	 */
	private setAvailable(text: Phaser.Text) {
		text.alpha = 0;
		this.availableTexts.push(text);
	}
}
