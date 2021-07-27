import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { hwAPI } from 'src/common/api/api';
import getFormAsDict from 'src/common/form';
import { Router } from '@angular/router'
import { NotificationsSharedService } from '../notifications/notifications.sharedService';

enum sortByType {
  Ascending = '1',
  Descending = '-1'
}

enum filterByType {
  Equal = '$eq',
  Lesser = '$lt',
  Greater = '$gt'
}

enum filterSuffixType {
  Equal = 'to',
  Lesser = 'than',
  Greater = 'than'
}


@Component({
  selector: 'app-raport-form',
  templateUrl: './raport-form.component.html',
  styleUrls: ['./raport-form.component.scss']
})
export class RaportFormComponent implements OnInit {
  RaportForm: FormGroup;
  eSortByType = sortByType;
  eFilterByType = filterByType;
  eFilterSuffixType = filterSuffixType;
  locationsList!: {
    node: {
      id: string
      locationName: string;
    }
  }[];
  customColumnsList!: {
    node: {
      id: string
      name: string;
    }
  }[];

  constructor(
    private hwAPI: hwAPI,
    private router: Router,
    private fb: FormBuilder,
    private notifications: NotificationsSharedService,
  ) {
    this.RaportForm = this.fb.group({
      raportName: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
      shortResults: new FormControl(5, [Validators.required, Validators.min(0), Validators.max(20)]),
      // rootLocation: new FormControl(0, [Validators.required]),
      showCustomColumns: new FormControl([], [Validators.required]),
      sortBy: this.fb.group({
        customColumn: new FormControl('', [Validators.required]),
        value: new FormControl(null, [Validators.required])
      }),
      filterBy: this.fb.array([])
    });
  }

  // Filters
  get allfilters(): FormArray {
    return this.RaportForm.controls["filterBy"] as FormArray;
  }

  addFilter() {
      let control = <FormArray>this.RaportForm.controls.filterBy;
      control.push(
        this.fb.group({
          customColumn: [''],
          comparison: [''],
          value: [''],
        })
      )
  }

  deleteFilter(filterIndex: number) {
    this.allfilters.removeAt(filterIndex);
  }

  // Get all Locations
  getLocations = async() => {
    const response = await this.hwAPI.fetch({
    query: `
    query locations{
      locationsList{
          edges{
            node{
              id
              locationName
            }
          }
      }
    }`
    })
    this.locationsList = response.data.data.locationsList.edges
  }

  // Get all custom columns
  getCustomColumns = async() => {
    const response = await this.hwAPI.fetch({
    query: `
    query customColumns{
    customColumnsList{
        edges{
          node{
            id
            name
          }
        }
    }
    }`
    })
    this.customColumnsList = response.data.data.customColumnsList.edges
  }

  onRaportSubmit = async() => {
    const formDict = getFormAsDict(this.RaportForm)
    const result = await this.hwAPI.fetch({
      query: `mutation create_raport($raportDetailsData: RaportInput!)  {
        createRaport(raportDetails:$raportDetailsData){
          raport{
            id
          }
        }
      }`,
      variables: {raportDetailsData: formDict}
    })
    if(result.data){
      if(result.data.data.createRaport.raport.id){
        this.notifications.sendOpenNotificationEvent({
          message: `Raport created! Now you will be redirected to new raport.`,
          type: 'SUCCESS'
        });
        this.router.navigate(['/raport-display', result.data.data.createRaport.raport.id])
      } else {
        this.notifications.sendOpenNotificationEvent({
          message: `Could not create raport - try again or ask administrator for further help`,
          type: 'ERROR'
        });
      }
    }
  }

  ngOnInit(): void {
    this.getLocations()
    this.getCustomColumns()
  }

}
