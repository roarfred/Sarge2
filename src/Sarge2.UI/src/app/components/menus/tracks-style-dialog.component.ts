import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  templateUrl: 'tracks-style-dialog.component.html',
  styleUrls: ['tracks-style-dialog.component.css']
})
export class TracksStyleDialogComponent {
  strokeColor: string;
  strokeWidth: number;

  constructor(
    public dialogRef: MatDialogRef<TracksStyleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.strokeColor = data.strokeColor;
    this.strokeWidth = data.strokeWidth;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close({
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth
    });
  }
}
