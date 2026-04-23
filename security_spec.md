# Security Spec: Aptly Maintenance Tracker

## Data Invariants
1. Bills must belong to a valid unit ID.
2. Only authenticated users can write expenses or generate bills.
3. Users cannot modify their own unit's billing status once marked as paid (or only admins can).
4. Timestamp logic: `createdAt` must match `request.time`.
5. ID Hardening: IDs must be alphanumeric and limited in size.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempting to create a user profile for another UID.
2. **Resource Poisoning**: Large junk string as unit ID.
3. **Price Manipulation**: Creating a bill with a negative total amount.
4. **Auth Bypass**: Attempting to list all bills without being logged in.
5. **Admin Escalation**: Attempting to write to the `configs` collection as a standard user.
6. **Future Billing**: Creating a bill for a month in the future that hasn't happened yet.
7. **Cross-Tenant View**: A tenant trying to view another apartment's meter readings (if PII is involved).
8. **Unverified Write**: Writing expenses without an email verified account.
9. **Ghost Fields**: Adding `isAdmin: true` to a unit document.
10. **Meter Reset**: Updating a unit's `lastMeterReading` to a value lower than the previous one.
11. **Mass Delete**: Attempting to delete the `expenses` collection.
12. **Status Shortcut**: Marking a bill as 'paid' without providing a `paidAt` timestamp.

## The Test Runner
A `firestore.rules.test.ts` will be implemented to verify these scenarios.
