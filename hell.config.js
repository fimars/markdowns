module.exports = {
  title: '|> Saki',
  base: '/saki/',
  dest: 'docs',
  ignores: ["ignores/*"],
  head: [
    ['link', { rel: 'icon', href: './favicon.png' }]
  ],
  themeConfig: {
    nav: [
      { text: '关于我', link: '/' },
      { text: '关于HellDoc', link: '/About Hell' },
      { text: 'More Webpack', link: '/More Webpack' },
      { text: 'TypeScript 2.8 News', link: '/TypeScript 2.8 News' },
    ]
  }

}
