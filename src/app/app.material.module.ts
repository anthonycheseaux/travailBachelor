import {
  MdButtonModule,
  MdCheckboxModule, MdInputContainer, MdInputModule, MdAutocompleteModule, MdListModule, MdTabsModule,
  MdProgressSpinnerModule
} from '@angular/material';

import {NgModule} from "@angular/core";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  imports: [
    MdButtonModule,
    MdInputModule,
    MdAutocompleteModule
  ],
  exports: [
    MdButtonModule,
    MdInputModule,
    MdAutocompleteModule,
    MdListModule,
    MdProgressSpinnerModule
  ],
})
export class AppMaterialModule { }
