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
          { start: 8, end: 11, keysLinePos: 1 },
          { start: 12, end: 13, keysLinePos: 1 },
          { start: 14, end: 16, keysLinePos: 1 },
          { start: 17, end: 18, keysLinePos: 1 }
        ]
      })
      results.push({
        round: '8', number: '1', winners: 'ita'
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
    // Create GROUPS round object
    const GROUPS = data.groups.map(group => {
      return {
        _id: `RR-${group.id}`,
        name: group.id,
        teams: group.teams.split(',').map(team => team.trim()),
        outputs: group.outputs.split(',').map(out => out.trim()),
        winners: [],
        freeze: false
      }
    })
    // Browse "results" object and look for groups round
    // results in order to store them in GROUPS round object
    data.results.forEach(result => {
      if (result.round !== 'RR') return
      const _id = `${result.round}-${result.number}`
      const winners = result.winners.split(',').map(team => team.trim())
      const matchId = GROUPS.findIndex(group => {
        return group._id === _id
      })
      GROUPS[matchId].winners = winners
      GROUPS[matchId].freeze = true
    })
    const groupsIsComplete = GROUPS.every(group => {
      const { winners, outputs } = group
      return winners.length === outputs.length
    })
    // Create LUCKYS round object and transform it
    // accordingly to results
    const LUCKYS = {
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
      selected_output: null,
      freeze: false
    }
    // Fill the LUCKYS round with all the teams in "GROUPS"
    // that are not found in GROUP.winners
    GROUPS.forEach(group => {
      const teams = group.teams
      const winners = group.winners
      const losers = [...teams]
      winners.forEach(winner => {
        const winnerIndex = losers.findIndex(team => team === winner)
        losers[winnerIndex] = null
      })
      LUCKYS.groups.push({
        name: group.name,
        teams: losers.filter(team => team)
      })
    })
    // If the group stage is over, we can populate
    // LUCKYS with the results we find in results object
    if (groupsIsComplete) {
      data.results.forEach(result => {
        if (result.round !== 'LL') return
        const winners = result.winners
          .split(',')
          .map(team => team.trim())
          .map(team => {
            const foundGroupOrigin = GROUPS.find(group => {
              return group.teams.indexOf(team) + 1
            })
            if (!foundGroupOrigin) return
            return {
              team: team,
              group_origin: foundGroupOrigin.name
            }
          }).sort((a, b) => {
            return a.group_origin.localeCompare(b.group_origin)
          })
        winners.forEach(winner => {
          const foundInLosers = LUCKYS.groups.some(group => {
            const foundInGroup = group.teams.some(team => team === winner.team)
            if (foundInGroup) {
              LUCKYS.winners.push(winner.team)
              LUCKYS.winners_origin += group.name
            }
            return foundInGroup
          })
          if (!foundInLosers) throw new Error(`${winner.team} not valid value for LL winners`)
        })
      })
    }
    // Find the output of the LUCKYS stage according to it's winners
    LUCKYS.winners_origin = LUCKYS.winners_origin.split('').sort().join('')
    const luckysIsValid = LUCKYS.outputs.length === 0 || LUCKYS.outputs.some(output => {
      return (output.from.length >= LUCKYS.winners_origin.length)
    })
    const luckysIsComplete = LUCKYS.outputs.length === 0 || LUCKYS.outputs.some(output => {
      if (output.from === LUCKYS.winners_origin) {
        LUCKYS.selected_output = output.to
        return true
      } else {
        return false
      }
    })
    // Create the FINAL stage object
    const winners = []
    GROUPS.forEach(group => winners.push(...group.winners))
    winners.push(...LUCKYS.winners)
    // Create an object for each round, based on the 
    // data.format.final_phase value which gives the nb of
    // rounds of the final phase
    let round = parseInt(data.format.final_phase, 10)
    const FINAL = []
    FINAL.all_matches = []
    while (round > 1) {
      const roundMatches = new Array(round / 2).fill(null).map((elt, j) => ({
        id: `${round/2}-${j+1}`,
        round: `${round/2}`,
        number: `${j+1}`,
        destination: round !== 2 ? `${round/4}-${((j+1)+(j+1)%2)/2}` : 'WINNER',
        complete: false,
        teams: [],
        winner: null,
        freeze: false
      }))
      const thisRound = {
        nb_teams: round,
        round_name: round / 2,
        matches: roundMatches
      }
      FINAL.push(thisRound)
      FINAL.all_matches.push(...roundMatches)
      round /= 2
    }
    // If groupIsComplete andluckysIsComplete, fill the first
    // round of the FINAL phase
    if (groupsIsComplete && luckysIsComplete) {
      GROUPS.forEach(group => {
        const winnersAndDestinations = group.winners.map((winner, i) => ({
          team: winner,
          destination: group.outputs[i]
        }))
        winnersAndDestinations.forEach(pair => {
          const destMatch = FINAL.all_matches.find(match => match.id === pair.destination)
          destMatch.teams.push(pair.team)
        })
      })
      const luckysAndDestinations = LUCKYS.winners.map((winner, i) => ({
        team: winner,
        destination: LUCKYS.selected_output[i]
      }))
      luckysAndDestinations.forEach(pair => {
        const destMatch = FINAL.all_matches.find(match => match.id === pair.destination)
        destMatch.teams.push(pair.team)
      })
    }
    // If groupIsComplete andluckysIsComplete, fill the first
    // round with the given results
    if (groupsIsComplete && luckysIsComplete) {
      console.log(data.results)
    }
    console.log(FINAL)
    // console.log(GROUPS, LUCKYS)



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
