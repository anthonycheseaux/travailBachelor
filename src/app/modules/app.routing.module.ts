import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "../home/home.component";
import {ErrorPageComponent} from "../error-page/error-page.component";
import {MunicipalitiesComponent} from "../municipalities/municipalities.component";
import {MapComponent} from "../map/map.component";
import {ArchivalResourcesComponent} from "../archival-resources/archival-resources.component";
import {AboutComponent} from "../about/about.component";
import {MunicipalitiesService} from "../municipalities/municipalities.service";


const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'municipalities', component: MunicipalitiesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'municipalities/:id/archival-resources', component: ArchivalResourcesComponent }
  // { path: 'not-found', component: ErrorPageComponent, data: {message: 'Page not found!'} },
  // { path: '**', redirectTo: '/not-found'}
];

@NgModule({
  imports: [
    //RouterModule.forRoot(appRoutes, {userHash: true})
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule{}
