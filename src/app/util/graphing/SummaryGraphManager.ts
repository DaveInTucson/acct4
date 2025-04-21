import { Region } from "./Region";

export class SummaryGraphManager {

    private context : CanvasRenderingContext2D;

    private graphRegion: Region = new Region(0, 1, 0, 1);
    private canvasRegion: Region = new Region(0, 1, 0, 1);

    constructor(
        private canvas: HTMLCanvasElement
    ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.context = canvas.getContext('2d')!;

        // the left margin should be the wide enough to display an integer balance plus a little extra
        // bottom margin should be tall enough to display a day number/month name/year number
        let leftMargin = 50;
        let topMargin = 5;
        let bottomMargin = 20;
        let rightMargin = 20;

        this.canvasRegion.setXRange(leftMargin, canvas.width - rightMargin);
        this.canvasRegion.setYRange(canvas.height - bottomMargin, topMargin);
    }

    setXRange(xLeft: number, xRight: number) : void
    { this.graphRegion.setXRange(xLeft, xRight); }

    setYRange(yLeft: number, yRight: number) : void
    { this.graphRegion.setYRange(yLeft, yRight); }

    drawNoData() {
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.font = "40px sans-serif";
        this.context.fillText("No data", this.canvas.width/2, this.canvas.height/2);
    }

    private graph2canvasX(graphX: number) : number 
    { return this.canvasRegion.normalized2X(this.graphRegion.x2Normalized(graphX)); }

    private graph2canvasY(graphY: number) : number
    { return this.canvasRegion.normalized2Y(this.graphRegion.y2Normalized(graphY)); }

    private canvas2graphX(canvasx: number) : number
    { return this.graphRegion.normalized2X(this.canvasRegion.x2Normalized(canvasx)); }

    private canvas2graphY(canvasy: number) : number
    { return this.graphRegion.normalized2Y(this.canvasRegion.y2Normalized(canvasy)); }

    private canvas2graphWidth(canvasW: number) : number
    { return this.graphRegion.normalized2Width(this.canvasRegion.width2Normalized(canvasW)); }

    canvas2graphHeight(canvasH: number) : number
    { return this.graphRegion.normalized2Height(this.canvasRegion.height2Normalized(canvasH)); }

    moveTo(graphX: number, graphY: number) : void
    { this.context.moveTo(this.graph2canvasX(graphX), this.graph2canvasY(graphY)); }

    lineTo(graphX: number, graphY: number) : void
    { this.context.lineTo(this.graph2canvasX(graphX), this.graph2canvasY(graphY)); }

    setTextAlign(textAlign: 'left'|'right'|'center'|'start'|'end') { this.context.textAlign = textAlign; }
    setTextBaseline(textBaseline: 'top'|'hanging'|'middle'|'alphabetic'|'ideographic'|'bottom')
    { this.context.textBaseline = textBaseline; }

    getTextWidth(text: string): number 
    { return this.canvas2graphWidth(this.context.measureText(text).width); }

    fillText(text: string, xPos: number, yPos: number): void
    { this.context.fillText(text, this.graph2canvasX(xPos), this.graph2canvasY(yPos)); }
    
    stroke(): void
    { this.context.stroke(); }

    beginPath(): void { this.context.beginPath(); }
    closePath(): void { this.context.closePath(); }

    getStrokeStyle(): string | CanvasGradient | CanvasPattern { return this.context.strokeStyle; }
    setStrokeStyle(style: string | CanvasGradient | CanvasPattern) { this.context.strokeStyle = style; }
}