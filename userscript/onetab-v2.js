function scan_link() {
  return Array.from(document.querySelectorAll('a.tabLink[href]'), a => a.href)
}

function deduplicate_in_trash(active_links) {
  let links = document.querySelectorAll('a.tabLink[href]')
  let removed_links = []
  let saw_links = new Set()
  for (let link of links) {
    let should_remove = false
    if (saw_links.has(link.href)) {
      should_remove = true
    } else {
      saw_links.add(link.href)
    }
    if (active_links.includes(link.href)) {
      should_remove = true
    }
    if (!should_remove) {
      continue
    }
    let button = link.parentElement.querySelector('.controlButton.red')
    if (button.innerText !== 'Delete') {
      throw new Error('Delete button not found')
    }
    removed_links.push(link.href)
    console.log('Deleting link in trash:', link.href)
    button.click()
  }
  console.log('removed', removed_links.length, 'links in trash')
  return removed_links
}

function remove_empty_tab_groups_in_active() {
  let titles = document.querySelectorAll('.editInPlaceLabelSpan')
  let removed = 0
  for (let title of titles) {
    let text = title.innerText
    if (text !== '0 tabs') {
      continue
    }
    let tabGroup = title.closest('.tabGroupBody')
    if (!tabGroup) {
      continue
    }
    let button = tabGroup
      .querySelector('[data-dark-src="images/cross2-dark.png"]')
      ?.closest('picture')
    if (!button) {
      throw new Error('Delete button not found')
    }
    button.click()
    removed++
  }
  console.log('removed', removed, 'empty tab groups')
  return removed
}

function remove_empty_tab_groups_in_trash() {
  let titles = document.querySelectorAll('.editInPlaceLabelSpan')
  let removed = 0
  for (let title of titles) {
    let text = title.innerText
    if (text !== '0 tabs') {
      continue
    }
    let tabGroup = title.closest('.tabGroupBody')
    if (!tabGroup) {
      continue
    }
    let button = tabGroup.querySelector('.controlButton.red')
    if (button.innerText !== 'Delete') {
      throw new Error('Delete button not found')
    }
    button.click()
    removed++
  }
  console.log('removed', removed, 'empty tab groups')
  return removed
}

function run_in_active_tab() {
  let active_links = scan_link()
  console.log(active_links)

  remove_empty_tab_groups_in_active()

  return active_links
}

function run_in_trash(active_links) {
  deduplicate_in_trash(active_links)

  remove_empty_tab_groups_in_trash()
}

function getCurrentPage() {
  let labels = Array.from(
    document.querySelectorAll('.editInPlaceLabelSpan'),
    s => s.innerText,
  ).filter(s => s == 'All' || s === 'Trash')
  let All = labels.filter(s => s === 'All').length
  let Trash = labels.filter(s => s === 'Trash').length
  if (All == 2 && Trash == 1) {
    return 'Active'
  }
  if (All == 1 && Trash == 2) {
    return 'Trash'
  }
  throw new Error('Unknown page')
}

function main() {
  let page = getCurrentPage()

  /* scan active tabs */
  if (page === 'Active') {
    let active_links = run_in_active_tab()
    console.log(
      'Right click, copy object, paste to the active_links variable, when move to the trash page to continue',
    )
  }

  /* scan trash */
  if (page === 'Trash') {
    let active_links = []
    run_in_trash(active_links)
  }
}

main()
