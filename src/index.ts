window.addEventListener('mouseover', event => {
  let outline = 'red solid 1px'

  document.querySelectorAll<HTMLElement>('*').forEach(node => {
    if (node.style.outline === outline) {
      node.style.outline = ''
    } else if (node.style.outline) {
      console.log('outline:', node.style.outline)
    }
  })

  let node = event.target as HTMLElement | null
  while (node) {
    node.style.outline = outline
    node = node.parentElement
  }
})
