"use client"
import { CoreMessage } from "ai";
import React from "react";
import { Button } from "./ui/button";
import FileDownload from '@mui/icons-material/FileDownload';
import { Document, Packer, Paragraph, TextRun } from "docx";


const FileSaver = require('file-saver');

interface Props {
  messages: string[]
}


export default function Notepad({messages}: Props) {
    const generateDoc = () => {

      var children: TextRun[] = []
      messages.map((message, index) => (
        children.push( new TextRun({
          text: message,
          bold: false,
        }))
      ))
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: children
              }),
            ],
          },
        ],
      })

      Packer.toBlob(doc).then((blob) => {
        FileSaver.saveAs(blob, "research.docx");
      });
      
    }
    return (
      <div className="flex flex-col  bg-white h-full">
        <div className="flex flex-row justify-between">
        <div className="flex h-10 m-10 text-black text-2xl font-semibold leading-none tracking-tight
         border-blue-100"> Scratchpad</div>
         <div className="flex h-10 m-8 text-black"> <button 
         onClick={generateDoc} type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mx-2">
          Export to Docx </button>
         </div>
        </div>
      
        {messages.map((message, index) => (
            <div key={index} className="whitespace-pre-wrap flex mb-5 w-full flex-col">
              
              <div className= "p-2 rounded-lg mx-14">
                {message as string}
              </div>
            </div>
          ))}
      </div>
    )
  }