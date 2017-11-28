/**
 * An abstract class for interfaces.
 */
abstract class GraphicInterface {
	static spacing = 30;//Pixels
	static spacingPercentage = 5;//Percentage
	
	public elements: Phaser.Group;
	
	protected x: number = 0;
	protected y: number = 0;

	private elementsRectangle: Phaser.Rectangle[] = [];
	private firstButton: boolean = true;
	private lastButtonHeight: number = 0;

	constructor() {
		this.elements = g.add.group();
	}
	
	/**
	 * Point au dessus de l'interface
	 */
	public isPointerOver(point: Phaser.Point): boolean {
		for(let i in this.elementsRectangle)
			if(Tools.isPointInPolygon(point, this.elementsRectangle[i]))
				return true;
		return false;
	}

	//Add button aligned vertically, top to bottom
	protected addAlignedButton(type: number, sprite: string, anchorX: number, anchorY: number, heigth: number, callback: Function, context: any, imageFromAtlas = true): Button {
		if(!this.firstButton)
			this.y += GraphicInterface.spacing + this.lastButtonHeight;
		else
			this.firstButton = false;
		let button = this.addButton(type, this.x, this.y, anchorX, anchorY, heigth, sprite, callback, context, imageFromAtlas);
		this.lastButtonHeight = button.height;
		
		return button;
	}
	
	//Add a button with over detection
	private addButton(type: number, x: number, y: number, anchorX: number, anchorY: number, height: number, sprite: string, callback: Function, context: any, imageFromAtlas = true): Button {
		let button = new Button(type, sprite, x, y, height, callback, context, imageFromAtlas);
		button.setAnchor(anchorX, anchorY);
		this.elements.add(button.group);
		
		let rectX: number, rectY: number;
		rectX = button.x - button.width * anchorX;
		rectY = button.y - button.height * anchorY;
		this.elementsRectangle.push(new Phaser.Rectangle(rectX, rectY, button.width, button.height));
		
		return button;
	}

	//*** Statics ***

	static init() {
		GraphicInterface.spacing = GraphicInterface.sizeOfHeight(GraphicInterface.spacingPercentage);
	}
	
	/**
	 * Return the pixel amount for width of a given percentage
	 */
	static sizeOfWidth(percent: number): number {
		return Math.round(g.world.width * percent / 100);
	}
	
	/**
	 * Return the pixel amount for height of a given percentage
	 */
	static sizeOfHeight(percent: number): number {
		return Math.round(g.world.height * percent / 100);
	}

	/**
	 * Scale the Sprite|Text|Button to a height of the screen percentage, keeping proprotion
	 */
	static scaleByHeight(graphic: Phaser.Sprite|Phaser.Text|Button, percent: number) {
		let newHeight = GraphicInterface.sizeOfHeight(percent);
		let newWidth = Math.round(graphic.width * newHeight / graphic.height);
		graphic.width = newWidth;
		graphic.height = newHeight;
	}

	/**
	 * Scale the Sprite|Text to a width of the screen percentage, keeping proprotion
	 */
	static scaleByWidth(graphic: Phaser.Sprite|Phaser.Text|Button, percent: number) {
		let newWidth = GraphicInterface.sizeOfWidth(percent);
		let newHeight = Math.round(graphic.height * newWidth / graphic.width);
		graphic.width = newWidth;
		graphic.height = newHeight;
	}

	/**
	 * Scale the Sprite|Text|Button to a height of the given number in pixel, keeping proprotion
	 */
	static scaleByHeightWithSize(graphic: Phaser.Sprite|Phaser.Text|Button, height: number) {
		let newWidth = Math.round(graphic.width * height / graphic.height);
		graphic.width = newWidth;
		graphic.height = height;
	}
}