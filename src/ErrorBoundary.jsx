import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { error: null, info: null }
  }
  componentDidCatch(error, info){
    console.error('ErrorBoundary caught', error, info)
    this.setState({ error, info })
  }
  render(){
    if (this.state.error) {
      return (
        <div style={{padding:20}}>
          <div style={{background:'#fee2e2',color:'#b91c1c',padding:16,borderRadius:8}}>
            <h3>Uh oh — an error occurred</h3>
            <pre style={{whiteSpace:'pre-wrap',fontSize:'0.9rem'}}>{String(this.state.error)}</pre>
            <details style={{marginTop:8}}>
              <summary>Stack trace / info</summary>
              <pre style={{whiteSpace:'pre-wrap'}}>{this.state.info && this.state.info.componentStack}</pre>
            </details>
            <div style={{marginTop:8}}>
              Try reloading or open DevTools console for more details.
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
