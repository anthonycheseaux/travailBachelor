import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { HomeComponent } from './home/home.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MunicipalitiesComponent } from './municipalities/municipalities.component';
import { ArchivalRessourcesComponent } from './archival-ressources/archival-ressources.component';
import { AppRoutingModule } from './app.routing.module';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppMaterialModule} from "./app.material.module";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {MunicipalitiesService} from "./municipalities/municipalities.service";
import {HttpModule} from "@angular/http";

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    HomeComponent,
    ErrorPageComponent,
    PageNotFoundComponent,
    MunicipalitiesComponent,
    ArchivalRessourcesComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AppMaterialModule,
    BrowserAnimationsModule
  ],
  providers: [
    MunicipalitiesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
