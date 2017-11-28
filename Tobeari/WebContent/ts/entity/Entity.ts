/**
 * An Entity of the game
 */
abstract class Entity {
	private alive: boolean = false;
	
	public group: Phaser.Group;
    public sprite: Phaser.Sprite;

	private selected: boolean = false;

	private hitarea: Phaser.Rectangle = null;//Click area
	private cursor: Phaser.Graphics;

    constructor(protected map: Map, protected controller: Controller, public cell: Cell, public sizeCells: number, public sizeSprite: number, spriteName: string, 
				spriteFromAtlas: boolean, private spriteSelectable: boolean, private cellSelectable: boolean, public walkable = false) {
        //Group containing all graphics positionned relatively to it
		this.group = g.add.group();

		//Sprite
        this.sprite = Tools.addSprite(0, 0, spriteName, spriteFromAtlas);
        this.sprite.width = Cell.EDGE_SIZE * sizeSprite;
        this.sprite.height = Cell.EDGE_SIZE * sizeSprite;
		this.sprite.anchor.setTo(0.5, 0.5);
		g.physics.enable(this.sprite, Phaser.Physics.ARCADE);
		this.group.addChild(this.sprite);

		//Change place
		this.displace(cell);

        //Cursor
		this.cursor = g.add.graphics(0, 0);
		this.cursor.visible = false;
		let cursorDiameter = Math.max(Cell.EDGE_SIZE_X2, Math.sqrt(Math.pow(this.sprite.width, 2) + Math.pow(this.sprite.height, 2)));

		let cursorLineWidth = GraphicInterface.sizeOfHeight(0.7);
		this.cursor.lineStyle(cursorLineWidth, 0xffffff, 1);
		this.cursor.drawCircle(0, 0, cursorDiameter);
		this.group.addAt(this.cursor, 0);

		//Selection
		if(this.spriteSelectable) {
			//Onup
			this.sprite.inputEnabled = true;
			this.sprite.events.onInputUp.add(function() {
				if(this.isAlive())
					this.controller.select(this);
				}, this);
		}
    }

	//*** Position ***

	/**
	 * Instantly change the position, and set Cell occupation and not selectable, odd size only
	 */
	public displace(cell: Cell) {
		//Free previous Cells
		if(this.cell != null)
			this.switchCells(false);

		//Change place
		this.cell = cell;
		if(cell != null) {
			this.group.x = cell.coordinates.center.x;
			this.group.y = cell.coordinates.center.y;
		}

		//Take new Cells
		if(this.cell != null)
			this.switchCells(true);
	}

	/**
	 * Lock or unlock the cells of this Entity
	 * @param {boolean} reserve : True to lock
	 */
	private switchCells(reserve: boolean) {
		let hexs: Hex[] = [];

		if(this.cell != null)
			hexs.push(this.cell.hex)//Center
		if(this.sizeCells > 1)
			hexs = hexs.concat(this.cell.hex.getDisk(1, Math.max(1, Math.floor(this.sizeCells / 2))));//Disk
		
		let cellAround: Cell;
		let cellsNotSelectable: Cell[] = [];
		for(let i in hexs){
			cellAround = this.map.cellAt(hexs[i]);
			if(cellAround != null){
				//Lock reserve
				if(reserve)
					cellAround.addEntity(this);
				else
					cellAround.removeEntity(this);
				//Not selectable
				if(!this.cellSelectable)
					cellsNotSelectable.push(cellAround);
			}
		}

		//Unselectable
		this.map.setSelectableCells(cellsNotSelectable, false);
	}

	//*** Life ***

	public isAlive(): boolean {
		return this.alive;
	}

	/**
	 * Set to alive
	 */
	public spawn() {
		this.alive = true;
	}

	/**
	 * Set to dead and callback the controller
	 */
	public destroy() {
		//Unselect cells
		this.switchCells(false);

		this.alive = false;
		this.controller.entityHasDied(this);
	}

	//*** Selection ***

	public isSelected(): boolean {
		return this.selected;
	}

	/**
	 * Set selection, cursor visibility and allow this entity to callback the Controller when it is dead
	 */
	public setSelected(selected: boolean) {
		this.selected = selected;
		this.cursor.visible = selected;
	}

	/**
	 * Update the hitarea and return it
	 */
	public getHitarea(): Phaser.Rectangle {
		this.hitarea = this.cell != null ? new Phaser.Rectangle(this.cell.coordinates.center.x - this.sprite.width / 2, 
											this.cell.coordinates.center.y - this.sprite.height / 2, this.sprite.width, this.sprite.height) : null;
		
		return this.hitarea;
	}

	public toString(): string {
		return "Entity at Cell " + this.cell;
	}
}