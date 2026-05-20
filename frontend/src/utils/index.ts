export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(date)
}

export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}
