import { WeyaElementFunction } from '../../lib/weya/weya'

export interface SelectOptions {
    items: SelectItemOptions[]
    onSelect?: (value: string) => void
    selected: string
    disabled?: boolean
}

export class SelectComponent {
    private elem: HTMLDivElement
    private selectElem: HTMLSelectElement
    private items: SelectItemOptions[]
    private readonly onSelect?: (value: string) => void

    constructor(opt: SelectOptions) {
        this.items = opt.items
        this._selected = opt.selected
        this.onSelect = opt.onSelect
        this._disabled = opt.disabled ?? false
    }

    private _disabled: boolean

    set disabled(value: boolean) {
        this._disabled = value
        this.selectElem.disabled = this._disabled
    }

    private _selected: string

    get selected() {
        return this.selectElem.value
    }

    set selected(value: string) {
        this._selected = value
        this.selectElem.value = this._selected
    }

    render($: WeyaElementFunction) {
        this.elem = $('div', '.input-container.mt-2', ($) => {
            $('div', '.select-content', ($) => {
                this.selectElem = $(
                    'select',
                    {
                        on: {
                            change: this.onSelectChange.bind(this),
                        },
                    },
                    ($) => {
                        this.items.forEach((value) => {
                            new SelectItem(value).render($)
                        })
                    }
                )
                this.selectElem.value = this._selected
                this.selectElem.disabled = this._disabled
            })
        })
    }

    private onSelectChange() {
        this._selected = this.selectElem.value
        if (this.onSelect) {
            this.onSelect(this.selectElem.value)
        }
    }
}

interface SelectItemOptions {
    item: string
    title?: string
    placeholder?: boolean
}

export class SelectItem {
    private readonly item: string
    private readonly title: string
    private readonly placeholder: boolean

    constructor(opt: SelectItemOptions) {
        this.item = opt.item
        this.title = opt.title ?? this.item
        this.placeholder = opt.placeholder
    }

    render($: WeyaElementFunction) {
        let elem = $('option', { value: this.item })
        if (this.placeholder) {
            elem.disabled = true
            elem.hidden = true
        }
        elem.innerText = this.title
    }
}

export interface NamedSelectOptions extends SelectOptions {
    name: string
}

export class NamedSelectComponent extends SelectComponent {
    private name: string

    constructor(opt: NamedSelectOptions) {
        super(opt)
        this.name = opt.name
    }

    render($: WeyaElementFunction) {
        $('div', `.input-item`, ($) => {
            $('span', '.item-key', this.name)
            super.render($)
        })
    }
}
