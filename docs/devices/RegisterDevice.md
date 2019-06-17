# Device registration
A device registration dialog will appear before a device is able sync for the first time. Device registration simply requires filling out the users login information for that server on the physical device and supplying a name for that device on the server. A device can be registered by any user with the "ADD_DEVICE" [permission](../admin/Permissions.md).

Part of the device registration process involves creating a unique access token for each device which will be used to authenticate the device each time it communicates with the server. This key is stored on the device and it can be changed by oresetting the device registration and completing the device registration form again. To revoke access for a device, remove the device via the [devices](./Devices.md) module in Trellis. Once access for a device has been revoked, the device will have to complete the registration process again to have access to the server again.

## Resetting device registration
To reset a device's registration, first navigate to the Information page. At the bottom there is an "Admin" section which has the "Unregister Device" button.
