export class StringUtils {
	public static capitalizeFirst = (str: string) => 
		str[0].toUpperCase() + str.slice(1);
}
export class ObjectUtils {
	public static filterObjectByKey<TObject, TKey extends keyof TObject>(object: TObject, predicate: (key: TKey) => boolean) {
		return (Object.keys(object) as TKey[])
			.filter(predicate)
			.reduce((res, key) => (res[key] = object[key], res), {} as Record<TKey, any>) as TObject
	}
}
