import React, { Component } from 'react'
import SectionTitle from 'libe-components/lib/text-levels/SectionTitle'
import Svg from 'libe-components/lib/primitives/Svg'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'

export default class Final extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'pronos-final'
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
    const { c, props } = this
    const { data } = props
    const classes = [c]
    return <div className={classes.join(' ')}>
      <SectionTitle>Phase finale</SectionTitle>{
      data.map(round => {
        return <div key={round.name}
          id={`${c}__round-${round.name}`}
          className={`${c}__round`}>{
          round.matches.map(match => {
            return <div key={match.id}
              className={`${c}__match`}>{
              new Array(2).fill(null).map((e, i) => {
                if (match.teams[i]) return match.teams[i]
                else return null
              }).map((id, i) => {
                let classVariant = ''
                if (match.winner && match.winner !== id) classVariant = `${c}__team_loser`
                else if (match.winner && match.winner === id) classVariant = `${c}__team_winner`
                else classVariant = `${c}__team_not-played`
                if (!id) {
                  return <div key={i}
                    style={{ background: '#888' }}
                    className={`${c}__team ${classVariant}`}>
                    <Paragraph>
                      <span style={{ color: '#000' }}>
                        —
                      </span>
                    </Paragraph>
                    <div className={`${c}__team-arrow`}>
                      <Svg src='https://www.liberation.fr/apps/static/assets/down-arrow-head-icon_24.svg' svgStyle={{ width: '3rem' }} />
                    </div>
                  </div>
                } else {
                  const team = this.findTeam(id)
                  return <div key={id}
                    onClick={e => this.addWinner(match.round, match.number, id)}
                    style={{ background: team.color_1 }}
                    className={`${c}__team ${classVariant}`}>
                    <Paragraph>
                      <span style={{ color: team.color_2 }}>
                        {team.short_name}
                      </span>
                    </Paragraph>
                    <div className={`${c}__team-arrow`}>
                      <Svg src='https://www.liberation.fr/apps/static/assets/down-arrow-head-icon_24.svg' svgStyle={{ width: '3rem' }} />
                    </div>
                  </div>
                }
              })
            }</div>
          })
        }</div>
      })
    }</div>
  }
}
