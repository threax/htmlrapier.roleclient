import * as controller from 'htmlrapier/src/controller';
import * as UserSearchController from './UserSearchController';
import * as standardCrudPage from 'htmlrapier.widgets/src/StandardCrudPage';
import { UserResultController } from './UserResultController';
import { UserCrudInjector } from './UserCrudInjector';

export { Settings as UserCrudSettings } from 'htmlrapier.widgets/src/StandardCrudPage';

export function addServices(builder: controller.InjectedControllerBuilder) {
    builder.Services.tryAddShared(UserSearchController.UserSearchController, UserSearchController.UserSearchController); //This is overridden to be a singleton, only support 1 user search per page
    builder.Services.tryAddTransient(UserSearchController.IUserResultController, UserResultController);
    UserSearchController.AddServices(builder.Services);
    standardCrudPage.addServices(builder, UserCrudInjector);
}

export function createControllers(builder: controller.InjectedControllerBuilder, settings: standardCrudPage.Settings): void {
    standardCrudPage.createControllers(builder, settings);
}