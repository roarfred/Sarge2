import { Component, OnInit, ViewChild } from "@angular/core";
import { MatButton } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
    selector: "my-user",
    templateUrl: "./user.component.html",
    styleUrls: ["./user.component.css"]
})
export class UserComponent implements OnInit {
    @ViewChild("loginButton") loginButton: MatButton;

    constructor(public fireBaseAuth: AngularFireAuth) {
    }
    login(): void {
        this.fireBaseAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
    ngOnInit(): void {
    }

    loginButtonClick() {
        if (this.fireBaseAuth.auth.currentUser)
            this.logout();
        else
            this.login();
    }

    logout(): void {
        this.fireBaseAuth.auth.signOut();
    }
}
