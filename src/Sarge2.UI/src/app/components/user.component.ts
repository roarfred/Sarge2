import { Component, OnInit, ViewChild } from "@angular/core";
import { KovaApiService } from "../services/kova-api.service";
import { MatButton, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LoginBoxComponent } from "./login-box.component";

@Component({
    selector: "my-user",
    templateUrl: "./user.component.html",
    styleUrls: ["./user.component.css"]
})
export class UserComponent implements OnInit {
    @ViewChild("loginButton") loginButton: MatButton;

    loggedIn: boolean = false;
    showLoginBox: boolean = false;
    name: string;

    constructor(private kovaApiService: KovaApiService, public dialog: MatDialog) {
        kovaApiService.authenticated.subscribe(() => {
            this.loggedIn = true;
            this.name = this.kovaApiService.name;
        });
    }
    login(): void {
        let dialogRef = this.dialog.open(LoginBoxComponent, {
            width: '250px',
            data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`The dialog was closed: ${result.user}`);
            if (result) {
                this.kovaApiService.authenticate(
                    result.user,
                    result.password
                );
            };
        });
    }
    ngOnInit(): void {
        this.loggedIn = this.kovaApiService.isAuthenticated;
    }

    loginButtonClick() {
        if (this.loggedIn)
            this.logout();
        else
            this.login();
    }

    logout(): void {
        this.kovaApiService.logout();
        this.loggedIn = false;
        this.name = "";
    }
}
