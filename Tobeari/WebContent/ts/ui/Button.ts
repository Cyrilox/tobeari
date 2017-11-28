/**
 * A button with text or image.
 */
enum TYPE { TEXT, IMAGE }
class Button {
	static TYPE = TYPE;

	public group: Phaser.Group;
	private text: Phaser.Text;

	private image: Phaser.Sprite;
	private element: Phaser.Text|Phaser.Sprite;

	private graphic: Phaser.Graphics;
	private graphicGrey: Phaser.Graphics;

	private padding: number;
	public width: number;
	public height: number;
	private roundedRectRadius: number;
	private anchorX: number = 0;
	private anchorY: number = 0;
	
	private xGroup: number;
	private yGroup: number;
	private xGroupScaled: number;
	private yGroupScaled: number;

	private scale: Phaser.Point;
	private scaleOnDown: Phaser.Point;

	private clickable = true;

	constructor(private type: number, value: string, public x: number, public y: number, heigthPerc: number, private callback: Function, private context: any, private imageFromAtlas = true, fillColor = 0x3689ff) {
		//Sizes
		let lineWidth: number, elementHeight: number;
		lineWidth = GraphicInterface.sizeOfHeight(1);
		this.padding = lineWidth + GraphicInterface.sizeOfHeight(1);
		elementHeight = heigthPerc - 4;

		//Text
		if(type == Button.TYPE["TEXT"]){
			let fontSize = GraphicInterface.sizeOfHeight(elementHeight);
			let style = { font: "bold "+fontSize+"px Arial", fill: "#000000" }
			this.text = g.add.text(this.padding, this.padding, value, style);
		}

		//Image
		if(type == Button.TYPE["IMAGE"])
			this.image = Tools.addSprite(this.padding, this.padding, value, imageFromAtlas);

		//Anchor and size
		this.element = (type == Button.TYPE["TEXT"]) ? this.text : this.image;
		GraphicInterface.scaleByHeight(this.element, elementHeight);

		//Button Size
		this.width = this.element.width + this.padding * 2;
		this.height = this.element.height + this.padding * 2;

		//Decoration graphics	
		this.roundedRectRadius = GraphicInterface.sizeOfHeight(4);
		let lineColor = 0xffe600;
		this.graphic = this.getGraphic(fillColor, lineWidth, lineColor);
		this.graphicGrey = this.getGraphic(0x808080, lineWidth, 0x000000);
		this.graphicGrey.visible = false;

		//Scale
		this.scale = new Phaser.Point(1, 1);
		this.scaleOnDown = new Phaser.Point(0.8, 0.8);

		//Inputs
		this.graphic.inputEnabled = true;
		this.graphic.events.onInputDown.add(this.onInputDown, this);
		this.graphic.events.onInputUp.add(this.onInputUp, this);

		//Group
		this.group = g.add.group();
		this.group.add(this.graphicGrey);
		this.group.add(this.graphic);
		this.group.add((type == Button.TYPE["TEXT"]) ? this.element : this.image);

		//Move
		this.moveTo(x, y);
	}

	/**
	 * Return a Graphic for this button, at 0/0 position and current width and height
	 */
	private getGraphic(fillColor: number, lineWidth: number, lineColor: number): Phaser.Graphics {
    	let graphic = g.add.graphics(0, 0);
		graphic.beginFill(fillColor);
		graphic.lineStyle(lineWidth, lineColor, 1);
		graphic.drawRoundedRect(0, 0, this.width, this.height, this.roundedRectRadius);

		return graphic;
	}

	//*** Position ***

	/**
	 * Move the Button to match the given anchor
	 */
	public setAnchor(anchorX: number, anchorY: number) {
		this.anchorX = anchorX;
		this.anchorY = anchorY;
		this.moveTo(this.x, this.y);
	}

	/**
	 * Move to a new position
	 */
	public moveTo(x: number, y: number) {
		//Position
		if(x !== null){
			this.x = x;
			this.xGroup = this.x - this.width * this.anchorX;
			this.group.x = this.xGroup;
		}
		if(y !== null){
			this.y = y;
			this.yGroup = this.y - this.height * this.anchorY;
			this.group.y = this.yGroup;
		}

		//Scaled down position
		this.xGroupScaled = this.xGroup + (this.width - (this.width * this.scaleOnDown.x)) / 2;
		this.yGroupScaled = this.yGroup + (this.height - (this.height * this.scaleOnDown.y)) / 2;
	}

	//*** Inputs ***

	/**
	 * Pointer is down on button, reduce scale of this one
	 */
	private onInputDown() {
		if(this.clickable) {
			//Sound
			sounds.play("menu_selection");
			
			//Shrink
			this.group.scale = this.scaleOnDown;
			this.group.x = this.xGroupScaled;
			this.group.y = this.yGroupScaled;
		}
	}

	/**
	 * Pointer is upped of button, reset scale of this one and callback
	 */
	private onInputUp() {
		if(this.clickable) {
			//Develop
			this.group.scale = this.scale;
			this.group.x = this.xGroup;
			this.group.y = this.yGroup;

			//Callback
			this.callback.apply(this.context);
		}
	}

	//*** Statut ***

	public isClickable(): boolean {
		return this.clickable;	
	}

	/**
	 * Set the clickable statut, and show this one graphically
	 */
	public setClickable(clickable: boolean) {
		this.clickable = clickable;
		
		if(this.type == Button.TYPE["IMAGE"] && !this.imageFromAtlas)
			this.image.frame = clickable ? 0 : 1;
		
		this.graphic.visible = clickable;
		this.graphicGrey.visible = !clickable;
	}
}