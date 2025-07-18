import { toResolvableComponent } from '../shared';

const ComponentA = () => {
    return null;
};

export default toResolvableComponent(ComponentA, [{ gateway: 'test-gateway-a' }]);
