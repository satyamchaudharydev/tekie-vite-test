export const hs = (width, factor = 1, size = 1920) => (width / size) * ((typeof window === 'undefined') ? 0 : window.innerWidth)
export const hvs = (width, factor = 1, size = 1920) => `${(((width / size) * 100))}vw`
export const hsm = (width, factor = 1, size = 414) => (width / size) * ((typeof window === 'undefined') ? 0 : window.innerWidth)