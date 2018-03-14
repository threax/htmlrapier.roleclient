import * as controller from 'hr.controller';
import * as UserSearchController from 'hr.roleclient.UserSearchController';
import * as standardCrudPage from 'hr.widgets.StandardCrudPage';
import { UserResultController } from 'hr.roleclient.UserResultController';
import { UserCrudInjector } from 'hr.roleclient.UserCrudInjector';

export { Settings as UserCrudSettings } from 'hr.widgets.StandardCrudPage';

export function addServices(builder: controller.InjectedControllerBuilder) {
    builder.Services.tryAddShared(UserSearchController.UserSearchController, UserSearchController.UserSearchController); //This is overridden to be a singleton, only support 1 user search per page
    builder.Services.tryAddTransient(UserSearchController.IUserResultController, UserResultController);
    UserSearchController.AddServices(builder.Services);
    standardCrudPage.addServices(builder, UserCrudInjector);
}

export function createControllers(builder: controller.InjectedControllerBuilder, settings: standardCrudPage.Settings): void {
    standardCrudPage.createControllers(builder, settings);
}