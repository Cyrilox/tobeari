/**
 * Tools for Hexagonal Grid
 */
class GridTools {

    //*** Coordinate conversion ***

    /**
     * Return the screen position of a Hex cell
     */
    static hexToPixel(layout: Layout, h: Hex): Phaser.Point {
        let M = layout.orientation;
        let x = (M.f0 * h.x + M.f1 * h.y) * layout.size.x;
        let y = (M.f2 * h.x + M.f3 * h.y) * layout.size.y;
        return new Phaser.Point(x + layout.origin.x, y + layout.origin.y);
    }

    /**
     * Return the Hex position of a screen Phaser.Point
     */
    static pixelToHex(layout: Layout, p: Phaser.Point): Hex {
        let M = layout.orientation;
        let pt = new Point((p.x - layout.origin.x) / layout.size.x,
                        (p.y - layout.origin.y) / layout.size.y);
        let x = M.b0 * pt.x + M.b1 * pt.y;
        let y = M.b2 * pt.x + M.b3 * pt.y;
        let hex = new Hex(x, y, -x - y);
        hex.round();
        return hex;
    }

    //*** Line drawing ***

    /**
     * Interpolation of 3 values
     */
    static lerpValues(a: number, b: number, t: number): number {
        return a * (1-t) + b * t;
    }

    /**
     * Interpolation of an Hex
     */
    static lerpHex(a: Hex, b: Hex, t: number): Hex {
        return new Hex(GridTools.lerpValues(a.x, b.x, t),
                        GridTools.lerpValues(a.y, b.y, t),
                         GridTools.lerpValues(a.z, b.z, t));
    }

    /**
     * Line drawing between two Hex
     */
    static lineDraw(a: Hex, b: Hex): Hex[] {
        let N = a.distance(b);
        let results: Hex[] = [];
        let step = 1 / Math.max(N, 1);
        for(let i = 0; i <= N; i++)
            results.push(GridTools.lerpHex(a, b, step * i));
        return results;
    }
}