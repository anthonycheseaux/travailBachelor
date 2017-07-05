
export class Municipality{

  id: number;
  name: string;
  canton: string;
  district: string;
  uri: string;
  versions: Municipality[] = [];
  state: string;

  constructor(id: number, name: string, canton: string, district: string, uri: string, state: string) {
    this.id = id;
    this.name = name;
    this.canton = canton;
    this.district = district;
    this.uri = uri;
    this.state = state;
  }
}
