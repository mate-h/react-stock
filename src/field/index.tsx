type Props = {
  children: React.ReactNode
  label: string
  for: string
}

export const Field = ({ children, label, for: htmlFor }: Props) => (
  <fieldset>
    <div class="flex items-center space-x-2 max-w-xs">
      <label for={htmlFor} class="text-sm font-medium text-medium flex-1">
        {label}
      </label>
      {children}
    </div>
  </fieldset>
)
