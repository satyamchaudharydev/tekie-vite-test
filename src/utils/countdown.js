const countdown = (duration, timerCallback = () => {}, doneCallback = () => {}) => {
  let start = Date.now();
  let diff;
  let minutes;
  let seconds;
  let intervalTimer = null
  function timer() {
    diff = duration - (((Date.now() - start) / 1000) | 0);

    minutes = (diff / 60) | 0;
    seconds = (diff % 60) | 0;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (seconds === '00') {
      timerCallback(minutes, '60')
    } else {
      timerCallback(minutes, seconds)
    }

    if (diff <= 0) {
      doneCallback()
      clearInterval(intervalTimer)
    }
  };
  timer();
  intervalTimer = setInterval(timer, 1000);
}

export default countdown