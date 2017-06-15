import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http'
import 'rxjs/Rx';
import {Municipality} from "./municipality";

const endpointUrl  = 'https://lindasprd.netrics.ch:8443/lindas/query?query=';

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
      'SELECT ?name (SAMPLE(?id )as ?id) (SAMPLE(?cantonName )as ?canton) (SAMPLE(?districtName )as ?district) ' +
      'WHERE { ' +
      '?version a <https://gont.ch/MunicipalityVersion>; ' +
      '<https://gont.ch/municipality> ?municipality ; ' +
      '<https://gont.ch/longName> ?name; ' +
      '<https://gont.ch/canton> ?c; ' +
      '<https://gont.ch/district> ?d. ' +
      '?c <https://gont.ch/longName> ?cantonName. ' +
      '?d <https://gont.ch/longName> ?districtName. ' +
      '?municipality <https://gont.ch/id> ?id. ' +
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

          for(const e of data){
            id = +e.id.value;
            name = e.name.value;
            canton = e.canton.value;
            district = e.district.value;

            elements.push(new Municipality(id, name, canton, district));
          }

          //console.log(elements);
          return elements;
        }
      );
  }

  getAllMunicipalitiesIdName() {

    let query:string =
      'SELECT ?name (SAMPLE(?id )as ?id) ' +
      'WHERE { ' +
      '?version a <https://gont.ch/MunicipalityVersion>; ' +
      '<https://gont.ch/municipality> ?municipality ; ' +
      '<https://gont.ch/longName> ?name. ' +
      '?municipality <https://gont.ch/id> ?id. ' +
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

          for(const e of data){
             id = +e.id.value;
             name = e.name.value

            elements.push(new Municipality(id, name, null, null));
          }

          //console.log(elements);
          return elements;
        }
      );
  }
}
