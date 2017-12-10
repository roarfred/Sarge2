import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { AppComponent } from './app.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: AppComponent
            },
            {
                path: ':id',
                canActivate: [AuthGuardService],
                pathMatch: 'full',
                component: AppComponent
            }
        ]
    }
];

export const AppRoutingModule = RouterModule.forChild(routes);