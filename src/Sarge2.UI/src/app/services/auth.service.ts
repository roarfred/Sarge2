import { Injectable, Output } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class AuthService {

    private _userName: string = null;
    
    constructor(public fireBaseAuth: AngularFireAuth) {
        fireBaseAuth.authState.subscribe(auth => {
            if (auth)
                this._userName = auth.displayName;
            else
                this._userName = null;
        });
    }

    public get userName() : string {
        return this._userName;
    }
    get loggedIn(): boolean {
        return this.fireBaseAuth.auth.currentUser != null;
    }

    login(): void {
        this.fireBaseAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }

    logout(): void {
        this.fireBaseAuth.auth.signOut();
    }
}
