import Image from "next/image";
import Message from "./components/Message";

export default function Home() {
  const messages = [
    {text:"hello",sender:"server"},
    {text:"im the server",sender:"server"}]
  return (
    messages.map((x,i)=>(<Message key={i} message={x}/>))
  )
}
