import {District} from "./district";

export class Canton {
  id: number;
  code: string;
  name: string;
  uri: string;
  date: Date;

  districts: District[];

  constructor(id: number, code: string, name: string, uri: string, date: Date,  districts: District[]){
    this.id = id;
    this.code = code;
    this.name = name;
    this.uri = uri;
    this.date = date;
    this.districts = districts;
  }
}
