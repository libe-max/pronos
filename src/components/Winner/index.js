import React, { Component } from 'react'
import { Parser } from 'html-to-react'
import PageTitle from 'libe-components/lib/text-levels/PageTitle'
import SectionTitle from 'libe-components/lib/text-levels/SectionTitle'

export default class Winner extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'pronos-winner'
    this.h2r = new Parser()
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
    const { c, h2r } = this
    const { props } = this
    const classes = [c]

    const team = this.findTeam(this.props.data)

    return <div className={classes.join(' ')}>
      <SectionTitle>{h2r.parse(props.page.inter_3)}</SectionTitle>
      <div className={`${c}__team`} style={{background: team.color_1}}>
        <img src={team.icon} />
        <PageTitle>
          <span style={{color: team.color_2}}>
            {this.findTeam(props.data).name}
          </span>
        </PageTitle>
      </div>
    </div>
  }
}
