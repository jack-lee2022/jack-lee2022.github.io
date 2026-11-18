/* global hexo */
'use strict'
// 建置時自動產生 /llms.txt（https://llmstxt.org/）：讓 AI 快速理解本站內容與重點文章。
// 依大類分組，每類列出最新 12 篇文章（標題、網址、摘要）。隱藏（published: false）的文章不會列入。

const PER_CATEGORY = 12

function clean (s, n) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/[`*_#>\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, n)
}

hexo.extend.generator.register('llms_txt', function (locals) {
  const cfg = this.config
  const base = cfg.url.replace(/\/$/, '')
  const posts = locals.posts.filter(p => p.published !== false).sort('-date')

  const groups = new Map()
  posts.forEach(p => {
    const cats = p.categories.toArray()
    const top = cats.length ? cats.find(c => !c.parent) || cats[0] : null
    const key = top ? top.name : '其他'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(p)
  })

  const lines = []
  lines.push(`# ${cfg.title}`)
  lines.push('')
  lines.push(`> ${cfg.description}`)
  lines.push('')
  lines.push(`作者：${cfg.author}。本站共 ${posts.length} 篇公開文章，主題涵蓋 LabVIEW 圖形化程式設計、量測與資料擷取（DAQ、影像處理）、單晶片與嵌入式（Arduino、PIC、ESP32、STM32）、電路與 PCB 設計、Python，以及 AI 開發工具與 Jetson 邊緣運算。文章多為實作教學，附程式碼、接線與實測數據。`)
  lines.push('')
  lines.push('## 網站導覽')
  lines.push('')
  lines.push(`- [首頁](${base}/): 最新文章`)
  lines.push(`- [關於作者](${base}/about/): 作者 Jack 的經歷與專長（23 年 LabVIEW、NI CLD、醫療器材自動化測試）`)
  lines.push(`- [分類](${base}/categories/): 依主題瀏覽全部文章`)
  lines.push(`- [歸檔](${base}/archives/): 依時間瀏覽全部文章`)
  lines.push(`- [Sitemap](${base}/sitemap.xml): 全部文章清單`)
  lines.push(`- [RSS](${base}/atom.xml): 最新文章訂閱`)
  lines.push('')

  ;[...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([name, list]) => {
      lines.push(`## ${name}（${list.length} 篇）`)
      lines.push('')
      list.slice(0, PER_CATEGORY).forEach(p => {
        const desc = clean(p.description || p.excerpt || p.content, 110)
        const url = base + '/' + p.path.replace(/index\.html$/, '')
        lines.push(`- [${clean(p.title, 120)}](${url})${desc ? ': ' + desc : ''}`)
      })
      lines.push('')
    })

  return { path: 'llms.txt', data: lines.join('\n') }
})
