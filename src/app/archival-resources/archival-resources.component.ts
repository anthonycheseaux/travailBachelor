import {Component, OnInit, Input} from '@angular/core';
import {ArchivalResourcesService} from "./archival-resources.service";
import {MunicipalitiesService} from "../municipalities/municipalities.service";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Router, ActivatedRoute, Data, Params} from "@angular/router";
import {ArchivalResources} from "../objects/archival-resources";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-archival-resources',
  templateUrl: './archival-resources.component.html',
  styleUrls: ['./archival-resources.component.css']
})
export class ArchivalResourcesComponent implements OnInit {

  mapUrl = '//map.geo.admin.ch/?zoom=5&?ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill=';
  loading: boolean;
  options: MunicipalityVersion[];
  versionId: number;
  currentMunicipalityVersion: MunicipalityVersion = new MunicipalityVersion(0, '', '', 0, -1, '', '', null, null);
  municipalities: MunicipalityVersion[];
  archivalResources: ArchivalResources[];
  related: MunicipalityVersion[];
  mapActive = false;

  constructor(public sanitizer: DomSanitizer,
              private router: Router,
              private route: ActivatedRoute,
              private archivalResourcesService: ArchivalResourcesService,
              private municipalitiesService: MunicipalitiesService) { }

  ngOnInit() {
    this.loading = true;

    this.municipalitiesService.getAllMunicipalities().subscribe(
      (elements: any[]) => this.options = elements,
      (error) => console.log(error),
      () => {
        this.route.params.subscribe(
          (params: Params) => {
            this.versionId = params['id'];

            this.currentMunicipalityVersion = this.options.find(x => x.id == this.versionId);

            this.related = this.testGetRelated(this.currentMunicipalityVersion);

            this.afterLoadRelated(this.related);

            //this.getRelatedMunicipalities(this.versionId);
          }
        );
      }
    );

    /*this.route.params.subscribe(
     (params: Params) => {
     this.versionId = params['id'];
     this.getRelatedMunicipalities(this.versionId);
     }
     );*/
  }


  private testGetRelated(current: MunicipalityVersion){
    let sameM: MunicipalityVersion[] = [];

    for(const option of this.options){
      if(current.municipality == option.municipality){
        sameM.push(option);
      }
    }

    let related: MunicipalityVersion[] = [];

    for(const same of sameM){
      for(const option of this.options){
        if(same.abolitionMutation){
          if(same.abolitionMutation.id == option.admissionMutation.id){
            related.push(option);
          }
        }
        if(option.abolitionMutation){
          if(related.indexOf(option) == -1) {
            if (same.admissionMutation.id == option.abolitionMutation.id) {
              related.push(option);
            }
          }
        }
      }
    }
    return related;
  }

  /*  private getRelatedMunicipalities(id: number){
   this.municipalitiesService.getRelatedMunicipalities(id).subscribe(
   (related: any[]) => this.afterLoadRelated(related),
   (error) => console.log(error)
   );
   }*/

  private afterLoadRelated(related: MunicipalityVersion[]){
    let names: string = '';

    this.constructHistory(related);

    for(const element of related){
      if(names.indexOf(element.name) == -1){
        names = names + "\"" + element.name + "\"" + " OR ";
      }
    }
    names = names.substring(0, names.length-4);

    this.loading = false;

    /*    this.archivalResourcesService.getArchivalResourcesMatchingNames(names).subscribe(
     (elements: any[]) => this.archivalResources = elements,
     (error) => console.log(error)
     );*/
  }

  private constructHistory(related: MunicipalityVersion[]){
    let history: string[] = [];
    let work: MunicipalityVersion[] = [];
    let active: MunicipalityVersion = null;

    console.log(related);

    for(let m of related){
      if(!m.abolitionMutation){
        active = m;
      }

      if(m.name == this.currentMunicipalityVersion.name){
        work.push(m);
      }
    }

    if(active){
      history.push("Nom actuel (commune active) " + active.name);
      this.mapUrl = this.mapUrl + active.municipality;
      this.mapActive = true;
    }
    else{
      related.sort((a: any, b: any) => {
        if (a.abolitionMutation.date < b.abolitionMutation.date) {
          return -1;
        }
        else if (a.abolitionMutation.date > b.abolitionMutation.date) {
          return 1;
        }
        else {
          return 0;
        }
      });

      this.mapUrl = this.mapUrl + related[related.length-1].municipality;
      this.mapActive = true;
    }

    work.push(this.currentMunicipalityVersion);

    for(let w of work){
      for(let r of related){
        if(r.abolitionMutation && w.name != r.name && w.admissionMutation.id == r.abolitionMutation.id){
          history.push(r.name + " " + w.admissionMutation.date + " " + w.admissionMutation.mutationLabel);
        }
        if(w.abolitionMutation && w.name != r.name && w.abolitionMutation.id == r.admissionMutation.id){
          history.push(r.name + " " + r.admissionMutation.date + " " + r.admissionMutation.mutationLabel);
        }
      }
    }

    for(let h of history){
      console.log(h);
    }
  }
}
