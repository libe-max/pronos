import React, { Component } from 'react'
import { parseTsvWithTabs } from 'libe-utils'
import LoadingError from 'libe-components/lib/blocks/LoadingError'
import ShareArticle from 'libe-components/lib/blocks/ShareArticle'
import InterTitle from 'libe-components/lib/text-levels/InterTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import Draw from './components/Draw'

export default class Pronos extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'pronos'
    this.fetchData = this.fetchData.bind(this)
    this.buildDraw = this.buildDraw.bind(this)
    this.state = {
      loading: true,
      error: null,
      data: {
        page: {},
        teams: [],
        groups: [],
        format: {
          group_stage: false,
          lucky_losers: false,
          third_place_match: false
        },
        results: {
          groups: {},
          lucky_losers: {},
          final_phase: [],
          third_place_match: null
        }
      }
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DID MOUNT
   *
   * * * * * * * * * * * * * * * * */
  componentDidMount () {
    this.fetchData()
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH DATA
   *
   * * * * * * * * * * * * * * * * */
  fetchData () {
    const { spreadsheet } = this.props
    window.fetch(spreadsheet).then(res => {
      if (res.ok) return res.text()
      else throw new Error(`Error: ${res.status}`)
    }).then(rawData => {
      const [teams, groups, format, page, results, luckyLosers] = parseTsvWithTabs({
        tsv: rawData,
        tabsParams: [
          { start: 0, end: 4, keysLinePos: 1 },
          { start: 5, end: 7, keysLinePos: 1 },
          { start: 8, end: 10, keysLinePos: 1 },
          { start: 11, end: 12, keysLinePos: 1 },
          { start: 13, end: 15, keysLinePos: 1 },
          { start: 16, end: 17, keysLinePos: 1 }
        ]
      })
      const draw = this.buildDraw({
        groups: groups,
        format: {
          ...format[0],
          lucky_losers: luckyLosers
        },
        results: results
      })
      this.setState({
        loading: false,
        error: null,
        data: {
          page: page[0],
          teams: teams,
          draw
        },
      })
    }).catch(err => {
      console.warn(err)
      this.setState({
        error: err.message,
        loading: false
      })
    })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * INTERPRET RESULTS
   *
   * * * * * * * * * * * * * * * * */
  buildDraw (data) {
    // Create groups object and transform them
    // accordingly to results
    const groups = data.groups.map(group => {
      return {
        _id: `RR-${group.id}`,
        name: group.id,
        teams: group.teams.split(',').map(team => team.trim()),
        outputs: group.outputs.split(',').map(out => out.trim()),
        winners: [],
        freeze: false
      }
    })
    data.results.forEach(result => {
      if (result.round !== 'RR') return
      const _id = `${result.round}-${result.number}`
      const winners = result.winners.split(',').map(team => team.trim())
      const matchId = groups.findIndex(group => {
        return group._id === _id
      })
      groups[matchId].winners = winners
      groups[matchId].freeze = true
    })
    const groupsIsComplete = groups.every(group => {
      const { winners, outputs } = group
      return winners.length === outputs.length
    })
    
    // Create lucky losers
    const luckyLosers = {
      _id: 'LL-1',
      groups: [],
      outputs: data.format.lucky_losers
        .map(out => {
          return {
            ...out,
            to: out.to
              .split(',')
              .map(elt => elt.trim())
          }
        }),
      winners: [],
      winners_origin: '',
      freeze: false
    }
    groups.forEach(group => {
      const teams = group.teams
      const winners = group.winners
      const losers = [...teams]
      winners.forEach(winner => {
        const winnerIndex = losers.findIndex(team => team === winner)
        losers[winnerIndex] = null
      })
      luckyLosers.groups.push({
        name: group.name,
        teams: losers.filter(team => team)
      })
    })
    data.results.forEach(result => {
      if (result.round !== 'LL') return
      const winners = result.winners.split(',').map(team => team.trim())
      winners.forEach(winner => {
        const foundInLosers = luckyLosers.groups.some(group => {
          const foundInGroup = group.teams.some(team => team === winner)
          if (foundInGroup) {
            luckyLosers.winners.push(winner)
            luckyLosers.winners_origin += group.name
          }
          return foundInGroup
        })
        if (!foundInLosers) throw new Error(`${winner} not valid value for LL winners`)
      })
    })
    console.log(luckyLosers.winners_origin)


    return {
      groups: [],
      lucky_losers: {},
      final_phase: [],
      third_place_match: {}
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this
    const { loading, error, data } = state
    const { page, teams, groups, format, results } = data

    const classes = [c]

    if (loading) {
      classes.push(`${c}_loading`)
      return <div className={classes.join(' ')} />
    } else if (error) {
      classes.push(`${c}_error`)
      return <div className={classes.join(' ')}>
        <LoadingError />
      </div>
    }

    return <div className={classes.join(' ')}>
      <InterTitle>{page.title}</InterTitle>
      <Paragraph>{page.intro}</Paragraph>
      <ShareArticle short
        iconsOnly
        url={props.meta.url}
        tweet={page.tweet} />
      <div className={`${c}__draw`}>
        <Draw {...data} />
      </div>
      <ShareArticle short
        iconsOnly
        url={props.meta.url}
        tweet={page.tweet} />
    </div>
  }
}
