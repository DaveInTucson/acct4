export class Region
{
    xLeft   : number;
    xRight  : number;
    yTop    : number;
    yBottom : number;

    constructor(xLeft : number, xRight : number, yTop: number, yBottom: number)
    {
        this.xLeft   = xLeft;
        this.xRight  = xRight;
        this.yTop    = yTop;
        this.yBottom = yBottom;
    }

    setXRange(xLeft: number, xRight: number) : void
    {
        this.xLeft = xLeft;
        this.xRight = xRight;
    }

    setYRange(yTop: number, yBottom: number) : void
    {
        this.yTop = yTop;
        this.yBottom = yBottom;
    }

    width() : number
    { return this.xRight - this.xLeft; }

    height() : number
    { return this.yBottom - this.yTop; }

    normalized2X(normalized: number) : number
    { return this.width() * normalized + this.xLeft; }

    normalized2Y(normalized: number) : number
    { return this.height() * normalized + this.yTop; }

    x2Normalized(x : number) : number
    { 
        if (this.width() === 0) return 0;
        return (x-this.xLeft)/this.width(); 
    }

    y2Normalized(y : number) : number
    {
        if (this.width() === 0) return 0;
        return (y-this.yTop)/this.height();
    }

    width2Normalized(width: number) : number
    {
        if (this.width() === 0) return 0;
        return width/this.width();
    }

    height2Normalized(height: number) : number
    {
        if (this.height() === 0) return 0;
        return height/this.height();
    }

    normalized2Height(normalized: number) : number {
        return normalized * this.height();
    }

    normalized2Width(normalized: number) : number {
        return normalized * this.width();
    }
}
