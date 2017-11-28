/**
 * GameManager
 */
class GameManager {
	//Properties
	public gameStateInterface: GameStateInterface;

	//States
	public playing: boolean = false;
	public score: number = 0;
	public isPaused: boolean = false;

	//Score
	private raiseScoreTime: number;
	private raiseScoreLoop: Phaser.TimerEvent = null;
	private bestScoreBeaten: boolean;
	
	//UI
	private messagesSizePerc: number;
	public objective: Phaser.Text;
	public scoreText: Phaser.Text;
	public endgameText: Phaser.Text;
	public bestScoreText: Phaser.Text;

	//Sounds
	private sounds: SoundManager;

	constructor(private controller: Controller) {
		this.raiseScoreTime = Phaser.Timer.SECOND * conf["gamemanager"]["raisescoretime"];

		//Messages size
		this.messagesSizePerc = 15;
		let messagesSize = GraphicInterface.sizeOfHeight(this.messagesSizePerc);
		
		//Début de partie
		let objectiveTextStyle = { font: "bold "+messagesSize+"px Arial", fill: "#B30065" }
		this.objective = g.add.text(g.world.centerX, GraphicInterface.spacing, strings["gamemanager"]["objective_text"], objectiveTextStyle);
		this.objective.anchor.setTo(0.5, 0);
		GraphicInterface.scaleByHeight(this.objective, this.messagesSizePerc);
		
		//Le score de fin
		let scoreTextStyle = { font: "bold "+messagesSize+"px Arial", fill: "#ccff33" }
		this.scoreText = g.add.text(g.world.centerX, GraphicInterface.spacing, "", scoreTextStyle);
		this.scoreText.anchor.setTo(0.5, 0);
		this.scoreText.visible = false;
		
		//Record battu
		let bestScoreTextStyle = { font: "bold "+messagesSize+"px Arial", fill: "#EFD807" }
		this.bestScoreText = g.add.text(g.world.centerX, g.world.centerY / 2 + GraphicInterface.spacing, strings["gamemanager"]["bestscore_text"], bestScoreTextStyle);
		this.bestScoreText.anchor.setTo(0.5, 0.5);
		this.bestScoreText.visible = false;
		this.bestScoreBeaten = false;
		GraphicInterface.scaleByHeight(this.bestScoreText, this.messagesSizePerc);
		
		//Fin de partie
		let endgameTextStyle = { font: "bold "+messagesSize+"px Arial", fill: "#e6e6e6" }
		this.endgameText = g.add.text(g.world.centerX, g.world.centerY + GraphicInterface.spacing, strings["gamemanager"]["endgame_text"], endgameTextStyle);
		this.endgameText.anchor.setTo(0.5, 0);
		this.endgameText.visible = false;
		GraphicInterface.scaleByHeight(this.endgameText, this.messagesSizePerc);

		//Sounds
		this.sounds = new SoundManager("gamemanager");
	}

	public init(gameStateInterface: GameStateInterface) {
		this.gameStateInterface = gameStateInterface;
	}
	
	//*** Level States ***

	/**
	 * Start the level
	 */
	public start() {
		//Raise score
		this.raiseScoreLoop = g.time.events.loop(this.raiseScoreTime, this.raiseScore, this);
		
		//Affichage
		g.time.events.add(Phaser.Timer.SECOND * 3, function() {
			g.add.tween(this.objective).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		}, this);
		this.scoreText.visible = false;
		this.bestScoreText.visible = false;
		this.bestScoreBeaten = false;
		
		//Démarrage
		this.playing = true;
	}
	
	/**
	 * End the level
	 */
	public end() {
		if(this.playing) {
			// alors interruption de partie.
			this.raiseScoreLoop.timer.remove(this.raiseScoreLoop);
			this.controller.unselect();
			this.playing = false;

			this.scoreText.setText(strings["gamemanager"]["score"] + this.score);
			this.scoreText.visible = true;//Score
			GraphicInterface.scaleByHeight(this.scoreText, this.messagesSizePerc);

			this.endgameText.visible = true;//Message de fin
			
			//Score
			this.addScore();
			
			//Sound & bestscore
			if(this.bestScoreBeaten) {
				this.bestScoreText.visible = true;
				this.sounds.play("endgame_bestscore");
			}else
				this.sounds.play("endgame");
		}
	}

	//*** Score ***

	/**
	 * Raise the score
	 */
	private raiseScore() {
		this.score += 1;
		this.gameStateInterface.update(GameStateInterface.INFOS["SCORE"], this.score, 1);
	}
	
	//Scores datas
	private addScore() {
		//Si partie terminée
		if(!this.playing) {
			//Record battu
			if(scoresDatas.bestScore > 0 && this.score > scoresDatas.bestScore)
				this.bestScoreBeaten = true;
			scoresDatas.add(this.score);
		}
	}
}