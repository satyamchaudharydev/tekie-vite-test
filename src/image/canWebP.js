let shouldUseWebp = null

function canUseWebP() {
  if (global && global.webp) return true
  if (typeof document === 'undefined') return false
  if (shouldUseWebp === null) {
    var elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
        shouldUseWebp = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        return shouldUseWebp
    }
    shouldUseWebp = false
    return false;
  }
  return shouldUseWebp
}

export default canUseWebP
