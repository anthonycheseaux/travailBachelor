import {Component, OnInit} from '@angular/core';
import {MunicipalitiesService} from "../municipalities/municipalities.service";
import {Municipality} from "../municipalities/municipality";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  /*constructor(private municipalitiesService: MunicipalitiesService) {  }

  ngOnInit() {
    this.municipalitiesService.getAllMunicipalitiesIdName()
      .subscribe(
        (elements: any[]) => this.options = elements,
        (error) => console.log(error),
        () => this.init()
      );
    //console.log(this.options);
  }

  filter(name: string): Municipality[] {
    return this.options.filter(option => new RegExp(`^${name}`, 'gi').test(option.name));
  }

  displayFn(municipality: Municipality): string | Municipality {
    return municipality ? municipality.name : municipality;
  }

  init(){
    this.tdMunicipalities = this.options;

    this.filteredOptions = this.myControl.valueChanges
      .startWith(null)
      .map(municipality => municipality && typeof municipality === 'object' ? municipality.name : municipality)
      .map(name => name ? this.filter(name) : this.options.slice());
  }*/

  ngOnInit() {
    this.municipalitiesService.getAllMunicipalitiesIdName()
      .subscribe(
        (elements: any[]) => this.municipalities = elements,
        (error) => console.log(error),
        () => this.init()
      );

    console.log(this.municipalities);
  }

  municipalities: Municipality[] = [];
  currentMunicipality: Municipality = new Municipality(null, null, null, null, null);
  tdMunicipalities: any[];

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
      if(m.name.toUpperCase() == current.toUpperCase()) {
        this.router.navigate(['/municipalities/', m.id, 'archival-resources']);
      }
      else {

      }
    }
  }
}
