import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

import { writable, type Writable } from 'svelte/store';

// @ts-ignore
import Stepper from '$lib/Stepper/Stepper.svelte';

export let active: Writable<number> = writable(0);

describe('Stepper.svelte', () => {
	it('Renders without props', async () => {
		const { getByTestId } = render(Stepper);
		expect(getByTestId('stepper')).toBeTruthy();
	});

	it('Renders with props', () => {
		const { getByTestId } = render(Stepper, {
			props: {
				active,
				length: 3,
				accent: 'bg-green-500',
				background: 'bg-surface-500'
			}
		});
		expect(getByTestId('stepper')).toBeTruthy();
	});
});
