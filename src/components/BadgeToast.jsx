import React, { useEffect, useState } from 'react'
import { subscribe } from '../lib/events'

export default function BadgeToast(){
  const [toast, setToast] = useState(null)

  useEffect(()=>{
    const unsub = subscribe('unlock', (name)=>{
      setToast(name)
      setTimeout(()=>setToast(null), 3000)
    })
    return unsub
  },[])

  if (!toast) return null
  return (
    <div className="badge-toast">{toast}</div>
  )
}
