import {Component, OnInit, OnDestroy} from '@angular/core';
import {MunicipalitiesService} from "../municipalities/municipalities.service";
import {Router} from "@angular/router";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  municipalities: MunicipalityVersion[] = [];
  distinctMunicipalities: MunicipalityVersion[] = [];
  currentMunicipality: MunicipalityVersion = new MunicipalityVersion(null, null, '', null, false, null, null, null, null);
  tdMunicipalities: any[];
  invalidName: boolean = false;
  message: string = 'Erreur';
  error: boolean;

  //Subscriptions
  getAllMunicipalitiesSubscription: Subscription;

  constructor(private router: Router, private municipalitiesService: MunicipalitiesService) {
    this.error = false;
  }

  ngOnInit() {
    this.getAllMunicipalitiesSubscription = this.municipalitiesService.getAllMunicipalities()
      .subscribe(
        (elements: any[]) => {
          this.municipalities = elements;
          this.distinctMunicipalities = this.municipalitiesService.getDistinctMunicipalities(this.municipalities);

          this.tdMunicipalities = this.distinctMunicipalities;
        },
        (error) => {
          console.log(error);
          this.error = true;
        }
      );
  }

  ngOnDestroy() {
    this.getAllMunicipalitiesSubscription.unsubscribe();
  }

  filterStates(val: string) {
    return val ? this.distinctMunicipalities.filter(s => new RegExp(`^${val}`, 'gi').test(s.name))
      : this.distinctMunicipalities;
  }

  onClick(current: string) {
    for(let m of this.distinctMunicipalities){
      if(m.name.toUpperCase() == current.trim().toUpperCase()) {
        this.router.navigate(['/municipalities/', m.id, 'archival-resources']);
      }
    }
    this.invalidName = true;
    this.message = 'Cette commune n\'existe pas';
  }
}
