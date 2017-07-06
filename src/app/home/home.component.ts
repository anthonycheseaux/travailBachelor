import {Component, OnInit} from '@angular/core';
import {MunicipalitiesService} from "../municipalities/municipalities.service";
import {Municipality} from "../objects/municipality";
import {Router} from "@angular/router";
import {MunicipalityVersion} from "../objects/municipality-version";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  municipalities: MunicipalityVersion[] = [];
  currentMunicipality: MunicipalityVersion = new MunicipalityVersion(null, null, '', null, -1, null, null, null, null);
  tdMunicipalities: any[];
  invalidName: boolean = false;
  message: string = 'Erreur';

  ngOnInit() {
    this.municipalitiesService.getActiveMunicipalities()
      .subscribe(
        (elements: any[]) => this.municipalities = elements,
        (error) => console.log(error),
        () => this.init()
      );
  }

  constructor(private router: Router, private municipalitiesService: MunicipalitiesService) {  }

  filterStates(val: string) {
    return val ? this.municipalities.filter(s => new RegExp(`^${val}`, 'gi').test(s.name))
      : this.municipalities;
  }

  init() {
    this.tdMunicipalities = this.municipalities;
  }

  onClick(current: string) {

    console.log(current);

    for(let m of this.municipalities){
      if(m.name.toUpperCase() == current.trim().toUpperCase()) {
        this.router.navigate(['/municipalities/', m.id, 'archival-resources']);
      }
    }
    this.invalidName = true;
    this.message = 'Cette commune n\'existe pas';
  }
}
