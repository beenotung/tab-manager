let loadCurrentTabsButton = document.getElementById('loadCurrentTabsButton')!
let openPopupButton = document.getElementById('openPopupButton')!
let saveTabsButton = document.getElementById('saveTabsButton')!
let restoreTabsButton = document.getElementById('restoreTabsButton')!
let messageNode = document.getElementById('message')!
let tabsNode = document.getElementById('tabsNode')!

openPopupButton.addEventListener('click', () => {
  window.open('/popup/popup.html', 'popup', 'width=400,height=600')
})

loadCurrentTabsButton.addEventListener('click', loadCurrentTabs)

saveTabsButton.addEventListener('click', saveTabs)

restoreTabsButton.addEventListener('click', restoreTabs)

async function loadCurrentTabs() {
  let tabs = await browser.tabs.query({})
  messageNode.textContent = `Loading ${tabs.length} tabs`
  await showTabs(tabs)
  messageNode.textContent = `Loaded ${tabs.length} tabs`
}

async function saveTabs() {
  let tabs = await browser.tabs.query({})
  localStorage.setItem('tabs', JSON.stringify(tabs))
  messageNode.textContent = `Saved ${tabs.length} tabs`
}

async function restoreTabs() {
  let tabs = JSON.parse(localStorage.getItem('tabs')!)
  messageNode.textContent = `Restoring ${tabs.length} tabs`
  await showTabs(tabs)
  messageNode.textContent = `Restored ${tabs.length} tabs`
}

async function showTabs(tabs: browser.tabs.Tab[]) {
  // let tabsList = tabs.map(tab =>
  //   pick(tab, [
  //     'id',
  //     'windowId',
  //     'title',
  //     'url',
  //     'active',
  //     'audible',
  //     'status',
  //     'isArticle',
  //     'lastAccessed',
  //     'successorTabId',
  //   ]),
  // )

  // tabsNode.innerHTML = JSON.stringify(tabsList, null, 2)

  tabsNode.textContent = ''

  for (let windowId of new Set(tabs.map(tab => tab.windowId))) {
    await showWindow(windowId!)
  }

  type WindowContext = {
    parent: HTMLElement
    childTabs: TabContext[]
    checkAllStatus: () => Promise<void>
  }
  type TabContext = {
    id: number
    checkStatus: () => Promise<void>
  }

  async function showWindow(windowId: number) {
    let windowNode = createDiv('window')
    let addLine = wrapAddLine(windowNode)
    addLine(`window id: ${windowId}`)
    let windowTabs = tabs.filter(tab => tab.windowId == windowId)
    let tabsLine = addLine(
      `${windowTabs.length} tabs: ` +
        windowTabs
          .map(tab => previewText(tab.title || 'undefined'))
          .join(' + '),
    )
    let windowControls = addLine('window controls: ')
    addButton(windowControls, 'toggle detail', () => {
      childTabs.hidden = !childTabs.hidden
    })
    addButton(windowControls, 'deduplicate tabs', async () => {
      let seenUrls = new Set<string>()
      for (let tab of windowTabs.slice()) {
        if (!seenUrls.has(tab.url!)) {
          seenUrls.add(tab.url!)
          continue
        }

        await browser.tabs.remove(tab.id!)

        removeFromArray(windowTabs, tab)
        removeFromArray(tabs, tab)
        let index = windowContext.childTabs.findIndex(
          eachTab => eachTab.id == tab.id,
        )
        if (index != -1) {
          windowContext.childTabs.splice(index, 1)
        }

        tabsLine.textContent =
          `${windowTabs.length} tabs: ` +
          windowTabs
            .map(tab => previewText(tab.title || 'undefined'))
            .join(' + ')
      }
    })
    addButton(windowControls, 'resume all', async () => {
      for (let tab of windowTabs) {
        let isSameUrl = await browser.tabs
          .get(tab.id!)
          .then(gotTab => gotTab.url == tab.url)
          .catch(() => false)
        if (!isSameUrl) {
          await browser.tabs.create({ windowId, url: tab.url })
        }
      }
      await windowContext.checkAllStatus()
    })
    addButton(windowControls, 'close all', async () => {
      for (let tab of windowTabs) {
        await browser.tabs.remove(tab.id!)
      }
      await windowContext.checkAllStatus()
    })
    let childTabs = createDiv('window-tabs')
    childTabs.hidden = true
    let windowContext: WindowContext = {
      parent: childTabs,
      childTabs: [],
      async checkAllStatus() {
        for (let tab of this.childTabs) {
          await tab.checkStatus()
        }
      },
    }
    for (let tab of windowTabs) {
      await showTab(windowContext, tab)
    }
    windowNode.appendChild(childTabs)
    tabsNode.appendChild(windowNode)
  }

  async function showTab(context: WindowContext, tab: browser.tabs.Tab) {
    let tabNode = createDiv('tab')
    let addLine = wrapAddLine(tabNode)
    {
      let tabControls = addLine('tab controls: ')
      let focusButton = addButton(tabControls, 'Focus', async () => {
        await browser.tabs.update(tab.id!, { active: true })
        await context.checkAllStatus()
      })
      let openButton = addButton(tabControls, 'Open', async () => {
        tab = await browser.tabs.create({
          windowId: tab.windowId!,
          url: tab.url!,
          active: true,
        })
        tabContext.id = tab.id!
        await context.checkAllStatus()
      })
      let closeButton = addButton(tabControls, 'Close', async () => {
        await browser.tabs.remove(tab.id!)
        await context.checkAllStatus()
      })

      async function checkStatus() {
        let isSameUrl = await browser.tabs
          .get(tab.id!)
          .then(gotTab => {
            if (gotTab.url == tab.url) {
              tab = gotTab
              return true
            }
            return false
          })
          .catch(() => false)

        show(focusButton, isSameUrl && !tab.active)
        show(openButton, !isSameUrl)
        show(closeButton, isSameUrl)
      }

      let tabContext: TabContext = { id: tab.id!, checkStatus }
      context.childTabs.push(tabContext)

      await checkStatus()
    }
    addLine(`tab id: ${tab.id}`)
    addLine(`windowId: ${tab.windowId}`)
    addLine(`title: ${tab.title}`)
    addLine(`url: ${tab.url}`)
    {
      let favIconLine = addLine(
        `favIconUrl: ${previewText(tab.favIconUrl || 'undefined')}`,
      )
      let favIcon = createNode('img', 'favIcon')
      favIcon.src = tab.favIconUrl!
      favIcon.className = 'favIcon'
      favIcon.width = 16
      favIcon.height = 16
      favIconLine.appendChild(favIcon)
    }
    addLine(`active: ${tab.active}`)
    addLine(`audible: ${tab.audible}`)
    addLine(`status: ${tab.status}`)
    addLine(`isArticle: ${tab.isArticle}`)
    addLine(`lastAccessed: ${tab.lastAccessed}`)
    addLine(`successorTabId: ${tab.successorTabId}`)
    context.parent.appendChild(tabNode)
  }
}

function pick<T, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(keys.map(key => [key, object[key]])) as Pick<T, K>
}

function wrapAddLine(parent: HTMLElement) {
  return (text: string) => addLine(parent, text)
}

function addLine(parent: HTMLElement, text: string) {
  let line = createDiv('line')
  line.textContent = text
  parent.appendChild(line)
  return line
}

function addButton(
  parent: HTMLElement,
  text: string,
  onclick: (event: MouseEvent) => void,
) {
  let button = document.createElement('button')
  button.textContent = text
  button.addEventListener('click', onclick)
  parent.appendChild(button)
  return button
}

function createDiv(className: string) {
  return createNode('div', className)
}

function createNode<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  className: string,
): HTMLElementTagNameMap[T] {
  let node = document.createElement(tagName)
  node.className = className
  return node
}

function previewText(text: string) {
  if (text.length > 20) {
    return text.slice(0, 20) + '...'
  }
  return text
}

function show(node: HTMLElement, visible: boolean) {
  node.hidden = !visible
}

function removeFromArray<T>(array: T[], item: T) {
  let index = array.indexOf(item)
  if (index != -1) {
    array.splice(index, 1)
  }
}
