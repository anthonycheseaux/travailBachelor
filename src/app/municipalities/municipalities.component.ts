import { Component, OnInit } from '@angular/core';
import {MunicipalitiesService} from "./municipalities.service";
import {Municipality} from "./municipality";

@Component({
  selector: 'app-municipalities',
  templateUrl: './municipalities.component.html',
  styleUrls: ['./municipalities.component.css']
})
export class MunicipalitiesComponent implements OnInit {

  options: Municipality[] = [];
  loading: boolean;
  municipalityNb: number;

  constructor(private municipalitiesService: MunicipalitiesService) {  }

  ngOnInit() {
    this.loading = true;

    this.municipalitiesService.getAllMunicipalities().subscribe(
      (elements: any[]) => this.options = elements,
      (error) => console.log(error),
      () => this.updateAfterLoad()
    );
  }

  private updateAfterLoad(){
    this.loading = false;
  }
}
