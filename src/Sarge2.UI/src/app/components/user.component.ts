import { Component, OnInit, ViewChild } from "@angular/core";
import { MatButton } from '@angular/material';
import { AuthService } from '../services/auth.service';

@Component({
    selector: "my-user",
    templateUrl: "./user.component.html",
    styleUrls: ["./user.component.css"]
})
export class UserComponent implements OnInit {
    @ViewChild("loginButton") loginButton: MatButton;
    public get userName(): string {
        return this.auth.userName;
    }

    constructor(private auth: AuthService) {
    }
    login(): void {
        this.auth.login();
    }
    ngOnInit(): void {
    }

    loginButtonClick() {
        if (this.auth.loggedIn)
            this.logout();
        else
            this.login();
    }

    logout(): void {
        this.auth.logout();
    }

    get loggedIn() : boolean {
        return this.auth.loggedIn;
    }
}
