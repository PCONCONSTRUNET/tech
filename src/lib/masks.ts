export const maskCPFOrCNPJ = (value: string) => {
  let v = value.replace(/\D/g, '')
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    v = v.substring(0, 14)
    v = v.replace(/^(\d{2})(\d)/, '$1.$2')
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
    v = v.replace(/(\d{4})(\d)/, '$1-$2')
  }
  return v
}

export const maskCEP = (value: string) => {
  let v = value.replace(/\D/g, '')
  v = v.substring(0, 8)
  v = v.replace(/^(\d{5})(\d)/, '$1-$2')
  return v
}

export const maskPhone = (value: string) => {
  let v = value.replace(/\D/g, '')
  v = v.substring(0, 11)
  v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
  v = v.replace(/(\d)(\d{4})$/, '$1-$2')
  return v
}
