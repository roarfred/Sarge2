"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var location_model_1 = require("../models/location.model");
var LocationComponent = (function () {
    function LocationComponent() {
        this.locationChange = new core_1.EventEmitter();
    }
    Object.defineProperty(LocationComponent.prototype, "location", {
        get: function () {
            return this._location;
        },
        set: function (location) {
            this._location = location;
            this.locationChange.emit(this._location);
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.Input(),
        __metadata("design:type", location_model_1.Location),
        __metadata("design:paramtypes", [location_model_1.Location])
    ], LocationComponent.prototype, "location", null);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], LocationComponent.prototype, "locationChange", void 0);
    LocationComponent = __decorate([
        core_1.Component({
            selector: 'my-location',
            templateUrl: './location.component.html',
            styleUrls: ['./location.component.css']
        })
    ], LocationComponent);
    return LocationComponent;
}());
exports.LocationComponent = LocationComponent;
//# sourceMappingURL=location.component.js.map