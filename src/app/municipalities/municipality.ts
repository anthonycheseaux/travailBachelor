
export class Municipality{

  id: number;
  name: string;
  canton: string;
  district: string;
  uri: string;

  constructor(id: number, name: string, canton: string, district: string, uri: string) {
    this.id = id;
    this.name = name;
    this.canton = canton;
    this.district = district;
    this.uri = uri;
  }
}
