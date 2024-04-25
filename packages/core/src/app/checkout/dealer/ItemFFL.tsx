import React from 'react';

export default function ItemFFL(props: any): any {
  const { imageUrl, name } = props.item;
  return (<div className="consignment">
      <figure className="consignment-product-figure">
          { imageUrl &&
              <img alt={ name } src={ imageUrl } /> }
      </figure>

      <div className="consignment-product-body">
          <h5 className="optimizedCheckout-contentPrimary">
              { `${props.quantity} x ${name}` }
          </h5>
      </div>
  </div>);
}
