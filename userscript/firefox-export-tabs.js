function export_tabs() {
  let view_syncedtabs = find_in_tree(
    'view-syncedtabs[name="syncedtabs"]',
    document.body,
  )
  // console.log({ view_syncedtabs })
  let device_headers = find_all_in_tree('.device-header', view_syncedtabs)
  // console.log({ device_headers })
  let devices = []
  for (let device_header of device_headers) {
    let device_name = device_header.textContent.trim()
    let list = find_in_tree(
      'syncedtabs-tab-list',

      device_header.parentElement,
    )
    // console.log({ device_name, list })
    let tabs = []
    for (let tab_row of find_all_in_tree('syncedtabs-tab-row', list)) {
      let a = find_in_tree('a.fxview-tab-row-main', tab_row)
      let url = a.href
      let title = find_in_tree(
        'span.fxview-tab-row-title',
        a,
      ).textContent.trim()
      // console.log({ url, title })
      tabs.push({ url, title })
    }
    devices.push({ device_name, tabs })
  }
  return devices
}

function* walk_tree(container) {
  yield container
  if (container instanceof Text) {
    return
  }
  if (container instanceof Comment) {
    return
  }
  if (container.shadowRoot) {
    for (let child of container.shadowRoot.childNodes) {
      yield* walk_tree(child)
    }
  }
  for (let child of container.children) {
    yield* walk_tree(child)
  }
}

function find_in_tree(selector, container) {
  for (let node of walk_tree(container)) {
    if (node.matches?.(selector)) {
      return node
    }
  }
  return null
}

function find_all_in_tree(selector, container) {
  let results = []
  for (let node of walk_tree(container)) {
    if (node.matches?.(selector)) {
      results.push(node)
    }
  }
  return results
}

export_tabs()
