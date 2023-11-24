const transformArray = (value: string | string[]): string[] | undefined => {
  if (!value) {
    return undefined
  }
  if (typeof value === 'string') {
    return [value].filter((val: string) => val !== '')
  }
  return value.filter((val: string) => val !== '')
}
export default transformArray
