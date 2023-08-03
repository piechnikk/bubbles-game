import { Position, IBubble } from "../interfaces";
import { click_decorator } from "../decorators";
import Board from "./Board";
export default class Bubble implements IBubble {

    /** Bubble position {x, y} */
    public position: Position
    /** Contains bubble color */
    public color: string
    /** contains div  */
    public div: HTMLDivElement
    /** Function in Board */
    public clickedOnBubble: Function
    /** Variable that shows if the bubble is selected */
    public selected: Boolean

    constructor(position: Position, color: string, clickedOnBubble: Function) {
        this.position = position
        this.color = color
        this.clickedOnBubble = clickedOnBubble
        this.create()
    }
    /** A function that create new bubble */
    create() {
        this.selected = false
        this.div = document.createElement("div")
        this.div.classList.add("bubbles")
        this.div.style.backgroundColor = this.color
        this.div.style.width = Board.SIZE * 0.5 + "px"
        this.div.style.height = Board.SIZE * 0.5 + "px"
        this.div.addEventListener("click", () => this.click())

        document.getElementById(this.position.y + "_" + this.position.x).appendChild(this.div)
    }
    /**
     * @event
     * Handle click on the bubble
     */
    @click_decorator
    click() {
        if ((this.position.x == 0 || Board.aTab[this.position.y][this.position.x - 1] != 0) && (this.position.y == 0 || Board.aTab[this.position.y - 1][this.position.x] != 0) && (this.position.x == Board.ROWS - 1 || Board.aTab[this.position.y][this.position.x + 1] != 0) && (this.position.y == Board.COLUMNS - 1 || Board.aTab[this.position.y + 1][this.position.x] != 0)) {
            console.log("blok");
        } else {
            this.changeClick()
            this.clickedOnBubble(this)
        }
    }
    /** Change ball size */
    changeClick() {
        this.selected = !this.selected
        if (this.selected) {
            this.div.style.width = Board.SIZE * 0.7 + "px"
            this.div.style.height = Board.SIZE * 0.7 + "px"
        } else {
            this.div.style.width = Board.SIZE * 0.5 + "px"
            this.div.style.height = Board.SIZE * 0.5 + "px"
        }
    }
    /**
     * Moves bubble
     * @param meta Bubble end position
     */
    move(meta: Position) {
        this.position.x = meta.x
        this.position.y = meta.y
        // this.position = meta
        this.changeClick()
    }
    /** Remove bubble */
    remove() {
        document.getElementById(this.position.y + "_" + this.position.x).removeChild(this.div)
    }
}