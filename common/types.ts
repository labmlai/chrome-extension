export type EnumDictionary<E extends string | number, V> = {
    [K in E]: V
}
