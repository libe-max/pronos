import React, { Component } from 'react'
import BlockTitle from 'libe-components/lib/text-levels/BlockTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'

export default class Groups extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'pronos-groups'
    this.findTeam = this.findTeam.bind(this)
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
    console.log(data)
    const classes = [c]
    return <div className={classes.join(' ')}>{
      data.map(group => {
        return <div key={group._id}
          className={`${c}__group`}>
          <div className={`${c}__group-name`}>
            <BlockTitle>
              {group.name}
            </BlockTitle>
          </div>
          <div className={`${c}__group-teams`}>{
            group.teams.map(teamId => {
              const team = this.findTeam(teamId)
              return <button key={teamId}
                className={`${c}__team`}>
                <img src={team.icon} />
                <Paragraph>{team.name}</Paragraph>
              </button>
            })
          }</div>
          <div className={`${c}__winners`}>{
            group.outputs.map((output, i) => {
              const team = this.findTeam(group.winners[i])
              return <div key={team.id} className={`${c}__winner`}>
                <Paragraph><span>{team.name}</span></Paragraph>
              </div>
            })
          }</div>
        </div>
      })
    }</div>
  }
}
