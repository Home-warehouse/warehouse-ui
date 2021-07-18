import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { apiFetch } from 'src/common/api/api';
import getFormAsDict from 'src/common/form';

@Component({
  selector: 'app-raport-form',
  templateUrl: './raport-form.component.html',
  styleUrls: ['./raport-form.component.scss']
})
export class RaportFormComponent implements OnInit {
  RaportForm: FormGroup;
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
      raportName: new FormControl('test', [Validators.required]),
      description: new FormControl('te', []),
      shortResults: new FormControl(4, [Validators.required, Validators.min(0), Validators.max(20)]),
      rootLocation: new FormControl('Home', [Validators.required]),
      customColumns: new FormControl('Typ Potrawy', [Validators.required]),
      sortBy: this.fb.group({
        customColumn: new FormControl('', [Validators.required]),
        by: new FormControl('', [Validators.required])
      }),
      // filterBy: this.fb.array([
      //   this.fb.group({
      //     customColumn: [''],
      //     by: ['']
      //   })
      // ])
    });
  }

  // Filters
  // get allfilters(): FormArray {
  //   return this.RaportForm.controls["filterBy"] as FormArray;
  // }

  // addFilter() {
  //     let control = <FormArray>this.RaportForm.controls.filterBy;
  //     control.push(
  //       this.fb.group({
  //         customColumn: [''],
  //         by: ['']
  //       })
  //     )
  // }

  // deleteFilter(filterIndex: number) {
  //   this.allfilters.removeAt(filterIndex);
  // }

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

  get sortBy(): string[] {
    return [
      "ASC",
      "DSC"
    ]
  }


  onRaportSubmit = async() => {
    const formDict = getFormAsDict(this.RaportForm)
    const mutation = await apiFetch({
      query: `
      mutation create_raport {
        createRaport(raportDetails: {
          ${JSON.stringify(formDict)}
        })
        {
          raport{
            id
          }
        }
      }
      `
    })
  }

  ngOnInit(): void {
    this.getLocations()
    this.getCustomColumns()
  }

}
