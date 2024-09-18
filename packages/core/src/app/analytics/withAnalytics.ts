import { AnalyticsContext } from '@bigcommerce/checkout/analytics';
import { createInjectHoc } from '@bigcommerce/checkout/legacy-hoc';

const withAnalytics = createInjectHoc(AnalyticsContext, { displayNamePrefix: 'WithAnalytics' });

export default withAnalytics;
