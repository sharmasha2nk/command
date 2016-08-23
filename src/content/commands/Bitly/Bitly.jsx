import _ from 'lodash'
import $ from 'jquery'
import React from 'react'
import classnames from 'classnames'
import { mountReactComponent } from 'content/commands/mount'

import * as Types from 'content/types'
import * as Input from 'content/components/Input'
import Container from 'content/components/Container'
var validUrl = require('valid-url');

const API_BASE = 'https://api-ssl.bitly.com/v3/shorten'

let shorten = (longURL, options={}, s) => {
  return $.ajax({
    url: API_BASE,
    data: {
      login: 'o_781236c20b',
      apiKey: 'R_439a3dbcf1c1492eb6a99b793dac2c42',
      longUrl: longURL
    }
  }).then((data) => {
    return data.data
  })
}

let validate = (longURL) => {
  return longURL!="" && !validUrl.isUri(longURL)
}

let BitlyResult = (props) => {
    return (
      <div>
        {props.url}
      </div>
    )
}

class Bitly extends React.Component {
  onSelect(result) {
        this.props.onDone(new Types.Link({
          href: result.url
      }))
  }

  render() {
    return (
      <Container {...this.props}>
        <Input.Widget
          placeholder="Paste a link to shorten it"
          onLinkSubmit={shorten}
          onSelect={this.onSelect.bind(this)}
          onEsc={this.props.onDone}
          ResultClass={BitlyResult}
          columns={0}
          isResultList={false}
          validate={validate}
        />
      </Container>
    )
  }
}
Bitly.propTypes = {
  onDone: React.PropTypes.func.isRequired
}

export let match = 'bitly'
export let icon = require('./Bitly.png')
export let mount = mountReactComponent.bind(null, Bitly)
