module.exports = {
  meta: {
    author: '',
    title: 'Mondial 2019 : qui sera champion du monde ?',
    url: 'https://www.liberation.fr/apps/2019/05/pronostic-coupe-du-monde',
    description: 'La Coupe du monde de football femmes a lieu du 7&nbsp;juin au 7&nbsp;juillet en France. Les Bleues imiteront-elles les hommes en obtenant leur premier sacre mondial à domicile&nbsp;? Tenants du titre, les Etats-Unis remporteront-ils leur quatrième étoile&nbsp;? Des poules à la finale, faites votre pronostic grâce à notre appli&nbsp;!',
    image: 'https://www.liberation.fr/apps/2019/05/pronostic-coupe-du-monde/social.jpg',
    xiti_id: 'pronos-mondial-foot-2019'
  },
  tracking: {
    active: true,
    format: 'pronos',
    article: 'mondial-foot-2019'
  },
  statics_url: process.env.NODE_ENV === 'production'
    ? 'https://www.liberation.fr/apps/static'
    : 'http://localhost:3003',
  api_url: process.env.NODE_ENV === 'production'
    ? 'https://libe-labo.site/api'
    : 'http://localhost:3004/api',
  stylesheet: 'pronos.css', // The name of the css file hosted at ${statics_url}/styles/apps/
  spreadsheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcdvM33jQ76btImUJvn7c5ZuPjZxcj0bwY8MCHAbaCBzSnvad6q8y-mABir5g5aa5HJKRT85XxRtbw/pub?gid=1083077486&single=true&output=tsv'
}
