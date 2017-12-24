import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { MainComponent } from './main.component';
import { environment } from '../environments/environment';

const routes: Routes = [
    {
        path: '',
        children: [
            {
              path: ':id',
              component: MainComponent
            },
            {
                path: '**',
                component: MainComponent
            }
        ]
    }
];

export const AppRoutingModule = RouterModule.forRoot(routes, { enableTracing: false /** !environment.production */ });
