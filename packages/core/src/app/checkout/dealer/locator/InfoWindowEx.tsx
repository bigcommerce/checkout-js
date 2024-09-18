import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { InfoWindow } from "google-maps-react";

export default function InfoWindowEx(props: any) {
  const infoWindowRef: any = React.createRef();
  const contentElement: any = document.createElement(`div`);
  useEffect(() => {
    ReactDOM.render(React.Children.only(props.children), contentElement);
    infoWindowRef.current.infowindow.setContent(contentElement);
  }, [props.children]);
  return <InfoWindow ref={infoWindowRef} {...props} />;
}
