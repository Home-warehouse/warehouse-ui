import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { hwAPI } from 'src/common/api/api';
import { customColumnParentNode, CustomColumnsService, customColumnValueParentNode, dataTypesEnum } from '../custom-columns.service';
import { locationParentNode, LocationsService } from '../locations.service';

interface sync {
  status: 'synced' | 'pending' | 'error',
  text: string
}


@Component({
  selector: 'app-locations-manager',
  templateUrl: './locations-manager.component.html',
  styleUrls: ['./locations-manager.component.scss']
})
export class LocationsManagerComponent implements OnInit {
  @Input() rootLocationId: string | null = null;

  synchronization: sync = {
    status: "synced",
    text: "Everything is up to date."
  }

  showDetails: boolean = false;
  isCreatingNewElement: boolean = false;
  showColumnsManage: boolean = false;

  @Input() selectedElement: any = null;
  @Output() selectedElementChange = new EventEmitter();

  parentLocationName: string | undefined;
  customColumnDataTypes = Object.keys(dataTypesEnum)

  constructor(
    public customColumnsService: CustomColumnsService,
    public locationsService: LocationsService,
    private hwAPI: hwAPI
  ) {}



  // Synchronization display
  startSync(text: string){
      this.synchronization = {
        status: "pending",
        text: "Syncing: ".concat(text)
      }
  }
  onSyncError(text: string){
    setTimeout(()=>{
      this.synchronization = {
        status: "error",
        text: "Could not sync: ".concat(text)
      }
    }, 750)
  }
  onSyncSuccess(){
    setTimeout(()=>{
      this.synchronization = {
        status: "synced",
        text: "Everything is up to date."
      }
    }, 1000)
  }


  // SELECT ELEMENT
  onElementSelect = (config: {element: any, parentName?: string}) => {
    this.parentLocationName = config.parentName
    this.showColumnsManage = false
    this.isCreatingNewElement = false
    this.showDetails = true;
    this.selectedElement = config.element
    this.selectedElementChange.emit(this.selectedElement)
  }

  // UPDATE CUSTOM COLUMN
  onCustomColumnUpdate = (allowedType: string) => {
    if(this.selectedElement.elementsAllowed.includes(allowedType)){
      this.selectedElement.elementsAllowed = this.selectedElement.elementsAllowed.filter((allowedTypeLocal: string)=>{
        return allowedTypeLocal !== allowedType
      })
    } else {
      this.selectedElement.elementsAllowed.push(allowedType)
    }
    this.onElementUpdate()
  }

  // UPDATE ELEMENT
  onElementUpdate = async() => {
    // Check if selectedElement is already created in DB (then only it has ID property)
    if(this.selectedElement.id){
      if(this.selectedElement.customColumnName) {
        this.startSync(this.selectedElement.customColumnName)
        const { show, ...customColumnDetails } = this.selectedElement
        const responseUpdate = await this.hwAPI.fetch({
          query: `
            mutation modCustomColumn($input: [CustomColumnInput]!){
              modifyCustomColumn(input: $input){
                modified
              }
            }
            `,
            variables: {
              input: [customColumnDetails]
            }
        })
        if(responseUpdate.status === 200){
          if(responseUpdate.data.data.modifyCustomColumn.modified){
            this.onSyncSuccess()
          }
        } else {
          this.onSyncError(this.selectedElement.customColumnName)
        }
        return
      }

      let customColumnsArr = this.selectedElement.customColumns.edges.map((parentNode: customColumnValueParentNode)=>{
        return {
          customColumn: parentNode.node.customColumn.id,
          value: parentNode.node.value
        }
      })

      if(this.selectedElement.productName){
      this.startSync(this.selectedElement.productName)

      const { customColumns, ...productDet } = this.selectedElement
      // If element is product
      const responseUpdate = await this.hwAPI.fetch({
        query: `
        mutation modProduct($productDetails: ProductInput!){
          modifyProduct(productDetails: $productDetails){
            modified
          }
        }
        `,
        variables: {
          id: this.selectedElement.id,
          productDetails: {...productDet, customColumns: customColumnsArr},
        }
      })

      if(responseUpdate.status === 200){
        if(responseUpdate.data.data.modifyProduct.modified){
          this.onSyncSuccess()
        }
      } else {
        this.onSyncError(this.selectedElement.productName)
      }

      }

      else if(this.selectedElement.locationName){

        // If element is location
        this.startSync(this.selectedElement.locationName)
        const { customColumns, childrens, products, ...locationDet } = this.selectedElement

        const responseUpdate = await this.hwAPI.fetch({
          query: `
          mutation modLocation($locationDetails: LocationInput!){
            modifyLocation(locationDetails: $locationDetails){
              modified
            }
          }
          `,
          variables: {
            locationDetails: {...locationDet, customColumns: customColumnsArr},
          }
        })
        if(responseUpdate.status === 200){
          if(responseUpdate.data.data.modifyLocation.modified){
            this.onSyncSuccess()
          }
        } else {
          this.onSyncError(this.selectedElement.locationName)
        }

      }

    }
  }

  // DELETE ELEMENT
  onElementDelete = async() => {
    this.showDetails = false
    if(this.selectedElement.productName){
      this.locationsService.elements.forEach((el: locationParentNode)=>{
        this.locationsService.deleteRecNested(el, 'products', this.selectedElement)
      })
      const responseDelProd = await this.hwAPI.fetch({
        query: `
        mutation deleteProd($id: ID!){
          deleteProduct(id: $id){
              deleted
          }
        }
        `,
        variables: {
          id: this.selectedElement.id
        }
      })
    } else if(this.selectedElement.locationName){
      this.locationsService.elements.forEach((el: locationParentNode)=>{
        this.locationsService.deleteRecNested(el, 'childrens', this.selectedElement)
      })
      const responseDelLoc = await this.hwAPI.fetch({
        query: `
        mutation deleteLoc($id: ID!){
          deleteLocation(id: $id){
              deleted
          }
        }
        `,
        variables: {
          id: this.selectedElement.id
        }
      })
    } else if(this.selectedElement.customColumnName) {
      this.customColumnsService.customColumns = this.customColumnsService.customColumns.filter((column: customColumnParentNode)=>{
        return column.node.id !== this.selectedElement.id
      })
      const responseDelCustomColumn = await this.hwAPI.fetch({
        query: `
        mutation deleteCustomColumn($id: ID!){
          deleteCustomColumn(id: $id){
              deleted
          }
        }
        `,
        variables: {
          id: this.selectedElement.id
        }
      })
    }
  }

  onNewElementInitEvent(elementType: string, parentId?: string, parentName?: string){
    this.onNewElementInit({elementType, parentId, parentName})
  }

  // CREATE ELEMENT
  onNewElementInit = async(config: {elementType: string, parentId?: string, parentName?: string}) => {
    this.showColumnsManage = false
    config.parentName ? this.parentLocationName = config.parentName : this.parentLocationName = undefined;
    if(config.elementType === 'location'){
      this.selectedElement = {
        parent: config.parentId,
        locationName: '',
        description: '',
        childrens: {
          edges: []
        },
        products: {
          edges: []
        },
        customColumns: {
          edges: []
        }
      }
      if(!config.parentId){
        this.selectedElement.root = true
        delete this.selectedElement.parent
      }
    } else if(config.elementType === 'product'){
      this.selectedElement = {
        parent: config.parentId,
        productName: '',
        description: '',
        customColumns: {
          edges: []
        }
      }
    } else if(config.elementType==='customColumn'){
      this.selectedElement = {
        index: this.customColumnsService.customColumns.length,
        customColumnName: "",
        elementsAllowed: [],
        dataType: "",
      }
    }

    this.selectedElementChange.emit(this.selectedElement)
    this.isCreatingNewElement = true
    this.showDetails = true
  }

  // SAVE ELEMENTS
  onNewElementSave = async() => {
    if(this.selectedElement.customColumnName){
      const {show, ...customColumn } = this.selectedElement
      const {id, selectedElement} = await this.customColumnsService.saveNewCustomColumnAPI(this.selectedElement, {...customColumn})
      this.selectedElement = selectedElement
      this.selectedElementChange.emit(this.selectedElement)
      this.customColumnsService.customColumns.push({node: {id: id,...customColumn, show: true}})
      return
    }

    // Prepare element custom column
    const customColumnsArr = this.selectedElement.customColumns.edges.map((parentNode: customColumnValueParentNode)=>{
      return {
        customColumn: parentNode.node.customColumn.id,
        value: parentNode.node.value
      }
    })

    if(this.selectedElement.productName){
      // If element is product
      this.locationsService.elements.forEach((parentNode)=> {
        this.locationsService.updateRecNested(parentNode.node, 'products', this.selectedElement, this.selectedElement.parent)
      })
      const { parent, customColumns, ...productDet } = this.selectedElement
      await this.locationsService.saveNewProductAPI(this.selectedElement, {...productDet, customColumns: customColumnsArr})

    }
    else if(this.selectedElement.locationName) {

        if(this.selectedElement.parent){
          // foreach root
          this.locationsService.elements.forEach((parentNode)=> {
            this.locationsService.updateRecNested(parentNode.node, 'childrens', this.selectedElement, this.selectedElement.parent)
          })
        } else {
          this.locationsService.elements.push({node: this.selectedElement})
        }

        const {parent, childrens, products, customColumns, ...locationDet } = this.selectedElement
        await this.locationsService.saveNewLocationAPI(this.selectedElement, {...locationDet, customColumns: customColumnsArr})
    }
    this.isCreatingNewElement = false
  }


  // Show Custom Columns Values for element
  showCC = () => {
      let elementType: "PRODUCTS" | "LOCATIONS";
      if(this.selectedElement.hasOwnProperty('productName')){
        elementType = 'PRODUCTS'
      } else {
        elementType = 'LOCATIONS'
      }
     const res = this.customColumnsService.customColumns.find((el: customColumnParentNode) => el.node.elementsAllowed.includes(elementType))
     return res
  }

  // CREATE CC VALUE
  addCustomColumnValue() {
    if(!this.selectedElement.values){
      this.selectedElement.values = [""]
    } else {
      this.selectedElement.values.push("")
    }
    this.selectedElementChange.emit(this.selectedElement)

    console.log(this.selectedElement)
  }

  trackForCCvalues(index: number, item: any) {
    return index;
  }

  // REMOVE CC VALUE
  removeCustomColumnValue(i: number){
    this.selectedElement.values.splice(i, 1)
    this.selectedElementChange.emit(this.selectedElement)
  }

  // Drag N Drop CC
  drop(event: CdkDragDrop<customColumnParentNode[]>) {
    moveItemInArray(this.customColumnsService.customColumns, event.previousIndex, event.currentIndex);
    this.customColumnsService.updateCustomColumnsIndexesAPI()
  }

  ngOnInit(): void {
    this.locationsService.queryLocations(this.rootLocationId);
    this.customColumnsService.queryCustomColumns();
  }

}
