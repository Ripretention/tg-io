export class Entity<TEntity> {
	constructor(protected readonly source: TEntity) {}

	public get<TKey extends keyof TEntity>(key: TKey): TEntity[TKey] {
		return this.source[key];
	}
}
