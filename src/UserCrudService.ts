import * as client from 'hr.roleclient.RoleClient';
import * as hyperCrud from 'hr.widgets.HypermediaCrudService';
import * as di from 'hr.di';
import * as controller from 'hr.controller';
import * as UserSearchController from 'hr.roleclient.UserSearchController';
import * as crudPage from 'hr.widgets.CrudPage';
import * as userDirClient from 'hr.roleclient.UserDirectoryClient';
import * as standardCrudPage from 'hr.widgets.StandardCrudPage';
import * as hyperCrudPage from 'hr.widgets.HypermediaCrudService';

export { Settings as UserCrudSettings } from 'hr.widgets.StandardCrudPage';

export class UserCrudInjector extends hyperCrud.AbstractHypermediaPageInjector {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [client.IRoleEntryInjector];
    }

    constructor(private injector: client.EntryPointInjector) {
        super();
    }

    async list(query: any): Promise<hyperCrud.HypermediaCrudCollection> {
        var entry = await this.injector.load();
        if (client.IsEntryPointResult(entry)) {
            return entry.listUsers(query);
        }
    }

    async canList(): Promise<boolean> {
        var entry = await this.injector.load();
        if (client.IsEntryPointResult(entry)) {
            return entry.canListUsers();
        }
    }

    public getDeletePrompt(item: client.RoleAssignmentsResult): string {
        return "Are you sure you want to delete " + item.data.name + "?";
    }

    public getItemId(item: client.RoleAssignmentsResult): string | null {
        return String(item.data.userId);
    }

    public createIdQuery(id: string): client.RoleQuery | null {
        return {
            userId: [id]
        };
    }
}

export class UserResultController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData, crudPage.ICrudService, hyperCrudPage.HypermediaPageInjector];
    }

    private editRolesToggle: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection, private data: userDirClient.PersonResult, private crudService: crudPage.ICrudService, private userCrudInjector: UserCrudInjector) {
        this.editRolesToggle = bindings.getToggle("editRoles");
        this.setup();
    }

    private async setup() {
        this.editRolesToggle.mode = await this.crudService.canAdd();
    }

    public editRoles(evt: Event) {
        evt.preventDefault();
        this.editUserRoles(this.data.data.userId, this.data.data.firstName + " " + this.data.data.lastName);
    }

    public async editUserRoles(userId: string, name: string) {
        if (await !this.userCrudInjector.canList()) {
            throw new Error("No permission to set roles.");
        }

        var roles = await this.userCrudInjector.list({
            userId: [userId],
            name: name
        });

        this.crudService.edit(roles.items[0]);
    }
}

export function addServices(builder: controller.InjectedControllerBuilder) {
    builder.Services.tryAddShared(UserSearchController.UserSearchController, UserSearchController.UserSearchController); //This is overridden to be a singleton, only support 1 user search per page
    builder.Services.tryAddTransient(UserSearchController.IUserResultController, UserResultController);
    standardCrudPage.addServices(builder, UserCrudInjector);
}

export function createControllers(builder: controller.InjectedControllerBuilder, settings: standardCrudPage.Settings): void {
    standardCrudPage.createControllers(builder, settings);
}