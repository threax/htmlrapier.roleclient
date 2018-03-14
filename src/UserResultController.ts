import * as controller from 'hr.controller';
import * as crudPage from 'hr.widgets.CrudPage';
import * as hyperCrudPage from 'hr.widgets.HypermediaCrudService';
import * as userDirClient from 'hr.roleclient.UserDirectoryClient';
import { UserCrudInjector } from 'hr.roleclient.UserCrudInjector';
import { IUserResultController } from 'hr.roleclient.UserSearchController';

export class UserResultController implements IUserResultController {
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