import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      console.log('AppComponent: ', params, params['id']);
    });
  }
}
