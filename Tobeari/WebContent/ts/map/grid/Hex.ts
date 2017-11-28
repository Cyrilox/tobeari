/**
 * Hexagonal cell
 * Cube storage, cube constructor
 * Ranges from 0 to number of cells
 */
class Hex {
    static DIRECTIONS: Hex[] = [
        new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1),
        new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
    
    constructor(public x: number, public y: number, public z?: number) {
        if(z === undefined){
            z = -x - y;
            this.z = z;
        }
        assert(x + y + z == 0, "Hex invalid for x="+x+", y="+y+", z="+z);
    }
    
    //*** Equality ***
    
    /**
     * Return true if this Hex and the Hex in parameter are equal
     */
    public equal(b: Hex): boolean {
        return this.x == b.x && this.y == b.y && this.z == b.z;
    }

    //*** Coordinate arithmetic ***

    /**
     * Return a new Hex corresponding to the addition of this Hex and the Hex in parameter
     */
    public add(b: Hex): Hex {
        return new Hex(this.x + b.x, this.y + b.y, this.z + b.z);
    }

    /**
     * Return a new Hex corresponding to the substraction of this Hex and the Hex in parameter
     */
    public subtract(b: Hex): Hex {
        return new Hex(this.x - b.x, this.y - b.y, this.z - b.z);
    }

    /**
     * Return a new Hex corresponding to the multiplication of this Hex and the number in parameter
     */
    public multiply(k: number): Hex {
        return new Hex(this.x * k, this.y * k, this.z * k);
    }

    //*** Distance ***

    /**
     * Return the length of this Hex
     */
    public length(): number {
        return Math.floor((Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)) / 2);
    }

    /**
     * Return the distance between this Hex and the Hex in parameter
     */
    public distance(b: Hex): number {
        return this.subtract(b).length();
    }

    /**
     * Return the standard Hex direction corresponding to the direction number in parameter
     * @param {number} direction - The direction from 0 to 5 included
     */
    static direction(direction: number): Hex {
        assert(0 <= direction && direction < 6, "Hex direction should be between 0 and 5 included, actual is "+direction);
        return Hex.DIRECTIONS[direction];
    }

    /**
     * Return the addition of this Hex plus the standard Hex direction chosed with the direction number in parameter
     * @param {number} direction - The direction from 0 to 5 included
     * @return A new Hex
     */
    public neighbor(direction: number): Hex {
        return this.add(Hex.direction(direction));
    }

    /**
     * Return all the neighbors of this Hex, even out of bounds
     */
    public neighbors(): Hex[] {
        let neighbors: Hex[] = [];
        for(let direction=0; direction<Hex.DIRECTIONS.length; direction++)
            neighbors.push(this.neighbor(direction));
        return neighbors;
    }

    //*** Rounding ***

    /**
     * Round the values of this Hex
     */
    public round() {
        let x = Math.round(this.x);
        let y = Math.round(this.y);
        let z = Math.round(this.z);
        let x_diff = Math.abs(x - this.x);
        let y_diff = Math.abs(y - this.y);
        let z_diff = Math.abs(z - this.z);
        if (x_diff > y_diff && x_diff > z_diff)
            x = -y - z;
        else if (y_diff > z_diff)
            y = -x - z;
        else
            z = -x - y;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    //*** Selection ***

    /**
     * Return the Hexs around this Hex, AT a distance (circle)
     * @param {number} radius Must be >0
     */
    public getRing(radius: number): Hex[] {
        //Décalage vers le point de départ
        let hex: Hex = this;
        for(let shift=0; shift<radius; shift++)
            hex = hex.add(Hex.direction(4));

        //Trace le cercle
        let hexs: Hex[] = [];
        for(let i=0; i<6; i++){
            for(let j=0; j<radius; j++){
                hexs.push(hex);
                hex = hex.neighbor(i);
            }
        }
        return hexs;
    }

    /**
     * Return the Hexs around this Hex, TO a distance (disk)
     */
    public getDisk(fromRadius: number, radius: number): Hex[] {
        //Trace les cercles à toutes les distances
        let hexs: Hex[] = [];
        for(let i=fromRadius; i<=radius; i++)
            hexs = hexs.concat(this.getRing(i));
        return hexs;
    }
    
    //Show
    public toString(): string {
        return "[" + this.x + ", " + this.y + "]";
    }
}