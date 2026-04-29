/**
 * JSDOM test setup helpers
 *
 * This file provides helper functions for common DOM element mocking
 * needs in Tabulator tests.
 */

declare global {
	function createSpyElement(tagName: string): HTMLElement;
	function createMockEvent(type: string, props?: Record<string, any>): Event;
	function createMockColumn(definition?: Record<string, any>): {
		definition: Record<string, any>;
		titleElement: { insertBefore: jest.Mock; firstChild: object };
		getComponent: jest.Mock;
	};
}

// Create an element with automatic spy functions on common methods
(global as any).createSpyElement = (tagName: string): HTMLElement => {
	const element = document.createElement(tagName);

	// Add spies to common DOM methods
	element.appendChild = jest.fn().mockImplementation(element.appendChild.bind(element));
	element.addEventListener = jest.fn().mockImplementation(element.addEventListener.bind(element));
	element.classList.add = jest.fn().mockImplementation(element.classList.add.bind(element.classList));
	element.classList.remove = jest.fn().mockImplementation(element.classList.remove.bind(element.classList));

	return element;
};

// Helper method to create mock events with required properties
(global as any).createMockEvent = (type: string, props: Record<string, any> = {}): Event => {
	let event: Event;

	if (type === 'click' || type === 'mousedown' || type === 'mouseup') {
		event = new MouseEvent(type, { bubbles: true, cancelable: true, ...props });
	} else {
		event = new Event(type, { bubbles: true, cancelable: true, ...props });
	}

	// Add any additional properties
	Object.entries(props).forEach(([key, value]) => {
		if (!(event as any)[key]) {
			(event as any)[key] = value;
		}
	});

	// Add spy on preventDefault
	const originalPreventDefault = event.preventDefault.bind(event);
	event.preventDefault = jest.fn().mockImplementation(originalPreventDefault);

	return event;
};

// Helper for column creation
(global as any).createMockColumn = (definition: Record<string, any> = {}) => {
	return {
		definition,
		titleElement: {
			insertBefore: jest.fn(),
			firstChild: {}
		},
		getComponent: jest.fn().mockReturnValue({ column: true })
	};
};

export {};
