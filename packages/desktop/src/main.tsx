import React from 'react'
import ReactDOM from 'react-dom/client'
import DesktopApp from './DesktopApp'
import './styles/desktop.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <DesktopApp />
  </React.StrictMode>,
)
