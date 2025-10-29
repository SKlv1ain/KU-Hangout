# Pull Request Template

## Summary
<!-- Briefly describe what this PR does -->
This PR merges the latest updates from **[source branch]** into **[target branch]**.

It includes updates such as:
- [short description of key updates, e.g., “model changes in User and Plans”]
- [function improvements, cleanup, or new features]
- [mention any frontend/backend sync or refactor if relevant]

> Example:  
> This PR brings the latest updates from `dev` into `dev-backend/userprofiles`, including changes to the **User** and **Plans** models, backend sync with the frontend post creation flow, and preparation for profile picture uploads.

---

## Changes Included
<!-- List key technical or functional changes -->
- [ ] Updated models  
- [ ] Improved functions  
- [ ] Synced backend and frontend logic  
- [ ] Data cleanup or migration  
- [ ] Added/modified API endpoints  
- [ ] Other (specify):

---

## How to Test
<!-- Describe how to test the new changes -->
1. Pull this branch and run the project  
2. Apply migrations if necessary:
   ```bash
   python manage.py migrate
