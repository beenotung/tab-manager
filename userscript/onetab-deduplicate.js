// remove duplicated tabs from onetab

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function check_duplicate_tabs() {
  let seenUrls = new Set()

  let tabs = document.querySelectorAll('.tabList .tab')

  let n = tabs.length
  let i = 0
  for (let tab of tabs) {
    i++
    console.log(`${i}/${n}`)

    let tabLink = tab.querySelector('a.tabLink')
    let url = tabLink.href

    if (!url?.startsWith('http')) {
      continue
    }

    if (!seenUrls.has(url)) {
      seenUrls.add(url)
      continue
    }

    console.log('duplicate:', { title: tabLink.textContent, url })

    let removeButton = tab.querySelector(
      '.tabLinkText [srcset="images/cross.svg"]',
    ).parentElement

    removeButton.click()

    await sleep(100)
  }
}

check_duplicate_tabs()
