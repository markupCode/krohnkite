

class LayoutStoreEntry {
    public layouts: ILayout[];

    public get currentLayout(): ILayout {
        if (this.layouts[0].enabled)
            return this.layouts[0];

        this.cycleLayout();
        if (this.layouts[0].enabled)
            return this.layouts[0];
        return FloatingLayout.instance;
    }

    constructor() {
        this.layouts = [
            new TileLayout(),
            new MonocleLayout(),
            new SpreadLayout(),
            new StairLayout(),
            new QuarterLayout(),
        ];
    }

    public cycleLayout() {
        const start = this.layouts[0];
        for (;;) {
            this.layouts.push(this.layouts.shift() as ILayout);
            if (this.layouts[0].enabled)
                break;
            if (this.layouts[0] === start)
                break;
        }
    }

    public setLayout(cls: any) {
        const result = this.layouts.filter((lo) =>
            lo.enabled && (lo instanceof cls));
        if (result.length === 0)
            return;
        const layout = result[0];

        while (this.layouts[0] !== layout)
            this.layouts.push(this.layouts.shift() as ILayout);
    }
}

class LayoutStore {
    private store: { [key: string]: LayoutStoreEntry  };

    constructor() {
        this.store = {};
    }

    public getCurrentLayout(ctx: IDriverContext): ILayout {
        return (ctx.ignore)
            ? FloatingLayout.instance
            : this.getEntry(ctx.id).currentLayout;
    }

    public cycleLayout(ctx: IDriverContext) {
        if (ctx.ignore)
            return;
        this.getEntry(ctx.id).cycleLayout();
    }

    public setLayout(ctx: IDriverContext, cls: any) {
        if (ctx.ignore)
            return;
        this.getEntry(ctx.id).setLayout(cls);
    }

    private getEntry(key: string): LayoutStoreEntry {
        if (!this.store[key])
            this.store[key] = new LayoutStoreEntry();
        return this.store[key];
    }
}

try {
    exports.LayoutStore = LayoutStore;
    exports.LayoutStoreEntry = LayoutStoreEntry;
} catch (e) { /* ignore */ }
