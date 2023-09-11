const scrollStop = (eventTarget = window, callback) => {
  if (!callback || typeof callback !== 'function') return;

  let isScrolling;
  eventTarget.addEventListener('scroll', event => {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
			callback();
		}, 66);
  }, false)

}

export default scrollStop