import { Component, OnInit } from '@angular/core';
import {GtExpandedRow} from "@angular-generic-table/core";

@Component({
  selector: 'app-custom-row',
  templateUrl: './custom-row.component.html',
  styleUrls: ['./custom-row.component.css']
})
export class CustomRowComponent extends GtExpandedRow<any> implements OnInit {

  constructor() { super() }

  ngOnInit() {
  }

}
