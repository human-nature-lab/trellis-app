# Changing Passwords
All users are able to change their own password by clicking the "Change password" button in the main menu. After clicking this button a dialog will show up with fields for the previous password and new password. Once submitted, if the previous password matches the existing password in the database, then the new password will be used instead. 

Users with the `CHANGE_PASSWORD` (typically administrative users) are also able to change the passwords of other users. Users with this permission do not need to confirm the existing password to make the change. To change the password of a user other than your own user, go to the [users](Introduction.md) module and click the "edit" button under actions. Then click the "Change password" button to modify their password.

Trellis has to synchronize data between many different devices which takes time. A [sync](../sync/Introduction.md) must occur for each device before the device will reflect any password changes.
