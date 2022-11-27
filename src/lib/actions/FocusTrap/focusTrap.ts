// Action: Focus Trap

export function focusTrap(node: HTMLElement, enabled: boolean) {
	const elemWhitelist: string = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
	let elemFirst: HTMLElement;
	let elemLast: HTMLElement;

	function onElemLastKeydown(e: KeyboardEvent): void {
		if (!e.shiftKey && e.code === 'Tab') {
			e.preventDefault();
			elemFirst.focus();
		}
	}

	function onElemFirstKeydown(e: KeyboardEvent): void {
		if (e.shiftKey && e.code === 'Tab') {
			e.preventDefault();
			elemLast.focus();
		}
	}

	const onInit = () => {
		if (enabled === false) return;
		// Gather all focusable elements
		const focusableElems: HTMLElement[] = Array.from(node.querySelectorAll(elemWhitelist));
		if (focusableElems.length) {
			// Set first/last focusable elements
			elemFirst = focusableElems[0];
			elemLast = focusableElems[focusableElems.length - 1];
			// Auto-focus first focusable element
			elemFirst.focus();
			// Listen for keydown on first & last element
			elemFirst.addEventListener('keydown', onElemFirstKeydown);
			elemLast.addEventListener('keydown', onElemLastKeydown);
		}
	};
	onInit();

	function onDestory(): void {
		if (elemLast) elemLast.removeEventListener('keydown', onElemLastKeydown);
	}

	// Lifecycle
	return {
		update(newArgs: boolean) {
			enabled = newArgs;
			newArgs ? onInit() : onDestory();
		},
		destroy() {
			onDestory();
		}
	};
}
