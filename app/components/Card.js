"use client"
import next from "next";
import { useState } from "react";

// 

export default function Card({card}) {
    const [selected,setSelected] = useState(false)
    const suit = card
    const value = card
    return(
        <div onClick={()=>(setSelected((selected)?false:true))}
        className={(selected)?"card selected":"card"}>
            <div className="first"></div>
                <div className="card-inside">
                </div>
            <div className="second"></div>

        </div>
    )
}