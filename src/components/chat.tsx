'use client'

import { Card } from "@/components/ui/card"
import { type CoreMessage } from 'ai'
import { useState } from 'react'
import { continueTextConversation, getResponseFromCeleris } from '@/app/actions'
import { readStreamableValue } from 'ai/rsc'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IconArrowUp } from '@/components/ui/icons'
import AboutCard from "./cards/aboutcard"
import Notepad from "./notepad"
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const maxDuration = 30

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([])
  const [copyMessages, setCopyMessages] = useState<string[]>([])
  const [input, setInput] = useState<string>('')

  const [copySuccess, setCopySuccess] = useState('')

  const copySelectedText = () => {
    if( typeof window !== "undefined"){
      const selectedText = window.getSelection()?.toString()
      console.log(selectedText)
      if (selectedText) {
        setCopyMessages([...copyMessages, selectedText])
        console.log("Copied the text")
      }
    }
   
    
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: 'user' },
    ]
    setMessages(newMessages)
    setInput('')
    console.log("Getting response ...")
    const result = await continueTextConversation(newMessages)
   
    for await (const content of readStreamableValue(result)) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: content as string, 
        },
      ])
    }
  }
  
  return (
    <div className="flex h-full">
      
    <div className="flex flex-col h-4/5 justify-between w-1/2">
      {messages.length <= 0 ? ( 
        <AboutCard />  
      ) 
      : (
        <div className="max-w-xl mx-auto mt-10 mb-24">
          {messages.map((message, index) => (
            <div key={index} className="whitespace-pre-wrap flex mb-5 w-full flex-col">
              
              <div className={`${message.role === 'user' ? 'bg-blue-300 ml-auto' : 'bg-slate-200'} p-2 rounded-lg`}>
                {message.role != 'user' && <div> <ContentCopyIcon onClick={copySelectedText}></ContentCopyIcon>
                  </div>}
                {message.content as string}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="bottom-10 max-w-l">
        <div className="w-full max-w-xl mx-auto">
          <Card className="p-2">
            <form onSubmit={handleSubmit}>
              <div className="flex">
                <Input
                  type="text"
                  value={input}
                  onChange={event => {
                    setInput(event.target.value)
                  }}
                  className="w-[95%] mr-2 border-0 ring-offset-0 focus-visible:ring-0 focus-visible:outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:border-none border-transparent focus:border-transparent focus-visible:ring-none"
                  placeholder='Ask questions from 10K+ annual reports and 40K+ earning calls '
                />
                <Button disabled={!input.trim()}>
                  <IconArrowUp />
                </Button>
              </div>
              {/* {messages.length > 1 && (
                <div className="text-center">
                  <Link href="/genui" className="text-xs text-blue-400">Try GenUI and streaming components &rarr;</Link>
                </div>
              )} */}
            </form>
          </Card>
        </div>
      </div>
    </div>
    <div className="w-1/2">
      <Notepad messages={copyMessages}></Notepad>
    </div>
    </div>
  )
}
