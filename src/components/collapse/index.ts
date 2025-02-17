/* eslint-disable @typescript-eslint/no-empty-function */
import type { CollapseOptions } from './types';
import { CollapseInterface } from './interface';
import instances from '../../dom/instances';

const Default: CollapseOptions = {
    onCollapse: () => {},
    onExpand: () => {},
    onToggle: () => {},
};

class Collapse implements CollapseInterface {
    _targetEl: HTMLElement | null;
    _triggerEl: HTMLElement | null;
    _options: CollapseOptions;
    _visible: boolean;
    _initialized: boolean;
    _clickHandler: EventListenerOrEventListenerObject;

    constructor(
        targetEl: HTMLElement | null = null,
        triggerEl: HTMLElement | null = null,
        options: CollapseOptions = Default
    ) {
        this._targetEl = targetEl;
        this._triggerEl = triggerEl;
        this._options = { ...Default, ...options };
        this._visible = false;
        this._initialized = false;
        this.init();
        instances.addInstance('Collapse', this, this._targetEl.id, true);
    }

    init() {
        if (this._triggerEl && this._targetEl && !this._initialized) {
            if (this._triggerEl.hasAttribute('aria-expanded')) {
                this._visible =
                    this._triggerEl.getAttribute('aria-expanded') === 'true';
            } else {
                // fix until v2 not to break previous single collapses which became dismiss
                this._visible = !this._targetEl.classList.contains('hidden');
            }

            this._clickHandler = () => {
                this.toggle();
            };

            this._triggerEl.addEventListener('click', this._clickHandler);
            this._initialized = true;
        }
    }

    destroy() {
        if (this._triggerEl && this._initialized) {
            this._triggerEl.removeEventListener('click', this._clickHandler);
            this._initialized = false;
        }
    }

    removeInstance() {
        instances.removeInstance('Collapse', this._targetEl.id);
    }

    destroyAndRemoveInstance() {
        this.destroy();
        this.removeInstance();
    }

    collapse() {
        this._targetEl.classList.add('hidden');
        if (this._triggerEl) {
            this._triggerEl.setAttribute('aria-expanded', 'false');
        }
        this._visible = false;

        // callback function
        this._options.onCollapse(this);
    }

    expand() {
        this._targetEl.classList.remove('hidden');
        if (this._triggerEl) {
            this._triggerEl.setAttribute('aria-expanded', 'true');
        }
        this._visible = true;

        // callback function
        this._options.onExpand(this);
    }

    toggle() {
        if (this._visible) {
            this.collapse();
        } else {
            this.expand();
        }
        // callback function
        this._options.onToggle(this);
    }
}

export function initCollapses() {
    document
        .querySelectorAll('[data-collapse-toggle]')
        .forEach(($triggerEl) => {
            const targetId = $triggerEl.getAttribute('data-collapse-toggle');
            const $targetEl = document.getElementById(targetId);

            // check if the target element exists
            if ($targetEl) {
                new Collapse(
                    $targetEl as HTMLElement,
                    $triggerEl as HTMLElement
                );
            } else {
                console.error(
                    `The target element with id "${targetId}" does not exist. Please check the data-collapse-toggle attribute.`
                );
            }
        });
}

if (typeof window !== 'undefined') {
    window.Collapse = Collapse;
    window.initCollapses = initCollapses;
}

export default Collapse;
