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

            elements.push(new Municipality(id, name, canton, district, uri));
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

            elements.push(new Municipality(id, name, null, null, null));
          }

          //console.log(elements);
          return elements;
        }
      );
  }
}
