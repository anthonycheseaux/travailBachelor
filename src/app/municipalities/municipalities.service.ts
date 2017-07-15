import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http'
import 'rxjs/Rx';
import {Canton} from "../objects/canton";
import {District} from "../objects/district";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Mutation} from "../objects/mutation";
import {Observable} from "rxjs";

const endpointUrl  = 'https://test.lindas-data.ch:8443/lindas/query?query=';

@Injectable()
export class MunicipalitiesService {
  private municipalities: MunicipalityVersion[];
  private municipalitiesObservable: Observable<any>;
  private cantons: Canton[];
  private cantonsObservable: Observable<any>;

  constructor(private http: Http) {}

  private getHeaders(){
    let username: string = 'public';
    let password: string = 'public';
    let headers: Headers = new Headers();

    headers.append("Authorization", "Basic " + btoa(username + ":" + password));
    headers.append("Accept", "application/sparql-results+json");

    return headers;
  }

  /*getHistory(uris: string){
   let query:string = 'SELECT ?version ?id ?name ?cantonName ?districtName ?adDate ?adLabel ?abDate ?abLabel ' +
   'FROM  <https://linked.opendata.swiss/graph/eCH-0071> ' +
   'WHERE { ' +
   'VALUES ?version {'+ uris +'} ' +
   '?version a gont:MunicipalityVersion; ' +
   'gont:id ?id; ' +
   'gont:longName ?name; ' +
   ' gont:canton ?c; ' +
   'gont:district ?d; ' +
   'gont:admissionEvent ?adEvent; ' +
   'gont:admissionMode ?adMode. ' +
   '?c gont:longName ?cantonName. ' +
   '?d gont:longName ?districtName. ' +
   '?adEvent gont:date ?adDate. ' +
   '?adMode skos:prefLabel ?adLabel. ' +
   'OPTIONAL{ ' +
   '?version gont:abolitionEvent ?abEvent; ' +
   'gont:abolitionMode ?abMode. ' +
   '?abEvent gont:date ?abDate. ' +
   '?abMode skos:prefLabel ?abLabel. ' +
   '} ' +
   '}';

   let getUrl = endpointUrl+encodeURIComponent(query);

   return this.http.get(getUrl, {headers: this.getHeaders()})
   .map(
   (response: Response) => {
   let data = response.json().results.bindings;
   let elements: MunicipalityVersion[] = [];

   console.log(data);

   for (const e of data) {

   }

   return elements;
   }
   );
   }*/

  getRelatedMunicipalities(id: number){
    let query:string = 'SELECT distinct ?otherVersion ?otherVersionLabel ' +
      'FROM  <https://linked.opendata.swiss/graph/eCH-0071> ' +
      'WHERE { ' +
      '?currentVersion a gont:MunicipalityVersion; ' +
      'gont:id '+ id +' . ' +
      '?municipality a gont:PoliticalMunicipality; ' +
      'gont:municipalityVersion ?currentVersion; ' +
      'gont:municipalityVersion ?version. ' +
      '{ ' +
      '?version gont:admissionEvent ?versionAdmissionEvent. ' +
      '?version gont:admissionMode ?versionAdmissionMode. ' +
      '?otherVersion a gont:MunicipalityVersion; ' +
      'gont:abolitionEvent ?versionAdmissionEvent; ' +
      'gont:longName ?otherVersionLabel. ' +
      '} ' +
      'UNION ' +
      '{ ' +
      '?version gont:abolitionEvent ?versionAbolitionEvent. ' +
      '?version gont:abolitionMode ?versionAbolitionMode. ' +
      '?otherVersion a gont:MunicipalityVersion; ' +
      'gont:admissionEvent ?versionAbolitionEvent; ' +
      'gont:longName ?otherVersionLabel. ' +
      '} ' +
      '}';

    let getUrl = endpointUrl+encodeURIComponent(query);

    return this.http.get(getUrl, {headers: this.getHeaders()})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements = [];

          for (const e of data) {
            elements.push({'uri': e.otherVersion.value, 'name': e.otherVersionLabel.value});
          }

          return elements;
        }
      );
  }

  getAllMunicipalities() {

    if(this.municipalities){
      return Observable.of(this.municipalities);
    }
    else if(this.municipalitiesObservable) {
      //pending request
      return this.municipalitiesObservable;
    }else {
      //new request
      let query:string =
        'PREFIX gont: <https://gont.ch/>' +
        'SELECT ?version ?id ?name ?municipalityId ?cantonName ?districtName ?adEvent ?adId ?adDate ?adLabel ?abEvent ?abId ?abDate ?abLabel ' +
        'FROM <https://linked.opendata.swiss/graph/eCH-0071> ' +
        'WHERE { ' +
        '?municipality a gont:PoliticalMunicipality; ' +
        'gont:id ?municipalityId. ' +
        '?version a gont:MunicipalityVersion; ' +
        'gont:municipality ?municipality ; ' +
        'gont:longName ?name; ' +
        'gont:id ?id; ' +
        'gont:canton ?canton; ' +
        'gont:district ?d; ' +
        'gont:admissionEvent ?adEvent; ' +
        'gont:admissionMode ?adMode. ' +
        '?canton gont:longName ?cantonName. ' +
        '?d gont:longName ?districtName. ' +
        '?adEvent gont:date ?adDate; ' +
        'gont:id ?adId. ' +
        '?adMode skos:notation ?adLabel. ' +
        'OPTIONAL{ ' +
        '?version gont:abolitionEvent ?abEvent. ' +
        '?version gont:abolitionMode ?abMode. ' +
        '?abEvent gont:date ?abDate; ' +
        'gont:id ?abId. ' +
        '?abMode skos:notation ?abLabel. ' +
        '} ' +
        '} ' +
        'ORDER BY ASC (?name) DESC (?adDate)';

      let getUrl = endpointUrl+encodeURIComponent(query);

      this.municipalitiesObservable = this.http.get(getUrl, {headers: this.getHeaders()})
        .map(
          (response: Response) => {
            this.municipalitiesObservable = null;

            let data = response.json().results.bindings;
            let elements: MunicipalityVersion[] = [];

            //console.log(data);

            let abolitionMutation: Mutation;
            let admissionMutation: Mutation;
            let currentVersion: MunicipalityVersion;
            let state: number = -1;

            for(const e of data){
              if(e.hasOwnProperty('abEvent')){
                state = 1;
                abolitionMutation = new Mutation(
                  e.abId.value,
                  e.abEvent.value,
                  e.abDate.value,
                  +e.abLabel.value
                );
              }
              else {
                abolitionMutation = null;
                state = 0;
              }

              admissionMutation = new Mutation(
                e.adId.value,
                e.adEvent.value,
                e.adDate.value,
                +e.adLabel.value
              );

              elements.push(new MunicipalityVersion(
                e.id.value,
                e.version.value,
                e.name.value,
                e.municipalityId.value,
                state,
                e.cantonName.value,
                e.districtName.value,
                admissionMutation,
                abolitionMutation
              ));

              state = -1;
            }

            //console.log(elements);
            this.municipalities = elements;

            return this.municipalities;
          }
        ).share();
      return this.municipalitiesObservable;
    }
  }

  getActiveMunicipalities() {

    let query:string =
      'PREFIX gont: <https://gont.ch/>' +
      'SELECT ?version ?id ?name ?municipalityId ?cantonName ?districtName ?adEvent ?adId ?adDate ?adLabel ' +
      'FROM <https://linked.opendata.swiss/graph/eCH-0071> ' +
      'WHERE { ' +
      '?municipality a gont:PoliticalMunicipality; ' +
      'gont:id ?municipalityId. ' +
      '?version a gont:MunicipalityVersion; ' +
      'gont:municipality ?municipality ; ' +
      'gont:longName ?name; ' +
      'gont:id ?id; ' +
      'gont:canton ?canton; ' +
      'gont:district ?d; ' +
      'gont:admissionEvent ?adEvent; ' +
      'gont:admissionMode ?adMode. ' +
      '?canton gont:longName ?cantonName. ' +
      '?d gont:longName ?districtName. ' +
      '?adEvent gont:date ?adDate; ' +
      'gont:id ?adId. ' +
      '?adMode skos:notation ?adLabel. ' +
      'MINUS{ ' +
      '?version gont:abolitionEvent ?abEvent. ' +
      '} ' +
      '} ' +
      'ORDER BY ASC (?name) DESC (?adDate)';

    let getUrl = endpointUrl+encodeURIComponent(query);

    return this.http.get(getUrl, {headers: this.getHeaders()})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements: MunicipalityVersion[] = [];

          //console.log(data);

          let abolitionMutation: Mutation = new Mutation(null, null, null, -1);
          let admissionMutation: Mutation;
          let state: number = -1;

          for(const e of data){
            admissionMutation = new Mutation(
              e.adId.value,
              e.adEvent.value,
              e.adDate.value,
              +e.adLabel.value
            );

            elements.push(new MunicipalityVersion(
              e.id.value,
              e.version.value,
              e.name.value,
              e.municipalityId.value,
              state,
              e.cantonName.value,
              e.districtName.value,
              admissionMutation,
              abolitionMutation
            ));

            state = -1;
          }

          //console.log(elements);
          return elements;
        }
      );
  }

  getCantonsDistricts() {

    if(this.cantons){
      return Observable.of(this.cantons);
    }
    else if(this.cantonsObservable) {
      //pending request
      return this.cantonsObservable;
    }else {
      //new request
      let query: string =
        'PREFIX gont: <https://gont.ch/> ' +
        'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ' +
        'SELECT ?canton ?cantonId ?cantonName ?cantonAbbreviation ?cantonDate ' +
        '?district ?districtId ?districtName ?adModeLabel ?abModeLabel ' +
        'WHERE { ' +
        '?canton a gont:Canton; ' +
        'gont:id ?cantonId; ' +
        'gont:longName ?cantonName; ' +
        'gont:cantonAbbreviation ?cantonAbbreviation; ' +
        'gont:date ?cantonDate. ' +
        '?district a gont:DistrictEntityVersion; ' +
        'gont:canton ?canton; ' +
        'gont:id ?districtId; ' +
        'gont:longName ?districtName; ' +
        'gont:admissionMode ?districtAdMode. ' +
        '?districtAdMode skos:prefLabel ?adModeLabel. ' +
        'OPTIONAL {?district gont:abolitionMode ?districtAbMode. ' +
        '?districtAbMode skos:prefLabel ?abModeLabel.} ' +
        '}' +
        'ORDER BY ?cantonName ?districtName';

      let getUrl = endpointUrl + encodeURIComponent(query);

      this.cantonsObservable = this.http.get(getUrl, {headers: this.getHeaders()})
        .map(
          (response: Response) => {
            this.cantonsObservable = null;

            let data = response.json().results.bindings;
            let elements: Canton[] = [];
            let currentDistricts: District[];
            let currentCanton: Canton;
            let currentDistrict: District;
            let abModeLabel: string = null;

            let cantonBefore: number = -1;
            for (const e of data) {
              if (e.hasOwnProperty('abModeLabel')) {
                abModeLabel = e.abModeLabel.value;
              }

              currentDistrict = new District(
                +e.districtId.value,
                e.districtName.value,
                e.district.value,
                e.adModeLabel.value,
                abModeLabel
              );

              if (cantonBefore != +e.cantonId.value) {
                currentDistricts = [];

                currentCanton = new Canton(
                  +e.cantonId.value,
                  e.cantonAbbreviation.value,
                  e.cantonName.value,
                  e.canton.value,
                  e.cantonDate.value,
                  currentDistricts
                );

                elements.push(currentCanton);
              }

              currentCanton.districts.push(currentDistrict);

              cantonBefore = +e.cantonId.value;
              abModeLabel = null;
            }

            let lastDistrict: District = new District(null, '', null, null, null);
            let districtToRemove: District[] = [];

            for (const canton of elements) {
              for (const district of canton.districts) {
                if (lastDistrict.name == district.name) {
                  if (lastDistrict.abolitionMode == null && district.abolitionMode != null) {
                    districtToRemove.push(district);
                  } else {
                    districtToRemove.push(lastDistrict);
                  }
                }
                lastDistrict = district;
              }

              for (const i of districtToRemove) {
                canton.districts.splice(canton.districts.indexOf(i), 1);
              }

              districtToRemove = [];
            }
            this.cantons = elements;

            return this.cantons;
          }
        ).share();
      return this.cantonsObservable;
    }
  }

  private removeDistricts(array: District[], index: number[]){
    for(const i of index){
      array.splice(i, 1);
    }
  }
}
