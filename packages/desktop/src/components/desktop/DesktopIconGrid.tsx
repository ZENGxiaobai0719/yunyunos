import { DESKTOP_ICONS } from '../../data/desktop-icons'
import DesktopIcon from './DesktopIcon'

export default function DesktopIconGrid() {
  return (
    <div className="desktop" id="desktopIcons">
      {DESKTOP_ICONS.map((item, index) => (
        <DesktopIcon key={item.id} {...item} index={index} />
      ))}
    </div>
  )
}
