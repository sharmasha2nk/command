import $ from 'jquery'
import React from 'react'
import NativeListener from 'react-native-listener'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import Spinner from 'react-spinner'

import styles from './Input.scss'

export class Input extends React.Component {
  constructor() {
    super()
    this.onPaste = this.onPaste.bind(this)
    this.onButtonClick = this.onButtonClick.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onLinkSubmit = _.debounce(this.onLinkSubmit.bind(this), 300)
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.linkInput)).focus()
  }

  onLinkSubmit(longURL) {
    this.props.onLinkSubmit(longURL)
  }

  onKeyDown(event) {
    event.stopPropagation()
    if (event.keyCode == 27) {
      return this.props.onEsc()
    }
    return true
  }

  onKeyUp(event) {
    event.stopPropagation()
    this.props.checkEmpty(event)
    return true
  }

  onKeyPress(event) {
    event.stopPropagation()
    return true
  }

  onPaste(event) {
    this.onLinkSubmit(event.clipboardData.getData('text'))
    return true
  }

  onButtonClick(event) {
    this.onLinkSubmit($('[name="linkInput"]').val())
    return true
  }

  render() {
    return (
    <div>
    <input 
        ref='submit'
        type='button' 
        value='SHORTEN' 
        className={styles.button}
        onClick={this.onButtonClick}
      />
    <div className={styles.inputDiv}>
      <NativeListener onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp} onKeyPress={this.onKeyPress}>
        <input
          type='input'
          name='linkInput'
          ref='linkInput'
          placeholder={this.props.placeholder}
          className={styles.input}
          onPaste={this.onPaste}
        />
      </NativeListener>
      </div>
    </div>
    )
  }
}
Input.propTypes = {
  checkEmpty: React.PropTypes.func.isRequired,
  onEsc: React.PropTypes.func.isRequired,
  onLinkSubmit: React.PropTypes.func.isRequired
}

let NoResults = (props) => {
  return (
    <p>Unable to shorten that link. It is not a valid url.</p>
  )
}

export class Widget extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      IS_LOADING: false,
      longURL: "",
      IS_INVALID: false
    }

    this.checkEmpty = this.checkEmpty.bind(this)
    this.shorten = this.shorten.bind(this)
  }

  componentWillUnmount() {
    if (this.pendingRequest) {
      this.cancel = true
    }
  }

  checkEmpty(event) {
    if(event.target.value !== '') {
      this.setState({
        IS_LOADING: false,
        IS_INVALID: false
      })
    }
    return true
  }

  doQuery(longURL, options={}) {
    this.pendingRequest = this.props.onLinkSubmit(longURL, options)
      .then((results) => {
        if (this.cancel) return
        this.setState({ IS_LOADING: false, IS_INVALID: false })
        this.props.onSelect(results)
      })
      .always(() => {
        this.pendingRequest = null
      })
  }

  shorten(longURL) {
    if (this.props.validate(longURL)) {
      
      return this.setState({
        longURL: longURL,
        IS_LOADING: false,
        IS_INVALID: true
      })
    }
    if (longURL === '') {
      return this.setState({
        longURL: longURL,
        IS_LOADING: false,
        IS_INVALID: false
      })
    }

    this.setState({ longURL: longURL, IS_LOADING: true, IS_INVALID: false })
    this.doQuery(longURL)
  }

  render() {
    var widgetClass=styles.widgetWithoutList
    let classes = classnames(widgetClass, this.props.className, {
      [styles.isExpanded]: this.state.IS_LOADING || this.state.IS_INVALID
    })

    let toRender
    if (this.state.IS_LOADING) {
      toRender = <Spinner />
    } else if (this.state.IS_INVALID) {
      toRender =  <NoResults />
    }
    return (
      <div className={classes}>
        <Input
          placeholder={this.props.placeholder}
          onLinkSubmit={this.shorten}
          onEsc={this.props.onEsc}
          checkEmpty={this.checkEmpty}
        />
        { toRender }
      </div>
    )
  }
}
Widget.propTypes = {
  results: React.PropTypes.object,
  columns: React.PropTypes.oneOfType([
      React.PropTypes.bool.isRequired,
      React.PropTypes.number.isRequired
  ]),
  placeholder: React.PropTypes.string,
  onLinkSubmit: React.PropTypes.func.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  validate: React.PropTypes.func.isRequired,
  onEsc: React.PropTypes.func.isRequired,
  ResultClass: React.PropTypes.oneOfType([
    React.PropTypes.func.isRequired,
    React.PropTypes.element.isRequired,
  ])
}
