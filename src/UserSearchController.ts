import * as Client from 'spc.roleclient.UserDirectoryClient';
import * as controller from 'hr.controller';
import { MainLoadErrorLifecycle } from 'hr.widgets.MainLoadErrorLifecycle';
import * as iter from 'hr.iterable';
import * as inputPage from 'hr.widgets.InputPage';
import * as event from 'hr.eventdispatcher';

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

export class UserSearchController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection,
                UserSearchControllerOptions,
                controller.InjectedControllerBuilder,
                Client.EntryPointInjector];
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
                private entryPointInjector: Client.EntryPointInjector)
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

        this.setup();
    }

    public show() {
        this.dialogToggle.on();
    }

    public hide() {
        this.dialogToggle.off();
    }

    public get onAddManually() {
        return this.addManuallyEvent.modifier;
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

    public addFromGuid(evt: Event): void {
        evt.preventDefault();
        this.addManuallyEvent.fire(this.guidForm.getData());
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
    inputPage.AddServices(services);
    services.tryAddTransient(UserSearchControllerOptions, s => new UserSearchControllerOptions());
    services.tryAddTransient(UserSearchController, UserSearchController);
    services.tryAddTransient(IUserResultController, UserResultController);
}