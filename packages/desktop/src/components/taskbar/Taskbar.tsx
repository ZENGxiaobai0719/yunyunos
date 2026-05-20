import StartButton from './StartButton'
import TaskList from './TaskList'
import SystemTray from './SystemTray'

export default function Taskbar() {
  return (
    <div className="taskbar">
      <StartButton />
      <TaskList />
      <SystemTray />
    </div>
  )
}
