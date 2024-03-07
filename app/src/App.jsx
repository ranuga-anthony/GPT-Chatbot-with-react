import { useState } from 'react';
//import reactLogo from './assets/react.svg';
//import viteLogo from '/vite.svg';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {MainContainer,ChatContainer,MessageList,Message,MessageInput,TypingIndicator} from "@chatscope/chat-ui-kit-react"

const api_key = "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"

// this gives chatgpt the context as to how it should provide the information based on the conversation pattern of the chat
const systemMessage = {
  "role":"system",
  "content": "Explain all concepts like a professional software engineer."
}

function App() {
  const[Typing,setTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT! Ask me any questions that you might have!",
      sender : "ChatGPT",
      direction:"incoming"
    }
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message : message,
      sender: "user",
      direction:"outgoing"
    }
    const newMessages = [...messages, newMessage]; // adding the new message to the array of old messages
  
    //updating the states of messages
    setMessages(newMessages)

    // set the chatGPT typing state to true
    setTyping(true)

    // sending message to chatgpt using API
    await MessageProcessbyChatGPT(newMessages)

    //defining a function to send messages to chatgpt using api for message processing
    async function MessageProcessbyChatGPT(ChatMessages){

      // api message array
      let apiMessages = ChatMessages.map((messageObject) => {
        let role = "";
        if(messageObject.sender === "ChatGPT"){
          role = "assistant"
        }else{
          role="user"
        }
        return{role : role, content:messageObject.message}
      })

      
      
      const apiRequestBody = {
        "model": "gpt-3.5-turbo",
        "messages":[
          systemMessage,
          ...apiMessages // array of chatmessages in api format
        ]
      }
      // http request to chatgpt api
      //const API_KEY = "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";
      
      await fetch("https://api.openai.com/v1/chat/completions",
      {
        method : "POST",
        headers: {
          "Authorization" : "Bearer " + api_key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      }).then((data)=> {
        return data.json();
      }).then((data)=>{
        console.log(data);
        console.log(data.choices[0].message.content);

        // updating the ui with the message obtained by ChatGPT through the API after identifying the position of the message in the json format.
        setMessages(
          [...ChatMessages,{
            message:data.choices[0].message.content,
            sender: "ChatGPT",
            direction: "incoming"
          }]
        )
      })
      setTyping(false);
    }
  }

  
  // testing
  return (
    
      <div className="App">
        <div style ={{position : "relative",height : "800px",width : "700px"}}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior='smooth'
                typingIndicator ={Typing?<TypingIndicator content = "ChatGPT is processing"/>:null}
              >
                {messages.map((message,i) => {
                  return <Message key = {i} model={message} />
                })}
              </MessageList>
              <MessageInput placeholder='Type message here' onSend={handleSend}/>
            </ChatContainer>
          </MainContainer>
        </div>
        
      </div>
      
  )
}

export default App
