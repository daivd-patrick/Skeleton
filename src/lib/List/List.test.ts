import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import { writable } from 'svelte/store';

// @ts-ignore
import List from '$lib/List/List.svelte';

describe('List.svelte', () => {
	it('Renders without props', async () => {
		const { getByTestId } = render(List);
		expect(getByTestId('list-group')).toBeTruthy();
	});

	// Standard Lists

	it('Renders ul list', async () => {
		const { getByTestId } = render(List, { props: { role: 'ul' } });
		const element = getByTestId('list-group');
		expect(element).toBeTruthy();
	});

	it('Renders ol list', async () => {
		const { getByTestId } = render(List, { props: { role: 'ol' } });
		const element = getByTestId('list-group');
		expect(element).toBeTruthy();
	});

	it('Renders dl list', async () => {
		const { getByTestId } = render(List, { props: { role: 'dl' } });
		const element = getByTestId('list-group');
		expect(element).toBeTruthy();
	});

	// Nav & Selection

	it('Renders nav a if selected is single value', async () => {
		const { getByTestId } = render(List, { role: 'nav', selected: writable('') });
		const element = getByTestId('list-group');
		expect(element).toBeTruthy();
	});

	it('Renders nav a if selected has multiple values', async () => {
		const { getByTestId } = render(List, { role: 'nav', selected: writable([]) });
		const element = getByTestId('list-group');
		expect(element).toBeTruthy();
	});
});
