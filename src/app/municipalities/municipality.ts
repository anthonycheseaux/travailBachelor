
export class Municipality{

  id: number;
  name: string;
  canton: string;
  district: string;

  constructor(id: number, name: string, canton: string, district: string) {
    this.id = id;
    this.name = name;
    this.canton = canton;
    this.district = district;
  }
}
