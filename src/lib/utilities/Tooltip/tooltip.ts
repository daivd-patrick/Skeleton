// Action: Tooltip

export interface ArgsTooltip {
	content: string;
	position?: string;
	// Style Overrides
	background?: string;
	color?: string;
	width?: string;
	padding?: string;
	shadow?: string;
	rounded?: string;
	// Regions
	regionContainer?: string;
	regionTooltip?: string;
	regionArrow?: string;
}

export function tooltip(node: HTMLElement, args: ArgsTooltip) {
	const animDuration: number = 150;
	let elemTooltip: HTMLElement;

	// Map the Args and provide default values
	// prettier-ignore
	const {
        content = '(tooltip)',
        position = 'top',
        // Regions
        regionContainer = 'regionContainer',
        regionTooltip = 'regionTooltip',
        regionArrow = 'regionArrow'
    }: ArgsTooltip = args;

	// Create a wrapping element, set relative positioning
	const createElemContainer = (): void => {
		const elemContainer = document.createElement('div');
		elemContainer.classList.add('tooltip-container', 'relative', regionContainer);
		node.parentNode?.insertBefore(elemContainer, node);
		elemContainer.appendChild(node);
	};
	createElemContainer();

	// Create the tooltip element
	// prettier-ignore
	const createElemTooltip = (): void => {
		elemTooltip = document.createElement('div');
		elemTooltip.classList.add('tooltip', `tooltip-${position}`, 'hidden', regionTooltip);
        if (args.background) { elemTooltip.classList.add(args.background); }
        if (args.color) elemTooltip.classList.add(args.color);
        if (args.width) elemTooltip.classList.add(args.width);
        if (args.padding) elemTooltip.classList.add(args.padding);
        if (args.shadow) elemTooltip.classList.add(args.shadow);
        if (args.rounded) elemTooltip.classList.add(args.rounded);
		elemTooltip.setAttribute('role', 'tooltip');
		elemTooltip.setAttribute('data-testid', 'tooltip');
		elemTooltip.innerHTML = content;
		node.parentNode?.insertBefore(elemTooltip, node);
	};
	createElemTooltip();

	// Create the tooltip arrow
	// prettier-ignore
	const createElemArrow = (): void => {
		const elemArrow = document.createElement('div');
		elemArrow.classList.add(`tooltip-arrow-${position}`, regionArrow);
        if (args.background) elemArrow.classList.add(args.background);
		elemTooltip.append(elemArrow);
	};
	createElemArrow();

	// On mouse over - show the tooltip
	const onMouseOver = (): void => {
		elemTooltip.classList.remove('hidden');
		setTimeout(() => {
			elemTooltip.classList.add('!opacity-100');
		}, animDuration);
	};

	// On mouse out - hide the tooltip
	const onMouseOut = (): void => {
		elemTooltip.classList.remove('!opacity-100');
		setTimeout(() => {
			elemTooltip.classList.add('hidden');
		}, animDuration);
	};

	// A11y Input Handler
	const onWindowKeyDown = (event: KeyboardEvent): void => {
		if (event.code === 'Escape') onMouseOut();
	};

	// Event Listner
	node.addEventListener('mouseover', onMouseOver);
	node.addEventListener('mouseout', onMouseOut);
	window.addEventListener('keydown', onWindowKeyDown);

	// Lifecycle
	return {
		update(newArgs: ArgsTooltip) {
			args = newArgs;
		},
		destroy() {
			node.removeEventListener('mouseover', onMouseOver);
			node.removeEventListener('mouseout', onMouseOut);
			window.removeEventListener('keydown', onWindowKeyDown);
		}
	};
}
