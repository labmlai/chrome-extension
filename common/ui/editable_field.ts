import { WeyaElementFunction } from '../../lib/weya/weya'

interface EditableFieldOptions {
    value: any
    placeholder?: string
    isEditable?: boolean
    numEditRows?: number
    type?: string
    inline?: boolean
    customClass?: string
    disabled?: boolean
    autocomplete?: string
    required?: boolean
}

export class EditableField {
    private value: any
    private placeholder: string
    private isEditable: boolean
    private numEditRows: number
    private inputElem: HTMLInputElement | HTMLTextAreaElement
    private valueElem: HTMLSpanElement
    protected type: string
    private readonly inline: boolean
    private readonly customClass: string
    private readonly autocomplete?: string
    private readonly required: boolean

    constructor(opt: EditableFieldOptions) {
        this.value = opt.value
        this.placeholder = opt.placeholder
        this.isEditable = opt.isEditable
        this.numEditRows = opt.numEditRows
        this.type = opt.type
        this.inline = opt.inline ?? false
        this.customClass = opt.customClass ?? ''
        this._disabled = opt.disabled ?? false
        this.autocomplete = opt.autocomplete
        this.required = opt.required ?? false
    }

    private _disabled: boolean

    set disabled(value: boolean) {
        this._disabled = value
        this.inputElem.disabled = value
    }

    getInput() {
        return this.inputElem.value
    }

    updateValue(value: string) {
        this.valueElem.textContent = value
    }

    render($: WeyaElementFunction) {
        if (this.isEditable) {
            $(
                'div',
                `.input-container.mt-2${this.inline ? '.inline' : ''}`,
                ($) => {
                    $('div', '.input-content', ($) => {
                        if (this.numEditRows) {
                            this.inputElem = $('textarea', this.customClass, {
                                rows: this.numEditRows,
                                placeholder: this.placeholder,
                                value: this.value,
                                autocomplete: this.autocomplete,
                            })
                            this.inputElem.textContent = this.value
                        } else {
                            this.inputElem = $('input', this.customClass, {
                                placeholder: this.placeholder,
                                value: this.value,
                                type: this.type,
                                autocomplete: this.autocomplete,
                            })
                        }
                        this.inputElem.required = this.required
                        this.inputElem.disabled = this._disabled
                    })
                }
            )
        } else {
            this.valueElem = $('span', '.item-value')
            this.updateValue(this.value)
        }
    }
}

interface NamedEditableFieldOptions extends EditableFieldOptions {
    name: string
}

export class NamedEditableField extends EditableField {
    name: string

    constructor(opt: NamedEditableFieldOptions) {
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
