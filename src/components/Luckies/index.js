import React, { Component } from 'react'

export default class Luckies extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'pronos-luckies'
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c } = this
    const classes = [c]
    return <div className={classes.join(' ')}>
      LUCKIES
    </div>
  }
}
