export const fadeIn = {
    initial: {
        opacity: 0
    },
    final: {
        opacity: 1
    }
}

export const popOut = {
    initial: {
        x: '-25%',
        y: '-50%',
        opacity: 0.6,
        scale: 0.4,
    },
    final: {
        x: '-50%',
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4
        }
    }
}