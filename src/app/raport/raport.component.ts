import { Component, Input, OnInit } from '@angular/core';
import { CustomColumnsService } from '../custom-columns.service';

@Component({
  selector: 'app-raport',
  templateUrl: './raport.component.html',
  styleUrls: ['./raport.component.scss']
})
export class RaportComponent implements OnInit {
  @Input() public customColumns!: any;
  @Input() public productsList!: any;

  constructor(
    public customColumnsService: CustomColumnsService
  ) { }

  ngOnInit(): void {
  }

}
