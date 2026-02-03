import { toResolvableComponent } from '../shared';

const ComponentB = () => null;

export default toResolvableComponent(ComponentB, [{ id: 'test-id-b', gateway: 'test-gateway-b' }]);
