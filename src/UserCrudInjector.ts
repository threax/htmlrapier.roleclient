import * as client from './RoleClient';
import * as hyperCrud from 'htmlrapier.widgets/src/HypermediaCrudService';
import * as controller from 'htmlrapier/src/controller';

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