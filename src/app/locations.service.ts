import { apiFetch } from 'src/common/api/api';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  elements!: any[];


  queryLocations = async(rootLocationId: string | null) => {

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


  // Recursive functions
  updateRecNested = (searchingIn:any, subType: string, element: any, parentId: string) => {
    if(searchingIn.id === parentId){
      if(searchingIn[subType].edges){
        searchingIn[subType].edges.push({node: element})
      } else {
        searchingIn[subType].edges = [{node: element}]
      }
      return
    }
    if(searchingIn.childrens){
      searchingIn.childrens.edges.forEach((parentNode: any)=>{
        if(parentNode.node){
          searchingIn = parentNode.node
          this.updateRecNested(searchingIn, subType, element, parentId)
        }
    })
    }
  }

  deleteRecNested = (searchingIn:any, selectedElement:any, subType: string) => {
    if(subType==='childrens'){
      if(searchingIn.node === selectedElement){
        delete searchingIn.node
        return true
      } else {
        if(searchingIn.node){
          if(searchingIn.node.childrens.edges){
            for (let parentNode of searchingIn.node.childrens.edges){
              searchingIn = parentNode
              this.deleteRecNested(searchingIn, selectedElement, subType)
            }
          }
        }
      }
    }
    if (subType==='products'){
        searchingIn.node.products.edges = searchingIn.node.products.edges.filter((parentNode: any) => parentNode.node !== selectedElement)
        if(searchingIn.node.childrens){
          for (let parentNode of searchingIn.node.childrens.edges){
            searchingIn = parentNode
            this.deleteRecNested(searchingIn, selectedElement, subType)
        }
      }
    }
    return false
  }



  // API calls
  saveNewProductAPI = async(selectedElement:any, productDetails: any) => {

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
        parent_id: selectedElement.parent,
        product_id: responseProduct.data.data.createProduct.product.id
      }
    })
    delete selectedElement.parent

    // Update ID
    selectedElement.id = responseProduct.data.data.createProduct.product.id
  }

  saveNewSubLocationAPI = async(selectedElement:any, locationDetails: any) => {
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


        if(selectedElement.parent){
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
              parent_id: selectedElement.parent,
              child_id: responseSub.data.data.createLocation.location.id
            }
          })
        }
        delete selectedElement.parent

        // Update ID
        selectedElement.id = responseSub.data.data.createLocation.location.id
  }
}
