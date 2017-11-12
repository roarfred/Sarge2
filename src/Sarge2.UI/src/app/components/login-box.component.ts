import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    templateUrl: './login-box.component.html',
    styles: ['./login-box.component.css']
})
export class LoginBoxComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<LoginBoxComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        let temp = localStorage.getItem("login-box");
        if (temp)
            this.data = JSON.parse(temp);
    }
    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        if (this.data.rememberMe)
            localStorage.setItem("login-box", JSON.stringify(this.data));
        else
            localStorage.removeItem("login-box");

        this.dialogRef.close({
            user: this.data.user,
            password: this.data.password
        })
    }
}