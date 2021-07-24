import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-locations-table',
  templateUrl: './locations-table.component.html',
  styleUrls: ['./locations-table.component.scss'],
})
export class LocationsTableComponent implements OnInit {
//  Services
 @Input() public customColumnsService: any;
 @Input() public locationsService: any;

//  Variables
 @Input() public selectedElement: any;

//  Functions
  @Output() public onElementSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onNewElementInit: EventEmitter<any> = new EventEmitter<any>();


  onElementSelectEvent(element: any, parentName?: string){
    this.onElementSelect.emit({element, parentName})
  }

  onElementSelectEventNested(config: any){
    this.onElementSelect.emit(config)
  }

  onNewElementInitEvent(elementType: string, parentId?: string, parentName?: string){
      this.onNewElementInit.emit({elementType, parentId, parentName})
  }


  ngOnInit(): void {}
}
