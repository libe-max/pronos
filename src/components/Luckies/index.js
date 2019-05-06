import React, { Component } from 'react'
import { Parser } from 'html-to-react'
import SectionTitle from 'libe-components/lib/text-levels/SectionTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import Annotation from 'libe-components/lib/text-levels/Annotation'

export default class Luckies extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'pronos-luckies'
    this.h2r = new Parser()
    this.findTeam = this.findTeam.bind(this)
    this.deleteWinners = this.deleteWinners.bind(this)
    this.addWinner = this.addWinner.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DELETE WINNER
   *
   * * * * * * * * * * * * * * * * */
  deleteWinners () {
    if (!this.props.data.freeze) this.props.submitResult('LL', 1, '')
  }

  /* * * * * * * * * * * * * * * * *
   *
   * ADD WINNER
   *
   * * * * * * * * * * * * * * * * */
  addWinner (id) {
    const newWinners = [...this.props.data.winners] || []
    if (newWinners.length === 4) return this.deleteWinners()
    newWinners.push(id)
    const str = newWinners.filter(e => e).join(', ')
    this.props.submitResult('LL', 1, str)
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
    const { data, page } = props

    const classes = [c]
    if (data.freeze) classes.push(`${c}_freeze`)

    return <div className={classes.join(' ')}>
      <SectionTitle>{h2r.parse(page.inter_1)}</SectionTitle>
      <Paragraph>{h2r.parse(page.sub_inter_1)}</Paragraph>
      <div className={`${c}__groups`}>{
        data.groups.map(group => {
          // [WIP] Could check if one group has already a LL
          const groupHasAlreadyAWinner = data.winners.some(winner => {
            return group.teams.indexOf(winner) + 1
          })
          return <div key={group.name}
            className={`${c}__group`}>{
            group.teams.map(id => {
              const team = this.findTeam(id)
              return <button key={id}
                disabled={data.freeze || groupHasAlreadyAWinner}
                onClick={e => this.addWinner(id)}
                className={`${c}__team`}>
                <img src={team.icon} />
                <div className={`${c}__team-label`}>
                  <Annotation>
                    {team.name}
                  </Annotation>
                </div>
              </button>
            })
          }</div>
        })
      }</div>
      <div className={`${c}__winners`}>{
        data.outputs[0].to.map((out, i) => {
          const team = this.findTeam(data.winners[i])
          if (team) {
            return <div key={team.id}
              onClick={e => this.deleteWinners(team.id)}
              style={{ background: team.color_1 }}
              className={`${c}__winner`}>
              <Paragraph>
                <span style={{ color: team.color_2 }}>{team.name}</span>
              </Paragraph>
            </div>
          } else {
            return <div key={`empty-${i}`}
              style={{ background: '#DDD' }}
              className={`${c}__winner`}>
              <Paragraph>
                <span style={{ color: '#888' }}>
                  {`Qualifié ${i}`}
                </span>
              </Paragraph>
            </div>
          }

          return <div>winner</div>



          // return <div key={out}
          //   onClick={e => this.deleteWinners('LL', team.)}
          //   style={{ background: team.color_1 }}
          //   className={`${c}__winner`}>

          // </div>
        })
      }</div>
      <div className={`${c}__reset`} onClick={this.deleteWinners}>
        <Annotation>
          <a>Remettre à zero</a>
        </Annotation>
      </div>
    </div>
  }
}


// <button key={teamId}
//   disabled={group.freeze || group.winners.indexOf(teamId) !== -1}
//   onClick={e => this.addWinner(group.name, teamId)}
//   className={`${c}__team`}>
//   <img src={team.icon} />
//   <div className={`${c}__team-label`}>
//     <Annotation>
//       {team.name}
//     </Annotation>
//   </div>
// </button>