import { Component, OnInit } from '@angular/core';
import { AutomatizationsService } from '../automatizations.service';

@Component({
  selector: 'app-automatizations-list',
  templateUrl: './automatizations-list.component.html',
  styleUrls: ['./automatizations-list.component.scss']
})
export class AutomatizationsListComponent implements OnInit {

  constructor(
    public AutomatizationsService: AutomatizationsService
  ) { }


  ngOnInit(): void {
    this.AutomatizationsService.queryAutomatizations()
  }

}
