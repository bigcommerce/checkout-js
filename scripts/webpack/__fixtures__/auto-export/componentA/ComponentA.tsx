import React, { FunctionComponent } from 'react';

const ComponentA: FunctionComponent<{ title: string }> = ({ title }) => <div>{ title }</div>;

export default ComponentA;
