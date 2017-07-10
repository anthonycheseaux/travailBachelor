export class ArchivalResources {
  id: number;
  uri: string;
  title: string;
  signature: string;
  startDate: Date;
  endDate: Date;

  constructor(id: number, uri: string, title: string, signature: string, startDate: Date, endDate: Date) {
    this.id = id;
    this.uri = uri;
    this.title = title;
    this.signature = signature;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}
