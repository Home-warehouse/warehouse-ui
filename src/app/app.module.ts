import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { HomePageComponent } from './home-page/home-page.component';
import { AccountComponent } from './account/account.component';
import { RaportComponent } from './raport/raport.component';
import { RaportsListComponent } from './raports-list/raports-list.component';
import { LocationsTableComponent } from './locations-manager/locations-table/locations-table.component';
import { RaportFormComponent } from './raport-form/raport-form.component';
import { LocationsManagerComponent } from './locations-manager/locations-manager.component';
import { RaportDisplayComponent } from './raport-display/raport-display.component';
import { AutomatizationsListComponent } from './automatizations-list/automatizations-list.component';
import { AutomatizationFormComponent } from './automatization-form/automatization-form.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { UserManagingComponent } from './user-managing/user-managing.component';
import { AddUserComponent } from './user-managing/add-user/add-user.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    NotificationsComponent,
    HomePageComponent,
    AccountComponent,
    RaportComponent,
    RaportsListComponent,
    LocationsTableComponent,
    RaportFormComponent,
    LocationsManagerComponent,
    RaportDisplayComponent,
    AutomatizationsListComponent,
    AutomatizationFormComponent,
    ActivateAccountComponent,
    UserManagingComponent,
    AddUserComponent,
  ],
  imports: [
    DragDropModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
