import React, { Component } from 'react'
import { Parser } from 'html-to-react'
import SectionTitle from 'libe-components/lib/text-levels/SectionTitle'
import Svg from 'libe-components/lib/primitives/Svg'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import AnnotationTitle from 'libe-components/lib/text-levels/AnnotationTitle'

export default class Final extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'pronos-final'
    this.h2r = new Parser()
    this.findTeam = this.findTeam.bind(this)
    this.addWinner = this.addWinner.bind(this)
  }

  addWinner (round, number, team) {
    this.props.submitResult(round, number, team)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FIND TEAM NAME
   *
   * * * * * * * * * * * * * * * * */
  findTeam (teamId) {
    const { teams } = this.props
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
    const { c, props, h2r } = this
    const { data, page, getMatchProvenance } = props
    const classes = [c]

    return <div className={classes.join(' ')}>
      <SectionTitle>{h2r.parse(page.inter_2)}</SectionTitle>{
      data.map((round, roundIndex) => {
        return <div key={round.name}
          id={`${c}__round-${round.name}`}
          className={`${c}__round`}>{
          round.matches.map(match => {
            const provenance = getMatchProvenance(match.id)
            return <div key={match.id}
              className={`${c}__match`}>
              {/*roundIndex === 0 ? <span className={`${c}__match-provenance`}><AnnotationTitle>{provenance}</AnnotationTitle></span> : ''*/}
              {new Array(2).fill(null).map((e, i) => {
                if (match.teams[i]) return match.teams[i]
                else return null
              }).map((id, i) => {
                let classVariants = [`${c}__team`]
                if (match.freeze) classVariants.push(`${c}__team_freeze`)
                if (match.winner && match.winner !== id) classVariants.push(`${c}__team_loser`)
                else if (match.winner && match.winner === id) classVariants.push(`${c}__team_winner`)
                else if (!match.winner && id) classVariants.push(`${c}__team_not-played`)
                // Team not known
                else {
                  return <div key={i}
                    style={{
                      opacity: .3,
                      background: '#888',
                      cursor: 'not-allowed' }}
                    className={`${classVariants.join(' ')}`}>
                    <Paragraph>
                      <span style={{ color: '#000' }}>—</span>
                    </Paragraph>
                    <div className={`${c}__team-arrow`}>
                      <Svg src='https://www.liberation.fr/apps/static/assets/down-arrow-head-icon_24.svg' svgStyle={{ width: '3rem' }} />
                    </div>
                  </div>
                }
                // Team known
                const team = this.findTeam(id)
                return <div key={id}
                  onClick={e => {
                    if (!match.freeze
                      && match.teams.length === 2
                      && match.teams.every(team => team)) {
                      this.addWinner(match.round, match.number, id)
                    }
                  }}
                  style={{ background: team ? team.color_1 : '' }}
                  className={`${classVariants.join(' ')}`}>
                  <Paragraph>
                    <span style={{ color: team ? team.color_2 : '' }}>
                      <span className={`${c}__team-short-name`}>{team ? team.short_name : ''}</span>
                      <span className={`${c}__team-medium-name`}>{team ? h2r.parse(team.medium_name) : ''}</span>
                    </span>
                  </Paragraph>
                  <div className={`${c}__team-arrow`}>
                    <Svg src='https://www.liberation.fr/apps/static/assets/down-arrow-head-icon_24.svg' svgStyle={{ width: '3rem' }} />
                  </div>
                </div>
              })
            }</div>
          })
        }</div>
      })
    }</div>
  }
}
