module.exports = {
  meta: {
    author: '',
    title: 'Euro 2020 : qui sera champion d\'Europe ?',
    url: 'https://www.liberation.fr/apps/2019/11/pronostic-euro-2020',
    description: 'Le tirage au sort de la 16<sup>e</sup> édition du Championnat d\'Europe de football a eu lieu le vendredi 30&nbsp;novembre. A l\'exception de l\'identité des quatre derniers qualifiés (barrages prévus en mars 2020), on connaît donc les groupes du premier tour. Qui succédera au Portugal le 12 juillet, à Londres, au terme d\'un mois de compétition organisé aux quatre coins du continent&nbsp;? Faites vos jeux des poules à la finale et pronostiquez votre champion&nbsp;!',
    image: 'https://www.liberation.fr/apps/2019/11/pronostic-euro-2020/social.jpg',
    xiti_id: 'pronostic-euro-2020'
  },
  tracking: {
    active: true,
    format: 'pronos',
    article: 'pronostic-euro-2020'
  },
  statics_url: process.env.NODE_ENV === 'production'
    ? 'https://www.liberation.fr/apps/static'
    : 'http://localhost:3003',
  api_url: process.env.NODE_ENV === 'production'
    ? 'https://libe-labo.site/api'
    : 'http://localhost:3004/api',
  stylesheet: 'pronos.css', // The name of the css file hosted at ${statics_url}/styles/apps/
  spreadsheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQCM9utk0p0L3HCOK6nDstB12SSjBTKncEWv3UDJGJaF5k9JddnbSoIoCnUtT2U8iqehqI5t2hXcqsT/pub?gid=1083077486&single=true&output=tsv'
}
