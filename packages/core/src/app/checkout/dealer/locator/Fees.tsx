import React from 'react';

export default function Fees(props: any): any {
  const { fees } = props;

  if (fees.length == 0) {
    return null;
  }

  return (
    <div className="dealer-fee-list">
      <p>Transfer Fees:</p>
      <ul>
        {
          fees.map(function(fee: any) {
            return (<li>{`${fee.name}: ${fee.amount}`}</li>)
          })
        }
      </ul>
    </div>
  );
}
