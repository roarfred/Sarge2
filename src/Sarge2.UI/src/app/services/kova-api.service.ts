import 'rxjs/add/operator/toPromise';
import { environment } from '../../environments/environment';

import { Injectable, EventEmitter } from '@angular/core';
import { Headers, Http, ResponseContentType } from '@angular/http';


@Injectable()
export class KovaApiService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private baseUrl = environment.kovaApiUrl;

    public isAuthenticated = false;
    private authentication: any;
    public authenticated = new EventEmitter();

    public get name(): string {
        if (this.isAuthenticated && this.authentication)
            return this.authentication.user.name;
        else
            return null;
    }

    constructor(private http: Http) {
        console.log("Initializing kova service");
        var json = localStorage.getItem("authentication");
        if (json) {
            console.log("Found stored auth");
            var auth = JSON.parse(json);
            var userRef = auth.user.personRef;
            var headers = new Headers({ 'Authorization': `Bearer ${auth.access_token}` });
            this.http.get(`${this.baseUrl}/api/person/${userRef}`, { headers: headers })
                .toPromise()
                .then(result => {
                    console.log("Stored auth tested");
                    this.isAuthenticated = true;
                    this.authentication = auth;
                    this.authenticated.emit(auth);
                });
        }
    }

    logout(): void {
        this.isAuthenticated = false;
        this.authentication = null;
        localStorage.removeItem("authentication");
    }

    authenticate(user: string, password: string) {
        let body = "username=" + user + "&password=" + password;
        return this.http
            .post(`${this.baseUrl}/api/token`,
            body,
            {
                headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' })
            })
            .toPromise()
            .then((result) => {
                this.authentication = result.json();
                localStorage.setItem("authentication", JSON.stringify(this.authentication));
                this.authenticated.emit(this.authentication);
                return this.authentication;
            });
        //.catch((error) => console.error(error));
    }
}