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
      (elements: any[]) => this.afterLoadRelated(elements),
      (error) => console.log(error)
    );
  }

  private afterLoadRelated(elements: any[]){
    let ids: number[];
    this.municipalitiesService.getHistory(ids).subscribe(
      (elements: any[]) => this.afterLoadRelated(elements),
      (error) => console.log(error)
    );
  }
}
