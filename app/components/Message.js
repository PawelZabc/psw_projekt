import next from "next";

export default function Message({message}) {

    return(
        <div className="message">{message.sender + ":" + message.text}</div>
    )
    

}