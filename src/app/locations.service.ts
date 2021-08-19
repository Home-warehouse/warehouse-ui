import { hwAPI } from 'src/common/api/api';
import { Injectable } from '@angular/core';
import { customColumnParentNode } from './custom-columns.service';



interface product {
  id: string
  productName: string
  description: string
  icon: string
  customColumns: {
    edges: customColumnParentNode[]
  }
}

interface productParentNode {
  node: product
}

interface location {
  parent?: string
  id: string
  root: boolean
  locationName: string
  products: {
    edges: productParentNode[]
  }
  childrens: {
    edges: locationParentNode[]
  }
  custom_columns: {
   edges: customColumnParentNode[]
  }
}

export interface locationParentNode {
  node: location
}



@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  elements: locationParentNode[] = [];

  constructor(
    private hwAPI: hwAPI
  ) { }

  queryLocations = async(rootLocationId: string | null) => {

    const response = await this.hwAPI.fetch({
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
        locationsList(${rootLocationId === null ? "root_Exact: true" : ""}){
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


  // Recursive functions for locations and products
  updateRecNested = (searchingIn:any, subType: "products" | "childrens", element: location | product, parentId: string) => {
    if(searchingIn.id === parentId){
      if(searchingIn[subType].edges){
        searchingIn[subType].edges.push({node: element})
      } else {
        searchingIn[subType].edges = [{node: element}]
      }
      return
    }
    if(searchingIn.childrens?.edges){
      searchingIn.childrens.edges.forEach((parentNode: any)=>{
        if(parentNode.node){
          searchingIn = parentNode.node
          this.updateRecNested(searchingIn, subType, element, parentId)
        }
    })
    }
  }

  deleteRecNested = (searchingIn:any, subType: "products" | "childrens", selectedElement: location | product) => {
    if(subType==='childrens'){
      if(searchingIn.node === selectedElement){
        delete searchingIn.node
        return true
      } else {
        if(searchingIn.node?.childrens?.edges){
          for (let parentNode of searchingIn.node.childrens.edges){
            searchingIn = parentNode
            this.deleteRecNested(searchingIn, subType, selectedElement)
          }
        }
      }
    }
    if (subType==='products'){
        searchingIn.node.products.edges = searchingIn.node.products.edges.filter((parentNode: any) => parentNode.node !== selectedElement)
        if(searchingIn.node.childrens){
          for (let parentNode of searchingIn.node.childrens.edges){
            searchingIn = parentNode
            this.deleteRecNested(searchingIn, subType, selectedElement)
        }
      }
    }
    return false
  }



  // API calls
  saveNewProductAPI = async(selectedElement: location, productDetails: product) => {

    // Create product
    const responseProduct = await this.hwAPI.fetch({
      query: `
      mutation createProd($productDetails: CreatingProductInput!){
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
    const responseParent = await this.hwAPI.fetch({
      query: `
      mutation modLocation($parent_id: ID!, $product_id: ID!){
        modifyLocation(locationDetails: {id:$parent_id, products: [$product_id]}){
          modified
        }
      }
      `,
      variables: {
        parent_id: selectedElement.parent,
        product_id: responseProduct.data.data.createProduct.product.id
      }
    })
    delete selectedElement.parent

    // Update ID
    selectedElement.id = responseProduct.data.data.createProduct.product.id
  }

  saveNewLocationAPI = async(selectedElement: location, locationDetails: location) => {
      const response = await this.hwAPI.fetch({
          query: `
          mutation createLoc($locationDetails: CreatingLocationInput!){
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


          // If created location has parent -> update parent location
        if(selectedElement.parent){
          const responseParent = await this.hwAPI.fetch({
            query: `
            mutation modLocation($parent_id: ID!, $child_id: ID!){
              modifyLocation(locationDetails: {id: $parent_id, childrens: [$child_id]}){
                modified
              }
            }
            `,
            variables: {
              parent_id: selectedElement.parent,
              child_id: response.data.data.createLocation.location.id
            }
          })
        }
        delete selectedElement.parent

        // Update ID
        selectedElement.id = response.data.data.createLocation.location.id
  }
}
