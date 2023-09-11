import { useEffect, useRef } from 'react'

const useIsFirstMount=()=>{
    const firstMount=useRef(true)

    useEffect(()=>{
        firstMount.current=false;
        return()=>firstMount.current=true
    },[])

    return firstMount.current
}

export default useIsFirstMount