import { NgModule } from '@angular/core';

// Material Design
import {
    MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule,
    MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule,
    MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatCardModule,
    MatDialogModule
} from '@angular/material';

@NgModule({
    imports: [MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule,
        MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule,
        MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
        MatCardModule,
        MatDialogModule],
    exports: [MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule,
        MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule,
        MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
        MatCardModule,
        MatDialogModule]
})
export class MaterialModule { };