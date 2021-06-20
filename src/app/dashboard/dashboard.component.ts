import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { apiFetch } from 'src/common/api/api';
// import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop"


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
  isCreatingNewElement: boolean = false;
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


  updateRecNested = (subType: string, element: any, parentId: string) => {
    if(this.searchingIn.id === parentId){
      // console.log('Found in root!')
      if(this.searchingIn[subType].edges){
        this.searchingIn[subType].edges.push({node: element})
      } else {
        this.searchingIn[subType].edges = [{node: element}]
      }
      return
    }
    this.searchingIn.childrens.edges.forEach((parentNode: any)=>{
        if(parentNode.node){
          this.searchingIn = parentNode.node
          this.updateRecNested(subType, element, parentId)
        }
    })
  }


  deleteRecNested = (subType: string) => {
    // console.log('Lokkin at', this.searchingIn)
    if(subType==='childrens'){
      if(this.searchingIn.node === this.selectedElement){
        console.log('Deleteing', this.searchingIn.node)
        delete this.searchingIn.node
        return true
      } else {
        if(this.searchingIn.node){
          for (let parentNode of this.searchingIn.node.childrens.edges){
            this.searchingIn = parentNode
            this.deleteRecNested(subType)
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


  // Selection
  onElementSelect = (element: any) => {
    this.isCreatingNewElement = false
    this.showDetails = true;
    // console.log(element)
    this.selectedElement = element
    this.selectedElementChange.emit(this.selectedElement)
  }



  // Update
  onElementUpdate = async() => {
    if(this.selectedElement.productName){
      const { id, ...productDet } = this.selectedElement
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
        productDetails: productDet
      }
    })
    } else {
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

  // Delete
  onElementDelete = async() => {
    // console.log(this.elements)
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
    } else {
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
    }
  }

  // Create
  onNewElementInit = async(elementType: string, parentId?: string) => {
    if(elementType === 'location'){
      this.selectedElement = {
        parent: parentId,
        locationName: '',
        childrens: {
          edges: []
        }
      }
      if(!parentId){
        this.selectedElement.root = true
        delete this.selectedElement.parent
      }
      console.log("creating new element:", this.selectedElement)
      this.selectedElementChange.emit(this.selectedElement)
    }
    if(elementType === 'product'){
      this.selectedElement = {
        parent: parentId,
        productName: '',
      }
      this.selectedElementChange.emit(this.selectedElement)
    }
    this.isCreatingNewElement = true
    this.showDetails = true
  }



  // Save through API
  onNewElementSave = async() => {
    if(this.selectedElement.productName){
      // If element is product
      this.elements.forEach((parentNode)=> {
        this.searchingIn = parentNode.node
        this.updateRecNested('products', this.selectedElement, this.selectedElement.parent)
      })
      const { parent, ...productDet } = this.selectedElement
      await this.saveNewProductAPI(productDet)

      } else {
        // console.log('loookinn for loc with id ', this.selectedElement.parent)
        if(this.selectedElement.parent){
          // foreach root
          this.elements.forEach((parentNode)=> {
            this.searchingIn = parentNode.node
            this.updateRecNested('childrens', this.selectedElement, this.selectedElement.parent)
          })
        } else {
          this.elements.push({node: this.selectedElement})
        }

        const { parent, childrens, ...locationDet } = this.selectedElement
        await this.saveNewSubLocationAPI(locationDet)
      }
    this.isCreatingNewElement = false
  }




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

    console.log(responseProduct)
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
        console.log("Saving new location", this.selectedElement)
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

  ngOnInit(): void {
    this.queryLocationsProducts();
  }
}
