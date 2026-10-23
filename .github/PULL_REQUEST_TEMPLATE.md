## What/Why?

<!--
  A description about what this pull request implements and its purpose.
  Try to be detailed and describe any technical details to simplify the job
  of the reviewer and the individual on production support.
-->

## Rollout/Rollback

<!--
Detail how this change will be rolled out. Include reference to any
experiments and how the success will be measured as the experiment is
ramped.

Document rollback procedures. Is rolling back the change as simple as
rolling back an experiment or does it require reverting code? Are there
database migrations that may change our decision to roll forward instead of
back?
-->

## New experiments

<!--
Complete this only if the pull request adds a new experiment (feature flag).
New experiments must be OFF for custom checkouts.
-->

- [ ] Gated on `isCustomCheckout`: `isCustomCheckout ? false : isExperimentEnabled(...)`
- [ ] Uses `false` as the `isExperimentEnabled` fallback
- [ ] Includes a test for the custom checkout case (flag ON, `isCustomCheckout` true, feature stays OFF)

## Testing

<!--
Provide as much information as you can about how you tested and how another
Engineer can test your change. Include screenshots, or test run output
where appropriate.
-->
