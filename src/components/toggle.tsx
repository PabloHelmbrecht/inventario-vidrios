import React from 'react'
import { Switch } from '@headlessui/react'

interface toggleProps {
  text?: string | React.ReactNode
  enabled: boolean
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>
  color?: string
}

export default function Toggle({text='Enable notifications',enabled,setEnabled,color='bg-sky-600'}:toggleProps) {

  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      className={`${
        enabled ? color : 'bg-gray-200'
      } relative inline-flex h-6 w-11 items-center rounded-full`}
    >
      <span className="sr-only">{text}</span>
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
      />
    </Switch>
  )
}