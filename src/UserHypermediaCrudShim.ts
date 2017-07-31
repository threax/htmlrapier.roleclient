import * as pageWidget from 'hr.widgets.PageNumberWidget';
import * as crudPage from 'hr.widgets.CrudPage';

export interface HypermediaCrudEntryInjector {
    load(): Promise<any>;
}

export interface HypermediaCrudCollection {
    data: pageWidget.OffsetLimitTotal;
    items: any;

    refresh();
    canRefresh();

    previous();
    canPrevious();

    next();
    canNext();

    first();
    canFirst();

    last();
    canLast();
}

export interface HypermediaCrudDataResult {
    data: any;
}

export abstract class HypermediaCrudService extends crudPage.ICrudService {
    private entry: HypermediaCrudEntryInjector;
    private currentPage: HypermediaCrudCollection;

    constructor(entry: HypermediaCrudEntryInjector) {
        super();
        this.entry = entry;
    }

    public async getItemSchema() {
        var entryPoint = await this.entry.load();
        var docs = await this.getActualSchema(entryPoint);
        return docs.requestSchema;
    }

    protected abstract getActualSchema(entryPoint): Promise<any>;

    public async getListingSchema() {
        return undefined;
    }

    public async getSearchSchema() {
        var entryPoint = await this.entry.load();
        var docs = await this.getActualSearchSchema(entryPoint);
        return docs.requestSchema;
    }

    protected abstract getActualSearchSchema(entryPoint): Promise<any>;

    public async add(item?: any) {
        if (item === undefined) {
            item = {};
        }
        this.fireShowItemEditorEvent(new crudPage.ShowItemEditorEventArgs(item, a => this.finishAdd(a)));
    }

    private async finishAdd(data) {
        var entryPoint = await this.entry.load();
        await this.commitAdd(entryPoint, data);
        this.refreshPage();
    }

    protected abstract commitAdd(entryPoint, data): Promise<any>;

    public async canAdd() {
        var entryPoint = await this.entry.load();
        return this.canAddItem(entryPoint);
    }

    protected abstract canAddItem(entryPoint): boolean;

    public async edit(item: HypermediaCrudDataResult) {
        var data = this.getEditObject(item);
        this.editData(item, data);
    }

    public editData(item: HypermediaCrudDataResult, dataPromise: Promise<any>) {
        this.fireShowItemEditorEvent(new crudPage.ShowItemEditorEventArgs(dataPromise, a => this.finishEdit(a, item)));
    }

    protected async getEditObject(item: HypermediaCrudDataResult) {
        return item.data;
    }

    private async finishEdit(data, item: HypermediaCrudDataResult) {
        await this.commitEdit(data, item);
        this.refreshPage();
    }

    protected abstract commitEdit(data, item: HypermediaCrudDataResult): Promise<any>;

    public async del(item: HypermediaCrudDataResult) {
        await this.commitDelete(item);
        this.refreshPage();
    }

    protected abstract commitDelete(item: HypermediaCrudDataResult): Promise<any>;

    public getPage(query: any) {
        var loadingPromise = this.getPageAsync(query);
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(loadingPromise));
        return loadingPromise;
    }

    private async getPageAsync(query: any) {
        var entryResult = await this.entry.load();

        if (this.canList(entryResult)) {
            this.currentPage = await this.list(entryResult, query);
            return this.currentPage;
        }
        else {
            throw new Error("No permissions to list people, cannot get page.");
        }
    }

    protected abstract canList(entryPoint): boolean;

    protected abstract list(entryPoint, query): Promise<HypermediaCrudCollection>;

    public firstPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.firstPageAsync()));
    }

    private async firstPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canFirst()) {
                this.currentPage = await this.currentPage.first();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot visit the first page, no link found.");
            }
        }
        else {
            throw new Error("Cannot visit the first page until a page has been loaded.");
        }
    }

    public lastPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.lastPageAsync()));
    }

    private async lastPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canLast()) {
                this.currentPage = await this.currentPage.last();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot visit the last page, no link found.");
            }
        }
        else {
            throw new Error("Cannot visit the last page until a page has been loaded.");
        }
    }

    public nextPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.nextPageAsync()));
    }

    private async nextPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canNext()) {
                this.currentPage = await this.currentPage.next();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot visit the next page, no link found.");
            }
        }
        else {
            throw new Error("Cannot visit the next page until a page has been loaded.");
        }
    }

    public previousPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.previousPageAsync()));
    }

    private async previousPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canPrevious()) {
                this.currentPage = await this.currentPage.previous();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot visit the previous page, no link found.");
            }
        }
        else {
            throw new Error("Cannot visit the previous page until a page has been loaded.");
        }
    }

    public refreshPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.refreshPageAsync()));
    }

    private async refreshPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canRefresh()) {
                this.currentPage = await this.currentPage.refresh();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot refresh the page, no link found.");
            }
        }
        else {
            throw new Error("Cannot refresh the page until a page has been loaded.");
        }
    }

    public getItems(list: HypermediaCrudCollection) {
        return list.items;
    }

    public getListingDisplayObject(item: HypermediaCrudDataResult) {
        return item.data;
    }

    public getPageNumberState(list: HypermediaCrudCollection) {
        return new pageWidget.HypermediaPageState(list);
    }
}