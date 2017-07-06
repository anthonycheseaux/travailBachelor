import {MunicipalityVersion} from "./municipality-version";

export class Municipality{

  id: number;
  uri: string;
  versions: MunicipalityVersion[];

  constructor(id: number, uri: string) {
    this.id = id;
    this.uri = uri;
    this.versions = [];
  }
}
