// @ts-nocheck
// Recovered from index.js:305
let MD5;
class h {
    constructor() {
        this.hexcase = 0;
        this.b64pad = "";
    }
    static get Instance() {
        return null == this._instance && (this._instance = new h), this._instance;
    }
    hex_md5(t) {
        return this.rstr2hex(this.rstr_md5(this.str2rstr_utf8(t)));
    }
    b64_md5(t) {
        return this.rstr2b64(this.rstr_md5(this.str2rstr_utf8(t)));
    }
    any_md5(t, r) {
        return this.rstr2any(this.rstr_md5(this.str2rstr_utf8(t)), r);
    }
    hex_hmac_md5(t, r) {
        return this.rstr2hex(this.rstr_hmac_md5(this.str2rstr_utf8(t), this.str2rstr_utf8(r)));
    }
    b64_hmac_md5(t, r) {
        return this.rstr2b64(this.rstr_hmac_md5(this.str2rstr_utf8(t), this.str2rstr_utf8(r)));
    }
    any_hmac_md5(t, r, h) {
        return this.rstr2any(this.rstr_hmac_md5(this.str2rstr_utf8(t), this.str2rstr_utf8(r)), h);
    }
    rstr_md5(t) {
        return this.binl2rstr(this.binl_md5(this.rstr2binl(t), 8 * t.length));
    }
    rstr_hmac_md5(t, r) {
        var h = this.rstr2binl(t);
        h.length > 16 && (h = this.binl_md5(h, 8 * t.length));
        for (var s = Array(16), i = Array(16), d = 0; d < 16; d++) {
            s[d] = 909522486 ^ h[d];
            i[d] = 1549556828 ^ h[d];
        }
        var _ = this.binl_md5(s.concat(this.rstr2binl(r)), 512 + 8 * r.length);
        return this.binl2rstr(this.binl_md5(i.concat(_), 640));
    }
    rstr2hex(t) {
        try {
            this.hexcase;
        }
        catch (t) {
            this.hexcase = 0;
        }
        for (var r, h = this.hexcase ? "0123456789ABCDEF" : "0123456789abcdef", s = "", i = 0, d = t.length; i < d; i++) {
            r = t.charCodeAt(i);
            s += h.charAt(r >>> 4 & 15) + h.charAt(15 & r);
        }
        return s;
    }
    rstr2b64(t) {
        try {
            this.b64pad;
        }
        catch (t) {
            this.b64pad = "";
        }
        for (var r = "", h = t.length, s = 0; s < h; s += 3) {
            for (var i = t.charCodeAt(s) << 16 | (s + 1 < h ? t.charCodeAt(s + 1) << 8 : 0) | (s + 2 < h ? t.charCodeAt(s + 2) : 0), d = 0; d < 4; d++) {
                8 * s + 6 * d > 8 * t.length ? r += this.b64pad : r += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i >>> 6 * (3 - d) & 63);
            }
        }
        return r;
    }
    rstr2any(t, r) {
        var h, s, i, d, _, e = r.length, m = Array(Math.ceil(t.length / 2));
        for (let r = 0, h = m.length; r < h; r++) {
            m[r] = t.charCodeAt(2 * r) << 8 | t.charCodeAt(2 * r + 1);
        }
        var a = Math.ceil(8 * t.length / (Math.log(r.length) / Math.log(2))), n = Array(a);
        for (s = 0; s < a; s++) {
            _ = Array();
            d = 0;
            for (let t = 0, r = m.length; t < r; t++) {
                d = (d << 16) + m[t];
                d -= (i = Math.floor(d / e)) * e;
                (_.length > 0 || i > 0) && (_[_.length] = i);
            }
            n[s] = d;
            m = _;
        }
        var f = "";
        for (h = n.length - 1; h >= 0; h--) {
            f += r.charAt(n[h]);
        }
        return f;
    }
    str2rstr_utf8(t) {
        for (var r, h, s = "", i = -1; ++i < t.length;) {
            r = t.charCodeAt(i);
            h = i + 1 < t.length ? t.charCodeAt(i + 1) : 0;
            55296 <= r && r <= 56319 && 56320 <= h && h <= 57343 && (r = 65536 + ((1023 & r) << 10) + (1023 & h), i++);
            r <= 127 ? s += String.fromCharCode(r) : r <= 2047 ? s += String.fromCharCode(192 | r >>> 6 & 31, 128 | 63 & r) : r <= 65535 ? s += String.fromCharCode(224 | r >>> 12 & 15, 128 | r >>> 6 & 63, 128 | 63 & r) : r <= 2097151 && (s += String.fromCharCode(240 | r >>> 18 & 7, 128 | r >>> 12 & 63, 128 | r >>> 6 & 63, 128 | 63 & r));
        }
        return s;
    }
    str2rstr_utf16le(t) {
        for (var r = "", h = 0; h < t.length; h++) {
            r += String.fromCharCode(255 & t.charCodeAt(h), t.charCodeAt(h) >>> 8 & 255);
        }
        return r;
    }
    str2rstr_utf16be(t) {
        for (var r = "", h = 0; h < t.length; h++) {
            r += String.fromCharCode(t.charCodeAt(h) >>> 8 & 255, 255 & t.charCodeAt(h));
        }
        return r;
    }
    rstr2binl(t) {
        for (var r = Array(t.length >> 2), h = 0, s = r.length; h < s; h++) {
            r[h] = 0;
        }
        for (h = 0; h < 8 * t.length; h += 8) {
            r[h >> 5] |= (255 & t.charCodeAt(h / 8)) << h % 32;
        }
        return r;
    }
    binl2rstr(t) {
        for (var r = "", h = 0, s = t.length; h < 32 * s; h += 8) {
            r += String.fromCharCode(t[h >> 5] >>> h % 32 & 255);
        }
        return r;
    }
    binl_md5(t, r) {
        t[r >> 5] |= 128 << r % 32;
        t[14 + (r + 64 >>> 9 << 4)] = r;
        for (var h = 1732584193, s = -271733879, i = -1732584194, d = 271733878, _ = 0; _ < t.length; _ += 16) {
            var e = h, m = s, a = i, n = d;
            h = this.md5_ff(h, s, i, d, t[_ + 0], 7, -680876936);
            d = this.md5_ff(d, h, s, i, t[_ + 1], 12, -389564586);
            i = this.md5_ff(i, d, h, s, t[_ + 2], 17, 606105819);
            s = this.md5_ff(s, i, d, h, t[_ + 3], 22, -1044525330);
            h = this.md5_ff(h, s, i, d, t[_ + 4], 7, -176418897);
            d = this.md5_ff(d, h, s, i, t[_ + 5], 12, 1200080426);
            i = this.md5_ff(i, d, h, s, t[_ + 6], 17, -1473231341);
            s = this.md5_ff(s, i, d, h, t[_ + 7], 22, -45705983);
            h = this.md5_ff(h, s, i, d, t[_ + 8], 7, 1770035416);
            d = this.md5_ff(d, h, s, i, t[_ + 9], 12, -1958414417);
            i = this.md5_ff(i, d, h, s, t[_ + 10], 17, -42063);
            s = this.md5_ff(s, i, d, h, t[_ + 11], 22, -1990404162);
            h = this.md5_ff(h, s, i, d, t[_ + 12], 7, 1804603682);
            d = this.md5_ff(d, h, s, i, t[_ + 13], 12, -40341101);
            i = this.md5_ff(i, d, h, s, t[_ + 14], 17, -1502002290);
            s = this.md5_ff(s, i, d, h, t[_ + 15], 22, 1236535329);
            h = this.md5_gg(h, s, i, d, t[_ + 1], 5, -165796510);
            d = this.md5_gg(d, h, s, i, t[_ + 6], 9, -1069501632);
            i = this.md5_gg(i, d, h, s, t[_ + 11], 14, 643717713);
            s = this.md5_gg(s, i, d, h, t[_ + 0], 20, -373897302);
            h = this.md5_gg(h, s, i, d, t[_ + 5], 5, -701558691);
            d = this.md5_gg(d, h, s, i, t[_ + 10], 9, 38016083);
            i = this.md5_gg(i, d, h, s, t[_ + 15], 14, -660478335);
            s = this.md5_gg(s, i, d, h, t[_ + 4], 20, -405537848);
            h = this.md5_gg(h, s, i, d, t[_ + 9], 5, 568446438);
            d = this.md5_gg(d, h, s, i, t[_ + 14], 9, -1019803690);
            i = this.md5_gg(i, d, h, s, t[_ + 3], 14, -187363961);
            s = this.md5_gg(s, i, d, h, t[_ + 8], 20, 1163531501);
            h = this.md5_gg(h, s, i, d, t[_ + 13], 5, -1444681467);
            d = this.md5_gg(d, h, s, i, t[_ + 2], 9, -51403784);
            i = this.md5_gg(i, d, h, s, t[_ + 7], 14, 1735328473);
            s = this.md5_gg(s, i, d, h, t[_ + 12], 20, -1926607734);
            h = this.md5_hh(h, s, i, d, t[_ + 5], 4, -378558);
            d = this.md5_hh(d, h, s, i, t[_ + 8], 11, -2022574463);
            i = this.md5_hh(i, d, h, s, t[_ + 11], 16, 1839030562);
            s = this.md5_hh(s, i, d, h, t[_ + 14], 23, -35309556);
            h = this.md5_hh(h, s, i, d, t[_ + 1], 4, -1530992060);
            d = this.md5_hh(d, h, s, i, t[_ + 4], 11, 1272893353);
            i = this.md5_hh(i, d, h, s, t[_ + 7], 16, -155497632);
            s = this.md5_hh(s, i, d, h, t[_ + 10], 23, -1094730640);
            h = this.md5_hh(h, s, i, d, t[_ + 13], 4, 681279174);
            d = this.md5_hh(d, h, s, i, t[_ + 0], 11, -358537222);
            i = this.md5_hh(i, d, h, s, t[_ + 3], 16, -722521979);
            s = this.md5_hh(s, i, d, h, t[_ + 6], 23, 76029189);
            h = this.md5_hh(h, s, i, d, t[_ + 9], 4, -640364487);
            d = this.md5_hh(d, h, s, i, t[_ + 12], 11, -421815835);
            i = this.md5_hh(i, d, h, s, t[_ + 15], 16, 530742520);
            s = this.md5_hh(s, i, d, h, t[_ + 2], 23, -995338651);
            h = this.md5_ii(h, s, i, d, t[_ + 0], 6, -198630844);
            d = this.md5_ii(d, h, s, i, t[_ + 7], 10, 1126891415);
            i = this.md5_ii(i, d, h, s, t[_ + 14], 15, -1416354905);
            s = this.md5_ii(s, i, d, h, t[_ + 5], 21, -57434055);
            h = this.md5_ii(h, s, i, d, t[_ + 12], 6, 1700485571);
            d = this.md5_ii(d, h, s, i, t[_ + 3], 10, -1894986606);
            i = this.md5_ii(i, d, h, s, t[_ + 10], 15, -1051523);
            s = this.md5_ii(s, i, d, h, t[_ + 1], 21, -2054922799);
            h = this.md5_ii(h, s, i, d, t[_ + 8], 6, 1873313359);
            d = this.md5_ii(d, h, s, i, t[_ + 15], 10, -30611744);
            i = this.md5_ii(i, d, h, s, t[_ + 6], 15, -1560198380);
            s = this.md5_ii(s, i, d, h, t[_ + 13], 21, 1309151649);
            h = this.md5_ii(h, s, i, d, t[_ + 4], 6, -145523070);
            d = this.md5_ii(d, h, s, i, t[_ + 11], 10, -1120210379);
            i = this.md5_ii(i, d, h, s, t[_ + 2], 15, 718787259);
            s = this.md5_ii(s, i, d, h, t[_ + 9], 21, -343485551);
            h = this.safe_add(h, e);
            s = this.safe_add(s, m);
            i = this.safe_add(i, a);
            d = this.safe_add(d, n);
        }
        return [h, s, i, d];
    }
    md5_cmn(t, r, h, s, i, d) {
        return this.safe_add(this.bit_rol(this.safe_add(this.safe_add(r, t), this.safe_add(s, d)), i), h);
    }
    md5_ff(t, r, h, s, i, d, _) {
        return this.md5_cmn(r & h | ~r & s, t, r, i, d, _);
    }
    md5_gg(t, r, h, s, i, d, _) {
        return this.md5_cmn(r & s | h & ~s, t, r, i, d, _);
    }
    md5_hh(t, r, h, s, i, d, _) {
        return this.md5_cmn(r ^ h ^ s, t, r, i, d, _);
    }
    md5_ii(t, r, h, s, i, d, _) {
        return this.md5_cmn(h ^ (r | ~s), t, r, i, d, _);
    }
    safe_add(t, r) {
        var h = (65535 & t) + (65535 & r);
        return (t >> 16) + (r >> 16) + (h >> 16) << 16 | 65535 & h;
    }
    bit_rol(t, r) {
        return t << r | t >>> 32 - r;
    }
}
(MD5 = h);
(h._instance = undefined);
export default MD5;
