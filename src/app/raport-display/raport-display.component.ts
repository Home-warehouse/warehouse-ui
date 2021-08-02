import { Component, OnInit } from '@angular/core';
import { RaportsService } from '../raports.service';
import { ActivatedRoute, Router } from '@angular/router'
import { EvernoteType, IntegrationsService } from '../integrations.service';

@Component({
  selector: 'app-raport-display',
  templateUrl: './raport-display.component.html',
  styleUrls: ['./raport-display.component.scss']
})
export class RaportDisplayComponent implements OnInit {
  raport!: any;
  id!: string | null;
  raportsList: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private integrations: IntegrationsService,
    public raportsService: RaportsService
  ) {}

  onEvernoteClick = (type: EvernoteType) => {
    this.integrations.queryEvernoteRaport(type, this.raportsService.raportsList[0].raportName,  this.raportsService.parseRaports(this.raportsList)[0])
  }

  onRaportDeletion = async(id: string) => {
    const result = await this.raportsService.deleteRaport(id)
    if(result.data.data.deleteRaport.deleted){
    this.router.navigate(['/raports'])
    }
  }

  initialQuery = async(id: string | null) => {
    const result = await this.raportsService.queryRaportsList(id)
    this.raportsList = result.data.data.raportsList
    this.raportsService.queryFilteredProductsList(result.data.data.raportsList, true)
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')
    this.initialQuery(this.id)
  }

}
