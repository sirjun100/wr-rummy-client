
/*************************************************************
* 扩展库函数
* 要保证本脚本在其它脚本之前调用(最简单方法:放在脚本文件夹第一层,并保证文件名排序在第一位)
* 否则其它地方可能已经用到这里的扩展功能,但是扩展功能却还没加载
*************************************************************/

import { _decorator } from 'cc';


/**构造随机数生成器(相同的随机数种子的随机数结果一定相同) */
Math.randomGener = function (seed: number) {
    let _seed = (typeof seed == "number") ? seed : Math.random();

    /**获取当前随机种子 */
    function getSeed() {
        return _seed;
    }

    /**计算下个随机数种子 */
    function getNextSeed(seed: number) {
        return (seed * 9301 + 49297) % 233280;
    }

    /**重置随机数种子 */
    function resetSeed(num: number) {
        _seed = num;
        return this;
    }

    /**设置已随机次数(次数越多,耗时越久) */
    function setRandomTimes(times: number) {
        let i = 0;
        while (i < times) {
            _seed = getNextSeed(_seed);
        }
        return this;
    }

    /**生成 [min, max) 小数 */
    function rand(min: number, max: number) {
        min = (typeof min == "number") ? min : 0;
        max = (typeof max == "number") ? max : 1;
        _seed = getNextSeed(_seed);
        var rnd = _seed / 233280.0;
        return min + rnd * (max - min);
    }

    /**生成 [min, max] 整数 */
    function randInt(min: number, max: number) {
        let n = rand(min, max);
        let _min = (typeof min == "number") ? min : 0;
        let _max = (typeof max == "number") ? max : 1;
        if (_min > _max) {
            _min = max;
            _max = min;
        }
        if (n < _min) {
            return _min;
        }
        if (n > _max) {
            return _max;
        }
        return Math.round(n);
    }

    return {
        getSeed: getSeed,
        getNextSeed: getNextSeed,
        setRandomTimes: setRandomTimes,
        resetSeed: resetSeed,
        rand: rand,
        randInt: randInt
    }
}

/**将小数放大成整数 */
Math.scaleToInteger = function (value: number | string): { integer: number, scale: number } {
    let s = value + "";
    let array1 = s.split("e");
    let point1 = Math.abs(Number(array1[1] || 0));
    let array2 = array1[0].split(".");
    let point2 = array2[1]?.length || 0;
    let scale = Math.pow(10, point1 + point2);
    let _s = array1[0].replace(".", "");
    let num = Number(_s);

    return {
        integer: num,
        scale: scale
    };
}

function numAdd(a: number, b: number) {
    let str_a = a + "";
    let str_b = b + "";
    let array_a = str_a.split(".");
    let array_b = str_b.split(".");

    if ((array_a.length > 1) || (array_b.length > 1)) { // 只有整数和整数操作才没有精度问题
        let len_a = array_a[1]?.length || 0;
        let len_b = array_b[1]?.length || 0;

        let point = Math.max(len_a, len_b);
        let scale = Math.pow(10, point);

        let a_head = Math.abs(Number(array_a[0])) * scale;
        let a_tail = (len_a > 0) ? (Number(array_a[1]) * Math.pow(10, point - len_a)) : 0;

        let b_head = Math.abs(Number(array_b[0])) * scale;
        let b_tail = (len_b > 0) ? (Number(array_b[1]) * Math.pow(10, point - len_b)) : 0;

        let _a = (a_head + a_tail) * ((a < 0) ? -1 : 1);
        let _b = (b_head + b_tail) * ((b < 0) ? -1 : 1);

        let n = _a + _b;
        let m = n / scale;
        return m;
    }

    return a + b;
}

/**两数相加(无论整数、小数、正负):解决小数之间相加的精度问题 */
Math.add = function (a: number, b: number) {
    if (typeof a != "number") {
        return (typeof b == "number") ? b : 0;
    } else if (typeof b != "number") {
        return a;
    }

    return numAdd(a, b);
}

/**两数相减(无论整数、小数、正负):解决小数之间相减的精度问题 */
Math.sub = function (a: number, b: number) {
    if (typeof a != "number") {
        return (typeof b == "number") ? b : 0;
    } else if (typeof b != "number") {
        return a;
    }

    return numAdd(a, -b);
}

/**两数相乘(无论整数、小数、正负):解决小数之间相乘的精度问题 */
Math.multiply = function (a: number, b: number) {
    let _a = Math.scaleToInteger(a);
    let _b = Math.scaleToInteger(b);
    let n = _a.integer * _b.integer;
    let scale = _a.scale * _b.scale;
    return n / scale;
}

/**判断两个对象是否相似(即:key、value都一致) */
Object.isTwins = function (a: any, b: any) {
    if (a == b) {
        return true;
    }

    if (typeof a != typeof b) {
        return false;
    }

    if (typeof a != "object") {
        return false;
    }

    if ((a == null) || (b == null)) {
        return false;
    }

    let keys_a = Object.keys(a);
    let keys_b = Object.keys(b);

    if (keys_a.length != keys_b.length) {
        return false;
    }

    for (let i = 0; i < keys_a.length; ++i) {
        let key = keys_a[i];
        if (!Object.isTwins(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

/**
 * 多个 Promise 同时执行,有一个 resolve 或 resolve 则立即返回
 * @param values Promise 数组
 * @returns 首先 resolve 或 reject 的值
 */
function PromiseRace<T extends readonly Promise<any>[] | []>(values: T): Promise<Awaited<T[number]>> {
    return new Promise(function (resolve, reject) {
        let _resolve = function (v) {
            if (resolve) {
                resolve(v);
                resolve = null;
                reject = null;
            }
        };
        let _reject = function (v) {
            if (reject) {
                reject(v);
                resolve = null;
                reject = null;
            }
        };
        for (let i = 0; i < values.length; i++) {
            values[i].then(_resolve, _reject);
        }
    });
}

Promise.raceEx = PromiseRace;


function ArrayFirstElem() {
    if (this.length > 0) {
        return this[0];
    }
}

function ArrayMidElem() {
    if (this.length > 0) {
        return this[Math.floor(this.length / 2)];
    }
}

function ArrayLastElem() {
    if (this.length > 0) {
        return this[this.length - 1];
    }
}

function ArrayRandomElem() {
    if (this.length > 0) {
        let idx = Math.floor(Math.random() * this.length);
        return this[idx];
    }
}

function ArrayIsEmpty() {
    return 0 == this.length;
}

function ArraySortPart(fromIdx: number, toIdx: number, compare: (a: any, b: any) => number) {
    fromIdx = Math.max(fromIdx, 0);
    toIdx = Math.min(toIdx, this.length - 1);
    if (toIdx > fromIdx) {
        let n = toIdx - fromIdx + 1;
        let array = this.slice(fromIdx, toIdx + 1) as Array<any>;
        array.sort(compare);
        for (let i = 0; i < n; ++i) {
            this[fromIdx + i] = array[i];
        }
        array.length = 0;
    }
}

function ArrayAppend(data: any | any[], repeat?: number) {
    let n = (typeof repeat == "number") ? repeat : 1;
    if (data instanceof Array) {
        for (let i = 0; i < n; ++i) {
            this.push(...data);
        }
    } else {
        for (let i = 0; i < n; ++i) {
            this.push(data);
        }
    }
    return this.length;
}

function ArraySortInsert(rawData: any | any[], compare: (a: any, b: any) => number, duplicate: (a: any, b: any) => boolean) {
    let array = Array.isArray(rawData) ? rawData : [rawData];
    let len = array.length;
    let c = 0;

    for (let i = 0; i < len; ++i) {
        let data = array[i];
        let left = 0;
        let right = this.length - 1;
        let idx = 0;
        let isDiscard = false;

        while (left <= right) {
            if (duplicate?.(data, this[left])) {
                isDiscard = true;
                break;
            }

            if (compare(data, this[left]) < 0) {
                idx = left;
                break;
            }

            if (duplicate?.(data, this[right])) {
                isDiscard = true;
                break;
            }

            if (compare(data, this[right]) >= 0) {
                idx = right + 1;
                break;
            }

            idx = Math.floor((right + left) / 2);

            if (duplicate?.(data, this[idx])) {
                isDiscard = true;
                break;
            }

            if (compare(data, this[idx]) < 0) {
                right = idx - 1;
                left++;
            } else {
                left = idx + 1;
                right--;
            }

            if (right + 1 == left) {
                idx = left;
            }
        }

        if (!isDiscard) {
            ++c;
            this.splice(idx, 0, data);
        }
    }

    return c;
}

function ArrayFindSuitNewIndex(data: any, compare: (a: any, b: any) => number) {
    let left = 0;
    let right = this.length - 1;
    let idx = 0;

    while (left <= right) {
        if (compare(data, this[left]) < 0) {
            idx = left;
            break;
        }

        if (compare(data, this[right]) >= 0) {
            idx = right + 1;
            break;
        }

        idx = Math.floor((right + left) / 2);

        if (compare(data, this[idx]) < 0) {
            right = idx - 1;
            left++;
        } else {
            left = idx + 1;
            right--;
        }

        if (right + 1 == left) {
            idx = left;
        }
    }

    return idx;
}


function ArrayFindIndexHalfSearch(data: any, compare: (a: any, b: any, indexOfb: number) => number) {
    let idx = -1;
    let left = 0;
    let right = this.length;

    while (left < right) {
        let _idx = Math.floor((right + left) / 2);
        let ret = compare(data, this[_idx], _idx);
        if (ret == 0) {
            idx = _idx;
            break;
        } else if (ret < 0) {
            right = _idx;
        } else {
            left = _idx + 1;
        }
    }

    return idx;
}

function ArrayCopyTo(array?: any[], fromIdx?: number, num?: number, isDesc?: boolean) {
    if (!array) {
        array = [];
    }

    do {
        if (this.length <= 0) { break; }
        if (typeof num == "number") {
            if (num <= 0) { break; }
        } else {
            num = this.length;
        }

        if (isDesc) { //倒序复制(从后往前复制)
            fromIdx = (typeof fromIdx == "number") ? fromIdx : this.length - 1;
            if (fromIdx < 0) { break; }
            let idxFrom = Math.min(fromIdx, this.length - 1);
            let idxTo = Math.max(0, fromIdx + 1 - num);
            let n = idxFrom - idxTo + 1;
            if (n > 0) {
                array.length = n;
                let c = 0;
                while (idxFrom >= idxTo) {
                    array[c++] = this[idxFrom--];
                }
            }

        } else { // 从前往后复制
            fromIdx = (typeof fromIdx == "number") ? fromIdx : 0;
            if (fromIdx >= this.length) { break; }
            let idxFrom = Math.max(fromIdx, 0);
            let idxTo = Math.min(fromIdx + num, this.length) - 1;
            let n = idxTo - idxFrom + 1;
            if (n > 0) {
                array.length = n;
                let c = 0;
                while (idxFrom <= idxTo) {
                    array[c++] = this[idxFrom++];
                }
            }
        }
    } while (false);

    return array;
}

function ArrayCopyFrom(array: any[], fromIdx?: number, num?: number, isDesc?: boolean) {
    array.copyTo(this, fromIdx, num, isDesc);
}

function ArrayReverseCopy(fromIdx?: number, num?: number) {
    return ArrayCopyTo.call(this, null, fromIdx, num, true);
}

function ArrayFindIndexReverse(predicate: (value: any, index: number) => boolean) {
    for (let i = this.length - 1; i >= 0; --i) {
        if (predicate(this[i], i)) {
            return i;
        }
    }
}

function ArrayFindReverse(predicate: (value: any, index: number) => boolean) {
    for (let i = this.length - 1; i >= 0; --i) {
        if (predicate(this[i], i)) {
            return this[i];
        }
    }
}

function ArrayRemove(data: any, num?: number) {
    let n = ((typeof num == "number") && (num > 0)) ? num : Infinity;
    let len = this.length;
    let c = 0;

    for (let i = 0, idx = 0; i < len; ++i) {
        if ((c < n) && (this[i] == data)) {
            ++c;
            continue;
        }

        if (i != idx) {
            this[idx] = this[i];
        }
        ++idx;
    }

    this.length -= c;
    return c;
}

function ArrayLastIdx() {
    return this.length - 1;
}

function ArrayClear() {
    this.length = 0;
}

function ArrayPick(predicate: (value: any, index: number, array: any[]) => boolean): any[] {
    let ret = [];
    let emptyIdx = -1;

    for (let i = 0; i < this.length; ++i) {
        if (predicate(this[i], i, this)) {
            ret.push(this[i]);
            if (-1 == emptyIdx) {
                emptyIdx = i;
            }
        } else if (-1 != emptyIdx) {
            this[emptyIdx] = this[i];
            emptyIdx++;
        }
    }

    this.length -= ret.length;
    return ret;
}

function ArrayGroup(num: number): any[][] {
    let ret = [];
    if (num > 0) {
        for (let i = 0; i < this.length; i += num) {
            ret.push(this.slice(i, i + num));
        }
    }
    return ret;
}

function ArrayShuffle(randomGener?: { randInt: (min: number, max: number) => number }) {
    if (!randomGener) {
        randomGener = {
            randInt: function (min: number, max: number) {
                let n = Math.random();
                let m = max - min + 1;
                return min + Math.floor(m * n); // 范围 [min, max]
            }
        }
    }

    for (let i = this.length - 1; i > -1; --i) {
        let idx = randomGener.randInt(0, i);
        let temp = this[idx];
        this[idx] = this[i];
        this[i] = temp;
    }

    return this;
}

function ArrayDeduplication() {
    if (this.length > 1) {
        let set = new Set;
        let n = 0;
        set.add(this[0]);

        for (let i = 1; i < this.length; ++i) {
            let data = this[i];
            if (set.has(data)) {
                ++n;
            } else {
                set.add(data);
                if (n > 0) {
                    this[i - n] = data;
                }
            }
        }

        set.clear();
        this.length -= n;
    }

    return this;
}

function ArrayFindData(data: any) {
    const type = typeof data;
    let ret = undefined;
    if (type == "number" || type == "string" || type == "object") {
        if (type == "object") {
            ret = this.find((v: Object) => {
                let isMatch = true;
                for (const key in data as Object) {
                    if (v[key] != data[key]) {
                        isMatch = false;
                    }
                }

                return isMatch;
            });
        } else {
            ret = this.find((v: number | string) => v == data);
        }

        return ret;
    } else {
        console.warn("查找失败，请传入指定类型数据！");
    }

    return ret;
}

function ArrayFindDataIndex(data: any) {
    const type = typeof data;
    let index = -1;
    if (type == "number" || type == "string" || type == "object") {
        if (type == "object") {
            index = this.findIndex((v: Object) => {
                let isMatch = true;
                for (const key in data as Object) {
                    if (v[key] != data[key]) {
                        isMatch = false;
                    }
                }

                return isMatch;
            });
        } else {
            index = this.findIndex((v: number | string) => v == data);
        }

        return index;
    } else {
        console.warn("查找失败，请传入指定类型数据！");
    }

    return index;
}


// 不要用 Array.prototype.xx = function(){ } 添加方法, 因为会被 for (let k in []) 遍历到所添加方法 

let isHas = Object.getOwnPropertyDescriptor(Array.prototype, "firstElem");
if (!isHas) {
    Object.defineProperties(Array.prototype, {
        firstElem: {
            get: function () {
                return ArrayFirstElem.bind(this);
            },
            enumerable: false
        },
        midElem: {
            get: function () {
                return ArrayMidElem.bind(this);
            },
            enumerable: false
        },
        lastElem: {
            get: function () {
                return ArrayLastElem.bind(this);
            },
            enumerable: false
        },
        randomElem: {
            get: function () {
                return ArrayRandomElem.bind(this);
            },
            enumerable: false
        },
        isEmpty: {
            get: function () {
                return ArrayIsEmpty.bind(this);
            },
            enumerable: false
        },
        sortPart: {
            get: function () {
                return ArraySortPart.bind(this);
            },
            enumerable: false
        },
        append: {
            get: function () {
                return ArrayAppend.bind(this);
            },
            enumerable: false
        },
        sortInsert: {
            get: function () {
                return ArraySortInsert.bind(this);
            },
            enumerable: false
        },
        findIndexReverse: {
            get: function () {
                return ArrayFindIndexReverse.bind(this);
            },
            enumerable: false
        },
        findReverse: {
            get: function () {
                return ArrayFindReverse.bind(this);
            },
            enumerable: false
        },
        findSuitNewIndex: {
            get: function () {
                return ArrayFindSuitNewIndex.bind(this);
            }
        },
        findIndexHalfSearch: {
            get: function () {
                return ArrayFindIndexHalfSearch.bind(this);
            },
            enumerable: false
        },
        reverseCopy: {
            get: function () {
                return ArrayReverseCopy.bind(this);
            },
            enumerable: false
        },
        copyTo: {
            get: function () {
                return ArrayCopyTo.bind(this);
            },
            enumerable: false
        },
        copyFrom: {
            get: function () {
                return ArrayCopyFrom.bind(this);
            },
            enumerable: false
        },
        remove: {
            get: function () {
                return ArrayRemove.bind(this);
            },
            enumerable: false
        },
        lastIdx: {
            get: function () {
                return ArrayLastIdx.call(this);
            },
            enumerable: false
        },
        clear: {
            get: function () {
                return ArrayClear.bind(this);
            },
            enumerable: false
        },
        pick: {
            get: function () {
                return ArrayPick.bind(this);
            },
            enumerable: false
        },
        group: {
            get: function () {
                return ArrayGroup.bind(this);
            },
            enumerable: false
        },
        shuffle: {
            get: function () {
                return ArrayShuffle.bind(this);
            },
            enumerable: false
        },
        deduplication: {
            get: function () {
                return ArrayDeduplication.bind(this);
            },
            enumerable: false
        },
        findData: {
            get: function () {
                return ArrayFindData.bind(this);
            },
            enumerable: false
        },
        findDataIndex: {
            get: function () {
                return ArrayFindDataIndex.bind(this);
            },
            enumerable: false
        }
    });
}


declare global {
    var AllCCClassName: Record<string, boolean>;
}

type CcclassDecorator = typeof _decorator.ccclass;
const oldCcclass: CcclassDecorator = _decorator.ccclass;

globalThis.AllCCClassName = {};

function recordCcClassName(ret: { name?: string } | undefined, constructor?: Function) {
    const className = ret?.name ?? constructor?.name;
    if (className) {
        globalThis.AllCCClassName[className] = true;
    }
}

const ccclassWithRegistry = function ccclassWithRegistry(nameOrConstructor?: string | Function): any {
    if (typeof nameOrConstructor === 'function') {
        const ret = oldCcclass(nameOrConstructor);
        recordCcClassName(ret as { name?: string }, nameOrConstructor);
        return ret;
    }
    const decorator = oldCcclass(nameOrConstructor);
    return function (constructor: Function) {
        const ret = decorator(constructor);
        recordCcClassName(ret as { name?: string }, constructor);
        return ret;
    };
} as CcclassDecorator;

(_decorator as { ccclass: CcclassDecorator }).ccclass = ccclassWithRegistry;
