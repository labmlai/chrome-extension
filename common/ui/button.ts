import { WeyaElement, WeyaElementFunction } from '../../lib/weya/weya'

export interface ButtonOptions {
    onButtonClick?: () => void
    isDisabled?: boolean
}

export abstract class Button {
    onButtonClick: () => void
    isDisabled: boolean
    elem?: WeyaElement

    protected constructor(opt: ButtonOptions) {
        this.onButtonClick = opt.onButtonClick
        this.isDisabled = opt.isDisabled ? opt.isDisabled : false
    }

    set disabled(isDisabled: boolean) {
        this.isDisabled = isDisabled
        if (this.elem) {
            if (this.isDisabled) {
                this.elem.classList.add('disabled')
                return
            }
            this.elem.classList.remove('disabled')
        }
    }

    onClick = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (!this.isDisabled) {
            this.onButtonClick()
        }
    }

    hide = (isHidden: boolean) => {
        if (this.elem == null) {
            return
        }
        if (isHidden) {
            this.elem.classList.add('hide')
        } else {
            this.elem.classList.remove('hide')
        }
    }

    render($: WeyaElementFunction) {}

    remove() {
        this.elem.remove()
    }
}

interface CustomIconButtonOptions extends ButtonOptions {
    text?: string
    icon: string
}

export class CustomIconButton extends Button {
    private readonly icon: string
    private readonly text?: string
    private iconElem: HTMLSpanElement

    constructor(opt: CustomIconButtonOptions) {
        super(opt)
        this.icon = opt.icon
        this.text = opt.text
    }

    set isLoading(value: boolean) {
        if (value) {
            this.iconElem.className = 'icon fas fa-sync spin'
        } else {
            this.iconElem.className = `icon ${this.icon.replace(/\./g, ' ')}`
        }
        this.disabled = value
    }

    render($: WeyaElementFunction) {
        this.elem = $(
            'div',
            '.nav-link.tab.icon-container.custom-button.upper-case',
            {
                on: { click: this.onClick },
            },
            ($) => {
                this.iconElem = $('span', `.icon${this.icon}`)
                if (this.text != null) {
                    $('span', this.text)
                }
            }
        )
    }
}
