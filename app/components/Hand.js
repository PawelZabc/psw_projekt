"use client"
import next from "next";
import Card from "./Card";

export default function Hand({hand}) {
    return(
        <div className="hand">
            {hand.map((x,i)=><Card card={x} key={i}/>)}
        </div>
    )
}