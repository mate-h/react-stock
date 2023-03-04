import type React from 'react'

type Props = {
  children: React.ReactNode
  label: string
  htmlFor: string
}

export const Field = ({ children, label, htmlFor }: Props) => (
  <fieldset>
    <div className="flex items-center space-x-2 max-w-xs">
      <label htmlFor={htmlFor} className="text-sm font-medium text-medium flex-1">
        {label}
      </label>
      {children}
    </div>
  </fieldset>
)
