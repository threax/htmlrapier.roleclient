import * as hal from 'hr.halcyon.EndpointClient';
import { Fetcher } from 'hr.fetcher';

export class EntryPointInjector {
    private url: string;
    private fetcher: Fetcher;
    private instance: Promise<EntryPointResult>;

    constructor(url: string, fetcher: Fetcher) {
        this.url = url;
        this.fetcher = fetcher;
    }

    public load(): Promise<EntryPointResult> {
        if (!this.instance) {
            this.instance = EntryPointResult.Load(this.url, this.fetcher);
        }

        return this.instance;
    }
}

export class EntryPointResult {
    private client: hal.HalEndpointClient;

    public static Load(url: string, fetcher: Fetcher): Promise<EntryPointResult> {
        return hal.HalEndpointClient.Load({
            href: url,
            method: "GET"
        }, fetcher)
            .then(c => {
                return new EntryPointResult(c);
            });
    }

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    public get data(): EntryPoint {
        return this.client.GetData<EntryPoint>();
    }

    public refresh(): Promise<EntryPointResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new EntryPointResult(r);
            });
    }

    public canRefresh(): boolean {
        return this.client.HasLink("self");
    }

    public getRefreshDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("self")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasRefreshDocs(): boolean {
        return this.client.HasLinkDoc("self");
    }

    public searchUsers(query: UserSearchModel): Promise<PersonCollectionResult> {
        return this.client.LoadLinkWithQuery("SearchUsers", query)
            .then(r => {
                return new PersonCollectionResult(r);
            });
    }

    public canSearchUsers(): boolean {
        return this.client.HasLink("SearchUsers");
    }

    public getSearchUsersDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("SearchUsers")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasSearchUsersDocs(): boolean {
        return this.client.HasLinkDoc("SearchUsers");
    }
}

export class PersonResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    public get data(): Person {
        return this.client.GetData<Person>();
    }

    public refresh(): Promise<PersonResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new PersonResult(r);
            });
    }

    public canRefresh(): boolean {
        return this.client.HasLink("self");
    }

    public getRefreshDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("self")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasRefreshDocs(): boolean {
        return this.client.HasLinkDoc("self");
    }
}

export class PersonCollectionResult {
    private client: hal.HalEndpointClient;

    constructor(client: hal.HalEndpointClient) {
        this.client = client;
    }

    public get data(): PersonCollection {
        return this.client.GetData<PersonCollection>();
    }

    public get items(): PersonResult[] {
        var embeds = this.client.GetEmbed("values");
        var clients = embeds.GetAllClients();
        var result: PersonResult[] = [];
        for (var i = 0; i < clients.length; ++i) {
            result.push(new PersonResult(clients[i]));
        }
        return result;
    }

    public refresh(): Promise<PersonCollectionResult> {
        return this.client.LoadLink("self")
            .then(r => {
                return new PersonCollectionResult(r);
            });
    }

    public canRefresh(): boolean {
        return this.client.HasLink("self");
    }

    public getRefreshDocs(): Promise<hal.HalEndpointDoc> {
        return this.client.LoadLinkDoc("self")
            .then(r => {
                return r.GetData<hal.HalEndpointDoc>();
            });
    }

    public hasRefreshDocs(): boolean {
        return this.client.HasLinkDoc("self");
    }
}
export interface EntryPoint {
}
export interface UserSearchModel {
    term?: string;
}
export interface PersonCollection {
}
export interface Person {
    userId?: string;
    spcId?: number;
    userName?: string;
    firstName?: string;
    lastName?: string;
    employeeEmail?: string;
    studentEmail?: string;
    isStudent?: boolean;
    isEnrolled?: boolean;
    isEmployee?: boolean;
    isFaculty?: boolean;
}