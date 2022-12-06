// Data Table Utilities
// A set of utility features for local template-driven data tables.

import { get, writable } from 'svelte/store';
import type { DataTableModel, DataTableOptions } from './types';

// Exports

export * from './types';
export * from './actions';

/** Creates the writeable store for the data table */
export function createDataTableStore<T extends Record<PropertyKey, any>>(source: T[], options: DataTableOptions<T> = {}) {
	// Creates a new source that also adds the `dataTableChecked` property to each row object
	const modifiedList = source.map((rowObj) => ({ ...rowObj, dataTableChecked: false }));
	const { subscribe, set, update } = writable<DataTableModel<T>>({
		source,
		base: modifiedList,
		filtered: modifiedList,
		sortState: { lastKey: '', asc: true },
		selection: [],
		search: options.search ?? '',
		sort: options.sort ?? ''
	});

	return {
		subscribe,
		/** Sets a new data source while maintaining the state of the original source */
		updateSource: (data: T[]) =>
			update((model) => {
				model.source = data;
				model.base = data.map((row, i) => {
					return { ...row, dataTableChecked: model.base[i]?.dataTableChecked ?? false };
				});
				return { ...model, filtered: model.base };
			}),
		/** Triggered by the "select all" checkbox to toggle all row selection. */
		selectAll: (checked: boolean) => {
			update((model) => {
				// checks/unchecks all of the rows
				model.base.forEach((row) => {
					row.dataTableChecked = checked;
					return row;
				});
				return model;
			});
		},
		/** Allows you to dynamically pre-select rows on-demand. */
		select: (key: keyof T, valuesArr: unknown[]) => {
			// TODO: maybe can improve?
			update((model) => {
				model.filtered.map((row) => {
					if (valuesArr.includes(row[key])) row.dataTableChecked = true;
					return row;
				});
				return model;
			});
		},
		/** Listens for clicks to a table heading with `data-sort` attribute. Updates `$dataTableModel.sort`. */
		sort: (event: Event) => {
			update((model) => {
				if (!(event.target instanceof Element)) return model;
				const newSortKey: keyof T | null | '' = event.target.getAttribute('data-sort');
				// If same key used repeated, toggle asc/dsc order
				if (newSortKey !== '' && newSortKey === model.sortState.lastKey) model.sortState.asc = !model.sortState.asc;
				// Cache the last key used
				model.sortState.lastKey = newSortKey;
				// Update sort key
				model.sort = newSortKey ?? '';
				return model;
			});
		},
		set
	};
}

// Data Table Handler

/** Listens for changes to `$dataTableModel` and triggers: search, selection, sort, and pagination. */
export function dataTableHandler<T extends Record<PropertyKey, any>>(store: DataTableModel<T>): void {
	searchHandler(store);
	selectionHandler(store);
	sortHandler(store);
	paginationHandler(store);
}

// Search ---

function searchHandler<T extends Record<PropertyKey, unknown>>(store: DataTableModel<T>): void {
	store.filtered = store.base.filter((rowObj) => {
		const formattedSearchTerm = store.search?.toLowerCase() || '';
		return Object.values(rowObj).join(' ').toLowerCase().includes(formattedSearchTerm);
	});
}

// Selection ---

function selectionHandler<T extends Record<PropertyKey, unknown>>(store: DataTableModel<T>): void {
	store.selection = store.base.filter((row) => row.dataTableChecked === true); // ? should this be filtered by source or filter?
}

// Sort ---

function sortHandler<T extends Record<PropertyKey, unknown>>(store: DataTableModel<T>): void {
	if (!store.sort) return;
	// Sort order based on current sortState.asc value
	store.sortState.asc ? sortOrder('asc', store) : sortOrder('dsc', store);
}

function sortOrder<T extends Record<PropertyKey, unknown>>(order: string, store: DataTableModel<T>): void {
	const key = store.sort;
	store.filtered = store.base.sort((x, y) => {
		// If descending, swap x/y
		if (order === 'dsc') [x, y] = [y, x];
		// Sort logic
		if (typeof x[key] === 'string' && typeof y[key] === 'string') {
			return String(x[key]).localeCompare(String(y[key]));
		} else {
			return (x[key] as number) - (y[key] as number);
		}
	});
}

// Pagination ---

function paginationHandler<T extends Record<PropertyKey, unknown>>(store: DataTableModel<T>): void {
	if (store.pagination) {
		// Slice for Pagination
		const filtered = store.base.slice(
			store.pagination.offset * store.pagination.limit, // start
			store.pagination.offset * store.pagination.limit + store.pagination.limit // end
		);

		// filter by search if currently searching
		if (store.search !== '') {
			store.filtered = store.filtered.slice(0, store.pagination.limit);
			// Set Current Size
			store.pagination.size = store.filtered.length;
		} else {
			store.filtered = filtered;
			// Set Current Size
			store.pagination.size = store.base.length;
		}
	}
}
