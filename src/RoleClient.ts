import * as hal from 'htmlrapier.halcyon/src/EndpointClient';

export interface RoleAssignmentsResult {
    data: RoleAssignments;

    refresh(): Promise<RoleAssignmentsResult>;

    canRefresh(): boolean;

    update(data: RoleAssignments): Promise<RoleAssignmentsResult>;

    canUpdate(): boolean;

    getUpdateDocs(): Promise<hal.HalEndpointDoc>;

    hasUpdateDocs(): boolean;

    delete();

    canDelete(): boolean;

    hasUpdateDocs(): boolean;

    getUpdateDocs(): Promise<any>;
}

/**
 * Make sure the passed in object is a correct RoleAssignmentsResult, this will return true on success and throw
 * an error on failure.
 * @param t
 */
export function IsRoleAssignmentsResult(t: RoleAssignmentsResult): t is RoleAssignmentsResult{
    var errors = "";
    if (t.refresh === undefined) {
        errors += "refresh(): Promise<RoleAssignmentsResult>.\n";
    }
    if (t.canRefresh === undefined) {
        errors += "canRefresh(): boolean.\n";
    }
    if (t.update === undefined) {
        errors += "update(data: RoleAssignments): Promise<RoleAssignmentsResult>.\n";
    }
    if (t.canUpdate === undefined) {
        errors += "canUpdate(): boolean.\n";
    }
    if (t.getUpdateDocs === undefined) {
        errors += "getUpdateDocs(): Promise<hal.HalEndpointDoc>.\n";
    }
    if (t.hasUpdateDocs === undefined) {
        errors += "hasUpdateDocs(): boolean.\n";
    }
    if (t.delete === undefined) {
        errors += "delete().\n";
    }
    if (t.canDelete === undefined) {
        errors += "canDelete(): boolean.\n";
    }
    if (errors !== "") {
        errors = "Cannot accept RoleAssignmentResult. The following functions are missing:\n" + errors;
        throw new Error(errors);
    }
    return true;
}

export class IRoleEntryInjector{
    
}

export interface EntryPointInjector {
    load(): Promise<EntryPointResult>;
}

export interface EntryPointResult {
    getUser(): Promise<RoleAssignmentsResult>;

    canGetUser(): boolean;

    listUsers(query: RoleQuery): Promise<UserCollectionResult>;

    canListUsers(): boolean;

    setUser(data: RoleAssignments): Promise<RoleAssignmentsResult>;

    canSetUser(): boolean;
}

/**
 * Make sure the passed in object is a correct EntryPointResult, this will return true on success and throw
 * an error on failure.
 * @param t
 */
export function IsEntryPointResult(t: EntryPointResult): t is EntryPointResult {
    var errors = "";
    if (t.getUser === undefined) {
        errors += "getUser(query: RolesQuery): Promise<RoleAssignmentsResult>.\n";
    }
    if (t.canGetUser === undefined) {
        errors += "canGetUser(): boolean.\n";
    }
    if (t.listUsers === undefined) {
        errors += "listUsers(query: PagedCollectionQuery): Promise<UserCollectionResult>\n";
    }
    if (t.canListUsers === undefined) {
        errors += "canListUsers(): boolean;";
    }
    if (t.setUser === undefined) {
        errors += "setUser(data: RoleAssignments): Promise<RoleAssignmentsResult>\n";
    }
    if (t.canSetUser === undefined) {
        errors += "canSetUser(): boolean\n";
    }
    if (errors !== "") {
        errors = "Cannot accept RoleAssignmentResult. The following functions are missing:\n" + errors;
        throw new Error(errors);
    }
    return true;
}

export interface EntryPointWithDocsResult {
    getListUsersDocs(): Promise<hal.HalEndpointDoc>;

    hasListUsersDocs(): boolean;
}

/**
 * Make sure the passed in object is a correct EntryPointResult, this will return true on success and throw
 * an error on failure.
 * @param t
 */
export function IsEntryPointWithDocsResult(t: EntryPointWithDocsResult): t is EntryPointWithDocsResult {
    var errors = "";
    if (t.getListUsersDocs === undefined) {
        errors += "getListUsersDocs(): Promise<hal.HalEndpointDoc>;\n";
    }
    if (t.hasListUsersDocs === undefined) {
        errors += "hasListUsersDocs(): boolean;\n";
    }
    if (errors !== "") {
        errors = "Cannot accept RoleAssignmentResult. The following functions are missing:\n" + errors;
        throw new Error(errors);
    }
    return true;
}

export interface UserCollectionResult {
    data: UserCollection;

    items: RoleAssignmentsResult[];

    refresh(): Promise<UserCollectionResult>;

    canRefresh(): boolean;

    getRefreshDocs(): Promise<hal.HalEndpointDoc>;

    hasRefreshDocs(): boolean;

    next(): Promise<UserCollectionResult>;

    canNext(): boolean;

    getNextDocs(): Promise<hal.HalEndpointDoc>;

    hasNextDocs(): boolean;

    previous(): Promise<UserCollectionResult>;

    canPrevious(): boolean;

    getPreviousDocs(): Promise<hal.HalEndpointDoc>;

    hasPreviousDocs(): boolean;

    first(): Promise<UserCollectionResult>;

    canFirst(): boolean;

    getFirstDocs(): Promise<hal.HalEndpointDoc>;

    hasFirstDocs(): boolean;

    last(): Promise<UserCollectionResult>;

    canLast(): boolean;

    getLastDocs(): Promise<hal.HalEndpointDoc>;

    hasLastDocs(): boolean;

    getUpdateDocs(): Promise<hal.HalEndpointDoc>;

    hasUpdateDocs(): boolean;

    hasAddDocs(): boolean;

    getAddDocs(): Promise<any>;

    add(data: any): Promise<any>;

    canAdd(): boolean;
}

export interface RoleAssignments {
    userId?: string;
    name?: string;
    editRoles?: boolean;
    superAdmin?: boolean;
}
export interface RoleQuery {
    userId?: string[];
    name?: string;
    offset?: number;
    limit?: number;
}
/** This class returns the entry points to the system using hal links. */
export interface EntryPoints {
}
export interface UserCollection {
    offset?: number;
    limit?: number;
    total?: number;
}