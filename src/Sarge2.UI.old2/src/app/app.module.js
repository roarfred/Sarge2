"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
// Angular Material
var animations_1 = require("@angular/platform-browser/animations");
var material_1 = require("@angular/material");
var app_component_1 = require("./app.component");
var map_component_1 = require("./components/map.component");
var location_component_1 = require("./components/location.component");
var utm_location_pipe_1 = require("./pipes/utm-location.pipe");
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                animations_1.BrowserAnimationsModule,
                material_1.MatButtonModule, material_1.MatCheckboxModule
            ],
            declarations: [
                app_component_1.AppComponent,
                map_component_1.MapComponent,
                location_component_1.LocationComponent,
                utm_location_pipe_1.UtmLocationPipe
            ],
            bootstrap: [app_component_1.AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map