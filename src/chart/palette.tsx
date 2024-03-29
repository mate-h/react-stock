type Props = {
  color: 'green' | 'red' | 'primary'
}

export default ({ color }: Props) => {
  const arr = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  return (
    <div className="flex">
    <ul className="flex rounded-full overflow-hidden">
      {arr.map((i) => {
        return (
          <li
            className="h-6 w-10"
            key={i}
            style={{
              backgroundColor: `var(--${color}-${i})`,
            }}
          />
        )
      })}
    </ul>
    </div>
  )
}
