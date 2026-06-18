function scan_link() {
  return Array.from(document.querySelectorAll('a.tabLink[href]'), a => a.href)
}

function deduplicate_in_trash(active_links) {
  let links = document.querySelectorAll('a.tabLink[href]')
  let removed_links = []
  for (let link of links) {
    if (!active_links.includes(link.href)) {
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

function main() {
  /* scan active tabs */
  // let active_links = run_in_active_tab()
  let active_links = []

  /* scan trash */
  run_in_trash(active_links)
}

main()
