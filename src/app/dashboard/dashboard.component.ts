import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { apiFetch } from 'src/common/api/api';
// import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop"

interface sync {
  status: 'synced' | 'pending' | 'error',
  text: string
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  synchronization: sync = {
    status: "synced",
    text: "Everything is up to date."
  }
  showDetails: boolean = false;
  showColumnsManage: boolean = false;
  @Input() selectedElement: any;
  @Output() selectedElementChange = new EventEmitter();
  elements!: any[];
  customColumns!: any[];
  parentLocationName: string | undefined = "";
  isCreatingNewElement: boolean = false;
  searchingIn: any;
  customColumnDataTypes = ['text', 'number', 'date']
  constructor() {}


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


  //
  // START QUERIES
  //
  queryCustomColumns = async() => {
    const response = await apiFetch({
      query: `
      query listCustomColumns{
        customColumnsList{
          edges{
            node{
              id
              name
              dataType
              elementsAllowed
            }
          }
        }
      }`
    })
    this.customColumns = response.data.data.customColumnsList.edges.map((parentNode: any)=>{
      return {node: {...parentNode.node, show: true}}
    })
  }

  queryLocationsProducts = async() => {
    const response = await apiFetch({
      query: `
      fragment locationFields on Location{
        id
        locationName
        description
        customColumns{
          edges{
            node{
              customColumn{
                id
              }
              value
            }
          }
        }
        products{
          edges{
            node{
              id
              productName
              description
              customColumns{
                edges{
                  node{
                    customColumn{
                      id
                    }
                    value
                  }
                }
              }
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




  //
  // CUSTOM COLUMNS
  //
  findCustomColumnValue = (customId: string, customValues: any) => {
    const value: any =  customValues.find((parentNode: any)=> {
       if (parentNode.node.customColumn.id === customId){
         return parentNode.node.value
       }
    })
    if(value){
      return value.node.value
    } else {
      return null
    }
  }

  findCustomColumnModel = (customId: string) => {
    if(this.selectedElement.customColumns){
      if(this.selectedElement.customColumns.edges){
        const value = this.selectedElement.customColumns.edges.find((parentNode:any)=>{
          return parentNode.node.customColumn.id === customId
        })
        if(value){
          return value.node.value
        }
      }
    }
    return ""
  }

  updateCustomColumnModel = async(columnModelNode?: any, event?: any) => {
    if(!this.selectedElement.customColumns){
      this.selectedElement.customColumns.edges = [
        {node:{
          customColumn: {
            id: columnModelNode.id,
            name: columnModelNode.name
          },
          value: event
        }}
      ]
      this.selectedElementChange.emit(this.selectedElement)
    }

      const value = this.selectedElement.customColumns.edges.find((parentNode:any)=>{
        return parentNode.node.customColumn.id === columnModelNode.id
      })
      if(value){
        value.node.value = event
      } else {
        this.selectedElement.customColumns.edges.push({node:{
          customColumn: {
            id: columnModelNode.id,
            name: columnModelNode.name
          },
          value: event
        }})
      }
    this.selectedElementChange.emit(this.selectedElement)
  }




  //
  // RECURSIVE FUNCTIONS
  //

  updateRecNested = (subType: string, element: any, parentId: string) => {
    if(this.searchingIn.id === parentId){
      if(this.searchingIn[subType].edges){
        this.searchingIn[subType].edges.push({node: element})
      } else {
        this.searchingIn[subType].edges = [{node: element}]
      }
      return
    }
    if(this.searchingIn.childrens){
      this.searchingIn.childrens.edges.forEach((parentNode: any)=>{
        if(parentNode.node){
          this.searchingIn = parentNode.node
          this.updateRecNested(subType, element, parentId)
        }
    })
    }
  }


  deleteRecNested = (subType: string) => {
    if(subType==='childrens'){
      if(this.searchingIn.node === this.selectedElement){
        delete this.searchingIn.node
        return true
      } else {
        if(this.searchingIn.node){
          if(this.searchingIn.node.childrens.edges){
            for (let parentNode of this.searchingIn.node.childrens.edges){
              this.searchingIn = parentNode
              this.deleteRecNested(subType)
            }
          }
        }
      }
    }
    if (subType==='products'){
        this.searchingIn.node.products.edges = this.searchingIn.node.products.edges.filter((parentNode: any) => parentNode.node !== this.selectedElement)
        if(this.searchingIn.node.childrens){
          for (let parentNode of this.searchingIn.node.childrens.edges){
            this.searchingIn = parentNode
            this.deleteRecNested(subType)
        }
      }
    }
    return false
  }



  // SELECT ELEMENT
  onElementSelect = (element: any, parentName?: string) => {
    this.parentLocationName = parentName
    this.showColumnsManage = false
    this.isCreatingNewElement = false
    this.showDetails = true;
    this.selectedElement = element
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
      if(!this.selectedElement.name){
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
      const responseUpdate = await apiFetch({
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

      } else if(this.selectedElement.locationName){

        // If element is location
        this.startSync(this.selectedElement.locationName)
        const { customColumns, childrens, id, products, ...locationDet } = this.selectedElement

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

      } else if(this.selectedElement.name){
        // If element is cutomColumn
        this.startSync(this.selectedElement.name)
        const { id, show, ...customColumnDetails } = this.selectedElement
        const responseUpdate = await apiFetch({
          query: `
            mutation modCustomColumn($id: String!, $customColumnDetails: CustomColumnInput!){
              modifyCustomColumn(id:$id, customColumnDetails: $customColumnDetails){
                modified
              }
            }
            `,
            variables: {
              id: this.selectedElement.id,
              customColumnDetails: customColumnDetails
            }
        })
        if(responseUpdate.status === 200){
          if(responseUpdate.data.data.modifyCustomColumn.modified){
            this.onSyncSuccess()
          }
        } else {
          this.onSyncError(this.selectedElement.name)
        }
      }
    }
  }

  // DELETE ELEMENT
  onElementDelete = async() => {
    this.showDetails = false
    this.searchingIn = this.elements[0]
    if(this.selectedElement.productName){
      this.deleteRecNested('products')
      const responseDelProd = await apiFetch({
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
    } else if(this.selectedElement.childrens){
      this.deleteRecNested('childrens')
      const responseDelLoc = await apiFetch({
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
    } else if(this.selectedElement.name) {
      this.customColumns = this.customColumns.filter((column: any)=>{
        return column.node.id !== this.selectedElement.id
      })
      const responseDelCustomColumn = await apiFetch({
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

  // CREATE ELEMENT
  onNewElementInit = async(elementType: string, parentId?: string, parentName?: string) => {
    this.showColumnsManage = false
    parentName ? this.parentLocationName = parentName : this.parentLocationName = undefined;
    if(elementType === 'location'){
      this.selectedElement = {
        parent: parentId,
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
      if(!parentId){
        this.selectedElement.root = true
        delete this.selectedElement.parent
      }
    } else if(elementType === 'product'){
      this.selectedElement = {
        parent: parentId,
        productName: '',
        description: '',
        customColumns: {
          edges: []
        }
      }
    } else if(elementType==='customColumn'){
      this.selectedElement = {
        name: "",
        elementsAllowed: [],
        dataType: ""
      }
    }

    this.selectedElementChange.emit(this.selectedElement)
    this.isCreatingNewElement = true
    this.showDetails = true
  }



  // SAVE ELEMENTS
  onNewElementSave = async() => {
    if(this.selectedElement.name){
      const { show, ...customColumn } = this.selectedElement
      const colId = await this.saveNewCustomColumnAPI({...customColumn})
      this.customColumns.push({node: {id: colId,...customColumn}})
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
      this.elements.forEach((parentNode)=> {
        this.searchingIn = parentNode.node
        this.updateRecNested('products', this.selectedElement, this.selectedElement.parent)
      })
      const { parent, customColumns, ...productDet } = this.selectedElement
      await this.saveNewProductAPI({...productDet, customColumns: customColumnsArr})

    } else if(this.selectedElement.locationName) {

        if(this.selectedElement.parent){
          // foreach root
          this.elements.forEach((parentNode)=> {
            this.searchingIn = parentNode.node
            this.updateRecNested('childrens', this.selectedElement, this.selectedElement.parent)
          })
        } else {
          this.elements.push({node: this.selectedElement})
        }

        const { parent, childrens, products, customColumns, ...locationDet } = this.selectedElement
        await this.saveNewSubLocationAPI({...locationDet, customColumns: customColumnsArr})
      }
    this.isCreatingNewElement = false
  }



// API CALLS
  saveNewProductAPI = async(productDetails: any) => {

    // Create product
    const responseProduct = await apiFetch({
      query: `
      mutation createProd($productDetails: ProductInput!){
        createProduct(productDetails: $productDetails){
          product{
            id
          }
        }
      }
      `,
      variables: {
        productDetails: productDetails
      }
    })


    // Update parent location
    const responseParent = await apiFetch({
      query: `
      mutation modLocation($parent_id: String!, $product_id: ID!){
        modifyLocation(id:$parent_id, locationDetails: {products: [$product_id]}){
          modified
        }
      }
      `,
      variables: {
        parent_id: this.selectedElement.parent,
        product_id: responseProduct.data.data.createProduct.product.id
      }
    })
    delete this.selectedElement.parent

    // Update ID
    this.selectedElement.id = responseProduct.data.data.createProduct.product.id
    this.selectedElementChange.emit(this.selectedElement);
  }

  saveNewSubLocationAPI = async(locationDetails: any) => {
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
            locationDetails: locationDetails
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

  saveNewCustomColumnAPI = async(customColumnDetails: any) => {
    // Create product
    const responseCustomColumn = await apiFetch({
      query: `
      mutation createCustomColumn($customColumnDetails: CustomColumnInput!){
        createCustomColumn(customColumnDetails: $customColumnDetails){
          customColumn{
            id
          }
        }
      }
      `,
      variables: {
        customColumnDetails: customColumnDetails
      }
    })
    // Update ID
    this.selectedElement.id = responseCustomColumn.data.data.createCustomColumn.customColumn.id
    this.selectedElementChange.emit(this.selectedElement);
    return responseCustomColumn.data.data.createCustomColumn.customColumn.id
  }

  ngOnInit(): void {
    this.queryLocationsProducts();
    this.queryCustomColumns();
  }
}
