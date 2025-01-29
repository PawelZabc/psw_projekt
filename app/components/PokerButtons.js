"use client"
import next from "next";

export default function PokerButtons({handleClick,startClicked}) {
    return(
        <div id="menu">
            <button onClick={()=>startClicked()}>start</button>
            <button onClick={()=>handleClick()}>check</button>
            <button onClick={()=>handleClick()}>raise</button>
            <button onClick={()=>handleClick()}>swap</button>
            <button onClick={()=>handleClick()}>fold</button>
        </div>
    )
}