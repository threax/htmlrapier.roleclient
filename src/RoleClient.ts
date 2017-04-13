import * as hal from 'hr.halcyon.EndpointClient';
import { Fetcher } from 'hr.fetcher';

export interface RoleAssignmentsResult {
    data: RoleAssignments;

    refresh(): Promise<RoleAssignmentsResult>;

    canRefresh(): boolean;

    getRefreshDocs(): Promise<hal.HalEndpointDoc>;

    hasRefreshDocs(): boolean;

    save(data: RoleAssignments): Promise<RoleAssignmentsResult>;

    canSave(): boolean;

    getSaveDocs(): Promise<hal.HalEndpointDoc>;

    hasSaveDocs(): boolean;

    deleteUser();

    canDeleteUser(): boolean;
}

export class IRoleEntryInjector{
    
}

export interface EntryPointInjector {
    load(): Promise<EntryPointResult>;
}

export interface EntryPointResult {
    refresh(): Promise<EntryPointResult>;

    canRefresh(): boolean;

    getRefreshDocs(): Promise<hal.HalEndpointDoc>;

    hasRefreshDocs(): boolean;

    getRoles(query: RolesQuery): Promise<RoleAssignmentsResult>;

    canGetRoles(): boolean;

    getGetRolesDocs(): Promise<hal.HalEndpointDoc>;

    hasGetRolesDocs(): boolean;

    listUsers(query: PagedCollectionQuery): Promise<UserCollectionResult>;

    canListUsers(): boolean;

    getListUsersDocs(): Promise<hal.HalEndpointDoc>;

    hasListUsersDocs(): boolean;

    setRoles(data: RoleAssignments): Promise<RoleAssignmentsResult>;

    canSetRoles(): boolean;

    getSetRolesDocs(): Promise<hal.HalEndpointDoc>;

    hasSetRolesDocs(): boolean;
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
export interface RolesQuery {
    userId?: string;
    name?: string;
}
export interface RoleAssignments {
    name?: string;
    editRoles?: boolean;
    superAdmin?: boolean;
}
export interface PagedCollectionQuery {
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