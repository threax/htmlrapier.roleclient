import * as Client from 'hr.roleclient.UserDirectoryClient';
import * as controller from 'hr.controller';
import { MainLoadErrorLifecycle } from 'hr.widgets.MainLoadErrorLifecycle';
import * as iter from 'hr.iterable';
import * as event from 'hr.eventdispatcher';
import * as crudItemEditor from 'hr.widgets.CrudItemEditor';
import { ICrudService, ItemEditorClosedCallback, ItemUpdatedCallback, ShowItemEditorEventArgs } from 'hr.widgets.CrudService';
import { UserCrudInjector } from 'hr.roleclient.UserCrudInjector';
import * as hyperCrudPage from 'hr.widgets.HypermediaCrudService';

export class UserSearchControllerOptions {
    mainToggleName: string = "main";
    errorToggleName: string = "error";
    loadToggleName: string = "load";
    dialogToggleName: string = "dialog";
    guidFormName: string = "fromGuidForm";
    setLoadingOnStart: boolean = true;
}

export interface SearchTermModel {
    term: string;
}

export interface FromGuidModel {
    id: string;
    name: string;
}

export class UserSearchController implements crudItemEditor.CrudItemEditorController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection,
                UserSearchControllerOptions,
                controller.InjectedControllerBuilder,
                Client.EntryPointInjector,
                ICrudService, 
                hyperCrudPage.HypermediaPageInjector];
    }

    private options: UserSearchControllerOptions;
    private searchModel: controller.Model<SearchTermModel>;
    private searchResultsModel: controller.Model<Client.Person>;
    private noResultsModel: controller.Model<SearchTermModel>;
    private noResultsToggle: controller.OnOffToggle;
    private lifecycle: MainLoadErrorLifecycle;
    private entryPoint: Client.EntryPointResult;
    private dialogToggle: controller.OnOffToggle;
    private addManuallyEvent: event.ActionEventDispatcher<FromGuidModel> = new event.ActionEventDispatcher<FromGuidModel>();
    private guidForm: controller.IForm<FromGuidModel>;

    constructor(bindings: controller.BindingCollection,
                settings: UserSearchControllerOptions,
                private builder: controller.InjectedControllerBuilder,
                private entryPointInjector: Client.EntryPointInjector,
                private crudService: ICrudService, 
                private userCrudInjector: UserCrudInjector)
    {
        this.options = settings;
        this.guidForm = bindings.getForm<FromGuidModel>(settings.guidFormName);
        this.searchModel = bindings.getModel<SearchTermModel>("search");
        this.searchResultsModel = bindings.getModel<Client.Person>("searchResults");
        this.noResultsModel = bindings.getModel<SearchTermModel>("noResults");
        this.noResultsToggle = bindings.getToggle("noResults");
        this.noResultsToggle.off();

        this.dialogToggle = bindings.getToggle(settings.dialogToggleName);

        this.lifecycle = new MainLoadErrorLifecycle(
            bindings.getToggle(settings.mainToggleName),
            bindings.getToggle(settings.loadToggleName),
            bindings.getToggle(settings.errorToggleName),
            settings.setLoadingOnStart);

        this.lifecycle.showLoad();

        this.crudService.showAddItemEvent.add(arg => {
            this.show();
        });

        this.crudService.showItemEditorEvent.add(arg => {
            this.hide();
        });

        this.crudService.closeItemEditorEvent.add(() => {
            this.dialogToggle.off();
        });

        this.setup();
    }

    public show() {
        this.dialogToggle.on();
    }

    public hide() {
        this.dialogToggle.off();
    }

    private async setup() {
        try {
            this.entryPoint = await this.entryPointInjector.load();
            if (this.entryPoint.canSearchUsers()) {
                this.lifecycle.showMain();
            }
            else {
                this.lifecycle.showError({
                    name: "List User Error",
                    message: "Cannot list users."
                });
            }
        }
        catch (err) {
            this.lifecycle.showError(err);
        }
    }

    public async runSearch(evt: Event): Promise<void> {
        evt.preventDefault();
        this.lifecycle.showLoad();
        var searchData = this.searchModel.getData();
        try {
            var data = await this.entryPoint.searchUsers(searchData);
            var listingCreator = this.builder.createOnCallback(IUserResultController);
            var items = data.items;
            this.searchResultsModel.clear();
            for (var i = 0; i < items.length; ++i) {
                var itemData = items[i].data;
                this.searchResultsModel.appendData(itemData, (b, d) => {
                    listingCreator(b, items[i]);
                });
            }
            this.lifecycle.showMain();
        }
        catch (err) {
            this.lifecycle.showError(err);
        }
    }

    public async addFromGuid(evt: Event): Promise<void> {
        evt.preventDefault();
        if (await !this.userCrudInjector.canList()) {
            throw new Error("No permission to set roles.");
        }

        var manualData = this.guidForm.getData();

        var roles = await this.userCrudInjector.list({
            userId: [manualData.id],
            name: manualData.name
        });

        var shadow = Object.create(roles.items[0]);
        shadow.canRefresh = () => false;

        this.crudService.edit(shadow);
    }
}

export class IUserResultController {

}

export class UserResultController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData];
    }

    constructor(bindings: controller.BindingCollection) {
        
    }
}

export function AddServices(services: controller.ServiceCollection) {
    services.tryAddTransient(UserSearchControllerOptions, s => new UserSearchControllerOptions());
    services.tryAddSharedId(crudItemEditor.CrudItemEditorType.Add, crudItemEditor.CrudItemEditorController, UserSearchController);
    services.tryAddTransient(IUserResultController, UserResultController);
}