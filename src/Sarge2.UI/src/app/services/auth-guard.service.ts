import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate{

    constructor(private router: Router, private auth: AuthService){}

    canActivate(): boolean {
        return this.auth.loggedIn;
    }
}