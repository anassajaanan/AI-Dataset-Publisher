"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ChatMessageProps {
  message: string
  isUser?: boolean
  avatar?: string
  name?: string
  timestamp?: string
  className?: string
}

export function ChatMessage({
  message,
  isUser = false,
  avatar,
  name,
  timestamp,
  className,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 p-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          {avatar && <AvatarImage src={avatar} alt={name || "Assistant"} />}
          <AvatarFallback>{name?.[0] || "A"}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {name && <div className="text-xs text-muted-foreground">{name}</div>}
        <div
          className={cn(
            "rounded-lg px-4 py-2 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {message}
        </div>
        {timestamp && (
          <div className="text-xs text-muted-foreground">{timestamp}</div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          {avatar && <AvatarImage src={avatar} alt={name || "User"} />}
          <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

interface ChatContainerProps {
  children: React.ReactNode
  className?: string
}

export function ChatContainer({
  children,
  className,
}: ChatContainerProps) {
  return (
    <Card className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {children}
      </div>
    </Card>
  )
}

interface ChatInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ChatInput({
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  className,
}: ChatInputProps) {
  const [message, setMessage] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message)
      setMessage("")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-center gap-2 p-4 border-t", className)}
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <Button type="submit" disabled={disabled || !message.trim()}>
        Send
      </Button>
    </form>
  )
}

interface ChatAssistantProps {
  children: React.ReactNode
  className?: string
}

export function ChatAssistant({
  children,
  className,
}: ChatAssistantProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {children}
    </div>
  )
}

const Chat = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-3 p-4", className)}
    {...props}
  />
))
Chat.displayName = "Chat"

const ChatItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    position?: "left" | "right"
  }
>(({ className, position = "left", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-max max-w-[75%] flex-col gap-2",
      position === "right" ? "ml-auto" : "mr-auto",
      className
    )}
    {...props}
  />
))
ChatItem.displayName = "ChatItem"

const ChatHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3", className)}
    {...props}
  />
))
ChatHeader.displayName = "ChatHeader"

const ChatFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3", className)}
    {...props}
  />
))
ChatFooter.displayName = "ChatFooter"

const ChatAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  React.ComponentPropsWithoutRef<typeof Avatar>
>(({ className, ...props }, ref) => (
  <Avatar
    ref={ref}
    className={cn("h-8 w-8", className)}
    {...props}
  />
))
ChatAvatar.displayName = "ChatAvatar"

const ChatBubble = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    position?: "left" | "right"
  }
>(({ className, position = "left", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg px-4 py-3",
      position === "left" 
        ? "bg-muted text-muted-foreground" 
        : "bg-primary text-primary-foreground",
      className
    )}
    {...props}
  />
))
ChatBubble.displayName = "ChatBubble"

const ChatCard = React.forwardRef<
  React.ElementRef<typeof Card>,
  React.ComponentPropsWithoutRef<typeof Card> & {
    selected?: boolean
  }
>(({ className, selected, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "transition-all cursor-pointer hover:shadow-md",
      selected && "ring-2 ring-primary",
      className
    )}
    {...props}
  />
))
ChatCard.displayName = "ChatCard"

export {
  Chat,
  ChatItem,
  ChatHeader,
  ChatFooter,
  ChatAvatar,
  ChatBubble,
  ChatCard
} 