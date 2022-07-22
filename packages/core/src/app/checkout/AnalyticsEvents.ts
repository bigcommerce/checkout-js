let boltTracker: Window["BoltTrack"] = {
  recordEvent: (event: string) => console.log("--bolt bigc--: NOOP ", event),
};

const eventLog: string[] = [];

export const AnalyticsEvents = {
  init: () => {
    try {
      console.log("--bolt bigc--: intializing Bolt-BigC analytics events");
      if (window && window.BoltTrack) {
        boltTracker = window.BoltTrack;
        console.log("--bolt bigc--: successfully assigned window BoltTrack");
        // immediately send checkout load success event
        AnalyticsEvents.emitEvent("Checkout load success");
      }
    } catch (e) {
      console.log("--bolt bigc--: error during emitting event ", e);
    }
  },
  emitEvent: (eventName: string) => {
    try {
      console.log("--bolt bigc--: emitting analytics event ", eventName);
      const props: any = {
        nextState: eventName,
        prevState: "",
      };
      if (eventLog.length > 0) {
        props.prevState = eventLog[0];
      }
      boltTracker.recordEvent("CheckoutFunnelTransition", props);
      // add latest event to beginning of log array
      eventLog.unshift(eventName);
    } catch (e) {
      console.log("--bolt bigc--: error during emitting event ", e);
    }
  },
  onBeforeUnload: () => {
    AnalyticsEvents.emitEvent("Exit");
  },
};
