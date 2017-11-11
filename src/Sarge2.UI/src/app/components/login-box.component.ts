import { Component, Inject } from "@angular/core";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
    templateUrl: './login-box.component.html',
    styles: [ './login-box.component.css']    
})
export class LoginBoxComponent {
    constructor(
        public dialogRef: MatDialogRef<LoginBoxComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }
    
      onNoClick(): void {
        this.dialogRef.close();
      }

      onOkClick(): void {
          this.dialogRef.close({
              user: this.data.user,
              password: this.data.password
          })
      }
}