"use client"

import { CreateServerModal } from "../modals/create-server-modal"
import { useState, useEffect } from "react"

export const ModalProvider = () =>{
    const [ isMounted, setIsMounted ] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    },[]);

    if(!isMounted){
        return null;
    }
    
    return (
        <> 
            <CreateServerModal/>
        </>
    )
}

