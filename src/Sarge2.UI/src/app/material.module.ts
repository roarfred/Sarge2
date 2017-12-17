import { NgModule } from '@angular/core';

// Material Design
import {
    MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule,
    MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule,
    MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatCardModule, MatMenuModule, MatSliderModule, MatAutocompleteModule, MatFormFieldModule,
    MatDialogModule
} from '@angular/material';

@NgModule({
    imports: [MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule,
        MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule,
        MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
        MatCardModule, MatMenuModule, MatSliderModule, MatAutocompleteModule, MatFormFieldModule,
        MatDialogModule],
    exports: [MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule,
        MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule,
        MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
        MatCardModule, MatMenuModule, MatSliderModule, MatAutocompleteModule, MatFormFieldModule,
        MatDialogModule]
})
export class MaterialModule { };