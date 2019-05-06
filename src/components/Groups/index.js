import React, { Component } from 'react'
import BlockTitle from 'libe-components/lib/text-levels/BlockTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import Annotation from 'libe-components/lib/text-levels/Annotation'

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
    this.deleteWinner = this.deleteWinner.bind(this)
    this.deleteAllWinners = this.deleteAllWinners.bind(this)
    this.addWinner = this.addWinner.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DELETE WINNER
   *
   * * * * * * * * * * * * * * * * */
  deleteWinner (groupName, i) {
    const group = this.props.data.find(group => group.name === groupName)
    if (!group) return
    if (group.winners.length === 1
      || group.winners.length === 2) {
      this.props.submitResult('RR', groupName, '')
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DELETE ALL WINNERS
   *
   * * * * * * * * * * * * * * * * */
  deleteAllWinners () {
    const canDeleteAll = this.props.data.every(group => !group.freeze)
    if (canDeleteAll) {
      this.props.deleteAllResults()
    } else {
      this.props.data.forEach(group => {
        if (!group.freeze) this.deleteWinner(group.name)
      })
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * ADD WINNER
   *
   * * * * * * * * * * * * * * * * */
  addWinner (groupName, id) {
    const group = this.props.data.find(group => group.name === groupName)
    if (!group) return
    if (group.winners.length === 0) {
      this.props.submitResult('RR', groupName, id)
    } else if (group.winners.length === 1) {
      this.props.submitResult('RR', groupName, `${group.winners[0]}, ${id}`)
    } else {
      this.props.submitResult('RR', groupName, id)
    }
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
    return <div className={classes.join(' ')}>{
      data.map(group => {
        const groupClasses = [`${c}__group`]
        if (group.freeze) groupClasses.push(`${c}__group_freeze`)          
        return <div key={group._id}
          className={groupClasses.join(' ')}>
          <div className={`${c}__group-name`}>
            <BlockTitle>
              {group.name}
            </BlockTitle>
          </div>
          <div className={`${c}__group-teams`}>{
            group.teams.map(teamId => {
              const team = this.findTeam(teamId)
              return <button key={teamId}
                disabled={group.freeze || group.winners.indexOf(teamId) !== -1}
                onClick={e => this.addWinner(group.name, teamId)}
                className={`${c}__team`}>
                <img src={team.icon} />
                <div className={`${c}__team-label`}>
                  <Annotation>
                    {team.medium_name}
                  </Annotation>
                </div>
              </button>
            })
          }</div>
          <div className={`${c}__winners`}>{
            group.outputs.map((output, i) => {
              const team = this.findTeam(group.winners[i])
              if (team) {
                return <div key={team.id}
                  onClick={e => {
                    if (!group.freeze) this.deleteWinner(group.name, i)
                  }}
                  style={{ background: team.color_1 }}
                  className={`${c}__winner`}>
                  <Paragraph>
                    <span style={{ color: team.color_2 }}>{team.medium_name}</span>
                  </Paragraph>
                </div>
              } else {
                return <div key={`empty-${i}`}
                  style={{ background: '#DDD' }}
                  className={`${c}__winner`}>
                  <Paragraph>
                    <span style={{ color: '#888' }}>
                      {i === 0 ? '1ère place' : '2ème place'}
                    </span>
                  </Paragraph>
                </div>
              }
            })
          }</div>
        </div>
      })}
      <div className={`${c}__reset`} onClick={this.deleteAllWinners}>
        <Annotation>
          <a>Remettre à zero</a>
        </Annotation>
      </div>
    </div>
  }
}
