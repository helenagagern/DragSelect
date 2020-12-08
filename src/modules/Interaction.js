// @ts-check
import DragSelect from '../DragSelect'
import '../types'

export default class Interaction {
  /**
   * @type {DSArea}
   * @private
   * */
  _areaElement

  /**
   * @constructor Interaction
   * @param {Object} obj
   * @param {DSArea} obj.areaElement
   * @param {DragSelect} obj.DS
   * @ignore
   */
  constructor({ areaElement, DS }) {
    this._areaElement = areaElement
    this.DS = DS
    this.DS.subscribe('PointerStore:updated', this.update)
    this.DS.subscribe('Area:scroll', this.update)
  }

  init = () => {
    this.stop()
    this._areaElement.addEventListener('mousedown', this.start)
    this._areaElement.addEventListener('touchstart', this.start, {
      passive: false,
    })
    this.DS.publish('Interaction:init', {})
  }

  start = (event) => {
    if (event.type === 'touchstart') event.preventDefault() // Call preventDefault() to prevent double click issue, see https://github.com/ThibaultJanBeyer/DragSelect/pull/29 & https://developer.mozilla.org/vi/docs/Web/API/Touch_events/Supporting_both_TouchEvent_and_MouseEvent
    if (/** @type {*} */ (event).button === 2) return // right-clicks

    this.isInteracting = true
    this.DS.publish('Interaction:start', { event })

    document.addEventListener('mouseup', this.reset)
    document.addEventListener('touchend', this.reset)
  }

  stop = () => {
    this.isInteracting = false
    this._areaElement.removeEventListener('mousedown', this.start)
    this._areaElement.removeEventListener('touchstart', this.start, {
      // @ts-ignore
      passive: false,
    })
    document.removeEventListener('mouseup', this.reset)
    document.removeEventListener('touchend', this.reset)
  }

  update = ({ event, data }) => {
    if (this.isInteracting)
      this.DS.publish('Interaction:update', { event, data })
  }

  reset = (event) => {
    this.stop()
    this.init()
    // debounce, make sure that the end event is put at the end of the event loop
    this.DS.publish('Interaction:end', { event })
  }
}