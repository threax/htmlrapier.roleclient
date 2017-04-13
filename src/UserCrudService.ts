import * as client from 'clientlibs.IdServerClient';
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
    TEntryResult extends client.EntryPointsResult,
    TListQueryType extends client.PagedCollectionQuery,
    >
    extends crudPage.HypermediaCrudService
    implements CrudServiceExtensions {

    private entryInjector: client.EntryPointsInjector;

    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [client.EntryPointsInjector, UserSearchController.UserSearchController];
    }

    constructor(entry: client.EntryPointsInjector, private userSearchController: UserSearchController.UserSearchController) {
        super(entry);
        this.entryInjector = entry;
    }

    protected async getActualSchema(entryPoint: TEntryResult) {
        return entryPoint.getSetRolesDocs();
    }

    public canAddItem(entryPoint: TEntryResult): boolean {
        return entryPoint.canSetRoles();
    }

    public async add(item?: any) {
        this.userSearchController.show();
    }

    protected commitAdd(entryPoint: TEntryResult, data: TEdit) {
        return entryPoint.setRoles(data);
    }

    protected async getEditObject(item: TResult) {
        if (item.canRefresh()) {
            var refreshed = await item.refresh();
            return refreshed.data;
        }
        return item.data;
    }

    protected commitEdit(data: TEdit, item: TResult) {
        return item.save(data);
    }

    public getDeletePrompt(item: TResult): string {
        return "Are you sure you want to delete " + item.data.name + "?";
    }

    protected commitDelete(item: TResult) {
        return item.deleteUser();
    }

    protected canList(entryPoint: TEntryResult): boolean {
        return entryPoint.canListUsers();
    }

    protected list(entryPoint: TEntryResult, query: TListQueryType): Promise<TResultCollection> {
        return entryPoint.listUsers(query);
    }

    public canEdit(item: TResult): boolean {
        return item.canSave();
    }

    public canDel(item: TResult): boolean {
        return item.canDeleteUser();
    }

    public async editUserRoles(userId: string, name: string) {
        var entryPoint = await this.entryInjector.load();
        if (!entryPoint.canSetRoles()) {
            throw new Error("No permission to set roles.");
        }

        var roles = await entryPoint.getRoles({
            userId: userId,
            name: name
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
    services.tryAddSingleton(UserSearchController.UserSearchController, UserSearchController.UserSearchController); //This is overridden to be a singleton, only support 1 user search per page
    services.tryAddScoped(UserSearchController.IUserResultController, UserResultController);
    services.tryAddSingleton(crudPage.ICrudService, CrudService);
}