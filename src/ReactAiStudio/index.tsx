import React from "react";
import { getConversationDetailAPI } from "../apis/chat";

export default function App() {

    const [message, setMessage] = React.useState('Hello World');
    async function handleClick() {
        const res = await getConversationDetailAPI(2,4);
        console.log('res',res.data.id);
    }
    return <div onClick={handleClick}>{message}</div>
}