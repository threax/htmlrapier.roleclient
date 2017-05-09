import * as client from 'spc.roleclient.RoleClient';
import * as crudPage from 'hr.widgets.CrudPage';
import * as controller from 'hr.controller';
import * as UserSearchController from 'spc.roleclient.UserSearchController';
import * as userDirClient from 'spc.roleclient.UserDirectoryClient';
import * as events from 'hr.eventdispatcher';

export interface CrudServiceExtensions {
    editUserRoles(userId: string, name: string): Promise<any>;
}

export function HasCrudServiceExtensions(t: any): t is CrudServiceExtensions {
    return (<CrudServiceExtensions>t).editUserRoles !== undefined;
}

export class CrudService
    <
    TResult extends client.RoleAssignmentsResult,
    TResultCollection extends client.UserCollectionResult,
    TEdit extends client.RoleAssignments,
    TEntryResult extends client.EntryPointResult,
    TListQueryType extends client.RoleQuery
    >
    extends crudPage.HypermediaCrudService
    implements CrudServiceExtensions {

    private entryInjector: client.EntryPointInjector;

    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [client.IRoleEntryInjector, UserSearchController.UserSearchController];
    }

    constructor(entry: client.EntryPointInjector, private userSearchController: UserSearchController.UserSearchController) {
        super(entry);
        this.entryInjector = entry;
    }

    protected async getActualSchema(entryPoint: TEntryResult) {
        if (client.IsEntryPointResult(entryPoint)) {
            return entryPoint.getSetUserDocs();
        }
    }

    protected async getActualSearchSchema(entryPoint: TEntryResult) {
        throw new Error("getActualSearchSchema Not supported");
    }

    public canAddItem(entryPoint: TEntryResult): boolean {
        if (client.IsEntryPointResult(entryPoint)) {
            return entryPoint.canSetUser();
        }
    }

    public async add(item?: any) {
        this.userSearchController.show();
    }

    protected commitAdd(entryPoint: TEntryResult, data: TEdit) {
        if (client.IsEntryPointResult(entryPoint)) {
            return entryPoint.setUser(data);
        }
    }

    protected async getEditObject(item: TResult) {
        if (item.canRefresh()) {
            var refreshed = await item.refresh();
            return refreshed.data;
        }
        return item.data;
    }

    protected commitEdit(data: TEdit, item: TResult) {
        if (client.IsRoleAssignmentsResult(item)) {
            return item.setUser(data);
        }
    }

    public getDeletePrompt(item: TResult): string {
        return "Are you sure you want to delete " + item.data.name + "?";
    }

    protected commitDelete(item: TResult) {
        if (client.IsRoleAssignmentsResult(item)) {
            return item.deleteUser();
        }
    }

    protected canList(entryPoint: TEntryResult): boolean {
        if (client.IsEntryPointResult(entryPoint)) {
            return entryPoint.canListUsers();
        }
    }

    protected list(entryPoint: TEntryResult, query: TListQueryType): Promise<TResultCollection> {
        if (client.IsEntryPointResult(entryPoint)) {
            return entryPoint.listUsers(query);
        }
    }

    public canEdit(item: TResult): boolean {
        if (client.IsRoleAssignmentsResult(item)) {
            return item.canSetUser();
        }
    }

    public canDel(item: TResult): boolean {
        if (client.IsRoleAssignmentsResult(item)) {
            return item.canDeleteUser();
        }
    }

    public async editUserRoles(userId: string, name: string) {
        var entryPoint = await this.entryInjector.load();
        if (!entryPoint.canSetUser()) {
            throw new Error("No permission to set roles.");
        }

        var roles = await entryPoint.listUsers({
            userId: [userId],
            name: name
        })
        .then(r => {
            return r.items[0];
        });

        this.editData(roles, Promise.resolve(roles.data));
    }
}

export class UserResultController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData, crudPage.ICrudService];
    }

    private editRolesToggle: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection, private data: userDirClient.PersonResult, private crudService: crudPage.ICrudService) {
        this.editRolesToggle = bindings.getToggle("editRoles");
        this.setup();
    }

    private async setup() {
        this.editRolesToggle.mode = await this.crudService.canAdd();
    }

    public editRoles(evt: Event) {
        evt.preventDefault();
        if (HasCrudServiceExtensions(this.crudService)) {
            this.crudService.editUserRoles(this.data.data.userId, this.data.data.firstName + " " + this.data.data.lastName);
        }
    }
}

export function addServices(services: controller.ServiceCollection) {
    services.tryAddShared(UserSearchController.UserSearchController, UserSearchController.UserSearchController); //This is overridden to be a singleton, only support 1 user search per page
    services.tryAddTransient(UserSearchController.IUserResultController, UserResultController);
    services.tryAddShared(crudPage.ICrudService, CrudService);
}