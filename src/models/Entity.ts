export class Entity<TEntity> {
	constructor(protected readonly source: TEntity) {}

	public get<TKey extends keyof TEntity>(key: TKey): TEntity[TKey] {
		return this.source?.[key];
	}
	public construct<TKey extends keyof TEntity, T>(key: TKey, ctor: new (source: TEntity[TKey]) => T): T | null {
		let source = this.get(key);
		return source
			? new ctor(source)
			: null;
	}
}
