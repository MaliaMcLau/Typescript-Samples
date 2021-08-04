import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Tab } from 'app/action-admin/classes/generic_admin';
import { ActivatedRoute } from '@angular/router';
import { RedactedService } from 'app/action-admin/services/redacted.service';
import { RedactedTwoService } from 'app/action-admin/services/redacted2.service';
import { RedactedThreeService } from 'app/action-admin/services/redacted3.service';
import { convertTypeToPlural } from 'app/action-admin/generic-admin/helpers';

@Component({
  selector: 'app-admin-tabs',
  templateUrl: './admin-tabs.component.html',
  styleUrls: ['./admin-tabs.component.scss']
})
export class AdminTabsComponent implements OnInit {

  @Output() tabStatus = new EventEmitter();
  actionType: string;
  bindingType: string;
  actionID: string;
  subTitle = '';
  serviceList = {};
  isForm = false;
  convertToPlural: Function = convertTypeToPlural;
  tabs: Tab[] = [
    { label: 'Redacted1', link: './redacted1', status: 'redacted1' },
    { label: 'Redacted2', link: './redacted2', status: 'redacted2' },
    { label: 'Redacted3', link: './redacted3', status: 'redacted3' },
    { label: 'Redacted4', link: './redacted4', status: 'redacted4' },
  ];

  redactedTabs: Tab[] = [
    { label: 'Redacted5', link: './redacted5', status: 'redacted5', },
    { label: 'Redacted6', link: './redacted6', status: 'redacted6' }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private redactedService: RedactedService,
    private redactedTwoService: RedactedTwoService,
    private redactedThreeService: RedactedThreeService
    ) {
        this.serviceList = {
          'redacted1': this.redactedService,
          'redacted2': this.redactedTwoService,
          'redacted3': this.redactedThreeeService
        }
      };

  ngOnInit() {

    this.activatedRoute.url
      .subscribe(
        data => {
          if ( data[0] ) {
            this.isForm = data[0]['path'] === 'edit'
          }
        }
      )

    this.activatedRoute.data
      .subscribe(
        data => this.actionType = data['type']
      );

    this.activatedRoute.paramMap
      .subscribe(
        params => {
          this.actionID = params.get('id');
          this.bindingType = params.get('type');

          if ( this.actionID && this.actionType === 'redacted' && this.bindingType == null ) {
            this.tabs = this.redactedTabs;
          }

        }
      );

      if (this.actionID && this.actionType && this.bindingType) {
        this.serviceList[this.actionType].getItemById( this.bindingType, this.actionID )
          .subscribe(
            data => this.subTitle = 'for '
            + this.bindingType.replace(this.bindingType[0], this.bindingType[0].toUpperCase())
            + ' \"' + data.title + '\"',
            error => console.error(error)
          );
      }
  }

  tabChange(tab) {
    if (this.actionType === 'redacted') {
      this.tabStatus.emit(tab);
    }
  }

}
