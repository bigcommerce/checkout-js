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
Complete this only if the pull request adds or removes an experiment (feature flag).

New experiments must be OFF for custom checkouts unless they opt in. Custom
checkouts are merchant-hosted forks that may run older code, and a rollout
alone can't protect them: if a flag is missing, `isExperimentEnabled` falls
back to its default. `isExperimentEnabledWithOptIn` keeps new experiments OFF for
custom checkouts regardless of rollout state or whether the flag exists.

A custom checkout can opt in to an experiment's rollout by adding it to
`CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS` in its fork
(`packages/utility/src/experiments/customCheckoutExperimentOptIns.ts`).
It then turns ON for that store only when the rollout reaches it.

When removing an experiment, remove the code before deleting the flag, so
opted-in custom checkouts keep the feature until they merge. Say so in the
commit subject: the feature then reaches every checkout, including custom
checkouts once they merge.

Existing flags are not affected.
-->

- [ ] Reads the experiment with `isExperimentEnabledWithOptIn(checkoutSettings, 'PROJECT-1234.flag_name')`
- [ ] Includes a test for the custom checkout case (flag ON, `isCustomCheckout` true, feature stays OFF)
- [ ] If removing an experiment, the code is removed before the flag is deleted, and the commit subject says the feature now applies to all checkouts

## Testing

<!--
Provide as much information as you can about how you tested and how another
Engineer can test your change. Include screenshots, or test run output
where appropriate.
-->
