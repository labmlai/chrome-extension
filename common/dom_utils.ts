export function clearChildElements(elem: HTMLElement) {
    // Comparison: https://www.measurethat.net/Benchmarks/Show/13770/0/innerhtml-vs-innertext-vs-removechild-vs-remove#latest_results_block
    while (elem.firstChild) {
        elem.firstChild.remove()
    }
}
