import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {MunicipalitiesService} from "../municipalities/municipalities.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  municipalitiesCtrl: FormControl;
  filteredMunicipalities: any;

  municipalities = [];

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
  }
}
