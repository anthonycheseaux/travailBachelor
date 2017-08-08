import {
  MdButtonModule,
  MdInputModule,
  MdAutocompleteModule,
  MdListModule,
  MdProgressSpinnerModule, MdProgressBarModule, MdSelectModule, MdSelectionModule, MdDialogModule, MdTooltipModule
} from '@angular/material';

import {NgModule} from "@angular/core";

/**
 * Module used to import Module from the Angular Material used in the app
 *
 * Then they are exported while the module is the imported in the app.module.ts
 */
@NgModule({
  imports: [
    MdInputModule,
    MdAutocompleteModule,
    MdProgressSpinnerModule,
    MdTooltipModule
  ],
  exports: [
    MdButtonModule,
    MdInputModule,
    MdAutocompleteModule,
    MdProgressSpinnerModule,
    MdTooltipModule
  ],
})
export class AppMaterialModule { }
