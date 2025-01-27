"use client"
import next from "next";

export default function SendMessage({onSubmit}) {
    return(
        <>
        <input id="message_input" placeholder="message"></input>
        <button onClick={()=>{
            if (document.getElementById("message_input").value)
                {onSubmit(document.getElementById("message_input").value)}
            document.getElementById("message_input").value = ""
            }}>send</button>
        </>
    )
}