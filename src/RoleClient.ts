import * as hal from 'hr.halcyon.EndpointClient';
import { Fetcher } from 'hr.fetcher';

export interface RoleAssignmentsResult {
    data: RoleAssignments;

    refresh(): Promise<RoleAssignmentsResult>;

    canRefresh(): boolean;

    setUser(data: RoleAssignments): Promise<RoleAssignmentsResult>;

    canSetUser(): boolean;

    getSetUserDocs(): Promise<hal.HalEndpointDoc>;

    hasSetUserDocs(): boolean;

    deleteUser();

    canDeleteUser(): boolean;
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
    if (t.setUser === undefined) {
        errors += "setUser(data: RoleAssignments): Promise<RoleAssignmentsResult>.\n";
    }
    if (t.canSetUser === undefined) {
        errors += "canSetUser(): boolean.\n";
    }
    if (t.getSetUserDocs === undefined) {
        errors += "getSetUserDocs(): Promise<hal.HalEndpointDoc>.\n";
    }
    if (t.hasSetUserDocs === undefined) {
        errors += "hasSetUserDocs(): boolean.\n";
    }
    if (t.deleteUser === undefined) {
        errors += "deleteUser().\n";
    }
    if (t.canDeleteUser === undefined) {
        errors += "canDeleteUser(): boolean.\n";
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

    getSetUserDocs(): Promise<hal.HalEndpointDoc>;

    hasSetUserDocs(): boolean;
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
    if (t.getSetUserDocs === undefined) {
        errors += "getSetUserDocs(): Promise<hal.HalEndpointDoc>\n";
    }
    if (t.hasSetUserDocs === undefined) {
        errors += "hasSetUserDocs(): boolean\n";
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
}

export interface RoleAssignments {
    name?: string;
    editRoles?: boolean;
    superAdmin?: boolean;
}
export interface RoleQuery {
    userId?: string;
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