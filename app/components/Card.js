"use client"
import next from "next";
import { useState } from "react";

export default function SendMessage({onSubmit}) {
    const [card,selected] = useState(false)
    return(
        <div className="send-message">
        <input id="message_input" placeholder="message"></input>
        <button onClick={()=>{
            if (document.getElementById("message_input").value)
                {onSubmit(document.getElementById("message_input").value)}
            document.getElementById("message_input").value = ""
            }}>send</button>
        </div>
    )
}