import * as roleClient from './RoleClient';
import * as hal from 'htmlrapier.halcyon/src/EndpointClient';
import * as di from 'htmlrapier/src/di';

class MultiUserRoleAssignmentsResult implements roleClient.RoleAssignmentsResult {
    constructor(private role: roleClient.RoleAssignmentsResult, private extendedRoles: roleClient.RoleAssignmentsResult[]) {
        for (var i = 0; i < this.extendedRoles.length; ++i) {
            var extRoles = this.extendedRoles[i];
            for (var key in extRoles.data) {
                if (this.role.data[key] === undefined) {
                    this.role.data[key] = extRoles.data[key];
                }
            }
        }
    }

    get data(): roleClient.RoleAssignments {
        return this.role.data;
    }

    async refresh(): Promise<roleClient.RoleAssignmentsResult> {
        var promises: Promise<roleClient.RoleAssignmentsResult>[] = [];
        for (var i = 0; i < this.extendedRoles.length; ++i) {
            promises.push(this.extendedRoles[i].refresh());
        }

        var mainRolePromise = this.role.refresh();
        var extRoles: roleClient.RoleAssignmentsResult[] = [];
        for (var i = 0; i < promises.length; ++i) {
            extRoles.push(await promises[i]);
        }

        var mainRole = await mainRolePromise;

        var result = new MultiUserRoleAssignmentsResult(mainRole, extRoles);
        return result;
    }

    canRefresh(): boolean {
        return this.role.canRefresh();
    }

    async update(data: roleClient.RoleAssignments): Promise<roleClient.RoleAssignmentsResult> {
        var promises = [];
        for (var i = 0; i < this.extendedRoles.length; ++i) {
            var extRoles = this.extendedRoles[i];
            promises.push(extRoles.update(data));
        }

        var mainTask = this.role.update(data);
        await Promise.all(promises);
        return mainTask;
    }

    canUpdate(): boolean {
        return this.role.canUpdate();
    }

    async getUpdateDocs(): Promise<hal.HalEndpointDoc> {

        var promises = [this.role.getUpdateDocs()];
        for (var i = 0; i < this.extendedRoles.length; ++i) {
            var extRoles = this.extendedRoles[i];
            promises.push(extRoles.getUpdateDocs());
        }

        var docs: hal.HalEndpointDoc[] = [];
        for (var i = 0; i < promises.length; ++i) {
            docs.push(await promises[i]);
        }

        var mainDocs = docs[0];
        var mainSchema = mainDocs.requestSchema;

        for (var i = 1; i < docs.length; ++i) {
            var doc = docs[i];
            var docSchema = doc.requestSchema;
            for (var key in docSchema.properties) {
                if (mainSchema.properties[key] === undefined) {
                    mainSchema.properties[key] = docSchema.properties[key];
                }
            }
        }

        return mainDocs;
    }

    hasUpdateDocs(): boolean {
        return this.role.hasUpdateDocs();
    }

    async delete() {
        var promises = [];
        for (var i = 0; i < this.extendedRoles.length; ++i) {
            var extRoles = this.extendedRoles[i];
            promises.push(extRoles.delete());
        }

        var mainTask = this.role.delete();
        await Promise.all(promises);
        return mainTask;
    }

    canDelete(): boolean {
        return this.role.canDelete();
    }
}

class MultiUserCollectionResult implements roleClient.UserCollectionResult {
    private mainResult: roleClient.UserCollectionResult;
    private roleAssignments: roleClient.RoleAssignmentsResult[] = [];
    private extendedResults: roleClient.UserCollectionResult[] = [];

    constructor(private injectors: roleClient.EntryPointInjector[]) {

    }

    async loadWithQuery(query: roleClient.RoleQuery) {
        var entry = await this.injectors[0].load();
        this.mainResult = await entry.listUsers(query);
        return this.finishLoading();
    }

    private async createWrapped(incomingResultPromise: Promise<roleClient.UserCollectionResult>) {
        var refreshed = new MultiUserCollectionResult(this.injectors);
        refreshed.mainResult = await incomingResultPromise;
        await refreshed.finishLoading();
        return refreshed;
    }

    private async finishLoading() {
        var promises: Promise<roleClient.UserCollectionResult>[] = [];
        var results = this.mainResult.items;
        var query: roleClient.RoleQuery = {
            userId: []
        };

        //Get all visible user ids
        for (var i = 0; i < results.length; ++i) {
            query.userId.push(results[i].data.userId);
        }

        //Look up those users in the external services
        for (var i = 1; i < this.injectors.length; ++i) {
            promises.push(this.injectors[i].load().then(r => r.listUsers(query)));
        }

        for (var i = 0; i < promises.length; ++i) {
            this.extendedResults.push(await promises[i]);
        }

        for (var i = 0; i < results.length; ++i) {
            var result = results[i];
            var externalRoles: roleClient.RoleAssignmentsResult[] = [];
            for (var j = 0; j < this.extendedResults.length; ++j) {
                var extRole = this.extendedResults[j].items;
                for (var k = 0; k < extRole.length; ++k) {
                    if (extRole[k].data.userId == result.data.userId) {
                        externalRoles.push(extRole[k]);
                        break;
                    }
                }
            }

            var role = new MultiUserRoleAssignmentsResult(result, externalRoles);
            this.roleAssignments.push(role);
        }
    }

    get data(): roleClient.UserCollection {
        return this.mainResult.data;
    }

    get items(): roleClient.RoleAssignmentsResult[]{
        return this.roleAssignments;
    }

    async refresh(): Promise<roleClient.UserCollectionResult> {
        return this.createWrapped(this.mainResult.refresh());
    }

    canRefresh(): boolean {
        return this.mainResult.canRefresh();
    }

    getRefreshDocs(): Promise<hal.HalEndpointDoc> {
        return this.mainResult.getRefreshDocs();
    }

    hasRefreshDocs(): boolean {
        return this.mainResult.hasRefreshDocs();
    }

    next(): Promise<roleClient.UserCollectionResult> {
        return this.createWrapped(this.mainResult.next());
    }

    canNext(): boolean {
        return this.mainResult.canNext();
    }

    getNextDocs(): Promise<hal.HalEndpointDoc> {
        return this.mainResult.getNextDocs();
    }

    hasNextDocs(): boolean {
        return this.mainResult.hasNextDocs();
    }

    previous(): Promise<roleClient.UserCollectionResult> {
        return this.createWrapped(this.mainResult.previous());
    }

    canPrevious(): boolean {
        return this.mainResult.canPrevious();
    }

    getPreviousDocs(): Promise<hal.HalEndpointDoc> {
        return this.mainResult.getPreviousDocs();
    }

    hasPreviousDocs(): boolean {
        return this.mainResult.hasPreviousDocs();
    }

    first(): Promise<roleClient.UserCollectionResult> {
        return this.createWrapped(this.mainResult.first());
    }

    canFirst(): boolean {
        return this.mainResult.canFirst();
    }

    getFirstDocs(): Promise<hal.HalEndpointDoc> {
        return this.mainResult.getFirstDocs();
    }

    hasFirstDocs(): boolean {
        return this.mainResult.hasFirstDocs();
    }

    last(): Promise<roleClient.UserCollectionResult> {
        return this.createWrapped(this.mainResult.last());
    }

    canLast(): boolean {
        return this.mainResult.canLast();
    }

    getLastDocs(): Promise<hal.HalEndpointDoc> {
        return this.mainResult.getLastDocs();
    }

    hasLastDocs(): boolean {
        return this.mainResult.hasLastDocs();
    }

    public async getUpdateDocs(): Promise<hal.HalEndpointDoc> {
        var promises = [this.mainResult.getUpdateDocs()];
        for (var i = 0; i < this.extendedResults.length; ++i) {
            var extRoles = this.extendedResults[i];
            promises.push(extRoles.getUpdateDocs());
        }

        var docs: hal.HalEndpointDoc[] = [];
        for (var i = 0; i < promises.length; ++i) {
            docs.push(await promises[i]);
        }

        var mainDocs = docs[0];
        var mainSchema = mainDocs.requestSchema;

        for (var i = 1; i < docs.length; ++i) {
            var doc = docs[i];
            var docSchema = doc.requestSchema;
            for (var key in docSchema.properties) {
                if (mainSchema.properties[key] === undefined) {
                    mainSchema.properties[key] = docSchema.properties[key];
                }
            }
        }

        return mainDocs;
    }

    public hasUpdateDocs(): boolean {
        return this.mainResult.hasUpdateDocs();
    }

    public hasAddDocs(): boolean {
        return this.mainResult.hasAddDocs();
    }

    public async getAddDocs(): Promise<any> {
        var promises = [this.mainResult.getAddDocs()];
        for (var i = 0; i < this.extendedResults.length; ++i) {
            var extRoles = this.extendedResults[i];
            promises.push(extRoles.getAddDocs());
        }

        var docs: hal.HalEndpointDoc[] = [];
        for (var i = 0; i < promises.length; ++i) {
            docs.push(await promises[i]);
        }

        var mainDocs = docs[0];
        var mainSchema = mainDocs.requestSchema;

        for (var i = 1; i < docs.length; ++i) {
            var doc = docs[i];
            var docSchema = doc.requestSchema;
            for (var key in docSchema.properties) {
                if (mainSchema.properties[key] === undefined) {
                    mainSchema.properties[key] = docSchema.properties[key];
                }
            }
        }

        return mainDocs;
    }

    public add(data: any): Promise<any> {
        return this.mainResult.add(data);
    }

    public canAdd(): boolean {
        return this.mainResult.canAdd();
    }
}

class MultiRoleEntryInjector implements roleClient.EntryPointInjector {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [MultiRoleEntryResult];
    }

    private needSetup: boolean = true;

    constructor(private entryResult: MultiRoleEntryResult) {
        
    }

    public async load(): Promise<roleClient.EntryPointResult> {
        if (this.needSetup) {
            await this.entryResult.setup();
            this.needSetup = false;
        }
        return this.entryResult;
    }
}

class MultiRoleEntryResult implements roleClient.EntryPointResult {
    private entryPointInjectors: roleClient.EntryPointInjector[];
    private ableToListUsers: boolean = false;

    /**
     * Create a new RoleEntryInjector that can read multiple sources, the first injector passed is treated as the primary
     * one that the user list is read from. It is assumed that the services share the same users and changes will be made
     * across all included services.
     * @param entryPointInjectors
     */
    constructor(entryPointInjectors: roleClient.EntryPointInjector[]) {
        this.entryPointInjectors = entryPointInjectors;
    }

    public async setup(): Promise<void> {
        var entry = await this.mainInjector.load();
        this.ableToListUsers = entry.canListUsers();
    }

    get mainInjector() {
        return this.entryPointInjectors[0];
    }

    public async getUser(): Promise<roleClient.RoleAssignmentsResult> {
        throw new Error("Not Supported");
    }

    public canGetUser(): boolean {
        throw new Error("Not Supported");
    }

    async listUsers(query: roleClient.RoleQuery): Promise<roleClient.UserCollectionResult> {
        var userCollection = new MultiUserCollectionResult(this.entryPointInjectors);
        await userCollection.loadWithQuery(query);
        return userCollection;
    }

    public canListUsers(): boolean {
        return this.ableToListUsers;
    }

    public async setUser(data: roleClient.RoleAssignments): Promise<roleClient.RoleAssignmentsResult> {
        var entry = await this.mainInjector.load();
        return entry.setUser(data);
    }

    public canSetUser(): boolean {
        throw new Error("Not Supported");
    }
}

export type GetEntryPointsCallback = (scope: di.Scope) => roleClient.EntryPointInjector[];

/**
 * The multi role client can consume multiple apis that conform to the role interfaces so that it appears you are
 * editing a single user in a single system.
 * @param services The service collection to add to
 * @param getEntryPoints The entry points to combine into a single user editor
 */
export function addServices(services: di.ServiceCollection, getEntryPoints: GetEntryPointsCallback) {
    services.tryAddShared(MultiRoleEntryResult, s => new MultiRoleEntryResult(getEntryPoints(s)));
    services.tryAddShared(roleClient.IRoleEntryInjector, MultiRoleEntryInjector);
}