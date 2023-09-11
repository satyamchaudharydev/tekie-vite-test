import { useEffect, useRef } from "react"

const useClickOutside = (handler) => {
    if(!handler) return

    const nodeRef = useRef()

    useEffect(() => {
        const clickHandler = (e) => {
            if (nodeRef.current === e.target) {
                handler()
            }
        }
        nodeRef.current.addEventListener('click', clickHandler)
        return () => {
            if (nodeRef.current) {
                nodeRef.current.removeEventListener('click', clickHandler)
            }
        }
    }, [])

    return nodeRef
}

export default useClickOutside