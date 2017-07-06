import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http'
import 'rxjs/Rx';
import {Municipality} from "../objects/municipality";
import {Canton} from "../objects/canton";
import {District} from "../objects/district";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Mutation} from "../objects/mutation";

const endpointUrl  = 'https://lindasdev.netrics.ch:8443/lindas/query?query=';

@Injectable()
export class MunicipalitiesService {
  constructor(private http: Http) {}

  private getHeaders(){
    let username: string = 'public';
    let password: string = 'public';
    let headers: Headers = new Headers();

    headers.append("Authorization", "Basic " + btoa(username + ":" + password));
    headers.append("Accept", "application/sparql-results+json");

    return headers;
  }

  getAllMunicipalities() {

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

  return this.http.get(getUrl, {headers: this.getHeaders()})
    .map(
      (response: Response) => {
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
            abolitionMutation = new Mutation(null, null, null, -1);
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
        return elements;
      }
    );
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

  getAllMunicipalitiesIdName() {

    let query:string =
      'PREFIX gont: <https://gont.ch/>' +
      'SELECT ?name (SAMPLE(?id )as ?id) ' +
      'WHERE { ' +
        'GRAPH <https://linked.opendata.swiss/graph/eCH-0071> {' +
          '?version a gont:MunicipalityVersion; ' +
          'gont:municipality ?municipality ; ' +
          'gont:longName ?name. ' +
        '?municipality gont:id ?id; ' +
          'a gont:PoliticalMunicipality' +
      '}' +
      '}' +
      'GROUP BY ?name ' +
      'ORDER BY ASC (?name)';

    let getUrl = endpointUrl+encodeURIComponent(query);

    return this.http.get(getUrl, {headers: this.getHeaders()})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements: Municipality[] = [];
          let id: number;
          let name: string;

          for(const e of data){
            id = +e.id.value;
            name = e.name.value

            //elements.push(new Municipality(id, name, null, null, null, 'Actif'));
          }

          //console.log(elements);
          return elements;
        }
      );
  }

  getCantonsDistricts() {

    let query:string =
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

    let getUrl = endpointUrl+encodeURIComponent(query);

    return this.http.get(getUrl, {headers: this.getHeaders()})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements: Canton[] = [];
          let currentDistricts: District[];
          let currentCanton: Canton;
          let currentDistrict: District;
          let abModeLabel: string = null;

          let cantonBefore: number = -1;
          for(const e of data){
            if(e.hasOwnProperty('abModeLabel')){
              abModeLabel = e.abModeLabel.value;
            }

            currentDistrict = new District(
              +e.districtId.value,
              e.districtName.value,
              e.district.value,
              e.adModeLabel.value,
              abModeLabel
            );

            if(cantonBefore != +e.cantonId.value){
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

          for(const canton of elements){
            for(const district of canton.districts){
              if(lastDistrict.name == district.name){
                if(lastDistrict.abolitionMode == null && district.abolitionMode != null){
                  districtToRemove.push(district);
                } else {
                  districtToRemove.push(lastDistrict);
                }
              }
              lastDistrict = district;
            }

            for(const i of districtToRemove){
              canton.districts.splice(canton.districts.indexOf(i), 1);
            }

            districtToRemove = [];
          }
          return elements;
        }
      );
  }

  private removeDistricts(array: District[], index: number[]){
    for(const i of index){
      array.splice(i, 1);
    }
  }
}
