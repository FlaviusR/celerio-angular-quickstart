//
// Source code generated by Celerio, a Jaxio product.
// Documentation: http://www.jaxio.com/documentation/celerio/
// Follow us on twitter: @jaxiosoft
// Need commercial support ? Contact us: info@jaxio.com
// Template pack-angular:web/src/app/entities/entity-list.component.ts.e.vm
//
import { Component, Input, Output, OnChanges, EventEmitter, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DataTable, LazyLoadEvent } from 'primeng/primeng';
import { PageResponse } from "../../support/paging";
import { MessageService } from '../../service/message.service';
import { MdDialog } from '@angular/material';
import { ConfirmDeleteDialogComponent } from "../../support/confirm-delete-dialog.component";
import { Passport } from './passport';
import { PassportDetailComponent } from './passport-detail.component';
import { PassportService } from './passport.service';
import { User } from '../user/user';
import { UserLineComponent } from '../user/user-line.component';

@Component({
    moduleId: module.id,
	templateUrl: 'passport-list.component.html',
	selector: 'passport-list'
})
export class PassportListComponent {

    @Input() header = "Passports...";

    // When 'sub' is true, it means this list is used as a one-to-many list.
    // It belongs to a parent entity, as a result the addNew operation
    // must prefill the parent entity. The prefill is not done here, instead we
    // emit an event.
    // When 'sub' is false, we display basic search criterias
    @Input() sub : boolean;
    @Output() onAddNewClicked = new EventEmitter();

    passportToDelete : Passport;

    // basic search criterias (visible if not in 'sub' mode)
    example : Passport = new Passport();

    // list is paginated
    currentPage : PageResponse<Passport> = new PageResponse<Passport>(0,0,[]);

    // X to one: input param is used to filter the list when displayed
    // as a one-to-many list by the other side.
    private _holder : User;

    constructor(private router : Router,
        private passportService : PassportService,
        private messageService : MessageService,
        private confirmDeleteDialog: MdDialog) {
    }

    /**
     * When used as a 'sub' component (to display one-to-many list), refreshes the table
     * content when the input changes.
     */
    ngOnChanges(changes: SimpleChanges) {
        this.loadPage({ first: 0, rows: 10, sortField: null, sortOrder: null, filters: null, multiSortMeta: null });
    }

    /**
     * Invoked when user presses the search button.
     */
    search(dt : DataTable) {
        if (!this.sub) {
            dt.reset();
            this.loadPage({ first: 0, rows: dt.rows, sortField: dt.sortField, sortOrder: dt.sortOrder, filters: null, multiSortMeta: dt.multiSortMeta });
        }
    }

    /**
     * Invoked automatically by primeng datatable.
     */
    loadPage(event : LazyLoadEvent) {
        this.passportService.getPage(this.example, event).
            subscribe(
                pageResponse => this.currentPage = pageResponse,
                error => this.messageService.error('Could not get the results', error)
            );
    }

    // X to one: input param is used to filter the list when displayed
    // as a one-to-many list by the other side.
    @Input()
    set holder(holder : User) {
        if (holder == null) {
            return;
        }
        this._holder = holder;

        this.example = new Passport();
        this.example.holder = new User();
        this.example.holder.id = this._holder.id;
    }


    onRowSelect(event : any) {
        let id =  event.data.id;
        this.router.navigate(['/passport', id]);
    }

    addNew() {
        if (this.sub) {
            this.onAddNewClicked.emit("addNew");
        } else {
            this.router.navigate(['/passport', 'new']);
        }
    }

    showDeleteDialog(rowData : any) {
        let passportToDelete : Passport = <Passport> rowData;

        let dialogRef = this.confirmDeleteDialog.open(ConfirmDeleteDialogComponent);
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'delete') {
                this.delete(passportToDelete);
            }
        });
    }

    private delete(passportToDelete : Passport) {
        let id =  passportToDelete.id;

        this.passportService.delete(id).
            subscribe(
                response => {
                    this.currentPage.remove(passportToDelete);
                    this.messageService.info('Deleted OK', 'Angular Rocks!');
                },
                error => this.messageService.error('Could not delete!', error)
            );
    }
}