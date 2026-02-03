import { toResolvableComponent } from '../shared';

const ComponentA = () => null;

export default toResolvableComponent(ComponentA, [{ gateway: 'test-gateway-a' }]);
