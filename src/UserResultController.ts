import * as controller from 'htmlrapier/src/controller';
import * as crudPage from 'htmlrapier.widgets/src/CrudPage';
import * as hyperCrudPage from 'htmlrapier.widgets/src/HypermediaCrudService';
import * as userDirClient from './UserDirectoryClient';
import { UserCrudInjector } from './UserCrudInjector';
import { IUserResultController } from './UserSearchController';

export class UserResultController implements IUserResultController {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, controller.InjectControllerData, crudPage.ICrudService, hyperCrudPage.HypermediaPageInjector];
    }

    private editRolesToggle: controller.OnOffToggle;

    constructor(bindings: controller.BindingCollection, protected data: userDirClient.AppUserResult, private crudService: crudPage.ICrudService, private userCrudInjector: UserCrudInjector) {
        this.editRolesToggle = bindings.getToggle("editRoles");
        this.setup();
    }

    private async setup() {
        this.editRolesToggle.mode = await this.crudService.canAdd();
    }

    public editRoles(evt: Event) {
        evt.preventDefault();
        this.editUserRoles(this.data.data.userId, this.data.data.userName);
    }

    public async editUserRoles(userId: string, name: string) {
        if (await !this.userCrudInjector.canList()) {
            throw new Error("No permission to set roles.");
        }

        var roles = await this.userCrudInjector.list({
            userId: [userId],
            name: name
        });

        var shadow = Object.create(roles.items[0]);
        shadow.canRefresh = () => false;

        this.crudService.edit(shadow);
    }
}