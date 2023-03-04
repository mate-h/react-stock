type Props = {
  children: React.ReactNode
  label: string
  for: string
}

export const Field = ({ children, label, for: htmlFor }: Props) => (
  <fieldset>
    <div className="flex items-center space-x-2 max-w-xs">
      <label for={htmlFor} className="text-sm font-medium text-medium flex-1">
        {label}
      </label>
      {children}
    </div>
  </fieldset>
)
