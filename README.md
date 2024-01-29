# Loading State

A loading spinner web component that takes a state argument that causes the loading animation to transition into either success or failure.

This is meant to be used to represent the state of a request that may take a few seconds and the status of the resolution needs to be displayed to the user such as creating a new account.

Four possible states:

- not_started (null/undefined, no attribute)
- loading
- success
- failure

The valid transitions are:

- not_started -> loading
- loading -> success
- loading -> failure
