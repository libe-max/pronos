import React, { Component } from 'react'
import { Parser } from 'html-to-react'
import { parseTsvWithTabs } from 'libe-utils'
import LibeLaboLogo from 'libe-components/lib/blocks/LibeLaboLogo'
import LoadingError from 'libe-components/lib/blocks/LoadingError'
import ShareArticle from 'libe-components/lib/blocks/ShareArticle'
import InterTitle from 'libe-components/lib/text-levels/InterTitle'
import BlockTitle from 'libe-components/lib/text-levels/BlockTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import Groups from './components/Groups'
import Luckies from './components/Luckies'
import Final from './components/Final'
import Winner from './components/Winner'

export default class Pronos extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'pronos'
    this.h2r = new Parser()
    this.fetchData = this.fetchData.bind(this)
    this.findTeam = this.findTeam.bind(this)
    this.buildDraw = this.buildDraw.bind(this)
    this.submitResult = this.submitResult.bind(this)
    this.deleteAllResults = this.deleteAllResults.bind(this)
    this.deleteLLResults = this.deleteLLResults.bind(this)
    this.state = {
      loading: true,
      error: null,
      data: {
        page: {},
        teams: [],
        groups: [],
        format: {
          group_stage: false,
          lucky_losers: [],
          third_place_match: false
        },
        results: [],
        freeze: []
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
   * GENERATE LINK
   *
   * * * * * * * * * * * * * * * * */
  generateLink () {
    const short = this.state.data.results.map(r => {
      return`${r.round}-${r.number}--${r.winners.split(',').map(e => e.trim()).join(',')}`
    }).join(';')
    return window.encodeURI(window.btoa(short))
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RESULTS IN PARAMS
   *
   * * * * * * * * * * * * * * * * */
  resultsInParams () {
    const search = window.location.search.slice(1)
    const keyVals = search.split('&')
    const params = {}
    keyVals.forEach(keyVal => {
      const spl = keyVal.split('=')
      const key = spl[0]
      const val = spl.slice(1).join('')
      if (key && val) {
        params[key] = val
      }
    })
    if (!params.res) return []
    const decoded = window.decodeURI(params.res)
    try {
      const clear = window.atob(decoded)
      const splClear = clear.split(';')
      const results = splClear.map(strResult => {
        let [round, number] = strResult.split('-')
        if (round === 'LL' && !number) {
          const [id, winners] = strResult.split('---')
          return { round, number, winners }
        } else {
          const [id, winners] = strResult.split('--')
          return { round, number, winners }
        }
      })
      return results
    } catch (e) {
      console.warn(e)
      return []
    }
    console.log(decoded)
    return params.res || ''
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH DATA
   *
   * * * * * * * * * * * * * * * * */
  fetchData () {
    const { spreadsheet } = this.props
    const resultsInParams = this.resultsInParams()
    window.fetch(spreadsheet).then(res => {
      if (res.ok) return res.text()
      else throw new Error(`Error: ${res.status}`)
    }).then(rawData => {
      const [teams, groups, format, page, results, luckyLosers, freeze] = parseTsvWithTabs({
        tsv: rawData,
        tabsParams: [
          { start: 0, end: 7, keysLinePos: 1 },
          { start: 8, end: 10, keysLinePos: 1 },
          { start: 11, end: 14, keysLinePos: 1 },
          { start: 15, end: 24, keysLinePos: 1 },
          { start: 25, end: 27, keysLinePos: 1 },
          { start: 28, end: 29, keysLinePos: 1 },
          { start: 30, end: 31, keysLinePos: 1 }
        ]
      })
      this.setState({
        loading: false,
        error: null,
        data: {
          teams: teams,
          groups: groups,
          format: {
            ...format[0],
            lucky_losers: luckyLosers
          },
          freeze: resultsInParams.length ? [] : freeze,
          page: page[0],
          results: resultsInParams.length ? resultsInParams : results
        }
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
   * BUILD DRAW
   *
   * * * * * * * * * * * * * * * * */
  buildDraw () {
    const data = {
      groups: this.state.data.groups,
      format: this.state.data.format,
      results: this.state.data.results,
      freeze: this.state.data.freeze
    }
    // Create GROUPS round object
    const GROUPS = data.groups.map(group => {
      return {
        _id: `RR-${group.id}`,
        name: group.id,
        teams: group.teams.split(',').map(team => team.trim()),
        outputs: group.outputs.split(',').map(out => out.trim()),
        winners: [],
        freeze: false,
        complete: false
      }
    })
    // Browse "results" object and look for groups round
    // results in order to store them in GROUPS round object
    data.results.forEach(result => {
      if (result.round !== 'RR') return
      const _id = `${result.round}-${result.number}`
      const winners = result.winners.split(',').map(team => team.trim()).filter(e => e)
      const matchId = GROUPS.findIndex(group => {
        return group._id === _id
      })
      GROUPS[matchId].winners = winners
    })
    new Array(GROUPS.length).fill(null).map((e, i) => GROUPS[i]).forEach((group, i) => {
      const { winners, outputs } = group
      if (winners.length === outputs.length) {
        GROUPS[i].complete = true
      }
    })
    const groupsIsComplete = GROUPS.every(group => {
      return group.complete
    })
    // Create LUCKIES round object and transform it
    // accordingly to results
    const LUCKIES = {
      _id: 'LL-1',
      groups: [],
      outputs: data.format.lucky_losers.map(out => ({
        ...out,
        to: out.to
          .split(',')
          .map(elt => elt.trim())
      })),
      winners: [],
      winners_origin: '',
      selected_output: null,
      freeze: false
    }
    // Fill the LUCKIES round with all the teams in "GROUPS"
    // that are not found in GROUP.winners
    GROUPS.forEach(group => {
      const teams = group.teams
      const winners = group.winners
      const losers = [...teams]
      winners.forEach(winner => {
        const winnerIndex = losers.findIndex(team => team === winner)
        losers[winnerIndex] = null
      })
      LUCKIES.groups.push({
        name: group.name,
        teams: losers.filter(team => team)
      })
    })
    // If the group stage is over, we can populate
    // LUCKIES with the results we find in results object
    if (groupsIsComplete) {
      data.results.forEach(result => {
        if (result.round !== 'LL') return
        LUCKIES.winners = []
        LUCKIES.winners_origin = ''
        const winners = [...new Set(result.winners
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
          }).filter(e => e))]

        winners.forEach(winner => {
          const foundInLosers = LUCKIES.groups.some(group => {
            const foundInGroup = group.teams.some(team => team === winner.team)
            if (foundInGroup) {
              LUCKIES.winners.push(winner.team)
              LUCKIES.winners_origin += group.name
            }
            return foundInGroup
          })
          if (!foundInLosers) console.warn(`${winner.team} not valid value for LL winners`)
        })
      })
    }
    // Find the output of the LUCKIES stage according to it's winners
    LUCKIES.winners_origin = LUCKIES.winners_origin.split('').sort().join('')
    const luckysIsValid = LUCKIES.outputs.length === 0 || LUCKIES.outputs.some(output => {
      return (output.from.length >= LUCKIES.winners_origin.length)
    })
    const luckysIsComplete = LUCKIES.outputs.length === 0 || LUCKIES.outputs.some(output => {
      if (output.from === LUCKIES.winners_origin) {
        LUCKIES.selected_output = output.to
        return true
      } else {
        return false
      }
    })
    if (luckysIsValid && luckysIsComplete) LUCKIES.complete = true
    // Create the FINAL stage object
    const winners = []
    GROUPS.forEach(group => winners.push(...group.winners))
    winners.push(...LUCKIES.winners)
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
        teams: [],
        winner: null,
        freeze: false
      }))
      const thisRound = {
        nb_teams: round,
        name: (round / 2).toString(),
        matches: roundMatches,
        complete: false,
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
      const luckysAndDestinations = LUCKIES.winners.map((winner, i) => ({
        team: winner,
        destination: LUCKIES.selected_output[i]
      }))
      luckysAndDestinations.forEach(pair => {
        const destMatch = FINAL.all_matches.find(match => match.id === pair.destination)
        destMatch.teams.push(pair.team)
      })
    }
    // If groupIsComplete andluckysIsComplete, fill the first
    // round with the given results
    if (groupsIsComplete && luckysIsComplete) {
      for (let i = 0; i < FINAL.length; i++) {
        const round = FINAL[i]
        const prevRoundIsComplete = i === 0
          ? groupsIsComplete && luckysIsComplete
          : FINAL[i - 1].complete
        if (i > 0) {
          const prevRound = FINAL[i - 1]
          prevRound.matches.forEach(match => {
            const destId = match.destination
            const winner = match.winner
            const destination = round.matches.find(match => {
              return match.id === destId
            })
            if (destination.teams.length < 2) {
              destination.teams.push(winner)
            }
          })
        }
        data.results.forEach(result => {
          const resultId = `${result.round}-${result.number}`
          if (round.name !== result.round) return false
          const foundMatch = round.matches.find(match => {
            return match.id === resultId
          })
          if (!foundMatch) return false
          const winnerIsInTeams = foundMatch.teams.indexOf(result.winners) + 1
          if (!winnerIsInTeams) return false
          foundMatch.winner = result.winners
        })
        const roundIsComplete = round.matches.every(match => match.winner)
        round.complete = roundIsComplete
      }
    }
    FINAL.complete = FINAL.every(round => round.complete)

    // Find frozen matches
    data.freeze.forEach(frozen => {
      const frozenId = `${frozen.round}-${frozen.number}`
      if (frozen.round === 'RR') {
        const foundGroup = GROUPS.find(group => group._id === frozenId)
        if (!foundGroup) return
        foundGroup.freeze = true
      } else if (frozen.round === 'LL') {
        LUCKIES.freeze = true
      } else if (frozen.round === 'TPM') {
        // Not handled
      } else {
        FINAL.forEach(round => {
          const foundMatch = round.matches.find(match => match.id === frozenId)
          if (!foundMatch) return
          foundMatch.freeze = true
        })
      }
    })

    // Find WINNER
    const WINNER = (FINAL.all_matches.find(match => match.destination === 'WINNER') || {}).winner

    return {
      groups: GROUPS,
      luckies: LUCKIES,
      final: FINAL,
      winner: WINNER
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * SUBMIT RESULT
   *
   * * * * * * * * * * * * * * * * */
  submitResult(round, number, winners) {
    this.setState(state => ({
      data: {
        ...state.data,
        results: [
          ...state.data.results,
          { round, number, winners }
        ]
      }
    }))
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DELETE ALL RESULTS
   *
   * * * * * * * * * * * * * * * * */
  deleteAllResults () {
    this.setState(state => ({
      data: {
        ...state.data,
        results: []
      }
    }))
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DELETE ALL RESULTS
   *
   * * * * * * * * * * * * * * * * */
  deleteLLResults () {
    const { results } = this.state.data
    const filtered = results.filter(result => {
      return result.round === 'RR'
    })
    this.setState(state => ({
      data: {
        ...state.data,
        results: filtered
      }
    }))
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FIND TEAM NAME
   *
   * * * * * * * * * * * * * * * * */
  findTeam (teamId) {
    const { teams } = this.state.data
    const team = teams.find(({ id }) => id === teamId)
    if (!team) return null
    return team
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props, h2r } = this
    const { loading, error, data } = state
    const { page, teams, results } = data
    const draw = this.buildDraw()
    const link = this.generateLink()
    const winnerId = draw.winner
    const winner = winnerId ? this.findTeam(winnerId) : {}
    const article = winner.article === "L'" ? winner.article : (winner.article + ' ')
    const tweet = `${page.tweet_2_1} ${article}${winner.name} ${page.tweet_2_2}`
    const classes = [c]

    if (loading) {
      classes.push(`${c}_loading`)
      return <div className={classes.join(' ')} />
    } else if (error || !draw) {
      classes.push(`${c}_error`)
      return <div className={classes.join(' ')}>
        <LoadingError />
      </div>
    }

    return <div className={classes.join(' ')}>
      <div className={`${c}__head`}>
        <InterTitle level={1}>{h2r.parse(page.title)}</InterTitle>
        <Paragraph>{h2r.parse(page.intro)}</Paragraph>
      </div>
      <div className={`${c}__share`}>
        <ShareArticle short
          iconsOnly
          url={props.meta.url}
          tweet={page.tweet_1} />
      </div>
      <div className={`${c}__draw`}>
        <Groups teams={teams} data={draw.groups} deleteAllResults={this.deleteAllResults} submitResult={this.submitResult} />{
          draw.groups.every(group => group.complete)
            ? draw.luckies.complete
              ? draw.final.complete
                ? [<Luckies key='luckies' page={page} teams={teams} data={draw.luckies} deleteLLResults={this.deleteLLResults} submitResult={this.submitResult} />,
                  <Final key='final' page={page} teams={teams} data={draw.final} submitResult={this.submitResult} />,
                  <Winner key='winner' page={page} teams={teams} data={draw.winner} />]
                :  [<Luckies key='luckies' page={page} teams={teams} data={draw.luckies} deleteLLResults={this.deleteLLResults} submitResult={this.submitResult} />,
                  <Final key='final' page={page} teams={teams} data={draw.final} submitResult={this.submitResult} />]
              : <Luckies page={page} teams={teams} data={draw.luckies} deleteLLResults={this.deleteLLResults} submitResult={this.submitResult} />
            : ''
        }
      </div>
      {draw.final.complete
        ? <div className={`${c}__share`}>
        <BlockTitle>{h2r.parse(page.inter_4)}</BlockTitle>
        <ShareArticle short
          iconsOnly
          url={`${props.meta.url}?res=${link}`}
          tweet={tweet} />
        </div>
        : ''}
    </div>
  }
}
