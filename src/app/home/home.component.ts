import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {MunicipalitiesService} from "../municipalities/municipalities.service";
import {Observable} from "rxjs";
import {Municipality} from "../municipalities/municipality";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  /*municipalitiesCtrl: FormControl;
  filteredMunicipalities: any;

  municipalities: {id: number, name: string}[] = [] ;

  constructor(private municipalitiesService: MunicipalitiesService) {
    this.municipalitiesCtrl = new FormControl();
  }

  ngOnInit() {
    this.municipalitiesService.getAllMunicipalities()
      .subscribe(
        (elements: any[]) => this.municipalities = elements,
        (error) => console.log(error),
        () => this.init()
      );
  }

  filterMunicipalities(val: string) {
    return val ? this.municipalities.filter(s => new RegExp(`^${val}`, 'gi').test(s))
      : this.municipalities;
  }

  init(){
    this.filteredMunicipalities = this.municipalitiesCtrl.valueChanges
      .startWith(null)
      .map(name => this.filterMunicipalities(name));
  }*/

  myControl = new FormControl();
  options: Municipality[] = [];
  filteredOptions: Observable<Municipality[]>;

  constructor(private municipalitiesService: MunicipalitiesService) {  }

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
    this.filteredOptions = this.myControl.valueChanges
      .startWith(null)
      .map(municipality => municipality && typeof municipality === 'object' ? municipality.name : municipality)
      .map(name => name ? this.filter(name) : this.options.slice());
  }
}
