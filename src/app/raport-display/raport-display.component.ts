import { Component, OnInit } from '@angular/core';
import { RaportsService } from '../raports.service';
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-raport-display',
  templateUrl: './raport-display.component.html',
  styleUrls: ['./raport-display.component.scss']
})
export class RaportDisplayComponent implements OnInit {
  raport!: any;
  id!: string | null;
  raportsList: any;
  apps: string[] = []

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public raportsService: RaportsService
  ) {}

  onRaportDeletion = async(id: string) => {
    const result = await this.raportsService.deleteRaport(id)
    if(result.data.data.deleteRaport.deleted){
    this.router.navigate(['/raports'])
    }
  }

  initialQuery = async(id: string | null) => {
    const result = await this.raportsService.queryRaportsList(id)
    this.raportsList = result.data.data.raportsList
    await this.raportsService.queryFilteredProductsList(result.data.data.raportsList, true)
  }

  typedKeys<T>(o: T): (keyof T)[] {
    return Object.keys(o) as (keyof T)[];
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')
    this.initialQuery(this.id)
  }

}
