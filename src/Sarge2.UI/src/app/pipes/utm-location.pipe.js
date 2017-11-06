"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var UtmLocationPipe = (function () {
    function UtmLocationPipe() {
    }
    UtmLocationPipe.prototype.transform = function (value) {
        return this.pad(Math.floor(value), 7);
    };
    UtmLocationPipe.prototype.pad = function (value, digits) {
        var v = value.toString();
        while (v.length < digits)
            v = "0" + v;
        return v;
    };
    UtmLocationPipe = __decorate([
        core_1.Pipe({ name: 'utmLocation' })
    ], UtmLocationPipe);
    return UtmLocationPipe;
}());
exports.UtmLocationPipe = UtmLocationPipe;
//# sourceMappingURL=utm-location.pipe.js.map