import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HotkeyModule } from "angular2-hotkeys";
import { SimpleNotificationsModule } from 'angular2-notifications';
import { DropdownModule } from 'primeng/dropdown';

import { LayoutModule } from "../../../containers/layout/layout.module";
import { SalesComponent } from "./sales.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ApiService } from "../../../data/api.service";
import { SalesRoutingModule } from "./sales.routing";
import { PdvComponent } from "./pdv/pdv.component";
import { ListComponent } from "./list/list.component";
import { ComponentsModule } from "../../../components/components.module";
import { SalesService } from "../../../data/sales.service";
import { BalanceService } from "../../../data/balance.service";

@NgModule({
  declarations: [
    SalesComponent,
    PdvComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    LayoutModule,
    FormsModule,
    ComponentsModule,
    ReactiveFormsModule,
    HotkeyModule.forRoot(),
    SimpleNotificationsModule.forRoot(),
    DropdownModule
  ],
  providers: [ApiService, SalesService, BalanceService],
})
export class SalesModule { }
