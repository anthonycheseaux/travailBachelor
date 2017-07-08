import { Component, OnInit } from '@angular/core';
import {ArchivalResourcesService} from "./archival-resources.service";
import {MunicipalitiesService} from "../municipalities/municipalities.service";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Router, ActivatedRoute, Data, Params} from "@angular/router";

@Component({
  selector: 'app-archival-resources',
  templateUrl: './archival-resources.component.html',
  styleUrls: ['./archival-resources.component.css']
})
export class ArchivalResourcesComponent implements OnInit {

  loading: boolean;
  options: MunicipalityVersion[];
  versionId: number;
  municipalities: MunicipalityVersion[];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private archivalResourcesService: ArchivalResourcesService,
              private municipalitiesService: MunicipalitiesService) { }

  ngOnInit() {
    this.loading = true;

    this.route.params.subscribe(
      (params: Params) => {
        this.getRelatedMunicipalities(params['id']);
      }
    );
  }

  private getRelatedMunicipalities(id: number){
    this.municipalitiesService.getRelatedMunicipalities(id).subscribe(
      (related: any[]) => this.afterLoadRelated(related),
      (error) => console.log(error)
    );
  }

  private afterLoadRelated(related: any[]){
    let uris: string = '';
    let names: string = '';

    for(const element of related){
      uris = uris + ' ' + element.uri ;

      if(names.indexOf(element.name) == -1){
        names = names + "\"" + element.name + "\"" + " OR ";
      }
    }

    names = names.substring(0, names.length-4);

    console.log(uris);
    console.log(names);

    this.municipalitiesService.getHistory(uris).subscribe(
      (elements: any[]) => this.afterLoadRelated(elements),
      (error) => console.log(error)
    );
  }
}
