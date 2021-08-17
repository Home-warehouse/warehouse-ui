import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { hwAPI } from 'src/common/api/api';
import { CustomColumnsService } from '../custom-columns.service';
import { LocationsService } from '../locations.service';

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

  parentLocationName: string | undefined = "";
  customColumnDataTypes = ['text', 'number', 'date', 'select']

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
    if(this.selectedElement.id){
      let customColumnsArr
      if(!this.selectedElement.customColumnName){
        customColumnsArr = this.selectedElement.customColumns.edges.map((parentNode:any)=>{
          return {
            customColumn: parentNode.node.customColumn.id,
            value: parentNode.node.value
          }
        })
      }
      if(this.selectedElement.productName){
      this.startSync(this.selectedElement.productName)

      const { id, customColumns, ...productDet } = this.selectedElement
      // If element is product
      const responseUpdate = await this.hwAPI.fetch({
        query: `
        mutation modProduct($id: String!, $productDetails: ProductInput!){
          modifyProduct(id:$id, productDetails: $productDetails){
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
        const { customColumns, childrens, id, products, ...locationDet } = this.selectedElement

        const responseUpdate = await this.hwAPI.fetch({
          query: `
          mutation modLocation($id: String!, $locationDetails: LocationInput!){
            modifyLocation(id:$id, locationDetails: $locationDetails){
              modified
            }
          }
          `,
          variables: {
            id: this.selectedElement.id,
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
      else if(this.selectedElement.customColumnName){
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
      }
    }
  }

  // DELETE ELEMENT
  onElementDelete = async() => {
    this.showDetails = false
    if(this.selectedElement.productName){
      this.locationsService.elements.forEach((el: any)=>{
        this.locationsService.deleteRecNested(el, this.selectedElement, 'products')
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
      this.locationsService.elements.forEach((el: any)=>{
        this.locationsService.deleteRecNested(el, this.selectedElement, 'childrens')
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
      this.customColumnsService.customColumns = this.customColumnsService.customColumns.filter((column: any)=>{
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
    // Custom Columns
    if(this.selectedElement.customColumnName){
      const {show, ...customColumn } = this.selectedElement
      const {id, selectedElement} = await this.customColumnsService.saveNewCustomColumnAPI(this.selectedElement, {...customColumn})
      this.selectedElement = selectedElement
      this.selectedElementChange.emit(this.selectedElement)
      this.customColumnsService.customColumns.push({node: {id: id,...customColumn, show: true}})
      return
    }

    const customColumnsArr = this.selectedElement.customColumns.edges.map((parentNode:any)=>{
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

    } else if(this.selectedElement.locationName) {

        if(this.selectedElement.parent){
          // foreach root
          this.locationsService.elements.forEach((parentNode)=> {
            this.locationsService.updateRecNested(parentNode.node, 'childrens', this.selectedElement, this.selectedElement.parent)
          })
        } else {
          this.locationsService.elements.push({node: this.selectedElement})
        }

        const { parent, childrens, products, customColumns, ...locationDet } = this.selectedElement
        await this.locationsService.saveNewSubLocationAPI(this.selectedElement, {...locationDet, customColumns: customColumnsArr})
      }
    this.isCreatingNewElement = false
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

  trackByFn(index: number, item: any) {
    return index;
  }

  // REMOVE CC VALUE
  removeCustomColumnValue(i: number){
    this.selectedElement.values.splice(i, 1)
    this.selectedElementChange.emit(this.selectedElement)
  }

  // Drag N Drop CC
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.customColumnsService.customColumns, event.previousIndex, event.currentIndex);
    this.customColumnsService.updateCustomColumnsIndexes()
  }

  ngOnInit(): void {
    this.locationsService.queryLocations(this.rootLocationId);
    this.customColumnsService.queryCustomColumns();
  }

}
