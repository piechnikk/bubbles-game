export interface Position {
    x: number;
    y: number;
}

export interface IBubble {
    position: Position;
    color: string;
    div: HTMLDivElement;
    clickedOnBubble: Function;
    selected: Boolean;
    create: () => void;
    click: () => void;
    changeClick: () => void;
    move: (meta: Position) => void;
}

export interface StringList extends Array<string> {
    [index: number]: string
}
