import { NgModule } from '@angular/core';

// Material Design
import {
    MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule,
    MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule,
    MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatCardModule
} from '@angular/material';

@NgModule({
    imports: [MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule,
        MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule,
        MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
        MatCardModule],
    exports: [MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule,
        MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule,
        MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
        MatCardModule]
})
export class MaterialModule { };