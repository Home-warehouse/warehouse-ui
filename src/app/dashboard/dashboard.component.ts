import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from "../../common/interfaces/location.interface";
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop"
import { apiFetch } from 'src/common/api/api';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  showDetails: boolean = false;
  @Input() selectedElement: any;
  @Output() selectedElementChange = new EventEmitter();
  elements!: any[];
  searchingIn: any;

  constructor() {}

  queryLocationsProducts = async() => {
    const response = await apiFetch({
      query: `
      fragment locationFields on Location{
        id
        locationName
        description
        products{
          edges{
            node{
              id
              productName
            }
          }
        }
      }
      query locations{
        locationsList(root_Exact: true){
          edges{
            node{
              ...locationFields
              childrens{
                edges{
                  node{
                    ...locationFields
                    childrens{
                      edges{
                        node{
                          ...locationFields
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`
    })
    this.elements = response.data.data.locationsList.edges
  }


  updateRecNested = (element: any, parentId: string) => {
    if(element.locationName){
      if(this.searchingIn.id === parentId){
        // console.log('Found in root!')
        if(this.searchingIn.childrens.edges){
          this.searchingIn.childrens.edges.push({node: element})
        } else {
          this.searchingIn.childrens.edges = [{node: element}]
        }
        return
      }
      this.searchingIn.childrens.edges.every((parentNode: any)=>{
        if(parentNode.node.id===parentId){
          if(parentNode.node.childrens.edges){
            parentNode.node.childrens.edges.push({node: element})
          } else {
            parentNode.node.childrens.edges = [{node: element}]
          }
          // console.log('Found in childrens!')
          return
        } else {
          if(parentNode.node.childrens){
            this.searchingIn = parentNode.node
            this.updateRecNested(element, parentId)
          }
        }
      })
    }
  }


  // Selection
  onElementSelect = (element: any) => {
    this.showDetails = true;
    // console.log(element)
    this.selectedElement = element
    this.selectedElementChange.emit(this.selectedElement)
  }



  // Update
  onElementUpdate = async() => {
    if(this.selectedElement.productName){
    // If element is product

    } else {
      console.log(this.selectedElement)
      const { childrens, id, products, ...locationDet } = this.selectedElement

      const responseUpdate = await apiFetch({
        query: `
        mutation modLocation($id: String!, $locationDetails: LocationInput!){
          modifyLocation(id:$id, locationDetails: $locationDetails){
            modified
          }
        }
        `,
        variables: {
          id: this.selectedElement.id,
          locationDetails: locationDet
        }
      })
    }
  }


  // Create
  onNewElementInit = async(elementType: string, parentId?: string) => {
    this.showDetails = true
    if(elementType === 'location'){
      this.selectedElement = {
        parent: parentId,
        locationName: ''
      }
      if(!parentId){
        this.selectedElement.root = true
        delete this.selectedElement.parent
      }
      this.selectedElementChange.emit(this.selectedElement)
    }

  }



  // Save through API
  onNewElementSave = async() => {
    if(this.selectedElement.productName){
      // If element is product

      } else {
        // console.log('loookinn for loc with id ', this.selectedElement.parent)
        if(this.selectedElement.parent){
          // foreach root
          this.elements.forEach((node)=> {
            this.searchingIn = node.node
            this.updateRecNested(this.selectedElement, this.selectedElement.parent)
          })
        } else {
          this.elements.push({node: this.selectedElement})
        }

        const { parent, ...locationDet } = this.selectedElement
        // Create sub location
        const responseSub = await apiFetch({
          query: `
          mutation createLoc($locationDetails: LocationInput!){
            createLocation(locationDetails: $locationDetails){
              location{
                id
              }
            }
          }
          `,
          variables: {
            locationDetails: locationDet
          }
        })


        if(this.selectedElement.parent){
          // Update parent location
          const responseParent = await apiFetch({
            query: `
            mutation modLocation($parent_id: String!, $child_id: ID!){
              modifyLocation(id:$parent_id, locationDetails: {childrens: [$child_id]}){
                modified
              }
            }
            `,
            variables: {
              parent_id: this.selectedElement.parent,
              child_id: responseSub.data.data.createLocation.location.id
            }
          })
        }
        delete this.selectedElement.parent

        // Update ID
        this.selectedElement.id = responseSub.data.data.createLocation.location.id
        this.selectedElementChange.emit(this.selectedElement);
      }
  }

  ngOnInit(): void {
    this.queryLocationsProducts();
  }
}
