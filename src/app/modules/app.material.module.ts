import {
  MdButtonModule,
  MdInputModule,
  MdAutocompleteModule,
  MdListModule,
  MdProgressSpinnerModule, MdProgressBarModule, MdSelectModule, MdSelectionModule, MdDialogModule, MdTooltipModule
} from '@angular/material';

import {NgModule} from "@angular/core";

@NgModule({
  imports: [
    MdButtonModule,
    MdInputModule,
    MdAutocompleteModule,
    MdListModule,
    MdProgressSpinnerModule,
    MdTooltipModule
  ],
  exports: [
    MdButtonModule,
    MdInputModule,
    MdAutocompleteModule,
    MdListModule,
    MdProgressSpinnerModule,
    MdTooltipModule
  ],
})
export class AppMaterialModule { }
