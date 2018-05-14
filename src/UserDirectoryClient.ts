import * as hal from 'hr.halcyon.EndpointClient';
import { Fetcher } from 'hr.fetcher';

export abstract class UserSearchEntryPointInjector {
    public abstract load(): Promise<EntryPointResult>;
}

export interface EntryPointResult {
    data: EntryPoint;

    listSpcUsers(query: AppUserQuery): Promise<AppUserCollectionResult>;

    canListSpcUsers(): boolean;

    getListSpcUsersDocs(): Promise<hal.HalEndpointDoc>;
}

export interface AppUserCollectionResult {
    data: AppUserCollection;

    items: AppUserResult[];

    refresh(): Promise<AppUserCollectionResult>;

    canRefresh(): boolean;

    linkForRefresh(): hal.HalLink;

    getRefreshDocs(): Promise<hal.HalEndpointDoc>;

    hasRefreshDocs(): boolean;

    getGetDocs(): Promise<hal.HalEndpointDoc>;

    hasGetDocs(): boolean;

    getListDocs(): Promise<hal.HalEndpointDoc>;

    hasListDocs(): boolean;

    next(): Promise<AppUserCollectionResult>;

    canNext(): boolean;

    linkForNext(): hal.HalLink;

    getNextDocs(): Promise<hal.HalEndpointDoc>;

    hasNextDocs(): boolean;

    previous(): Promise<AppUserCollectionResult>;

    canPrevious(): boolean;

    linkForPrevious(): hal.HalLink;

    getPreviousDocs(): Promise<hal.HalEndpointDoc>;

    hasPreviousDocs(): boolean;

    first(): Promise<AppUserCollectionResult>;

    canFirst(): boolean;

    linkForFirst(): hal.HalLink;

    getFirstDocs(): Promise<hal.HalEndpointDoc>;

    hasFirstDocs(): boolean;

    last(): Promise<AppUserCollectionResult>;

    canLast(): boolean;

    linkForLast(): hal.HalLink;

    getLastDocs(): Promise<hal.HalEndpointDoc>;

    hasLastDocs(): boolean;
}

export interface AppUserResult {
    data: AppUser;

    refresh(): Promise<AppUserResult>;

    canRefresh(): boolean;

    linkForRefresh(): hal.HalLink;

    getRefreshDocs(): Promise<hal.HalEndpointDoc>;

    hasRefreshDocs(): boolean;
}

export interface EntryPoint {

}

export interface AppUserQuery {
    /** The number of pages (item number = Offset * Limit) into the collection to query. */
    offset?: number;
    /** The limit of the number of items to return. */
    limit?: number;
}

export interface AppUserCollection {
    //Only want page items, don't care about the rest of the data.
    total?: number;
    /** The number of pages (item number = Offset * Limit) into the collection to query. */
    offset?: number;
    /** The limit of the number of items to return. */
    limit?: number;
}

export interface AppUser {
    userId: string;
    userName: string;
}