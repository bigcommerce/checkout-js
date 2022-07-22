
let boltTracker: Window["BoltTrack"] = {
  recordEvent: (event: string) => console.log("--bolt bigc--: NOOP ", event)
}

const eventLog: string[] = []

export const AnalyticsEvents = {
  init: () => {
    console.log("--bolt bigc--: intializing Bolt-BigC analytics events")
    if(window && window.BoltTrack) {
      boltTracker = window.BoltTrack
      console.log("--bolt bigc--: successfully assigned window BoltTrack")
      // immediately send checkout start event
      AnalyticsEvents.emitEvent("Checkout load success")
    }
  },
  emitEvent: (eventName: string) => {
    console.log("--bolt bigc--: emitting analytics event ", eventName);
    const props: any = {
      nextState: eventName
    }
    if (eventLog.length > 0) {
      props.prevState = eventLog[0];
    }
    boltTracker.recordEvent("CheckoutFunnelTransition", props)
    eventLog.unshift(eventName)
    console.log("--bolt bigc--: successfully sent analytics event ", eventName);
  },
  onBeforeUnload: () => {
    AnalyticsEvents.emitEvent("Exit")
  }
}