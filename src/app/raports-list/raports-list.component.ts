import { Component, OnInit } from '@angular/core';
import { RaportsService } from '../raports.service';

@Component({
  selector: 'app-raports-list',
  templateUrl: './raports-list.component.html',
  styleUrls: ['./raports-list.component.scss']
})
export class RaportsListComponent implements OnInit {
  customColumns!: any[];
  constructor(
    public raportsService: RaportsService
  ) {}

  initialQuery = async() => {
    const result = await this.raportsService.queryRaportsList()
    this.raportsService.queryFilteredProductsList(result.data.data.raportsList)
  }

  ngOnInit(): void {
    this.initialQuery()
  }

}
