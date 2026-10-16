/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * GridKit for Cocos Creator (TypeScript)
 ****************************************************************************/

import { LogKit } from "../logKit/LogKit";

// #region EasyGrid

export class EasyGrid<T> {

    private mGrid: T[][] = [];
    private mWidth: number;
    private mHeight: number;

    public get Width(): number {
        return this.mWidth;
    }

    public get Height(): number {
        return this.mHeight;
    }

    public constructor(width: number, height: number) {
        this.mWidth = width;
        this.mHeight = height;
        this.mGrid = [];
        for (let x = 0; x < width; x++) {
            this.mGrid[x] = [];
            for (let y = 0; y < height; y++) {
                this.mGrid[x][y] = null;
            }
        }
    }

    public Fill(value: T): void;
    public Fill(onFill: (x: number, y: number) => T): void;
    public Fill(valueOrOnFill: T | ((x: number, y: number) => T)): void {
        for (let x = 0; x < this.mWidth; x++) {
            for (let y = 0; y < this.mHeight; y++) {
                if (typeof valueOrOnFill === "function") {
                    this.mGrid[x][y] = (valueOrOnFill as (x: number, y: number) => T)(x, y);
                } else {
                    this.mGrid[x][y] = valueOrOnFill as T;
                }
            }
        }
    }

    public Resize(width: number, height: number, onAdd: (x: number, y: number) => T): void {
        const newGrid: T[][] = [];
        for (let x = 0; x < width; x++) {
            newGrid[x] = [];
            for (let y = 0; y < height; y++) {
                newGrid[x][y] = null;
            }
        }
        for (let x = 0; x < this.mWidth; x++) {
            for (let y = 0; y < this.mHeight; y++) {
                newGrid[x][y] = this.mGrid[x][y];
            }
            for (let y = this.mHeight; y < height; y++) {
                newGrid[x][y] = onAdd(x, y);
            }
        }
        for (let x = this.mWidth; x < width; x++) {
            for (let y = 0; y < height; y++) {
                newGrid[x][y] = onAdd(x, y);
            }
        }
        this.Fill(null as T);
        this.mWidth = width;
        this.mHeight = height;
        this.mGrid = newGrid;
    }

    public ForEach(each: (x: number, y: number, content: T) => void): void;
    public ForEach(each: (content: T) => void): void;
    public ForEach(each: ((x: number, y: number, content: T) => void) | ((content: T) => void)): void {
        for (let x = 0; x < this.mWidth; x++) {
            for (let y = 0; y < this.mHeight; y++) {
                if (each.length >= 3) {
                    (each as (x: number, y: number, content: T) => void)(x, y, this.mGrid[x][y]);
                } else {
                    (each as (content: T) => void)(this.mGrid[x][y]);
                }
            }
        }
    }

    public getCell(xIndex: number, yIndex: number): T {
        return this.Get(xIndex, yIndex);
    }

    public setCell(xIndex: number, yIndex: number, value: T): void {
        this.Set(xIndex, yIndex, value);
    }

    /** C# indexer `grid[x, y]` getter */
    public Get(xIndex: number, yIndex: number): T {
        if (xIndex >= 0 && xIndex < this.mWidth && yIndex >= 0 && yIndex < this.mHeight) {
            return this.mGrid[xIndex][yIndex];
        }
        LogKit.W(`out of bounds [${xIndex}:${yIndex}] in grid[${this.mWidth}:${this.mHeight}]`);
        return null;
    }

    /** C# indexer `grid[x, y]` setter */
    public Set(xIndex: number, yIndex: number, value: T): void {
        if (xIndex >= 0 && xIndex < this.mWidth && yIndex >= 0 && yIndex < this.mHeight) {
            this.mGrid[xIndex][yIndex] = value;
        } else {
            LogKit.W(`out of bounds [${xIndex}:${yIndex}] in grid[${this.mWidth}:${this.mHeight}]`);
        }
    }

    public Clear(cleanupItem?: (item: T) => void): void {
        for (let x = 0; x < this.mWidth; x++) {
            for (let y = 0; y < this.mHeight; y++) {
                if (cleanupItem) {
                    cleanupItem(this.mGrid[x][y]);
                }
                this.mGrid[x][y] = null;
            }
        }
        this.mGrid = null;
    }
}

// #endregion

// #region DynaGrid

function gridKey(x: number, y: number): string {
    return x + "," + y;
}

export class DynaGrid<T> {

    private mGrid: Map<string, T> = new Map();

    public ForEach(each: (x: number, y: number, data: T) => void): void;
    public ForEach(each: (data: T) => void): void;
    public ForEach(each: ((x: number, y: number, data: T) => void) | ((data: T) => void)): void {
        this.mGrid.forEach((value, key) => {
            const parts = key.split(",");
            const x = Number(parts[0]);
            const y = Number(parts[1]);
            if (each.length >= 3) {
                (each as (x: number, y: number, data: T) => void)(x, y, value);
            } else {
                (each as (data: T) => void)(value);
            }
        });
    }

    public getCell(xIndex: number, yIndex: number): T {
        return this.mGrid.get(gridKey(xIndex, yIndex));
    }

    public setCell(xIndex: number, yIndex: number, value: T): void {
        this.mGrid.set(gridKey(xIndex, yIndex), value);
    }

    public Clear(cleanupItem?: (item: T) => void): void {
        if (cleanupItem) {
            this.mGrid.forEach((v) => cleanupItem(v));
        }
        this.mGrid.clear();
    }
}

// #endregion
