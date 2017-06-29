import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http'
import 'rxjs/Rx';
import {Municipality} from "./municipality";
import {Canton} from "./canton";
import {District} from "./district";

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
      'SELECT ?name ' +
        '(SAMPLE(?id)as ?id) ' +
        '(SAMPLE(?cantonName)as ?canton) ' +
        '(SAMPLE(?districtName)as ?district) ' +
        '(SAMPLE(?municipality)as ?uri)' +
      'WHERE { ' +
        'GRAPH <https://linked.opendata.swiss/graph/eCH-0071> {' +
          '?version a gont:MunicipalityVersion; ' +
            'gont:municipality ?municipality ; ' +
            'gont:longName ?name; ' +
            'gont:id ?id;' +
            'gont:canton ?c; ' +
            'gont:district ?d. ' +
          '?c gont:longName ?cantonName. ' +
          '?d gont:longName ?districtName. ' +
        '} ' +
      '} ' +
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
          let canton: string;
          let district: string;
          let uri: string;

          for(const e of data){
            id = +e.id.value;
            name = e.name.value;
            canton = e.canton.value;
            district = e.district.value;
            uri = e.district.uri;

            elements.push(new Municipality(id, name, canton, district, uri, 'true'));
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

            elements.push(new Municipality(id, name, null, null, null, 'true'));
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
              console.log(e.hasOwnProperty('abModeLabel'));
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

          console.log(elements);
          return elements;
        }
      );
  }
}
