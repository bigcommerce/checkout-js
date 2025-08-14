import { toResolvableComponent } from '../shared';

const ComponentB = () => {
    return null;
};

export default toResolvableComponent(ComponentB, [{ id: 'test-id-b', gateway: 'test-gateway-b' }]);
