import next from "next";
import Message from "./Message";
import SendMessage from "./SendMessage";

export default function ChatBox({messages,onSend}) {
    return (
        <div className="chat-box">
        {messages.map((x,i)=>(<Message key={i} message={x}/>))}
        <SendMessage onSubmit={onSend}/>
        </div>
      )
    

}