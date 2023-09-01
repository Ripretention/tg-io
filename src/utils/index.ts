export * from "./Middleware";

export function capitalize(str: string) {
	return str[0].toUpperCase() + str.slice(1);
}

export function filterObjectByKey<TObject, TKey extends keyof TObject>(
	object: TObject,
	predicate: (key: TKey) => boolean
) {
	return (Object.keys(object) as TKey[])
		.filter(predicate)
		.reduce(
			(res, key) => ((res[key] = object[key]), res),
			{} as Record<TKey, any>
		) as TObject;
}

export function groupByKey<TObject, TKey extends keyof TObject>(
	arr: TObject[],
	key: TKey
) {
	let grouped: {
		key: TObject[TKey];
		values: TObject[];
	}[] = [];

	for (let elem of arr) {
		let index = grouped.findIndex(
			g => JSON.stringify(g.key) === JSON.stringify(elem[key])
		);
		if (index == -1) {
			index = grouped.length;
			grouped.push({ key: elem[key], values: [] });
		}
		grouped[index].values.push(elem);
	}

	return grouped;
}
