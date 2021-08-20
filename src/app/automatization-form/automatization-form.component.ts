import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { hwAPI } from 'src/common/api/api';
import getFormAsDict from 'src/common/form';
import { NotificationsSharedService } from '../notifications/notifications.sharedService';

import { environment } from 'src/environments/environment';
const integrations = environment.intergrations;

@Component({
  selector: 'app-automatization-form',
  templateUrl: './automatization-form.component.html',
  styleUrls: ['./automatization-form.component.scss']
})
export class AutomatizationFormComponent implements OnInit {
  @Input() elementType!: string
  @Input() elementID!: string
  @Output() hideModal = new EventEmitter()

  AutomatizationForm: FormGroup;
  apps: string[] = []
  configs = {
    evernote: [
      {
        name: "noteType",
        readableName: "Note Type",
        type: "select",
        values: ["NOTE", "TODO"]
      },
      {
        name: "noteTitle",
        readableName: "Note Title",
        type: "text"
      }
    ]
  }
  elementsMonitoredRaw = ["PRODUCT", "LOCATION", "CUSTOM_COLUMN"]

  constructor(
    private fb: FormBuilder,
    private notifications: NotificationsSharedService,
    private hwAPI: hwAPI
  ) {
    this.AutomatizationForm = this.fb.group({
      app: this.fb.control(this.apps[0], [Validators.required]),
      automatizationName: this.fb.control('', [Validators.required]),
      elementsMonitored: this.fb.array(this.elementsMonitoredRaw.map(el => {
        return this.fb.control(false, [Validators.required]);
      }))
    });
  }

  get config():FormGroup{
    return <FormGroup>this.AutomatizationForm.get('config')
  }

  get elementsMonitored(): FormArray{
    return <FormArray>this.AutomatizationForm.get('elementsMonitored')
  }


  onChangeApp = () => {
    const app = this.AutomatizationForm.get('app')?.value
    if(app==='EVERNOTE'){
      this.AutomatizationForm.addControl('config', this.fb.group(
        this.buildSettingsGroup(this.configs.evernote)
      ))
    }
  }

  buildSettingsGroup = (config: any) => {
    let obj:any = {}
    config.forEach((el: any) => {
      obj[el.name] = this.fb.control('', [Validators.required]);
    })
    return obj
  }

  onAutomatizationSubmit = async() => {
    let formDict = getFormAsDict(this.AutomatizationForm)

    let elementsMonitored:string[] = []
    formDict.elementsMonitored.forEach((el: Boolean, index: number) => {
      if(el){
        elementsMonitored.push(this.elementsMonitoredRaw[index])
      }
    })
    formDict.elementsMonitored = elementsMonitored
    formDict.config = JSON.stringify(formDict.config)

    formDict.elementIntegrated = {
      elementType: this.elementType,
      elementID: this.elementID
    }
    const response = await this.hwAPI.fetch({
      query: `mutation createAccount($automatizationDetails: CreatingAutomatizationInput!){
        createAutomatization(automatizationDetails: $automatizationDetails){
          automatization {
            id
          }
        }
      }`,
      variables: {automatizationDetails: formDict}
    })
    if(response.data?.data?.createAutomatization?.automatization?.id){
      this.notifications.sendOpenNotificationEvent({
        message: `Created automatization successfully`,
         type: 'SUCCESS'
      });
      this.hideModal.emit()
    } else {
      this.notifications.sendOpenNotificationEvent({
        message: `Could not create automatization - try again or ask administrator for further help`,
         type: 'ERROR'
      });
    }
  }

  typedKeys<T>(o: T): (keyof T)[] {
    return Object.keys(o) as (keyof T)[];
  }

  ngOnInit(): void {
    integrations.forEach((el: {name: string, integrated: boolean})=>{
      if(el.integrated){
        this.apps.push(el.name)
      }
    })
    this.onChangeApp()
  }

}
