import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
    selector: 'areas-style',
    templateUrl: 'areas-style.dialog.html',
    styleUrls: ['areas-style.dialog.css']
  })
  export class AreasStyleDialog {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;

    constructor(
      public dialogRef: MatDialogRef<AreasStyleDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any) { 
        this.fillColor = data.fillColor;
        this.strokeColor = data.strokeColor;
        this.strokeWidth = data.strokeWidth;
      }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    onYesClick(): void {
      this.dialogRef.close({
        fillColor: this.fillColor,
        strokeColor: this.strokeColor,
        strokeWidth: this.strokeWidth
      });
    }
  }