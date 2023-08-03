import { Position, StringList } from "../interfaces"
import { points_decorator } from "../decorators"
import Bubble from "./Bubble";

export default class Board {

    static readonly COLUMNS: number = 9
    static readonly ROWS: number = 9
    private static readonly NEW_BALLS_COUNT: number = 3
    static readonly SIZE: number = 50
    private static readonly BALLS_COLOR_TAB: StringList = ["red", "green", "blue"]
    private static readonly DEL_COUNT: number = 5

    static aTab: (number | string)[][]
    private bTab: string[][][]
    private bubblesTab: Bubble[]
    private table: HTMLDivElement
    private nextBubblesColors: StringList
    private nextBubbles: HTMLDivElement[] = []
    private points: number = 0

    private status: number // 0-set start, 1-set end, 2-path finding, 3-path found, 4-path not found

    private selectedBubble: Bubble
    private meta: Position

    constructor() {
        this.createTables()
        this.createBoard()
        this.addBubbles()
    }

    createTables() {
        Board.aTab = []
        this.bTab = []
        this.bubblesTab = []
        this.selectedBubble = null
        this.meta = { x: null, y: null }
        this.status = 0

        //create empty arrays
        for (let y = 0; y < Board.ROWS; y++) {
            Board.aTab.push([])
            this.bTab.push([])
            for (let x = 0; x < Board.COLUMNS; x++) {
                Board.aTab[y].push(0)
                this.bTab[y].push([])
            }
        }
    }

    createBoard() {
        //create preview
        let preview = document.getElementById("preview")
        for (let i = 0; i < Board.NEW_BALLS_COUNT; i++) {
            let div = document.createElement("div")
            div.classList.add("bubbles")
            div.style.width = Board.SIZE * 0.7 + "px"
            div.style.height = Board.SIZE * 0.7 + "px"
            this.nextBubbles.push(div)
            preview.appendChild(div)
        }

        //create table in html id=y_x
        let content = document.getElementById("content")
        content.innerHTML = ""

        this.table = document.createElement("div")
        this.table.id = "table"
        this.table.style.width = Board.COLUMNS * Board.SIZE + "px"
        for (let y = 0; y < Board.ROWS; y++) {
            for (let x = 0; x < Board.COLUMNS; x++) {
                let cell = document.createElement("div")
                cell.id = y + "_" + x
                cell.style.width = Board.SIZE + "px"
                cell.style.height = Board.SIZE + "px"
                cell.classList.add("cells")
                cell.addEventListener("click", () => {

                    // console.log("status:", this.status, "   selectedBubble:", this.selectedBubble, this);

                    if ((this.status == 3) && (this.selectedBubble.position.x != x || this.selectedBubble.position.y != y)) {
                        this.moveBubble()
                    }
                    else {
                        this.rendere()
                    }
                })


                cell.addEventListener("mouseover", () => {
                    if (this.status != 0 && this.status != 2 && Number.isInteger(Board.aTab[y][x])) {
                        Board.aTab[y][x] = "M"
                        this.meta.x = x
                        this.meta.y = y
                        this.status = 2
                        this.startSearching()
                        this.rendere()
                    }
                })

                this.table.appendChild(cell)
            }
        }
        content.appendChild(this.table)
    }
    startSearching() {
        this.findShortestRoute([{ x: this.selectedBubble.position.x, y: this.selectedBubble.position.y }], 1)
    }
    moveBubble() {
        Board.aTab[this.selectedBubble.position.y][this.selectedBubble.position.x] = 0
        Board.aTab[this.meta.y][this.meta.x] = this.selectedBubble.color
        document.getElementById(this.selectedBubble.position.y + "_" + this.selectedBubble.position.x).innerHTML = ""
        this.selectedBubble.move(this.meta)
        document.getElementById(this.selectedBubble.position.y + "_" + this.selectedBubble.position.x).appendChild(this.selectedBubble.div)
        this.status = 0
        this.selectedBubble = null

        //gray background
        for (let y = 0; y < Board.ROWS; y++) {
            for (let x = 0; x < Board.COLUMNS; x++) {
                let div = document.getElementById(y + "_" + x)
                if (div.style.backgroundColor == "red")
                    div.style.backgroundColor = "gray"
            }
        }

        setTimeout(() => {
            this.rendere()
            if (this.deleteBubbles())
                this.addBubbles()
            this.rendere()
        }, 500);
    }

    @points_decorator
    deleteBubbles() {
        let toDelete: Position[] = []
        //horizontally
        for (let y = 0; y < Board.ROWS; y++) {
            let color = null
            let count = 0
            for (let x = 0; x < Board.COLUMNS; x++) {
                color = Board.aTab[y][x]
                if (Board.aTab[y][x] != 0 && (color == null || Board.aTab[y][x] == color)) {
                    count++
                } else {
                    count = 0
                }


                if (x + 1 >= Board.COLUMNS || Board.aTab[y][x + 1] != color) {
                    if (count >= Board.DEL_COUNT) {
                        for (let i = 0; i < count; i++) {
                            if (toDelete.findIndex((el) => { return el.x == x - i && el.y == y }) == -1) {
                                toDelete.push({ x: x - i, y: y })
                            }
                        }

                    }
                    count = 0
                }

            }
        }
        //vertically
        for (let x = 0; x < Board.COLUMNS; x++) {
            let color = null
            let count = 0
            for (let y = 0; y < Board.ROWS; y++) {
                color = Board.aTab[y][x]
                if (Board.aTab[y][x] != 0 && (color == null || Board.aTab[y][x] == color)) {
                    count++
                } else {
                    count = 0
                }

                if (y + 1 >= Board.ROWS || Board.aTab[y + 1][x] != color) {
                    if (count >= Board.DEL_COUNT) {
                        for (let i = 0; i < count; i++) {
                            if (toDelete.findIndex((el) => { return el.x == x && el.y == y - i }) == -1) {
                                toDelete.push({ x: x, y: y - i })
                            }
                        }
                    }
                    count = 0
                }

            }
        }

        //diagonally

        //from up to down
        for (let x = 0; x < Board.COLUMNS - (Board.DEL_COUNT - 1); x++) {
            let color = null
            let count = 0

            for (let y = 0; y < Math.min(Board.ROWS, Board.COLUMNS - x); y++) {
                color = Board.aTab[y][x + y]
                if (Board.aTab[y][x + y] != 0 && (color == null || Board.aTab[y][x + y] == color)) {
                    count++
                } else {
                    count = 0
                }

                if (y + 1 >= Math.min(Board.ROWS, Board.COLUMNS) || Board.aTab[y + 1][x + y + 1] != color) {
                    if (count >= Board.DEL_COUNT) {
                        for (let i = 0; i < count; i++) {
                            if (toDelete.findIndex((el) => { return el.x == (x + y) - i && el.y == y - i }) == -1) {
                                toDelete.push({ x: (x + y) - i, y: y - i })
                            }
                        }
                    }
                    count = 0
                }

            }
        }
        //from down to up
        for (let x = 0; x < Board.COLUMNS - (Board.DEL_COUNT - 1); x++) {
            let color = null
            let count = 0

            for (let y = 0; y < Math.min(Board.ROWS, Board.COLUMNS - x); y++) {
                color = Board.aTab[(Board.ROWS - 1) - y][x + y]
                if (Board.aTab[(Board.ROWS - 1) - y][x + y] != 0 && (color == null || Board.aTab[(Board.ROWS - 1) - y][x + y] == color)) {
                    count++
                } else {
                    count = 0
                }

                if (y + 1 >= Math.min(Board.ROWS, Board.COLUMNS) || Board.aTab[((Board.ROWS - 1) - y) - 1][x + y + 1] != color) {
                    if (count >= Board.DEL_COUNT) {
                        for (let i = 0; i < count; i++) {
                            if (toDelete.findIndex((el) => { return el.x == (x + y) - i && el.y == ((Board.ROWS - 1) - y) + i }) == -1) {
                                toDelete.push({ x: (x + y) - i, y: ((Board.ROWS - 1) - y) + i })
                            }
                        }
                    }
                    count = 0
                }

            }
        }
        // side up
        for (let y = Board.DEL_COUNT - 1; y < Board.ROWS; y++) {

            let color = null
            let count = 0
            for (let x = 0; x < Math.min(y + 1, Board.COLUMNS); x++) {
                color = Board.aTab[y - x][x]
                if (Board.aTab[y - x][x] != 0 && (color == null || Board.aTab[y - x][x] == color)) {
                    count++
                } else {
                    count = 0
                }

                if (x + 1 >= Math.min(Board.ROWS, Board.COLUMNS, y + 1) || Board.aTab[(y - x) - 1][x + 1] != color) {
                    if (count >= Board.DEL_COUNT) {
                        for (let i = 0; i < count; i++) {
                            if (toDelete.findIndex((el) => { return el.x == x - i && el.y == (y - x) + i }) == -1) {
                                toDelete.push({ x: x - i, y: (y - x) + i })
                            }
                        }
                    }
                    count = 0
                }

            }
        }

        //side down
        for (let y = 0; y < Board.ROWS - (Board.DEL_COUNT - 1); y++) {

            let color = null
            let count = 0
            for (let x = 0; x < Math.min(Board.ROWS - y, Board.COLUMNS); x++) {
                color = Board.aTab[y + x][x]
                if (Board.aTab[y + x][x] != 0 && (color == null || Board.aTab[y + x][x] == color)) {
                    count++
                } else {
                    count = 0
                }

                if (x + 1 >= Math.min(Board.ROWS, Board.COLUMNS, Board.ROWS - y) || Board.aTab[(y + x) + 1][x + 1] != color) {
                    if (count >= Board.DEL_COUNT) {
                        for (let i = 0; i < count; i++) {
                            if (toDelete.findIndex((el) => { return el.x == x - i && el.y == (y + x) - i }) == -1) {
                                toDelete.push({ x: x - i, y: (y + x) - i })
                            }
                        }
                    }
                    count = 0
                }

            }
        }


        //removal
        for (let i = 0; i < toDelete.length; i++) {

            Board.aTab[toDelete[i].y][toDelete[i].x] = 0

            let bubbleIndex = this.bubblesTab.findIndex((el) => { return el.position.x == toDelete[i].x && el.position.y == toDelete[i].y })
            let bubble = this.bubblesTab[bubbleIndex]
            bubble.remove()
            this.bubblesTab.splice(bubbleIndex, 1)

        }

        //add points
        this.points += toDelete.length
        document.getElementById("points").innerText = this.points.toString()

        //additional move after taking bubbles 
        if (toDelete.length > 0) {
            return false
        } else {
            return true
        }
    }

    rendere() {
        // clearBG
        for (let y = 0; y < Board.ROWS; y++) {
            for (let x = 0; x < Board.COLUMNS; x++) {
                document.getElementById(y + "_" + x).style.backgroundColor = ""
            }
        }
        //color path
        if (this.meta.x != null && this.meta.y != null) {
            this.bTab[this.meta.y][this.meta.x].forEach(element => {
                let div = document.getElementById(element)
                div.style.backgroundColor = "red"
            });
            if (this.bTab[this.meta.y][this.meta.x].length != 0)
                document.getElementById(this.meta.y + "_" + this.meta.x).style.backgroundColor = "red"
        }
        //clearTables
        for (let y = 0; y < Board.ROWS; y++) {
            for (let x = 0; x < Board.COLUMNS; x++) {
                if (Board.aTab[y][x] == "M") {
                    Board.aTab[y][x] = 0
                    this.bTab[y][x] = []
                } else if (Number.isInteger(Board.aTab[y][x])) {
                    Board.aTab[y][x] = 0
                    this.bTab[y][x] = []
                }
            }
        }
        // this.meta = { x: null, y: null }
    }

    addBubbles() {
        if (this.bubblesTab.length + Board.NEW_BALLS_COUNT >= Board.COLUMNS * Board.ROWS) {
            window.alert("Koniec gry! Twój wynik: " + this.points.toString())
            window.location.reload()
        } else {
            //randomize bubbles color (only for the first time)
            if (this.bubblesTab.length == 0 && this.points == 0) {
                this.nextBubblesColors = []
                for (let i = 0; i < Board.NEW_BALLS_COUNT; i++) {
                    let random = Math.floor(Math.random() * Board.BALLS_COLOR_TAB.length)
                    this.nextBubblesColors.push(Board.BALLS_COLOR_TAB[random])
                }
            }
            //randomize new bubbles
            for (let i = 0; i < Board.NEW_BALLS_COUNT; i++) {
                let position: Position
                let placeIsTaken: Boolean
                //checks if the draw positions are not repeated
                do {
                    placeIsTaken = false
                    position = { x: Math.floor(Math.random() * Board.COLUMNS), y: Math.floor(Math.random() * Board.ROWS) }
                    if (this.bubblesTab.findIndex((el) => { return el.position.x == position.x && el.position.y == position.y }) != -1) placeIsTaken = true
                } while (placeIsTaken)
                //create new bubble
                let color = this.nextBubblesColors[i]
                Board.aTab[position.y][position.x] = color
                this.bubblesTab.push(new Bubble(position, color, (bubble: Bubble) => this.clickedOnBubble(bubble)))
            }

            //randomize next bubbles color (to preview)
            this.nextBubblesColors = []
            for (let i = 0; i < Board.NEW_BALLS_COUNT; i++) {
                let random = Math.floor(Math.random() * Board.BALLS_COLOR_TAB.length)
                this.nextBubblesColors.push(Board.BALLS_COLOR_TAB[random])
            }

            //add colors to preview
            for (let i = 0; i < this.nextBubbles.length; i++) {
                this.nextBubbles[i].style.backgroundColor = this.nextBubblesColors[i]
            }
        }
    }

    clickedOnBubble(bubble: Bubble) {
        if (bubble.selected) {
            if (this.selectedBubble != null) this.selectedBubble.changeClick()
            this.selectedBubble = bubble
            this.status = 1
        } else {
            this.selectedBubble = null
            this.status = 0
        }
    }

    findShortestRoute(tab: Position[], count: number) {
        let noPath = true
        let nextTab = []

        for (let i = 0; i < tab.length; i++) {
            let el = tab[i]
            //left
            if (el.x - 1 >= 0) {
                if (Board.aTab[el.y][el.x - 1] == 0) {
                    Board.aTab[el.y][el.x - 1] = count
                    this.bTab[el.y][el.x - 1] = [...this.bTab[el.y][el.x], el.y + "_" + el.x]
                    nextTab.push({ x: el.x - 1, y: el.y })
                    noPath = false
                } else if (Board.aTab[el.y][el.x - 1] == "M") {
                    if (this.bTab[el.y][el.x - 1].length == 0) {
                        this.bTab[el.y][el.x - 1] = [...this.bTab[el.y][el.x], el.y + "_" + el.x]
                    }
                    this.status = 3
                }
            }
            //top
            if (el.y - 1 >= 0) {
                if (Board.aTab[el.y - 1][el.x] == 0) {
                    Board.aTab[el.y - 1][el.x] = count
                    this.bTab[el.y - 1][el.x] = [...this.bTab[el.y][el.x], el.y + "_" + el.x]
                    nextTab.push({ x: el.x, y: el.y - 1 })
                    noPath = false
                } else if (Board.aTab[el.y - 1][el.x] == "M") {
                    if (this.bTab[el.y - 1][el.x].length == 0) {
                        this.bTab[el.y - 1][el.x] = [...this.bTab[el.y][el.x], el.y + "_" + el.x]
                    }
                    this.status = 3
                }
            }
            //right
            if (el.x + 1 < Board.COLUMNS) {
                if (Board.aTab[el.y][el.x + 1] == 0) {
                    Board.aTab[el.y][el.x + 1] = count
                    this.bTab[el.y][el.x + 1] = [...this.bTab[el.y][el.x], el.y + "_" + el.x]
                    nextTab.push({ x: el.x + 1, y: el.y })
                    noPath = false
                } else if (Board.aTab[el.y][el.x + 1] == "M") {
                    if (this.bTab[el.y][el.x + 1].length == 0) {
                        this.bTab[el.y][el.x + 1] = [...this.bTab[el.y][el.x], el.y + "_" + el.x]
                    }
                    this.status = 3
                }
            }
            //down
            if (el.y + 1 < Board.ROWS) {
                if (Board.aTab[el.y + 1][el.x] == 0) {
                    Board.aTab[el.y + 1][el.x] = count
                    this.bTab[el.y + 1][el.x] = [...this.bTab[el.y][el.x], el.y + "_" + el.x]
                    nextTab.push({ x: el.x, y: el.y + 1 })
                    noPath = false
                } else if (Board.aTab[el.y + 1][el.x] == "M") {
                    if (this.bTab[el.y + 1][el.x].length == 0) {
                        this.bTab[el.y + 1][el.x] = [...this.bTab[el.y][el.x], el.y + "_" + el.x]
                    }
                    this.status = 3
                }
            }
        }
        if (this.status == 3) {

        } else if (noPath) {
            this.status = 4
        } else {
            this.findShortestRoute(nextTab, count + 1)
        }
    }
}