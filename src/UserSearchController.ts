import * as Client from './UserDirectoryClient';
import * as controller from 'htmlrapier/src/controller';
import { MainLoadErrorLifecycle } from 'htmlrapier.widgets/src/MainLoadErrorLifecycle';
import * as event from 'htmlrapier/src/eventdispatcher';
import * as crudItemEditor from 'htmlrapier.widgets/src/CrudItemEditor';
import { ICrudService, ItemEditorClosedCallback, ItemUpdatedCallback, ShowItemEditorEventArgs } from 'htmlrapier.widgets/src/CrudService';
import { UserCrudInjector } from './UserCrudInjector';
import * as hyperCrudPage from 'htmlrapier.widgets/src/HypermediaCrudService';

export class UserSearchControllerOptions {
    mainToggleName: string = "main";
    errorToggleName: string = "error";
    loadToggleName: string = "load";
    dialogToggleName: string = "dialog";
    guidFormName: string = "fromGuidForm";
    setLoadingOnStart: boolean = true;
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
                Client.UserSearchEntryPointInjector,
                ICrudService, 
                hyperCrudPage.HypermediaPageInjector];
    }

    private options: UserSearchControllerOptions;
    private searchForm: controller.IForm<Client.AppUserQuery>;
    private searchResultsModel: controller.IView<Client.AppUser>;
    private noResultsModel: controller.IView<Client.AppUserQuery>;
    private noResultsToggle: controller.OnOffToggle;
    private lifecycle: MainLoadErrorLifecycle;
    private entryPoint: Client.EntryPointResult;
    private dialogToggle: controller.OnOffToggle;
    private addManuallyEvent: event.ActionEventDispatcher<FromGuidModel> = new event.ActionEventDispatcher<FromGuidModel>();
    private guidForm: controller.IForm<FromGuidModel>;

    constructor(bindings: controller.BindingCollection,
                settings: UserSearchControllerOptions,
                private builder: controller.InjectedControllerBuilder,
                private entryPointInjector: Client.UserSearchEntryPointInjector,
                private crudService: ICrudService, 
                private userCrudInjector: UserCrudInjector)
    {
        this.options = settings;
        this.guidForm = bindings.getForm<FromGuidModel>(settings.guidFormName);
        this.searchForm = bindings.getForm<Client.AppUserQuery>("search");
        this.searchResultsModel = bindings.getView<Client.AppUser>("searchResults");
        this.noResultsModel = bindings.getView<Client.AppUserQuery>("noResults");
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
            if (this.entryPoint.canListAppUsers()) {
                var listUsersDocs = await this.entryPoint.getListAppUsersDocs();
                var schema = listUsersDocs.requestSchema;
                //Remove common properties that we won't want on the ui
                var properties = schema.properties;
                if (properties) {
                    for (var key in properties) {
                        if (key === 'userId' || key === 'offset' || key === 'limit') {
                            delete properties[key]; //Delete all properties that do not have x-ui-search set.
                        }
                    }
                }
                this.searchForm.setSchema(schema);
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
        var searchData = this.searchForm.getData();
        if (searchData === null) {
            searchData = {};
        }
        try {
            searchData.offset = 0;
            searchData.limit = 10;
            var data = await this.entryPoint.listAppUsers(searchData);
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

export class UserResultController implements IUserResultController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData];
    }

    constructor(bindings: controller.BindingCollection, data: any) {
        
    }
}

export function AddServices(services: controller.ServiceCollection) {
    services.tryAddTransient(UserSearchControllerOptions, s => new UserSearchControllerOptions());
    services.tryAddSharedId(crudItemEditor.CrudItemEditorType.Add, crudItemEditor.CrudItemEditorController, UserSearchController);
    services.tryAddTransient(IUserResultController, UserResultController);
}