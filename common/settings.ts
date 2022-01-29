export interface Settings {
    linkType: LinkType
    emoji?: string
}

export enum LinkType {
    button = 'button',
    emoji = 'emoji',
    override = 'override',
    none = 'none',
}

export let DEFAULT_SETTINGS: Settings = {
    linkType: LinkType.none,
    emoji: '📎',
}
