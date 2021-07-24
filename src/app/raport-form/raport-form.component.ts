import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { apiFetch } from 'src/common/api/api';
import getFormAsDict from 'src/common/form';

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
    private fb: FormBuilder,
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
    const response = await apiFetch({
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
    const response = await apiFetch({
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
    // delete formDict.description
    // delete formDict.sortBy
    // delete formDict.rootLocation
    console.log(formDict)
    const mutation = await apiFetch({
      query: `mutation create_raport($raportDetailsData: RaportInput!)  {
        createRaport(raportDetails:$raportDetailsData){
          raport{
            id
          }
        }
      }`,
      variables: {raportDetailsData: formDict}
    })
  }

  ngOnInit(): void {
    this.getLocations()
    this.getCustomColumns()
  }

}
