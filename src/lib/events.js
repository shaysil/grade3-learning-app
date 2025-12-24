const listeners = {}
export function subscribe(event, fn){
  listeners[event] = listeners[event] || []
  listeners[event].push(fn)
  return ()=>{ listeners[event] = listeners[event].filter(f=>f!==fn) }
}
export function publish(event, payload){
  (listeners[event] || []).forEach(fn=>{ try{fn(payload)}catch(e){console.error(e)} })
}
export default { subscribe, publish }
